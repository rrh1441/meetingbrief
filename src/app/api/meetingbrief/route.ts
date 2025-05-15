// src/app/api/meetingbrief/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildMeetingBriefGemini } from "@/lib/MeetingBriefGeminiPipeline";  // ← uses new OpenAI-based pipeline

/*────────────────────  Helper: superscript citations  */

function normalizeCitations(
  brief: string,
  citations: { marker: string; url: string }[]
): string {
  if (!citations?.length || typeof brief !== "string") return brief;

  // Build lookup map: "1" -> superscript link
  const sup: Record<string, string> = {};
  citations.forEach((c, i) => {
    const n = (i + 1).toString();
    sup[n] = `<sup><a class="text-blue-600 underline hover:no-underline" href="${c.url}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
  });

  // Replace each [^N] (or loose ^N) cluster with superscript(s)
  brief = brief.replace(/(\[\s*\^|\^)\s*([\d\s,]+)(?=\]|\s|,|$)/g,
    (_m, _pre, nums) => {
      const unique = Array.from(
        new Set(nums.split(/[\s,]+/).filter(n => sup[n]))
      );
      return unique.map(n => sup[n]).join("");
    }
  );

  // Strip stray brackets/carets
  return brief.replace(/[\[\]\^,]/g, "")
              .replace(/\s+\n/g, "\n")
              .replace(/\n{3,}/g, "\n\n")
              .trim();
}

/*────────────────────  POST handler  */

export async function POST(req: NextRequest) {
  try {
    const { name, org, team } = await req.json();
    const payload = await buildMeetingBriefGemini(name, org, team);

    if (payload.brief && payload.citations?.length) {
      payload.brief = normalizeCitations(payload.brief, payload.citations);
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "pipeline failed" },
      { status: 500 }
    );
  }
}
