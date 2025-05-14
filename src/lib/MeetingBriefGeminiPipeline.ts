// lib/MeetingBriefGeminiPipeline.ts
import fs from "fs";
import { VertexAI } from "@google-cloud/vertexai";

export const runtime = "nodejs"; // Node APIs required for Vertex SDK

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

/* ── internal response shims (partial) ─────────────────────────────── */
interface Part      { text?: string }
interface Content   { parts?: Part[] }
interface WebInfo   { uri?: string; title?: string; htmlSnippet?: string }
interface Chunk     { web?: WebInfo }
interface Grounding { groundingChunks?: Chunk[]; webSearchQueries?: unknown[] }
interface Candidate { content?: Content; groundingMetadata?: Grounding }

/* ── markdown post-processor ───────────────────────────────────────── */
function formatBrief(md: string): string {
  // Normalise top heading
  md = md.replace(
    /^#+\s*Meeting Brief:\s*(.+)$/im,
    (_, subj) => `## **Meeting Brief: ${subj.trim()}**`,
  );

  // Convert any numbered headings → bold headers (and capture renames)
  md = md
    .replace(/^###\s*1\.\s*Executive Summary/i, "**Executive Summary**")
    .replace(/^###\s*2\.\s*Notable\s+.*$/im, "**Notable Highlights**")
    .replace(/^###\s*3\.\s*Interesting.*$/im, "**Interesting / Fun Facts**")
    .replace(/^###\s*4\.\s*Detailed.*$/im, "**Detailed Research Notes**")
    .replace(/^\*\*\d+\.\*\*\s*(.+)$/gm, "**$1**")
    .replace(/^###\s*\d+\.\s*(.+)$/gm, "**$1**");

  // Ensure blank line before & after every bold header
  md = md.replace(/\n(?=\*\*)/g, "\n\n").replace(/\*\*\n(?!\n)/g, "**\n\n");

  // Strip bullet markers in Executive Summary
  md = md.replace(
    /\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_, body) => body.replace(/^[ \t]*[-*]\s+/gm, ""),
  );

  return md.trim();
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
3–6 concise **factual** sentences (no adjectives, no opinions, no bullet characters) – each ends with a footnote like [^1]

**Notable Highlights**  
• bullet list – awards, controversies, major milestones (omit if none) – every bullet ends with a footnote

**Interesting / Fun Facts**  
• bullet list (max 2) – light rapport-building items – each ends with a footnote

**Detailed Research Notes**  
• bullet list – career chronology, recent activity (≤ 24 mo), team context – every bullet ends with a footnote

RULES
• ≤ 1 000 words total  
• Every sentence or bullet **must** end with a markdown footnote link like [^1]  
• ≥ 1 reputable source per fact (≥ 2 for negative claims)  
• If a fact cannot meet the evidence rule, drop it
`.trim();

/* Types for tools lag behind SDK – cast to any to avoid “no-explicit-any” error. */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const model = (vertex.preview as any).getGenerativeModel({
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