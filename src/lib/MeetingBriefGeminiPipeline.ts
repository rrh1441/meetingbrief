// lib/MeetingBriefGeminiPipeline.ts
import fs from "fs";
import { VertexAI } from "@google-cloud/vertexai";

export const runtime = "nodejs";

/* ── service-account ─────────────────────────────────────────────── */
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

/* ── partial Vertex types ───────────────────────────────────────── */
interface Part      { text?: string }
interface Content   { parts?: Part[] }
interface WebInfo   { uri?: string; title?: string; htmlSnippet?: string }
interface Chunk     { web?: WebInfo }
interface Grounding { groundingChunks?: Chunk[]; webSearchQueries?: unknown[] }
interface Candidate { content?: Content; groundingMetadata?: Grounding }

/* ── header / spacing helper ────────────────────────────────────── */
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

  // ensure exactly two newlines after every header
  md = md.replace(/^\*\*[^\n]*\*\*(?=\n)/gm, (h: string) => `${h}\n`);
  md = md.replace(/^\*\*[^\n]*\*\*(?!\n{2})/gm, (h: string) => `${h}\n\n`);

  return md.trim();
}

/* ── bullets, date strip, negative filter ───────────────────────── */
function shapeSections(md: string): string {
  md = md.replace(
    /\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_: string, block: string) =>
      "**Executive Summary**\n\n" + block.replace(/^[ \t]*[-*]\s+/gm, ""),
  );

  md = md.replace(
    /\*\*(Notable Highlights|Interesting \/ Fun Facts|Detailed Research Notes)\*\*([\s\S]*?)(?=\n\*\*|$)/g,
    (_: string, title: string, blk: string) => {
      let body = blk.replace(/^(?![*\-\s])([^\n]+)/gm, "* $1");

      if (title === "Detailed Research Notes") {
        body = body
          .replace(/^\*\*\d{4}[^:]*:\*\*\s*/gm, "* ")
          .replace(/^\*\*[A-Za-z]+[^:]*\d{4}:?\*\*\s*/gm, "* ");
      }

      if (title === "Notable Highlights") {
        body = body
          .split("\n")
          .filter((ln: string) => {
            const neg = /arrest|lawsuit|felony|indict|fraud/i.test(ln);
            const refs = (ln.match(/\[\^\d+\]/g) ?? []).length;
            return !neg || refs >= 2;
          })
          .join("\n");
      }

      return `**${title}**${body}`;
    },
  );

  return md;
}

/* ── footnote utilities ─────────────────────────────────────────── */
interface Citation { marker: string; url: string }

function normaliseCaretMarkers(md: string): string {
  /* Gemini often emits plain caret numbers (^7). Turn them into [^7] */
  return md.replace(/(\s)\^(\d{1,4})(\b)/g, (_, a: string, n: string, b: string) =>
    `${a}[^${n}]${b}`,
  );
}

function ensureInlineMarkers(md: string, citations: Citation[]): string {
  if (/\[\^\d+\]/.test(md) || citations.length === 0) return md;

  let idx = 0;
  md = md.replace(/^(?:[*\-]\s+[^\n]+?)(?!\s+\[\^\d+\])/gm, (line: string) =>
    idx < citations.length ? `${line} ${citations[idx++].marker}` : line,
  );

  md = md.replace(
    /\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_: string, block: string) =>
      "**Executive Summary**\n\n" +
      block.replace(/([.!?])(\s+|$)/g, (__, p: string, gap: string) =>
        idx < citations.length ? `${p} ${citations[idx++].marker}${gap}` : `${p}${gap}`,
      ),
  );

  return md;
}

function linkifyMarkers(md: string, citations: Citation[]): string {
  citations.forEach((c: Citation, i: number) => {
    const n = i + 1;
    const anchor =
      `<sup><a class="text-blue-600 underline hover:no-underline" ` +
      `href="${c.url}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
    md = md.replace(new RegExp(`\$begin:math:display$\\\\^${n}\\$end:math:display$`, "g"), anchor);
  });
  return md;
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
• Drop any fact that cannot meet the rule
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

  /* ── post-process ─────────────────────────────────────────────── */
  let brief = normaliseCaretMarkers(rawMd);
  brief = normaliseHeaders(brief);
  brief = shapeSections(brief);
  brief = ensureInlineMarkers(brief, citations);
  brief = linkifyMarkers(brief, citations);

  /* ── counters ─────────────────────────────────────────────────── */
  const usage    = result.usageMetadata ?? {};
  const tokens   = usage.totalTokenCount ??
                  (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches =
    cand?.groundingMetadata?.webSearchQueries?.length ?? 0;

  return { brief, citations, tokens, searches, searchResults };
}