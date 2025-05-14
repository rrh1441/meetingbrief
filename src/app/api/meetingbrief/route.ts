// src/app/api/meetingbrief/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildMeetingBriefGemini } from "@/lib/MeetingBriefGeminiPipeline";

// Robust, strictly-typed citation normalization (safe for any payload)
function normalizeCitations(
  brief: string,
  citations: { marker: string; url: string }[]
): string {
  if (!citations || !Array.isArray(citations) || citations.length === 0) return brief;
  if (typeof brief !== "string") return brief;

  // Matches [^1], ^2, [^1, 2], ^3, 5], etc.
  const citationRegex = /(\[\s*\^|\^)\s*([\d\s,]+)(?=\]|\s|,|$)/g;

  // Build lookup for superscript anchors
  const supLinks: Record<string, string> = {};
  for (let i = 0; i < citations.length; ++i) {
    const n = (i + 1).toString();
    supLinks[n] =
      `<sup><a class="text-blue-600 underline hover:no-underline" href="${citations[i].url}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
  }

  // Replace all citation clusters
  brief = brief.replace(citationRegex, (_match, _pre, numList) => {
    const numsSet: Set<string> = new Set(
      numList
        .split(/[\s,]+/)
        .map((n: string) => n.trim())
        .filter((n: string) => n && supLinks[n])
    );
    const nums: string[] = Array.from(numsSet);
    return nums.map((n: string) => supLinks[n]).join("");
  });

  // Remove any leftover [ ^, [^, ^, ]
  brief = brief.replace(/[\[\]\^,]/g, "");

  // Remove accidental repeated superscripts
  brief = brief.replace(/(<sup>.*?<\/sup>)+/g, (s: string) => {
    const re = /<sup><a.*?>(\d+)<\/a><\/sup>/g;
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    let out = "";
    while ((m = re.exec(s))) {
      if (!seen.has(m[1])) {
        out += m[0];
        seen.add(m[1]);
      }
    }
    return out;
  });

  // Clean up whitespace
  return brief.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function POST(req: NextRequest) {
  try {
    const { name, org } = await req.json();
    const payload = await buildMeetingBriefGemini(name, org);

    // Only normalize if citations is a non-empty array and brief is string
    if (
      payload &&
      typeof payload.brief === "string" &&
      Array.isArray(payload.citations) &&
      payload.citations.length > 0
    ) {
      payload.brief = normalizeCitations(payload.brief, payload.citations);
    }

    return NextResponse.json(payload);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "pipeline failed" }, { status: 500 });
  }
}
