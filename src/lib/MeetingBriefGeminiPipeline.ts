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

/* ── Vertex client ───────────────────────────────────────────────── */
const vertex = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION ?? "us-central1",
});

/* ── payload type ───────────────────────────────────────────────── */
export interface MeetingBriefPayload {
  brief: string;
  citations: { marker: string; url: string }[];
  tokens: number;
  searches: number;
  searchResults: { url: string; title: string; snippet: string }[];
}

/* ── Vertex response shims (partial) ────────────────────────────── */
interface Part      { text?: string }
interface Content   { parts?: Part[] }
interface WebInfo   { uri?: string; title?: string; htmlSnippet?: string }
interface Chunk     { web?: WebInfo }
interface Grounding { groundingChunks?: Chunk[]; webSearchQueries?: unknown[] }
interface Candidate { content?: Content; groundingMetadata?: Grounding }

/* ── markdown post-processor ─────────────────────────────────────── */
function formatBrief(md: string): string {
  /* top heading → ## **Meeting Brief: …** */
  md = md.replace(
    /^#+\s*Meeting Brief:\s*(.+)$/im,
    (_, subj) => `## **Meeting Brief: ${subj.trim()}**`,
  );

  /* numbered → bold headers, rename section 2 */
  md = md
    .replace(/^###\s*1\.\s*Executive Summary/i, "**Executive Summary**")
    .replace(/^###\s*2\.\s*.+$/im,           "**Notable Highlights**")
    .replace(/^###\s*3\.\s*.+$/im,           "**Interesting / Fun Facts**")
    .replace(/^###\s*4\.\s*.+$/im,           "**Detailed Research Notes**")
    .replace(/^###\s*\d+\.\s*(.+)$/gm,       "**$1**")        // fallback
    .replace(/^\*\*\d+\.\*\*\s*(.+)$/gm,     "**$1**");

  /* blank line before & after each header */
  md = md.replace(/(\n)?\*\*/g, "\n\n**");  // before
  md = md.replace(/\*\*[^\n]*\*\*(?!\n\n)/g, m => `${m}\n\n`); // after

  /* Exec Summary – strip bullet markers */
  md = md.replace(
    /\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_, body) => body.replace(/^[ \t]*[-*]\s+/gm, ""),
  );

  /* For list sections: add “* ” if missing */
  md = md.replace(
    /\*\*(Notable Highlights|Interesting \/ Fun Facts|Detailed Research Notes)\*\*([\s\S]*?)(?=\n\*\*|$)/g,
    (_, title, block) =>
      `**${title}**${block.replace(/^(?![*\-\s])([^\n]+)/gm, "* $1")}`,
  );

  return md.trim();
}

/* ── main helper ─────────────────────────────────────────────────── */
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
3–6 concise **factual** sentences (no adjectives or opinion).  
Each sentence **must** end with a footnote like [^1]

**Notable Highlights**  
* bullet list – awards, lawsuits, major milestones (omit section if none)

**Interesting / Fun Facts**  
* bullet list (max 2) – light rapport builders

**Detailed Research Notes**  
* bullet list – career timeline, team context, activity ≤ 24 mo

RULES
• ≤ 1 000 words total  
• **Every** sentence or bullet ends with a footnote like [^1]  
• ≥ 1 reputable source per fact (≥ 2 for negative claims)  
• Drop any fact that can’t meet the evidence rule
`.trim();

/* typings lag – cast preview to any */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const model = (vertex.preview as any).getGenerativeModel({
    model: "gemini-2.5-pro-preview-05-06",
    tools: [{ googleSearch: {} }],
    generationConfig: { maxOutputTokens: 1024, temperature: 0.2 },
  });

  const result  = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    responseMimeType: "text/plain",
  });

  const cand    = (result.response.candidates ?? [])[0] as Candidate | undefined;
  const rawMd   = cand?.content?.parts?.[0]?.text ?? "";
  const brief   = formatBrief(rawMd);

  const chunks  = cand?.groundingMetadata?.groundingChunks ?? [];
  const citations = chunks.map((c, i) => ({
    marker: `[^${i + 1}]`,
    url: c.web?.uri ?? "",
  }));

  const searchResults = chunks.map(c => ({
    url:     c.web?.uri ?? "",
    title:   c.web?.title ?? "",
    snippet: c.web?.htmlSnippet ?? "",
  }));

  const usage  = result.usageMetadata ?? {};
  const tokens = usage.totalTokenCount ??
                (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches =
    cand?.groundingMetadata?.webSearchQueries?.length ?? 0;

  return { brief, citations, tokens, searches, searchResults };
}