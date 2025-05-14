// lib/MeetingBriefGeminiPipeline.ts
import fs from "fs";
import { VertexAI } from "@google-cloud/vertexai";

export const runtime = "nodejs"; // Vertex SDK needs full Node APIs

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

/* ── payload types ─────────────────────────────────────────────────── */
export interface MeetingBriefPayload {
  brief: string;
  citations: { marker: string; url: string }[];
  tokens: number;
  searches: number;
  searchResults: { url: string; title: string; snippet: string }[];
}

/* ── helper types for partial Vertex response ──────────────────────── */
interface Part      { text?: string }
interface Content   { parts?: Part[] }
interface WebInfo   { uri?: string; title?: string; htmlSnippet?: string }
interface Chunk     { web?: WebInfo }
interface Grounding { groundingChunks?: Chunk[]; webSearchQueries?: unknown[] }
interface Candidate { content?: Content; groundingMetadata?: Grounding }

/* ── markdown post-processor ───────────────────────────────────────── */
function formatBrief(md: string): string {
  md = md.replace(
    /^#+\s*Meeting Brief:\s*(.+)$/im,
    (_, subj) => `## **Meeting Brief: ${subj.trim()}**`
  );

  md = md
    .replace(/^###\s*\d+\.\s*(.+)$/gm, "**$1**")
    .replace(/^\*\*\d+\.\*\*\s*(.+)$/gm, "**$1**")
    .replace(/^\d+\.\s*(.+)$/gm, "**$1**");

  md = md.replace(/\n(?=\*\*)/g, "\n\n");

  md = md.replace(
    /\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_, body) => body.replace(/^[ \t]*[-*]\s+/gm, "")
  );

  return md.trim();
}

/* ── main helper ───────────────────────────────────────────────────── */
export async function buildMeetingBriefGemini(
  name: string,
  org: string
): Promise<MeetingBriefPayload> {
  const prompt = `
SUBJECT
• Person  : ${name}
• Employer: ${org}

FORMAT (markdown – follow exactly)
## **Meeting Brief: ${name} – ${org}**

**Executive Summary**  
3–6 concise sentences (no bullet characters)

**Notable Flags**  
• bullet list – omit section if none

**Interesting / Fun Facts**  
• bullet list (max 2)

**Detailed Research Notes**  
• bullet list

RULES
• ≤ 1 000 words total  
• Each bullet ends with a markdown footnote link like [^1]  
• ≥ 1 reputable source per fact (≥ 2 for negative claims)  
• If the evidence rule can’t be met, drop the fact
`.trim();

/* The typings for tools lag behind the API; cast to suppress TS error. */
// @ts-expect-error googleSearch tool missing in Vertex SDK typings
  const model = vertex.preview.getGenerativeModel({
    model: "gemini-2.5-pro-preview-05-06",
    tools: [{ googleSearch: {} }],
    generationConfig: { maxOutputTokens: 1024, temperature: 0.2 },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    responseMimeType: "text/plain",
  });

  const cand = (result.response.candidates ?? [])[0] as Candidate | undefined;
  const raw  = cand?.content?.parts?.[0]?.text ?? "";
  const brief = formatBrief(raw);

/* ── citations & grounded results ─────────────────────────────────── */
  const chunks = cand?.groundingMetadata?.groundingChunks ?? [];
  const citations = chunks.map((c, i) => ({
    marker: `[^${i + 1}]`,
    url: c.web?.uri ?? "",
  }));

  const searchResults = chunks.map(c => ({
    url: c.web?.uri ?? "",
    title: c.web?.title ?? "",
    snippet: c.web?.htmlSnippet ?? "",
  }));

/* ── counts ────────────────────────────────────────────────────────── */
  const usage    = result.usageMetadata ?? {};
  const tokens   = usage.totalTokenCount ??
                  (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches = cand?.groundingMetadata?.webSearchQueries?.length ?? 0;

  return { brief, citations, tokens, searches, searchResults };
}