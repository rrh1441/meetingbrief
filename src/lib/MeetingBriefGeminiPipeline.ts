// lib/MeetingBriefGeminiPipeline.ts
import fs from "fs";
import { VertexAI } from "@google-cloud/vertexai";

/* ── env sanity ───────────────────────────────────────────────────────── */
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS!;
if (!fs.existsSync(keyPath)) {
  throw new Error(`Service-account key not found at ${keyPath}`);
}

/* ── Vertex client ────────────────────────────────────────────────────── */
const vertex = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION ?? "us-central1",
});

/* ── types ────────────────────────────────────────────────────────────── */
export interface MeetingBriefPayload {
  brief: string;
  citations: { marker: string; url: string }[];
  tokens: number;
  searches: number;
  searchResults: { url: string; title: string; snippet: string }[];
}

/* ── markdown post-processor ──────────────────────────────────────────── */
function formatBrief(md: string): string {
  // 1. Standardise top heading   → ## **Meeting Brief: Name – Org**
  md = md.replace(
    /^#+\s*Meeting Brief:\s*(.+)$/im,
    (_m, subj) => `## **Meeting Brief: ${subj.trim()}**`
  );

  // 2. Convert any “### 1. Title” or “**1.** Title” → **Title**
  md = md
    .replace(/^###\s*\d+\.\s*(.+)$/gm, "**$1**")
    .replace(/^\*\*\d+\.\*\*\s*(.+)$/gm, "**$1**")
    .replace(/^\d+\.\s*(.+)$/gm, "**$1**");

  // 3. Ensure blank line before each bold header
  md = md.replace(/\n(?=\*\*)/g, "\n\n");

  // 4. In Executive Summary block, strip bullet markers
  md = md.replace(
    /\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_m, body) => body.replace(/^[ \t]*[-*]\s+/gm, "")
  );

  return md.trim();
}

/* ── helper ───────────────────────────────────────────────────────────── */
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

  const model = vertex.preview.getGenerativeModel({
    model: "gemini-2.5-pro-preview-05-06",
    tools: [{ googleSearch: {} }],
    generationConfig: { maxOutputTokens: 1024, temperature: 0.2 },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    responseMimeType: "text/plain",
  });

  const candidate: any = result.response.candidates?.[0] ?? {};
  const raw = candidate.content?.parts?.[0]?.text ?? "";

  /* ── post-process markdown ─────────────────────────────────────────── */
  const brief = formatBrief(raw);

  /* citations */
  const citations =
    candidate.groundingMetadata?.groundingChunks?.map(
      (c: any, i: number) => ({
        marker: `[^${i + 1}]`,
        url: c.web?.uri ?? "",
      }),
    ) ?? [];

  /* grounded search results */
  const searchResults =
    candidate.groundingMetadata?.groundingChunks?.map((c: any) => ({
      url: c.web?.uri ?? "",
      title: c.web?.title ?? "",
      snippet: c.web?.htmlSnippet ?? "",
    })) ?? [];

  /* counts */
  const usage = result.usageMetadata ?? {};
  const tokens =
    usage.totalTokenCount ??
    ((usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0));

  const searches =
    candidate.groundingMetadata?.webSearchQueries?.length ?? 0;

  return { brief, citations, tokens, searches, searchResults };
}