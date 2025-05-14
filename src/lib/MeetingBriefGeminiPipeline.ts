// lib/MeetingBriefGeminiPipeline.ts
import fs from "fs";
import { VertexAI } from "@google-cloud/vertexai";

export const runtime = "nodejs";

/* ── service-account setup ─────────────────────────────────────────── */
const saJson = process.env.GCP_SA_JSON;
if (!saJson) throw new Error("GCP_SA_JSON env var not set");

const keyPath = "/tmp/sa_key.json";
if (!fs.existsSync(keyPath)) fs.writeFileSync(keyPath, saJson, "utf8");
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

/* ── Vertex client ─────────────────────────────────────────────────── */
const vertex = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION ?? "us-central1",
});

/* ── types ─────────────────────────────────────────────────────────── */
export interface MeetingBriefPayload {
  brief: string;
  citations: { marker: string; url: string }[];
  tokens: number;
  searches: number;
  searchResults: { url: string; title: string; snippet: string }[];
}

interface Part { text?: string }
interface Content { parts?: Part[] }
interface WebInfo { uri?: string; title?: string; htmlSnippet?: string }
interface Chunk { web?: WebInfo }
interface Grounding { groundingChunks?: Chunk[]; webSearchQueries?: unknown[] }
interface Candidate { content?: Content; groundingMetadata?: Grounding }

/* ── post-processors ───────────────────────────────────────────────── */
function tidyHeaders(md: string): string {
  md = md.replace(/^#+\s*Meeting Brief:\s*(.+)$/im, (_, s) => `## **Meeting Brief: ${s.trim()}**`);

  md = md
    .replace(/^###\s*1\.\s*Executive Summary/i, "**Executive Summary**")
    .replace(/^###\s*2\.\s*.+$/im,           "**Notable Highlights**")
    .replace(/^###\s*3\.\s*.+$/im,           "**Interesting / Fun Facts**")
    .replace(/^###\s*4\.\s*.+$/im,           "**Detailed Research Notes**")
    .replace(/^###\s*\d+\.\s*(.+)$/gm,       "**$1**")
    .replace(/^\*\*\d+\.\*\*\s*(.+)$/gm,     "**$1**");

  // blank line before & after each header
  md = md.replace(/(\n)?\*\*/g, "\n\n**")
         .replace(/\*\*[^\n]*\*\*(?!\n\n)/g, m => `${m}\n\n`);

  return md.trim();
}

function ensureBullets(md: string): string {
  // Strip bullets from Exec-Summary block
  md = md.replace(
    /\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_, b) => `**Executive Summary**\n\n` + b.replace(/^[ \t]*[-*]\s+/gm, ""),
  );

  // Add '* ' to list sections if missing
  md = md.replace(
    /\*\*(Notable Highlights|Interesting \/ Fun Facts|Detailed Research Notes)\*\*([\s\S]*?)(?=\n\*\*|$)/g,
    (_, title, blk) =>
      `**${title}**${blk.replace(/^(?![*\-\s])([^\n]+)/gm, "* $1")}`,
  );

  return md;
}

function injectFootnotes(md: string, citations: { marker: string }[]): string {
  // if model already inserted footnotes leave them
  if (/\[\^\d+\]/.test(md)) return md;

  let idx = 0;
  // add markers to bullets
  md = md.replace(/^(?:[*\-]\s+[^\n]+)(?!\s+\[\^\d+\])/gm, line =>
    idx < citations.length ? `${line} ${citations[idx++].marker}` : line
  );

  // add markers to Exec-Summary sentences
  md = md.replace(
    /\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_, block) =>
      "**Executive Summary**\n\n" +
      block.replace(/([.!?])(\s+|$)/g, (m, p, q) =>
        idx < citations.length ? `${p} ${citations[idx++].marker}${q}` : m
      ),
  );

  // append footnote list
  if (citations.length) {
    md += "\n\n---\n";
    citations.forEach(c => (md += `${c.marker}: ${c.url}\n`));
  }

  return md;
}

/* ── main helper ───────────────────────────────────────────────────── */
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
3–6 concise **factual** sentences (no adjectives/opinion). Each ends with [^1]

**Notable Highlights**
* bullet list – awards, lawsuits, milestones

**Interesting / Fun Facts**
* bullet list (max 2)

**Detailed Research Notes**
* bullet list – timeline, activity ≤ 24 mo

RULES
• ≤ 1 000 words total
• **Every** sentence or bullet ends with a footnote like [^1]
• ≥ 1 reputable source per fact (≥ 2 for negative claims)
• Drop any fact that can’t meet the rule
`.trim();

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const model = (vertex.preview as any).getGenerativeModel({
    model: "gemini-2.5-pro-preview-05-06",
    tools: [{ googleSearch: {} }],
    generationConfig: { maxOutputTokens: 1536, temperature: 0.2 },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    responseMimeType: "text/plain",
  });

  const cand  = (result.response.candidates ?? [])[0] as Candidate | undefined;
  const rawMd = cand?.content?.parts?.[0]?.text ?? "";

  const chunks = cand?.groundingMetadata?.groundingChunks ?? [];
  const citations = chunks.map((c, i) => ({
    marker: `[^${i + 1}]`,
    url: c.web?.uri ?? "",
  }));

  /* diagnostics */
  if (process.env.VERCEL_LOGS) {
    console.log("RAW length:", rawMd.length);
    console.log("USAGE:", result.usageMetadata);
  }

  /* post-process */
  let brief = tidyHeaders(rawMd);
  brief = ensureBullets(brief);
  brief = injectFootnotes(brief, citations);

  /* counts */
  const usage = result.usageMetadata ?? {};
  const tokens =
    usage.totalTokenCount ??
    (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches =
    cand?.groundingMetadata?.webSearchQueries?.length ?? 0;

  /* grounded search results */
  const searchResults = chunks.map(c => ({
    url: c.web?.uri ?? "",
    title: c.web?.title ?? "",
    snippet: c.web?.htmlSnippet ?? "",
  }));

  return { brief, citations, tokens, searches, searchResults };
}