/* ------------------------------------------------------------------
 *  API route:  POST /api/meetingbrief
 *  Body JSON:  { "name": "<person>", "organization": "<company>" }
 * -----------------------------------------------------------------*/

import { NextRequest, NextResponse } from "next/server";
import { buildMeetingBriefGemini } from "@/lib/MeetingBriefGeminiPipeline";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { Pool } from "pg";
import { 
  checkRateLimit, 
  validateStringInput, 
  checkRequestSize, 
  createRateLimitResponse,
  createSecureErrorResponse,
  validateUserId
} from "@/lib/api-security";

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
    // Check request size
    const sizeCheck = checkRequestSize(request);
    if (sizeCheck) return sizeCheck;

    // Check authentication - allow anonymous users for limited briefs
    const headersList = await headers();
    
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: headersList,
    });

    // Parse and validate request body first
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // Validate and sanitize inputs
    const nameValidation = validateStringInput(body.name, "Name");
    if (!nameValidation.isValid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    const orgValidation = validateStringInput(body.organization, "Organization");
    if (!orgValidation.isValid) {
      return NextResponse.json(
        { error: orgValidation.error },
        { status: 400 }
      );
    }

    const sanitizedName = nameValidation.sanitized!;
    const sanitizedOrganization = orgValidation.sanitized!;

    const client = await pool.connect();
    
    try {
      let userId: string;
      let planName: keyof typeof PLAN_LIMITS;
      let monthlyLimit: number;

      if (session?.user?.id) {
        // Authenticated user - check their plan
        userId = session.user.id;
        
        // Validate user ID
        if (!validateUserId(userId)) {
          return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        // Rate limiting for authenticated users
        const rateLimitCheck = checkRateLimit(userId, 5);
        if (!rateLimitCheck.allowed) {
          return createRateLimitResponse(rateLimitCheck.resetTime!, rateLimitCheck.remaining);
        }

        // Check subscription plan
        planName = "free";
        monthlyLimit = PLAN_LIMITS.free;

        try {
          const subscriptionResult = await client.query(
            `SELECT plan, status, "periodStart", "periodEnd" 
             FROM subscription 
             WHERE "userId" = $1 
             AND status IN ('active', 'trialing')
             ORDER BY "createdAt" DESC
             LIMIT 1`,
            [userId]
          );

          if (subscriptionResult.rows.length > 0) {
            const subscription = subscriptionResult.rows[0];
            const plan = subscription.plan || "free";
            if (plan in PLAN_LIMITS) {
              planName = plan as keyof typeof PLAN_LIMITS;
              monthlyLimit = PLAN_LIMITS[planName];
            }
          }
        } catch (error) {
          console.error("Subscription query error:", error);
        }
      } else {
        // Anonymous user - allow 2 free briefs using IP-based tracking
        const clientIP = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 
                         'unknown';
        
        userId = `anon_${clientIP}`;
        planName = "free";
        monthlyLimit = 2; // Only 2 briefs for anonymous users
        
        // Basic rate limiting for anonymous users (stricter)
        const rateLimitCheck = checkRateLimit(userId, 2);
        if (!rateLimitCheck.allowed) {
          return createRateLimitResponse(rateLimitCheck.resetTime!, rateLimitCheck.remaining);
        }
      }

      // Get current usage
      const usageResult = await client.query(
        `SELECT current_month_count, current_month_start
         FROM user_brief_counts 
         WHERE user_id = $1`,
        [userId]
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
        const errorMessage = session?.user?.id 
          ? "Monthly brief limit exceeded. Please upgrade your plan."
          : "You've used your 2 free anonymous briefs. Please sign in for more.";
        return NextResponse.json(
          { error: errorMessage },
          { status: 429 }
        );
      }

      // Generate the brief with sanitized inputs
      const result = await buildMeetingBriefGemini(sanitizedName, sanitizedOrganization);
      const normalizedBrief = normalizeCitations(result.brief, result.citations);

      // Save to database with sanitized inputs
      await client.query(
        `INSERT INTO user_briefs (user_id, name, organization, brief_content)
         VALUES ($1, $2, $3, $4)`,
        [userId, sanitizedName, sanitizedOrganization, normalizedBrief]
      );

      // Update usage count
      await client.query(
        `INSERT INTO user_brief_counts (user_id, current_month_count, current_month_start)
         VALUES ($1, 1, $2)
         ON CONFLICT (user_id)
         DO UPDATE SET 
           current_month_count = CASE 
             WHEN user_brief_counts.current_month_start = $2 THEN user_brief_counts.current_month_count + 1
             ELSE 1
           END,
           current_month_start = $2`,
        [userId, new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
      );

      return NextResponse.json({ 
        brief: normalizedBrief,
        remainingBriefs: monthlyLimit - currentMonthCount - 1,
        isAnonymous: !session?.user?.id
      });

    } finally {
      client.release();
    }
  } catch (error: unknown) {
    return createSecureErrorResponse(error);
  }
}