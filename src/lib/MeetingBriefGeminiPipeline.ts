import fs from 'fs';
import {
  VertexAI,
  type Tool,
  type GenerateContentRequest,
  type Content,
} from '@google-cloud/vertexai';

/*────────────────────────  Auth  */

export const runtime = 'nodejs';

const saJson = process.env.GCP_SA_JSON;
if (!saJson) throw new Error('GCP_SA_JSON env var not set');

const keyPath = '/tmp/sa_key.json';
if (!fs.existsSync(keyPath)) fs.writeFileSync(keyPath, saJson, 'utf8');
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

/*────────────────────────  Vertex client  */

const vertexAI = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION ?? 'us-central1',
});

/* Vertex Gemini 2.x → field name is googleSearch */
const googleSearchTool: Tool =
  { googleSearch: {} } as unknown as Tool;

const modelId = 'gemini-2.5-pro-preview-05-06';
const generativeModel = (vertexAI as unknown as {
  preview: { getGenerativeModel: typeof vertexAI.getGenerativeModel }
}).preview.getGenerativeModel({
  model: modelId,
  generationConfig: { maxOutputTokens: 2_048, temperature: 0 },
});

/*────────────────────────  Output types  */

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
interface GroundingChunk { web?: { uri?: string; title?: string; htmlSnippet?: string } }
interface Candidate {
  content?: { parts?: { text?: string }[] };
  groundingMetadata?: { groundingChunks?: GroundingChunk[]; webSearchQueries?: string[] };
}
interface UsageMeta { totalTokenCount?: number; promptTokenCount?: number; candidatesTokenCount?: number }
interface GeminiResp { candidates?: Candidate[]; usageMetadata?: UsageMeta }

/*────────────────────────  Helpers  */

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function superscript(text: string, chunks: GroundingChunk[]): string {
  return text.replace(/\[\^(\d+)\]/g, (_, n) => {
    const i = Number(n) - 1;
    const url = chunks[i]?.web?.uri ?? '#';
    return `<sup><a href="${url}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
  });
}
const is429 = (e: unknown): boolean =>
  typeof e === 'object' && e !== null && 'code' in e && (e as { code?: number }).code === 429;

/*────────────────────────  Main function  */

export async function buildMeetingBriefGemini(
  name: string,
  org: string,
): Promise<MeetingBriefPayload> {

  const orgLabel = org?.trim() || '';
  const prompt = `
SUBJECT
• Person  : ${name}
• Employer: ${orgLabel}

FORMAT (Markdown – follow exactly)
## **Meeting Brief: ${name} – ${orgLabel}**

**Executive Summary**
Exactly **3** concise sentences, each ends with a citation marker [^N].

**Notable Highlights**
* **Up to 5** bullets. Each bullet one fact, ends with [^N].

**Interesting / Fun Facts**
* **Up to 3** bullets. Each bullet one fact, ends with [^N].

**Detailed Research Notes**
* **Up to 8** bullets. Each bullet one fact, ends with [^N].

RULES
• Max total facts ≤ 20.  
• Every fact must end with exactly **one** [^N].  
• Never introduce a marker without a matching source.  
• Discard any fact you cannot cite under these rules.`.trim();

  const contents: Content[] = [
    { role: 'user', parts: [{ text: prompt }] },
  ];
  const request: GenerateContentRequest = {
    contents,
    tools: [googleSearchTool],
  };

  /*──  call with retry  */

  let resp: GeminiResp | undefined;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      // cast because SDK overload uses string | request
      const r = await generativeModel.generateContent(request as GenerateContentRequest) as { response: GeminiResp };
      resp = r.response;
      break;
    } catch (e) {
      if (!is429(e) || attempt === 3) throw e;
      await sleep(500 * 2 ** attempt); // 0.5 s, 1 s, 2 s
    }
  }
  if (!resp) throw new Error('No response from Gemini');

  /*──  parse  */

  const cand   = resp.candidates?.[0] ?? {};
  const text   = cand.content?.parts?.[0]?.text ?? '';
  const chunks = cand.groundingMetadata?.groundingChunks ?? [];

  const brief = superscript(text, chunks);

  const citations: Citation[] = chunks.map((c, i) => ({
    marker : `[^${i + 1}]`,
    url    : c.web?.uri ?? '',
    title  : c.web?.title,
    snippet: c.web?.htmlSnippet,
  })).filter(c => c.url);

  const usage  = resp.usageMetadata ?? {};
  const tokens = usage.totalTokenCount ??
    (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches = cand.groundingMetadata?.webSearchQueries?.length ?? 0;

  const searchResults = chunks
    .filter(c => c.web?.uri)
    .map(c => ({ url: c.web!.uri!, title: c.web!.title ?? '', snippet: c.web!.htmlSnippet ?? '' }));

  return { brief, citations, tokens, searches, searchResults };
}
