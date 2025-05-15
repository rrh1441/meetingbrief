/* eslint-disable no-console */
/* eslint-disable react/no-danger */

/**
 * MeetingBriefGeminiPipeline.ts
 *
 * – Uses Vertex AI Gemini 2.5 Pro Preview with Google Search-as-a-Tool enabled **by default**.
 * – Relies on `GCP_SA_JSON`, `VERTEX_PROJECT_ID`, and optional `VERTEX_LOCATION` env vars.
 * – Typed for strict TS; compile-time workaround included until the SDK’s `Tool` type
 *   officially exposes the `googleSearch` property (≥ v1.11).
 */

import fs from 'fs';
import { VertexAI, type Tool } from '@google-cloud/vertexai';

/*────────────────────────────  Auth bootstrap  */

export const runtime = 'nodejs'; // Vercel / Next.js edge-runtime not required

const saJson = process.env.GCP_SA_JSON;
if (!saJson) throw new Error('GCP_SA_JSON env var not set');

const keyPath = '/tmp/sa_key.json';
if (!fs.existsSync('/tmp')) fs.mkdirSync('/tmp', { recursive: true });
fs.writeFileSync(keyPath, saJson, 'utf8');
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

/*────────────────────────────  Vertex client  */

const vertexAI = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION ?? 'us-central1',
});

/**
 * Workaround: the Tool interface in `@google-cloud/vertexai` ≤ v1.10
 * doesn’t yet include `googleSearch`. Either upgrade (≥ v1.11) or cast:
 */
// @ts-expect-error – googleSearch prop not in type as of v1.10
const googleSearchTool: Tool = { googleSearch: {} } as Tool;

const modelId = 'gemini-2.5-pro-preview-05-06';

const generativeModel = vertexAI.preview.getGenerativeModel({
  model: modelId,
  tools: [googleSearchTool],          // ⬅ default Search on every request
  generationConfig: {
    maxOutputTokens: 8_192,
    temperature: 0,
  },
});

/*────────────────────────────  Types  */

export interface Citation {
  marker: string;
  url: string;
  title?: string;
  snippet?: string;
}

export interface MeetingBriefPayload {
  brief: string;
  citations: Citation[];
  tokens: number;
  searches: number;
  searchResults: { url: string; title: string; snippet: string }[];
}

interface Part           { text?: string }
interface Content        { role?: string; parts?: Part[] }
interface WebInfo        { uri?: string; title?: string; htmlSnippet?: string }
interface GroundingChunk { web?: WebInfo }
interface GroundingMeta  {
  groundingAttributions?: unknown[];
  groundingChunks?: GroundingChunk[];
  webSearchQueries?: string[];
}
interface Candidate {
  content?: Content;
  finishReason?: string;
  safetyRatings?: unknown[];
  groundingMetadata?: GroundingMeta;
  citationMetadata?: { citationSources?: { uri?: string; startIndex?: number; endIndex?: number; license?: string }[] };
}
interface UsageMeta { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
interface GeminiResponse { candidates?: Candidate[]; usageMetadata?: UsageMeta }

/*────────────────────────────  Helpers  */

function superscriptCitations(md: string, citations: Citation[]): string {
  let out = md;
  citations.forEach(c => {
    if (!c.marker || !c.url || c.url.startsWith('ERROR_')) return;
    const num = c.marker.match(/\d+/)?.[0] ?? '#';
    const anchor = `<sup><a class="text-blue-600 underline hover:no-underline" href="${c.url}" target="_blank" rel="noopener noreferrer">${num}</a></sup>`;
    out = out.replace(new RegExp(c.marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), anchor);
  });
  return out;
}

/*────────────────────────────  Main  */

export async function buildMeetingBriefGemini(
  name: string,
  org: string,
): Promise<MeetingBriefPayload> {

  const prompt = `
IMPORTANT: If you cannot provide a citation marker [^N] at the end of **every** fact and match every [^N] to a unique, reputable, public source URL, DO NOT answer. Reply only: "ERROR: INSUFFICIENT GROUNDING."

SUBJECT
• Person  : ${name}
• Employer: ${org}

FORMAT (Markdown – follow exactly)
## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
Each sentence on its own line, single fact, ends with one marker [^N].

**Notable Highlights**
* Bullet list; each bullet one fact + [^N].

**Interesting / Fun Facts**
* Bullet list; each bullet one fact + [^N].

**Detailed Research Notes**
* Bullet list; each bullet one fact + [^N].

RULES
• ≤ 1500 words total.
• **CITATIONS ARE REQUIRED.** One [^N] per fact, at end of sentence/bullet—no other styles.
• Drop any fact you can’t cite under these rules.
  `.trim();

  console.log(`[${new Date().toISOString()}]  ►  Generating brief for "${name}" using ${modelId}`);

  const { response } = await generativeModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  }) as { response: GeminiResponse };

  /*──────────  Parse response  */

  const candidate       = response.candidates?.[0] ?? {};
  const rawText         = candidate.content?.parts?.[0]?.text ?? '';
  const groundingChunks = candidate.groundingMetadata?.groundingChunks ?? [];

  /** Extract markers in order (unique, numeric ASC) */
  const markers = [...new Set(rawText.match(/\[\^\d+\]/g) ?? [])]
    .sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]));

  const citations: Citation[] = markers.map(m => {
    const idx = Number(m.match(/\d+/)![0]) - 1;      // 0-based
    const chunk = groundingChunks[idx];
    return chunk?.web?.uri
      ? { marker: m, url: chunk.web.uri, title: chunk.web.title, snippet: chunk.web.htmlSnippet }
      : { marker: m, url: `ERROR_NO_URI_${idx}` };
  });

  const validCitations = citations.filter(c => !c.url.startsWith('ERROR_'));
  const formattedBrief = superscriptCitations(rawText, validCitations);

  const usage  = response.usageMetadata ?? {};
  const tokens = usage.totalTokenCount ?? (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches = candidate.groundingMetadata?.webSearchQueries?.length ?? 0;
  const searchResults = groundingChunks
    .filter(c => c.web?.uri)
    .map(c => ({ url: c.web!.uri!, title: c.web!.title ?? '', snippet: c.web!.htmlSnippet ?? '' }));

  return { brief: formattedBrief, citations: validCitations, tokens, searches, searchResults };
}

/*────────────────────────────  Version hints  */

/**
 * pnpm install @google-cloud/vertexai@latest --save
 *
 *   – v1.11+ exposes Tool.googleSearch so the ts-expect-error cast above
 *     can be removed.
 *   – Ensure "skipLibCheck": false in tsconfig for full type-safety.
 */
