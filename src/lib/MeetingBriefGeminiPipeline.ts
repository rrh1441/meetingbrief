/**
 * MeetingBriefGeminiPipeline.ts
 * Vertex AI / Gemini-2.5-pro-preview + Google Search-as-a-Tool (default).
 */

import fs from 'fs';
import { VertexAI, type Tool } from '@google-cloud/vertexai';

/*────────────────────  Auth bootstrap  */

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
 * Correct protobuf field is **google_search_retrieval**.
 * Cast through unknown so TypeScript tolerates all SDK versions.
 */
const googleSearchTool: Tool =
  { google_search_retrieval: {} } as unknown as Tool;

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
    const num  = c.marker.match(/\d+/)?.[0] ?? '#';
    const link = `<sup><a class="text-blue-600 underline hover:no-underline" href="${c.url}" target="_blank" rel="noopener noreferrer">${num}</a></sup>`;
    out = out.replace(new RegExp(c.marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), link);
  });
  return out;
}

function isResourceExhausted(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code?: number }).code === 429;
}

/*────────────────────  Main  */

export async function buildMeetingBriefGemini(
  name: string,
  org?: string,
): Promise<MeetingBriefPayload> {

  if (!name) throw new Error('name is required');

  const orgLabel = org && org !== 'undefined' ? org : '';

  const prompt = `
IMPORTANT: If you cannot end **every** fact with a citation marker [^N] linked to a public URL, reply only "ERROR: INSUFFICIENT GROUNDING."

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
• One [^N] per fact, at end of bullet/sentence.
• Drop any fact you can’t cite.`
  .trim();

  /*──────────  Call with retries  */

  const request = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    tools: [googleSearchTool],            // search tool actually sent
  };

  let resp: GeminiResp | undefined;
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await generativeModel.generateContent(request) as { response: GeminiResp };
      resp = res.response;
      break;
    } catch (err) {
      if (!isResourceExhausted(err) || attempt >= 3) throw err;
      await sleep(500 * 2 ** attempt);    // 0.5 s, 1 s, 2 s
    }
  }

  if (!resp) throw new Error('No response from Gemini');

  /*──────────  Parse response  */

  const cand   = resp.candidates?.[0] ?? {};
  const text   = cand.content?.parts?.[0]?.text ?? '';
  const chunks = cand.groundingMetadata?.groundingChunks ?? [];

  const markers = [...new Set(text.match(/\[\^\d+\]/g) ?? [])]
    .sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]));

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
