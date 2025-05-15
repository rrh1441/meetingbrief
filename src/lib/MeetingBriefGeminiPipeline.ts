import fs from 'fs';
import { VertexAI } from '@google-cloud/vertexai';

export const runtime = 'nodejs';

const saJson = process.env.GCP_SA_JSON;
if (!saJson) throw new Error('GCP_SA_JSON env var not set');

const keyPath = '/tmp/sa_key.json';
if (!fs.existsSync(keyPath)) fs.writeFileSync(keyPath, saJson, 'utf8');
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

const vertex = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION ?? 'us-central1',
});

export interface MeetingBriefPayload {
  brief: string;
  citations: { marker: string; url: string }[];
  tokens: number;
  searches: number;
  searchResults: { url: string; title: string; snippet: string }[];
}

interface Part {
  text?: string;
}
interface Content {
  parts?: Part[];
}
interface WebInfo {
  uri?: string;
  title?: string;
  htmlSnippet?: string;
}
interface Chunk {
  web?: WebInfo;
}
interface Grounding {
  groundingChunks?: Chunk[];
  webSearchQueries?: unknown[];
}
interface Candidate {
  content?: Content;
  groundingMetadata?: Grounding;
}
interface Citation {
  marker: string;
  url: string;
}

function appendSources(responseText: string, groundingChunks: Chunk[]): string {
  if (!groundingChunks || groundingChunks.length === 0) {
    return responseText;
  }

  let sourcesText = '\n\n**Sources:**\n';
  groundingChunks.forEach((chunk, index) => {
    const source = chunk.web;
    if (source && source.uri) {
      sourcesText += `[^${index + 1}]: ${source.uri}\n`;
    }
  });

  return responseText + sourcesText;
}

export async function buildMeetingBriefGemini(
  name: string,
  org: string
): Promise<MeetingBriefPayload> {
  const prompt = `
Please provide a detailed response about ${name} from ${org}, ensuring that each factual statement is followed by a citation marker in the format [^N], where N corresponds to the source number. List the sources at the end of the response.
`.trim();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = (vertex.preview as any).getGenerativeModel({
    model: 'gemini-2.5-pro-preview-05-06',
    tools: [{ googleSearch: {} }],
    generationConfig: { maxOutputTokens: 5000, temperature: 0.2 },
  });

  const res = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    responseMimeType: 'text/plain',
  });

  const cand = (res.response.candidates ?? [])[0] as Candidate | undefined;
  let raw = cand?.content?.parts?.[0]?.text ?? '';

  // --- LOG RAW OUTPUT BEFORE ANY FORMATTING ---
  console.log('RAW GEMINI OUTPUT >>>\n' + raw);
  console.log('GROUNDING METADATA >>>\n' + JSON.stringify(cand?.groundingMetadata, null, 2));

  try {
    fs.writeFileSync('/tmp/last_gemini.txt', raw, 'utf8');
  } catch {}

  const chunks = cand?.groundingMetadata?.groundingChunks ?? [];
  const citations: Citation[] = chunks.map((c, i) => ({
    marker: `[^${i + 1}]`,
    url: c.web?.uri ?? '',
  }));

  const hasAnyCitationMarker = /\[\^\d+\]/.test(raw);
  const hasAnySource = citations.length > 0;

  if (!hasAnyCitationMarker && hasAnySource) {
    raw = appendSources(raw, chunks);
  } else if (!hasAnyCitationMarker && !hasAnySource) {
    throw new Error('No citation markers or grounded sources found in Gemini output.');
  }

  const brief = raw;

  const usage = res.usageMetadata ?? {};
  const tokens =
    usage.totalTokenCount ??
    (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches = cand?.groundingMetadata?.webSearchQueries?.length ?? 0;

  const searchResults = chunks.map((c) => ({
    url: c.web?.uri ?? '',
    title: c.web?.title ?? '',
    snippet: c.web?.htmlSnippet ?? '',
  }));

  return { brief, citations, tokens, searches, searchResults };
}
