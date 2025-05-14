// app/api/meetingbrief/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildMeetingBriefGemini } from "@/lib/MeetingBriefGeminiPipeline";

// --- Citation normalization utility ---
function normalizeCitations(
  brief: string,
  citations: { marker: string; url: string }[]
): string {
  if (!citations.length) return brief;

  // Step 1: Find ALL citation clusters like: ^1, 2], [^2, ^3], [^2, [^3]], etc.
  // Regex matches [^1], ^2, [^1, 2], ^3, 5], etc.
  // It will match all citation patterns, even ugly ones, and split them into numbers.
  const citationRegex = /(\[\s*\^|\^)\s*([\d\s,]+)(?=\]|\s|,|$)/g;

  // Gather all numbers (as strings) in the order of the citations array (1-indexed)
  // We'll map each number (as a string) to its superscript.
  const supLinks: { [n: string]: string } = {};
  for (let i = 0; i < citations.length; ++i) {
    const n = (i + 1).toString();
    supLinks[n] = `<sup><a class="text-blue-600 underline hover:no-underline" href="${citations[i].url}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
  }

  // Replace all clusters in text (each cluster can have one or more numbers)
  brief = brief.replace(citationRegex, (_match, _pre, numList) => {
    // Split on comma/space and dedupe
    const nums = Array.from(
      new Set(
        numList
          .split(/[\s,]+/)
          .map(n => n.trim())
          .filter(n => n && supLinks[n])
      )
    );
    // Replace with one or more superscripts (in order)
    return nums.map(n => supLinks[n]).join("");
  });

  // Remove any remaining [ ^, [^, ^, ] that weren't replaced (leftover garbage)
  brief = brief.replace(/[\[\]\^,]/g, "");

  // Remove accidental trailing or double superscripts
  brief = brief.replace(/(<sup>.*?<\/sup>)+/g, (s) => {
    // Only keep the unique citation numbers in this group
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

  // Optional: clean up extra whitespace
  return brief.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function POST(req: NextRequest) {
  try {
    const { name, org } = await req.json();
    const payload = await buildMeetingBriefGemini(name, org);

    // -- Key normalization step --
    payload.brief = normalizeCitations(payload.brief, payload.citations);

    return NextResponse.json(payload);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "pipeline failed" }, { status: 500 });
  }
}
