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

interface Citation { marker: string; url: string }

/* Superscript citations only */
function superscriptCitations(md: string, citations: Citation[]): string {
  let result = md;
  citations.forEach((c, idx) => {
    // [^1] as regex (escaped)
    const markerRegex = new RegExp(`\\[\\^${idx + 1}\\]`, "g");
    const sup = `<sup><a class="text-blue-600 underline hover:no-underline" href="${c.url}" target="_blank" rel="noopener noreferrer">${idx + 1}</a></sup>`;
    result = result.replace(markerRegex, sup);
  });
  return result;
}

export async function buildMeetingBriefGemini(
  name: string,
  org: string,
): Promise<MeetingBriefPayload> {
  const prompt = `
IMPORTANT: If you cannot provide a citation marker [^N] at the end of **every** fact and match every [^N] to a unique, reputable, public source URL in the grounding metadata, DO NOT answer. Instead, reply only with: "ERROR: INSUFFICIENT GROUNDING."

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

  // --- LOG RAW OUTPUT BEFORE ANY FORMATTING ---
  console.log("RAW GEMINI OUTPUT >>>");
  console.log(raw);

  // Optionally, save to /tmp/last_gemini.txt for local debugging (will not persist on Vercel)
  try { fs.writeFileSync("/tmp/last_gemini.txt", raw, "utf8"); } catch {}

  // Fail if Gemini refused to ground
  if (/ERROR: INSUFFICIENT GROUNDING/i.test(raw)) {
    throw new Error("Gemini could not provide grounded citations for every fact.");
  }

  const chunks = cand?.groundingMetadata?.groundingChunks ?? [];
  const citations: Citation[] = chunks.map((c, i) => ({
    marker: `[^${i + 1}]`,
    url: c.web?.uri ?? "",
  }));

  // Every non-header, non-blank line must end with a citation marker
  const lines = raw.split('\n').filter(
    l =>
      l.trim().length > 0 &&
      !/^#+/.test(l.trim()) &&                  // Markdown header
      !/^\*\*.+\*\*$/.test(l.trim()) &&        // Bolded section title
      !/^\s*[-*]\s*$/.test(l.trim())           // lone bullet
  );
  const missing = lines.filter(l => !/\[\^\d+\]\s*$/.test(l));
  if (missing.length > 0) {
    throw new Error(`Some lines are missing citation markers: ${missing.length} of ${lines.length}`);
  }
  if (citations.length === 0) {
    throw new Error("No grounded sources returned by Gemini.");
  }

  // Only superscript citations, preserve all formatting
  const brief = superscriptCitations(raw, citations);

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
