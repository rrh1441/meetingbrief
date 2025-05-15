import fs from 'fs';
import { VertexAI } from '@google-cloud/vertexai';

export const runtime = 'nodejs'; // Or your specific Vercel/Next.js runtime

const saJson = process.env.GCP_SA_JSON;
if (!saJson) {
  console.error('GCP_SA_JSON env var not set');
  throw new Error('GCP_SA_JSON env var not set');
}

const keyPath = '/tmp/sa_key.json'; // Standard path for serverless environments
try {
  if (!fs.existsSync(keyPath)) {
    fs.writeFileSync(keyPath, saJson, 'utf8');
    console.log('Service account key written to /tmp/sa_key.json');
  }
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
} catch (error) {
  console.error('Failed to write or access service account key:', error);
  throw new Error('Failed to setup service account credentials.');
}


const vertexAI = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION ?? 'us-central1',
});

export interface Citation {
  marker: string; // e.g., "[^1]"
  url: string;
  title?: string;
  snippet?: string;
}

export interface MeetingBriefPayload {
  brief: string;
  citations: Citation[];
  tokens: number;
  searches: number;
  searchResults: { url:string; title: string; snippet: string }[];
}

interface Part {
  text?: string;
  // Potentially other part types if dealing with images, etc.
}
interface Content {
  role?: string;
  parts?: Part[];
}
interface WebInfo {
  uri?: string;
  title?: string;
  htmlSnippet?: string; // Often contains the raw snippet from the search result
}
interface GroundingChunk {
  web?: WebInfo;
}
interface GroundingMetadata {
  groundingAttributions?: unknown[];
  groundingChunks?: GroundingChunk[];
  webSearchQueries?: string[];
}
interface Candidate {
  content?: Content;
  finishReason?: string;
  safetyRatings?: unknown[];
  groundingMetadata?: GroundingMetadata;
  citationMetadata?: { citationSources?: { uri?: string; startIndex?: number; endIndex?: number; license?: string }[] };
}

function superscriptCitations(markdownText: string, citations: Citation[]): string {
  let result = markdownText;
  citations.forEach((citation) => {
    if (!citation.marker || !citation.url || citation.url.startsWith('ERROR_')) {
      console.warn(`Skipping superscript for invalid citation: ${citation.marker} -> ${citation.url}`);
      return;
    }
    const escapedMarker = citation.marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const markerRegex = new RegExp(escapedMarker, 'g');
    const numericMatch = citation.marker.match(/\d+/);
    const displayNumber = numericMatch ? numericMatch[0] : '#';
    const sup = `<sup><a class="text-blue-600 underline hover:no-underline" href="${citation.url}" target="_blank" rel="noopener noreferrer">${displayNumber}</a></sup>`;
    result = result.replace(markerRegex, sup);
  });
  return result;
}

