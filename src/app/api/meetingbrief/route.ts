/* ------------------------------------------------------------------
 *  API route:  POST /api/meetingbrief
 *  Body JSON:  { "name": "<person>", "organization": "<company>" }
 * -----------------------------------------------------------------*/

import { NextRequest, NextResponse } from "next/server";
import { buildMeetingBriefGemini } from "@/lib/MeetingBriefGeminiPipeline";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Plan limits mapping
const PLAN_LIMITS = {
  free: 5,
  starter: 50,
  growth: 150,
  scale: 500,
} as const;

/*──────────────────────────  superscript helper  */

function normalizeCitations(
  brief: string,
  citations: { marker: string; url: string }[]
): string {
  if (!Array.isArray(citations) || citations.length === 0) return brief;
  if (typeof brief !== "string") return brief;

  const sup: Record<string, string> = {};
  citations.forEach((c, i) => {
    const n = (i + 1).toString();
    sup[n] =
      `<sup><a class="text-blue-600 underline hover:no-underline" href="${c.url}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
  });

  brief = brief.replace(
    /(\[\s*\^|\^)\s*([\d\s,]+)(?=\]|\s|,|$)/g,
    (_m: string, _pre: string, nums: string) => {
      const unique = Array.from(
        new Set(
          nums
            .split(/[\s,]+/)
            .filter((num: string) => num && sup[num])
        )
      );
      return unique.map((num: string) => sup[num]).join("");
    }
  );

  return brief
    .replace(/[\[\]\^,]/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/*──────────────────────────  main handler  */

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, organization } = body;

    if (!name || !organization) {
      return NextResponse.json(
        { error: "Missing required fields: name, organization" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Check usage limits
      const subscription = await auth.api.getSubscription({
        headers: await headers(),
      });

      let planName = "free";
      let monthlyLimit = PLAN_LIMITS.free;

      if (subscription?.data?.subscription) {
        planName = subscription.data.subscription.plan || "free";
        monthlyLimit = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
      }

      // Get current usage
      const usageResult = await client.query(
        `SELECT current_month_count, current_month_start
         FROM user_brief_counts 
         WHERE user_id = $1`,
        [session.user.id]
      );

      let currentMonthCount = 0;
      
      if (usageResult.rows.length > 0) {
        const usage = usageResult.rows[0];
        const currentMonthStart = new Date(usage.current_month_start);
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        if (currentMonthStart.getTime() === thisMonthStart.getTime()) {
          currentMonthCount = usage.current_month_count;
        }
      }

      // Check if user has exceeded their limit
      if (currentMonthCount >= monthlyLimit) {
        return NextResponse.json(
          { error: "Monthly brief limit exceeded. Please upgrade your plan." },
          { status: 429 }
        );
      }

      // Generate the brief
      const result = await buildMeetingBriefGemini(name, organization);
      const normalizedBrief = normalizeCitations(result.brief, result.citations);

      // Save to database
      await client.query(
        `INSERT INTO user_briefs (user_id, name, organization, brief_content)
         VALUES ($1, $2, $3, $4)`,
        [session.user.id, name, organization, normalizedBrief]
      );

      return NextResponse.json({ brief: normalizedBrief });

    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error("MeetingBrief API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}