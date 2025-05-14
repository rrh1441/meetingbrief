// lib/MeetingBriefGeminiPipeline.ts
import fs from "fs";
import { VertexAI } from "@google-cloud/vertexai";

export const runtime = "nodejs";

/* ── service-account setup ───────────────────────────────────────── */
const saJson = process.env.GCP_SA_JSON;
if (!saJson) throw new Error("GCP_SA_JSON env var not set");

const keyPath = "/tmp/sa_key.json";
if (!fs.existsSync(keyPath)) fs.writeFileSync(keyPath, saJson, "utf8");
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

/* ── Vertex client ──────────────────────────────────────────────── */
const vertex = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION ?? "us-central1",
});

/* ── outward payload ────────────────────────────────────────────── */
export interface MeetingBriefPayload {
  brief: string;
  citations: { marker: string; url: string }[];
  tokens: number;
  searches: number;
  searchResults: { url: string; title: string; snippet: string }[];
}

/* ── partial Vertex response types ─────────────────────────────── */
interface Part      { text?: string }
interface Content   { parts?: Part[] }
interface WebInfo   { uri?: string; title?: string; htmlSnippet?: string }
interface Chunk     { web?: WebInfo }
interface Grounding { groundingChunks?: Chunk[]; webSearchQueries?: unknown[] }
interface Candidate { content?: Content; groundingMetadata?: Grounding }

/* ── helpers ────────────────────────────────────────────────────── */
function normaliseHeaders(md: string): string {
  md = md.replace(
    /^#+\s*Meeting Brief:\s*(.+)$/im,
    (_: string, subj: string) => `## **Meeting Brief: ${subj.trim()}**`,
  );

  md = md
    .replace(/^###\s*1\.\s*Executive Summary/i, "**Executive Summary**")
    .replace(/^###\s*2\.\s*.+$/im,           "**Notable Highlights**")
    .replace(/^###\s*3\.\s*.+$/im,           "**Interesting / Fun Facts**")
    .replace(/^###\s*4\.\s*.+$/im,           "**Detailed Research Notes**")
    .replace(/^###\s*\d+\.\s*(.+)$/gm,       "**$1**")
    .replace(/^\*\*\d+\.\*\*\s*(.+)$/gm,     "**$1**");

  /* exactly two newlines after every header (no newline insertion inside) */
  md = md.replace(/^\*\*[^\n]*\*\*(?=\n)/gm, (h: string) => `${h}\n`);
  md = md.replace(/^\*\*[^\n]*\*\*(?!\n{2})/gm, (h: string) => `${h}\n\n`);

  return md.trim();
}

function bulletiseAndClean(md: string): string {
  // Exec-summary: strip any leading bullet markers
  md = md.replace(
    /\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_: string, block: string) =>
      "**Executive Summary**\n\n" + block.replace(/^[ \t]*[-*]\s+/gm, ""),
  );

  // Add "* " to un-bulleted lines and remove bold date prefixes
  md = md.replace(
    /\*\*(Notable Highlights|Interesting \/ Fun Facts|Detailed Research Notes)\*\*([\s\S]*?)(?=\n\*\*|$)/g,
    (_m: string, title: string, blk: string) => {
      let body = blk.replace(/^(?![*\-\s])([^\n]+)/gm, "* $1");

      if (title === "Detailed Research Notes") {
        body = body.replace(/^\*\*\d{4}[^:]*:\*\*\s*/gm, "* ");   // **2025-05-08:** …
        body = body.replace(/^\*\*[A-Za-z]+[^:]*\d{4}:?\*\*\s*/gm, "* "); // **May 8, 2025:**
      }
      return `**${title}**${body}`;
    },
  );

  return md;
}

/* –– foot-notes ––––––––––––––––––––––––––––––––––––––––––––––––––– */
interface Citation { marker: string; url: string }

function ensureFootnotes(md: string, citations: Citation[]): string {
  let idx = 0;

  /* if model suppressed markers, add them */
  if (!/\[\^\d+\]/.test(md) && citations.length) {
    md = md.replace(/^(?:[*\-]\s+[^\n]+?)(?!\s+\[\^\d+\])/gm, (line: string) =>
      idx < citations.length ? `${line} ${citations[idx++].marker}` : line,
    );

    md = md.replace(
      /\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
      (_: string, block: string) =>
        "**Executive Summary**\n\n" +
        block.replace(/([.!?])(\s+|$)/g, (__, punct: string, gap: string) =>
          idx < citations.length
            ? `${punct} ${citations[idx++].marker}${gap}`
            : `${punct}${gap}`,
        ),
    );
  }

  /* strip negative bullets lacking ≥ 2 markers */
  md = md.replace(
    /\*\*Notable Highlights\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_: string, block: string) =>
      "**Notable Highlights**" +
      block
        .split("\n")
        .filter((ln: string) => {
          const lower = ln.toLowerCase();
          const negative =
            /arrest|lawsuit|felony|indict|fraud/.test(lower);
          const foots   = (ln.match(/\[\^\d+\]/g) ?? []).length;
          return !negative || foots >= 2;
        })
        .join("\n"),
  );

  /* always append a foot-note list */
  md += "\n\n---\n";
  if (citations.length) {
    citations.forEach(c => {
      md += `${c.marker}: ${c.url || "(source URL pending)"}\n`;
    });
  } else {
    md += "_No external sources available for this summary_\n";
  }

  return md.trim();
}

/* ── main helper ────────────────────────────────────────────────── */
export async function buildMeetingBriefGemini(
  name: string,
  org: string,
): Promise<MeetingBriefPayload> {
  const prompt = `
SUBJECT
• Person  : ${name}
• Employer: ${org}

FORMAT (markdown – follow exactly)
## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
3–6 concise **factual** sentences; each ends with [^1]

**Notable Highlights**
* bullet list – awards, lawsuits, milestones

**Interesting / Fun Facts**
* bullet list (max 2)

**Detailed Research Notes**
* bullet list – timeline, activity ≤ 24 mo

RULES
• ≤ 1 000 words total
• **Every** line ends with a foot-note like [^1]
• ≥ 1 reputable source per fact (≥ 2 for negative claims)
• Drop any fact that can’t meet the rule
`.trim();

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const model = (vertex.preview as any).getGenerativeModel({
    model: "gemini-2.5-pro-preview-05-06",
    tools: [{ googleSearch: {} }],
    generationConfig: { maxOutputTokens: 5000, temperature: 0.2 },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    responseMimeType: "text/plain",
  });

  const cand  = (result.response.candidates ?? [])[0] as Candidate | undefined;
  const rawMd = cand?.content?.parts?.[0]?.text ?? "";

  if (process.env.VERCEL_LOGS) {
    console.log("RAW length:", rawMd.length);
    console.log("USAGE:", result.usageMetadata);
  }

  const chunks = cand?.groundingMetadata?.groundingChunks ?? [];
  const citations: Citation[] = chunks.map((c, i) => ({
    marker: `[^${i + 1}]`,
    url: c.web?.uri ?? "",
  }));

  const searchResults = chunks.map(c => ({
    url: c.web?.uri ?? "",
    title: c.web?.title ?? "",
    snippet: c.web?.htmlSnippet ?? "",
  }));

  let brief = normaliseHeaders(rawMd);
  brief = bulletiseAndClean(brief);
  brief = ensureFootnotes(brief, citations);

  const usage   = result.usageMetadata ?? {};
  const tokens  = usage.totalTokenCount ??
                 (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches =
    cand?.groundingMetadata?.webSearchQueries?.length ?? 0;

  return { brief, citations, tokens, searches, searchResults };
}