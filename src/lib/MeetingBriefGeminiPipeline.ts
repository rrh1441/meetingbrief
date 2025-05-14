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

/* ---------- formatting pipeline --------------------------------- */
// Fix header spacing and ensure exactly one blank line after headers
function fixHeaderSpacing(md: string): string {
  md = md.replace(/^#+\s*Meeting Brief:\s*(.+)$/im,
    (_: string, subj: string) => `## **Meeting Brief: ${subj.trim()}**`);
  md = md
    .replace(/^###\s*1\.\s*Executive Summary/i, "**Executive Summary**")
    .replace(/^###\s*2\.\s*.+$/im, "**Notable Highlights**")
    .replace(/^###\s*3\.\s*.+$/im, "**Interesting / Fun Facts**")
    .replace(/^###\s*4\.\s*.+$/im, "**Detailed Research Notes**")
    .replace(/^###\s*\d+\.\s*(.+)$/gm, "**$1**")
    .replace(/^\*\*\d+\.\*\*\s*(.+)$/gm, "**$1**");

  // Exactly one blank line after every header (bold line)
  md = md.replace(/^(\*\*[^\n]*\*\*)(?!\n\n)/gm, "$1\n\n");
  // Remove excess blank lines
  md = md.replace(/\n{3,}/g, "\n\n");
  return md;
}

// Ensure every fact gets a citation if citations exist (legacy, may not be needed with strict prompt)
function guaranteeInlineMarkers(md: string, cit: Citation[]): string {
  if (/\[\^\d+\]/.test(md) || cit.length === 0) return md;

  let idx = 0;
  md = md.replace(/^(?:[*\-]\s+[^\n]+?)(?!\s+\[\^\d+\])/gm, (ln: string) =>
    idx < cit.length ? `${ln} ${cit[idx++].marker}` : ln);

  md = md.replace(/\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_: string, blk: string) =>
      "**Executive Summary**\n\n" +
      blk.replace(/([.!?])(\s+|$)/g,
        (_2: string, p: string, s: string) =>
          idx < cit.length ? `${p} ${cit[idx++].marker}${s}` : `${p}${s}`));

  return md;
}

// Remove stray carets/brackets that should not appear (conservative)
function removeStrayCaretsAndBrackets(md: string): string {
  md = md.replace(/\[\^\s*\]/g, "");
  md = md.replace(/\[\s*\^/, "");
  md = md.replace(/\^(\D|$)/g, "");
  md = md.replace(/(\s|^)\[(?=[^\[]*?(?:\s|$))/g, "$1");
  md = md.replace(/(\s|^)\](?=[^\]]*?(?:\s|$))/g, "$1");
  md = md.replace(/(\s|^)\^(?=\s|$)/g, "$1");
  return md;
}

interface Citation { marker: string; url: string }

export async function buildMeetingBriefGemini(
  name: string,
  org: string,
): Promise<MeetingBriefPayload> {
  const prompt = `
SUBJECT
• Person  : ${name}
• Employer: ${org}

FORMAT (Markdown – follow exactly)
## **Meeting Brief: ${name} – ${org}**

**Executive Summary**

Each sentence must be on its own line, ending with a period and a citation marker [^N]. Do not combine multiple facts into one sentence.

**Notable Highlights**

* Use Markdown bullet list. Each bullet is a single fact, each ends with a period and a citation marker [^N].

**Interesting / Fun Facts**

* Use Markdown bullet list. Each bullet is a single fact, each ends with a period and a citation marker [^N].

**Detailed Research Notes**

* Use Markdown bullet list. Each bullet is a single fact, each ends with a period and a citation marker [^N].

RULES
• ≤ 1 000 words total.
• **CITATIONS ARE REQUIRED.** Every fact must end with exactly one citation marker in the format [^N], at the end of the sentence or bullet, and nowhere else.
• Never use any other citation style (no caret-alone (^N]), no number-bracket (1]), no citation bundles ([^1, ^2]), no comma-separated, grouped, or combined citations).
• Each [^N] must correspond to a unique source in the grounding metadata.
• Never insert [^N] in the middle of a line—only at the very end of a sentence or bullet.
• ≥ 1 reputable source per fact (≥ 2 for negative claims).
• Drop any fact that cannot meet the rule.
`.trim();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = (vertex.preview as any).getGenerativeModel({
    model: "gemini-2.5-pro-preview-05-06",
    tools: [{ googleSearch: {} }],
    generationConfig: { maxOutputTokens: 5000, temperature: 0.2 },
  });

  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    responseMimeType: "text/plain",
  });

  const cand = (res.response.candidates ?? [])[0] as Candidate | undefined;
  const raw = cand?.content?.parts?.[0]?.text ?? "";

  const chunks = cand?.groundingMetadata?.groundingChunks ?? [];
  const citations: Citation[] = chunks.map((c, i) => ({
    marker: `[^${i + 1}]`,
    url: c.web?.uri ?? "",
  }));

  let brief = raw;
  brief = fixHeaderSpacing(brief);
  brief = guaranteeInlineMarkers(brief, citations);
  brief = removeStrayCaretsAndBrackets(brief);

  const usage = res.usageMetadata ?? {};
  const tokens = usage.totalTokenCount ??
    (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches = cand?.groundingMetadata?.webSearchQueries?.length ?? 0;

  const searchResults = chunks.map(c => ({
    url: c.web?.uri ?? "",
    title: c.web?.title ?? "",
    snippet: c.web?.htmlSnippet ?? "",
  }));

  return { brief, citations, tokens, searches, searchResults };
}
