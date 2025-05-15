/**
 * MeetingBriefGeminiPipeline.ts
 *
 * – Gemini-2.5-pro-preview with Google Search-as-a-Tool enabled by default.
 * – Requires env vars: GCP_SA_JSON, VERTEX_PROJECT_ID, (optional) VERTEX_LOCATION.
 */

import fs from 'fs';
import { VertexAI, type Tool } from '@google-cloud/vertexai';

/*────────────────────────────  Auth bootstrap  */

export const runtime = 'nodejs';

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
 * Typings workaround:
 * Some SDK versions still omit `googleSearch` from `Tool`.
 * We cast through `unknown` so the compiler cannot reject it.
 */
const googleSearchTool = { googleSearch: {} } as unknown as Tool;

const modelId = 'gemini-2.5-pro-preview-05-06';

const generativeModel = vertexAI.preview.getGenerativeModel({
  model: modelId,
  tools: [googleSearchTool],            // ← Search always enabled
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
interface GroundingMeta  { groundingChunks?: GroundingChunk[]; webSearchQueries?: string[] }
interface Candidate      {
  content?: Content;
  finishReason?: string;
  groundingMetadata?: GroundingMeta;
}
interface UsageMeta      { totalTokenCount?: number; promptTokenCount?: number; candidatesTokenCount?: number }
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
IMPORTANT: If you cannot end **every** fact with one citation marker [^N] linked to a public URL, reply only "ERROR: INSUFFICIENT GROUNDING."

SUBJECT
• Person  : ${name}
• Employer: ${org}

FORMAT (Markdown – follow exactly)
## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
Each sentence on its own line, ends with [^N].

**Notable Highlights**
* Bullet list; one fact + [^N] each.

**Interesting / Fun Facts**
* Bullet; one fact + [^N].

**Detailed Research Notes**
* Bullet; one fact + [^N].

RULES
• ≤ 1500 words total.
• One [^N] per fact, at end of sentence/bullet.
• Drop any fact you can’t cite.`
  .trim();

  console.log(`[${new Date().toISOString()}] ► Generating brief for "${name}"`);

  const { response } = await generativeModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  }) as { response: GeminiResponse };

  /*──────────  Parse response  */

  const candidate = response.candidates?.[0] ?? {};
  const rawText   = candidate.content?.parts?.[0]?.text ?? '';
  const chunks    = candidate.groundingMetadata?.groundingChunks ?? [];

  const markers = [...new Set(rawText.match(/\[\^\d+\]/g) ?? [])]
    .sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]));

  const citations: Citation[] = markers.map(m => {
    const idx = Number(m.match(/\d+/)![0]) - 1;
    const chunk = chunks[idx];
    return chunk?.web?.uri
      ? { marker: m, url: chunk.web.uri, title: chunk.web.title, snippet: chunk.web.htmlSnippet }
      : { marker: m, url: `ERROR_NO_URI_${idx}` };
  }).filter(c => !c.url.startsWith('ERROR_'));

  const brief    = superscriptCitations(rawText, citations);
  const usage    = response.usageMetadata ?? {};
  const tokens   = usage.totalTokenCount ?? (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches = candidate.groundingMetadata?.webSearchQueries?.length ?? 0;
  const results  = chunks.filter(c => c.web?.uri)
    .map(c => ({ url: c.web!.uri!, title: c.web!.title ?? '', snippet: c.web!.htmlSnippet ?? '' }));

  return { brief, citations, tokens, searches, searchResults: results };
}

/*────────────  SDK version hint  */
/*
 * If you prefer full typings support drop the cast and:
 *   pnpm add -D @google-cloud/vertexai@latest
 * Once the package exposes Tool.googleSearch, revert
 *   const googleSearchTool = { googleSearch: {} } as unknown as Tool;
 * to:
 *   const googleSearchTool: Tool = { googleSearch: {} };
 */
