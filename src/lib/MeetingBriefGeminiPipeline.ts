/**
 * MeetingBriefGeminiPipeline.ts  –  Vertex Gemini-2.5-pro-preview + Google Search
 */

import fs from 'fs';
import { VertexAI, type Tool } from '@google-cloud/vertexai';

/*────────────────────  Auth  */

export const runtime = 'nodejs';

const saJson = process.env.GCP_SA_JSON;
if (!saJson) throw new Error('GCP_SA_JSON env var not set');

const keyPath = '/tmp/sa_key.json';
if (!fs.existsSync('/tmp')) fs.mkdirSync('/tmp', { recursive: true });
fs.writeFileSync(keyPath, saJson, 'utf8');
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

/*────────────────────  Vertex client  */

const vertexAI = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION ?? 'us-central1',
});

/**
 * Vertex Gemini 2.x JSON schema →   { "google_search": {} }
 * The SDK typings haven’t caught up, so cast through unknown.
 */
const googleSearchTool: Tool =
  { google_search: {} } as unknown as Tool;

const modelId = 'gemini-2.5-pro-preview-05-06';

const generativeModel = vertexAI.preview.getGenerativeModel({
  model: modelId,
  generationConfig: { maxOutputTokens: 2_048, temperature: 0 },
});

/*────────────────────  Types  */

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
interface WebInfo        { uri?: string; title?: string; htmlSnippet?: string }
interface GroundingChunk { web?: WebInfo }
interface GroundingMeta  { groundingChunks?: GroundingChunk[]; webSearchQueries?: string[] }
interface Candidate      {
  content?: { parts?: { text?: string }[] };
  groundingMetadata?: GroundingMeta;
}
interface UsageMeta      { totalTokenCount?: number; promptTokenCount?: number; candidatesTokenCount?: number }
interface GeminiResp     { candidates?: Candidate[]; usageMetadata?: UsageMeta }

/*────────────────────  Helpers  */

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function superscript(md: string, citations: Citation[]): string {
  let out = md;
  citations.forEach(c => {
    if (!c.marker || !c.url) return;
    const n   = c.marker.match(/\d+/)?.[0] ?? '#';
    const sup = `<sup><a class="text-blue-600 underline hover:no-underline" href="${c.url}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
    out = out.replace(new RegExp(c.marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), sup);
  });
  return out;
}
const is429 = (e: unknown): boolean =>
  typeof e === 'object' && e !== null && 'code' in e && (e as { code?: number }).code === 429;

/*────────────────────  Main  */

export async function buildMeetingBriefGemini(
  name: string,
  org?: string,
): Promise<MeetingBriefPayload> {

  if (!name) throw new Error('name is required');
  const orgLabel = org && org !== 'undefined' ? org : '';

  const prompt = `
IMPORTANT: If you cannot end **every** fact with one citation marker [^N] linked to a public URL, reply only "ERROR: INSUFFICIENT GROUNDING."

SUBJECT
• Person  : ${name}
${orgLabel ? `• Employer: ${orgLabel}` : ''}

FORMAT (Markdown — follow exactly)
## **Meeting Brief: ${name}${orgLabel ? ` – ${orgLabel}` : ''}**

**Executive Summary**
Each sentence on its own line, ends with [^N].

**Notable Highlights**
* Bullet; one fact + [^N].

**Interesting / Fun Facts**
* Bullet; one fact + [^N].

**Detailed Research Notes**
* Bullet; one fact + [^N].

RULES
• ≤ 1500 words total.
• One [^N] per fact. Drop any fact you can’t cite.`
  .trim();

  const req = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    tools: [googleSearchTool],            // search tool sent in payload
  };

  /*──────────  call with back-off  */

  let resp: GeminiResp | undefined;
  for (let a = 0; ; a++) {
    try {
      const r = await generativeModel.generateContent(req) as { response: GeminiResp };
      resp = r.response;
      break;
    } catch (e) {
      if (!is429(e) || a >= 3) throw e;
      await sleep(500 * 2 ** a);           // 0.5 s, 1 s, 2 s
    }
  }

  if (!resp) throw new Error('Empty response from Gemini');

  /*──────────  parse  */

  const cand   = resp.candidates?.[0] ?? {};
  const text   = cand.content?.parts?.[0]?.text ?? '';
  const chunks = cand.groundingMetadata?.groundingChunks ?? [];

  const markers = [...new Set(text.match(/\[\^\d+\]/g) ?? [])]
    .sort((x, y) => Number(x.match(/\d+/)![0]) - Number(y.match(/\d+/)![0]));

  const citations: Citation[] = markers.map(m => {
    const idx   = Number(m.match(/\d+/)![0]) - 1;
    const chunk = chunks[idx];
    return chunk?.web?.uri
      ? { marker: m, url: chunk.web.uri, title: chunk.web.title, snippet: chunk.web.htmlSnippet }
      : { marker: m, url: '' };
  }).filter(c => c.url);

  const brief    = superscript(text, citations);
  const usage    = resp.usageMetadata ?? {};
  const tokens   = usage.totalTokenCount ?? (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches = cand.groundingMetadata?.webSearchQueries?.length ?? 0;
  const results  = chunks.filter(c => c.web?.uri)
    .map(c => ({ url: c.web!.uri!, title: c.web!.title ?? '', snippet: c.web!.htmlSnippet ?? '' }));

  return { brief, citations, tokens, searches, searchResults: results };
}