export async function buildMeetingBriefGemini(
  name: string,
  org: string
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
• ≤ 1500 words total.
• **CITATIONS ARE REQUIRED.** Every fact must end with exactly one citation marker in the format [^N] (e.g., [^1], [^2], [^3]), at the end of the sentence or bullet, and nowhere else.
• Never use any other citation style (no caret-alone (^N]), no number-bracket ([1]), no citation bundles ([^1, ^2]), no comma-separated, grouped, or combined citations).
• Each [^N] must correspond to a source in the grounding metadata. The number N in [^N] should ideally correspond to the Nth source if possible, but accuracy of the link is paramount.
• Never insert [^N] in the middle of a line—only at the very end of a sentence or bullet.
• Aim for ≥ 1 reputable source per fact (≥ 2 for negative or sensitive claims).
• Drop any fact that cannot meet these citation rules.
`.trim();

  // --- CORRECTED MODEL ID ---
  // Use one of the models documented to support grounding with Google Search in Vertex AI.
  // Prefer the latest available preview or stable version of Gemini 2.5 Pro or 2.0 Flash.
  // Example using a Gemini 2.5 Pro preview model name structure:
  const modelId = 'gemini-2.5-pro-preview-05-06';
  // OR, if you prefer Gemini 2.0 Flash (ensure it's the latest stable/preview):
  // const modelId = 'gemini-2.0-flash-001';

  console.log(`[${new Date().toISOString()}] Using model: ${modelId} for grounding.`);

  const generativeModel = vertexAI.getGenerativeModel({
    model: modelId,
    tools: [{
      googleSearchRetrieval: {},
    }],
    generationConfig: {
      maxOutputTokens: 8192, // Adjust if necessary based on chosen model's limits
      temperature: 0.2,      // As per grounding best practices, a lower temp (even 0.0) is often good
      // topP: 0.95,
      // topK: 40,
    },
  });

  const request = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  };

  console.log(`[${new Date().toISOString()}] Sending request to Gemini for: ${name}, ${org}`);

  let res;
  try {
    res = await generativeModel.generateContent(request);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error during Gemini API call:`, error);
    throw new Error(`Gemini API call failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log(`[${new Date().toISOString()}] Received response from Gemini.`);
  // console.log(`[${new Date().toISOString()}] Full Gemini Response Object: ${JSON.stringify(res?.response, null, 2)}`);


  if (!res || !res.response) {
    console.error(`[${new Date().toISOString()}] Invalid or empty response from Gemini.`);
    throw new Error('Invalid or empty response from Gemini.');
  }

  const candidate = (res.response.candidates ?? [])[0] as Candidate | undefined;
  const rawText = candidate?.content?.parts?.[0]?.text ?? '';

  console.log(`[${new Date().toISOString()}] RAW GEMINI TEXT OUTPUT for ${name}:\n${rawText}`);
  console.log(`[${new Date().toISOString()}] GROUNDING METADATA for ${name}:\n${JSON.stringify(candidate?.groundingMetadata, null, 2)}`);

  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    if (!fs.existsSync('/tmp/gemini_debug')) fs.mkdirSync('/tmp/gemini_debug');
    fs.writeFileSync(`/tmp/gemini_debug/${timestamp}_${name}_raw.txt`, rawText, 'utf8');
    fs.writeFileSync(`/tmp/gemini_debug/${timestamp}_${name}_full_response.json`, JSON.stringify(res.response, null, 2), 'utf8');
    if (candidate?.groundingMetadata) {
      fs.writeFileSync(`/tmp/gemini_debug/${timestamp}_${name}_grounding.json`, JSON.stringify(candidate.groundingMetadata, null, 2), 'utf8');
    }
  } catch (e) {
    console.warn(`[${new Date().toISOString()}] Failed to write debug files:`, e);
  }

  if (/ERROR: INSUFFICIENT GROUNDING/i.test(rawText)) {
    console.error(`[${new Date().toISOString()}] Gemini explicitly stated: ERROR: INSUFFICIENT GROUNDING for ${name}.`);
    throw new Error('Gemini could not provide grounded citations for every fact as requested.');
  }
  if (candidate?.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
     console.warn(`[${new Date().toISOString()}] Gemini response finishReason was not 'STOP': ${candidate.finishReason} for ${name}. Response might be incomplete or problematic.`);
     if (candidate.finishReason === 'SAFETY') {
         throw new Error('Gemini response flagged for safety reasons.');
     }
  }

  const groundingChunks = candidate?.groundingMetadata?.groundingChunks ?? [];
  const extractedCitations: Citation[] = [];
  const usedCitationMarkers = [...new Set(rawText.match(/\[\^\d+\]/g) ?? [])]
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);
      return numA - numB;
    });

  if (groundingChunks.length > 0 && usedCitationMarkers.length > 0) {
    console.log(`[${new Date().toISOString()}] Found ${usedCitationMarkers.length} unique citation markers and ${groundingChunks.length} grounding chunks for ${name}.`);
    usedCitationMarkers.forEach(marker => {
      const numMatch = marker.match(/\d+/);
      if (numMatch) {
        const citationNumber = parseInt(numMatch[0], 10);
        const chunkIndex = citationNumber - 1;
        if (chunkIndex >= 0 && chunkIndex < groundingChunks.length) {
          const chunk = groundingChunks[chunkIndex];
          if (chunk.web?.uri) {
            extractedCitations.push({
              marker: marker,
              url: chunk.web.uri,
              title: chunk.web.title,
              snippet: chunk.web.htmlSnippet,
            });
          } else {
            console.warn(`[${new Date().toISOString()}] Marker ${marker} (for chunk index ${chunkIndex}) has no URI for ${name}.`);
            extractedCitations.push({ marker, url: `ERROR_NO_URI_FOR_CHUNK_${chunkIndex + 1}` });
          }
        } else {
          console.warn(`[${new Date().toISOString()}] Marker ${marker} has no corresponding grounding chunk by its number index ${chunkIndex} (total chunks: ${groundingChunks.length}) for ${name}.`);
          extractedCitations.push({ marker, url: `ERROR_DANGLING_MARKER_${marker}` });
        }
      }
    });
  } else {
     console.warn(`[${new Date().toISOString()}] No citation markers found in text OR no grounding chunks returned for ${name}. usedCitationMarkers: ${usedCitationMarkers.length}, groundingChunks: ${groundingChunks.length}`);
  }

  const hasAnyValidSource = extractedCitations.some(c => c.url && !c.url.startsWith('ERROR_'));
  if (usedCitationMarkers.length > 0 && !hasAnyValidSource) {
    console.error(`[${new Date().toISOString()}] Citation markers found for ${name}, but no valid URLs could be mapped from grounding chunks. Grounding failure.`);
  }
  if (usedCitationMarkers.length === 0 && rawText.length > 50 && !rawText.includes("ERROR: INSUFFICIENT GROUNDING")) {
      console.warn(`[${new Date().toISOString()}] No citation markers found in Gemini output for ${name}, but text was generated. Grounding likely failed or was not triggered as expected.`);
  }

  const formattedBrief = superscriptCitations(rawText, extractedCitations);
  const usage = res.response.usageMetadata ?? {};
  const totalTokens = usage.totalTokenCount ?? ((usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0));
  const searchQueriesPerformed = candidate?.groundingMetadata?.webSearchQueries?.length ?? 0;
  const searchResultsPayload = groundingChunks.map((chunk) => ({
    url: chunk.web?.uri ?? '',
    title: chunk.web?.title ?? '',
    snippet: chunk.web?.htmlSnippet ?? '',
  }));

  if (prompt.includes("CITATIONS ARE REQUIRED") && extractedCitations.filter(c => !c.url.startsWith("ERROR_")).length === 0 && usedCitationMarkers.length > 0) {
      console.error(`[${new Date().toISOString()}] Critical: Citations were required and markers present, but no valid sources could be linked for ${name}.`);
  }
   if (prompt.includes("CITATIONS ARE REQUIRED") && usedCitationMarkers.length === 0 && rawText.length > 50 && !rawText.includes("ERROR: INSUFFICIENT GROUNDING")) {
      console.warn(`[${new Date().toISOString()}] Warning: Citations required, but no markers found in non-error response for ${name}. Prompt adherence issue or grounding failure.`);
  }

  return {
    brief: formattedBrief,
    citations: extractedCitations,
    tokens: totalTokens,
    searches: searchQueriesPerformed,
    searchResults: searchResultsPayload,
  };
}