/* ------------------------------------------------------------------
 *  API route:  POST /api/meetingbrief
 *  Body JSON:  { "name": "...", "org": "...", "team": "..."? }
 *  Returns  :  MeetingBriefPayload  (brief HTML + citations array …)
 * -----------------------------------------------------------------*/

import { NextRequest, NextResponse } from "next/server";
import { buildMeetingBriefGemini } from "@/lib/MeetingBriefGeminiPipeline";

/*──────────────────────────  superscript helper  */

function normalizeCitations(
  brief: string,
  citations: { marker: string; url: string }[]
): string {
  if (!Array.isArray(citations) || citations.length === 0) return brief;
  if (typeof brief !== "string") return brief;

  /* build lookup table */
  const sup: Record<string, string> = {};
  citations.forEach((c, i) => {
    const n = (i + 1).toString();
    sup[n] = `<sup><a class="text-blue-600 underline hover:no-underline" href="${c.url}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
  });

  /* replace every cluster like [^1, 2] or ^3 */
  brief = brief.replace(
    /(\[\s*\^|\^)\s*([\d\s,]+)(?=\]|\s|,|$)/g,
    (_match: string, _pre: string, nums: string) => {
      const unique = Array.from(
        new Set(
          nums.split(/[\s,]+/).filter((num: string) => num && sup[num])
        )
      );
      return unique.map((num: string) => sup[num]).join("");
    }
  );

  /* strip stray symbols and clean spacing */
  return brief
    .replace(/[\[\]\^,]/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/*──────────────────────────  POST handler  */

export async function POST(req: NextRequest) {
  try {
    const { name, org, team } = await req.json();

    if (!name || !org) {
      return NextResponse.json(
        { error: "name and org are required" },
        { status: 400 }
      );
    }

    const payload = await buildMeetingBriefGemini(name, org, team);

    if (payload.brief && payload.citations?.length) {
      payload.brief = normalizeCitations(payload.brief, payload.citations);
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "pipeline failed" }, { status: 500 });
  }
}
