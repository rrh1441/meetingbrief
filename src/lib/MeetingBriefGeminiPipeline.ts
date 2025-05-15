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
  if (!fs.existsSync('/tmp')) {
    fs.mkdirSync('/tmp', { recursive: true });
  }
  fs.writeFileSync(keyPath, saJson, 'utf8');
  console.log('Service account key written to /tmp/sa_key.json');
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
  searchResults: { url:string; title: string; snippet: string }[];
}

interface Part {
  text?: string;
}
interface Content {
  role?: string;
  parts?: Part[];
}
interface WebInfo {
  uri?: string;
  title?: string;
  htmlSnippet?: string;
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
interface GeminiUsageMetadata {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
}
interface GeminiResponse {
    candidates?: Candidate[];
    usageMetadata?: GeminiUsageMetadata;
}


function superscriptCitations(markdownText: string, citations: Citation[]): string {
  let result = markdownText;
  citations.forEach((citation) => {
    if (!citation.marker || !citation.url || citation.url.startsWith('ERROR_')) {
      console.warn(`[superscriptCitations] Skipping superscript for invalid citation: ${citation.marker} -> ${citation.url}`);
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

  const modelId = 'gemini-2.5-pro-preview-05-06';

  console.log(`[${new Date().toISOString()}] Using model: ${modelId} for grounding.`);

  const generativeModel = vertexAI.getGenerativeModel({
    model: modelId,
    tools: [{
      googleSearch: {},
    }],
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.0,
    },
  });

  const request = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  };

  console.log(`[${new Date().toISOString()}] Sending request to Gemini for: ${name}, ${org}`);

  let res: { response: GeminiResponse };
  try {
    const rawResponse = await generativeModel.generateContent(request);
    res = rawResponse as { response: GeminiResponse };
  } catch (error: unknown) { // Explicitly type 'error' as unknown
    console.error(`[${new Date().toISOString()}] Error during Gemini API call (raw error object):`, error);

    let finalErrorMessage: string;
    let errorDetailsToLog: unknown = null; // Use unknown for stricter typing

    if (error instanceof Error) {
      finalErrorMessage = error.message;
      console.error(`[${new Date().toISOString()}] Gemini API Error (Standard Error instance): ${finalErrorMessage}`);
      // Attempt to access common additional properties if they exist on the Error object
      // Some error objects might have a 'details' property, common in Google API errors
      const errAsObjectWithPotentialDetails = error as Record<string, unknown> & { details?: unknown };
      if (errAsObjectWithPotentialDetails.details) {
        errorDetailsToLog = errAsObjectWithPotentialDetails.details;
      }
      if (error.stack) {
        console.error(`[${new Date().toISOString()}] Gemini API Error Stack: ${error.stack}`);
      }
    } else if (typeof error === 'object' && error !== null) {
      // Handle non-Error objects that might have a message or details
      const errObj = error as Record<string, unknown>; // Cast to a generic object to check properties
      if (typeof errObj.message === 'string') {
        finalErrorMessage = errObj.message;
        console.error(`[${new Date().toISOString()}] Gemini API Error (Object with message property): ${finalErrorMessage}`);
      } else {
        finalErrorMessage = 'An unexpected error object was caught (no string message property).';
        console.error(`[${new Date().toISOString()}] ${finalErrorMessage} Full error object:`, errObj);
      }
      if ('details' in errObj) { // Check if 'details' property exists
        errorDetailsToLog = errObj.details;
      }
      // Log other potentially useful top-level string/number/boolean properties from the error object
      Object.keys(errObj).forEach(key => {
        const value = errObj[key];
        if (key !== 'message' && key !== 'details' && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
          console.error(`[${new Date().toISOString()}] Gemini API Error Object Property - ${key}: ${value}`);
        }
      });
    } else if (typeof error === 'string') {
      finalErrorMessage = error;
      console.error(`[${new Date().toISOString()}] Gemini API Error (Raw string): ${finalErrorMessage}`);
    } else {
      finalErrorMessage = 'An unexpected and non-object/non-string error type was caught during API call.';
      console.error(`[${new Date().toISOString()}] ${finalErrorMessage}`);
    }

    if (errorDetailsToLog !== null && errorDetailsToLog !== undefined) {
      try {
        // Log the raw details first in case stringify fails (e.g., circular references)
        console.error(`[${new Date().toISOString()}] Gemini API Error Details (raw, before stringify):`, errorDetailsToLog);
        console.error(`[${new Date().toISOString()}] Gemini API Error Details (JSON): ${JSON.stringify(errorDetailsToLog, null, 2)}`);
      } catch (stringifyError) {
        console.error(`[${new Date().toISOString()}] Failed to JSON.stringify errorDetailsToLog:`, stringifyError);
        // Attempt to log keys if it's an object but couldn't be stringified
        if (typeof errorDetailsToLog === 'object' && errorDetailsToLog !== null) {
            console.error(`[${new Date().toISOString()}] Keys of errorDetailsToLog: ${Object.keys(errorDetailsToLog).join(', ')}`);
        }
      }
    }
    throw new Error(`Gemini API call failed: ${finalErrorMessage}`);
  }

  console.log(`[${new Date().toISOString()}] Received response from Gemini.`);

  if (!res || !res.response) {
    console.error(`[${new Date().toISOString()}] Invalid or empty response structure from Gemini.`);
    throw new Error('Invalid or empty response structure from Gemini.');
  }

  const candidate = (res.response.candidates ?? [])[0] as Candidate | undefined;
  const rawText = candidate?.content?.parts?.[0]?.text ?? '';

  console.log(`[${new Date().toISOString()}] RAW GEMINI TEXT OUTPUT for ${name}:\n${rawText}`);
  console.log(`[${new Date().toISOString()}] GROUNDING METADATA for ${name}:\n${JSON.stringify(candidate?.groundingMetadata, null, 2)}`);

  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_');
    const debugDir = '/tmp/gemini_debug';
    if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
    const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
    fs.writeFileSync(`${debugDir}/${timestamp}_${safeName}_raw.txt`, rawText, 'utf8');
    fs.writeFileSync(`${debugDir}/${timestamp}_${safeName}_full_response.json`, JSON.stringify(res.response, null, 2), 'utf8');
    if (candidate?.groundingMetadata) {
      fs.writeFileSync(`${debugDir}/${timestamp}_${safeName}_grounding.json`, JSON.stringify(candidate.groundingMetadata, null, 2), 'utf8');
    }
     if (candidate?.citationMetadata) {
      fs.writeFileSync(`${debugDir}/${timestamp}_${safeName}_citation_meta.json`, JSON.stringify(candidate.citationMetadata, null, 2), 'utf8');
    }
  } catch (e) {
    console.warn(`[${new Date().toISOString()}] Failed to write debug files:`, e);
  }

  if (/ERROR: INSUFFICIENT GROUNDING/i.test(rawText)) {
    console.error(`[${new Date().toISOString()}] Gemini explicitly stated: ERROR: INSUFFICIENT GROUNDING for ${name}.`);
  }
  if (candidate?.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
     console.warn(`[${new Date().toISOString()}] Gemini response finishReason was not 'STOP' or 'MAX_TOKENS': ${candidate.finishReason} for ${name}.`);
     if (candidate.finishReason === 'SAFETY') {
         throw new Error(`Gemini response flagged for safety reasons for ${name}.`);
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
            console.warn(`[${new Date().toISOString()}] Marker ${marker} (for chunk index ${chunkIndex}) has no web URI for ${name}. Chunk: ${JSON.stringify(chunk)}`);
            extractedCitations.push({ marker, url: `ERROR_NO_URI_FOR_CHUNK_INDEX_${chunkIndex}` });
          }
        } else {
          console.warn(`[${new Date().toISOString()}] Marker ${marker} (number ${citationNumber}) has no corresponding grounding chunk by its 0-based index ${chunkIndex} (total chunks: ${groundingChunks.length}) for ${name}.`);
          extractedCitations.push({ marker, url: `ERROR_DANGLING_MARKER_${marker.replace(/[^a-zA-Z0-9]/g, '')}` });
        }
      } else {
        console.warn(`[${new Date().toISOString()}] Could not parse number from citation marker: ${marker} for ${name}.`);
      }
    });
  } else {
     console.warn(`[${new Date().toISOString()}] No citation markers found in text OR no grounding chunks returned for ${name}. Markers: ${usedCitationMarkers.length}, Chunks: ${groundingChunks.length}`);
  }

  const validExtractedCitations = extractedCitations.filter(c => c.url && !c.url.startsWith('ERROR_'));
  if (usedCitationMarkers.length > 0 && validExtractedCitations.length === 0) {
    console.error(`[${new Date().toISOString()}] Critical: ${usedCitationMarkers.length} markers found for ${name}, but NO valid URLs mapped from grounding. Grounding failed to provide sources.`);
  }
  if (usedCitationMarkers.length === 0 && rawText.length > 50 && !rawText.includes("ERROR: INSUFFICIENT GROUNDING")) {
      console.warn(`[${new Date().toISOString()}] Warning: No citation markers in Gemini output for ${name}, but text generated. Grounding issue or prompt adherence failure.`);
  }
  if (usedCitationMarkers.length > 0 && validExtractedCitations.length < usedCitationMarkers.length) {
      console.warn(`[${new Date().toISOString()}] Warning: Mismatch for ${name}. ${usedCitationMarkers.length} markers, ${validExtractedCitations.length} valid citations. Some markers dangling or chunks missing URIs.`);
  }

  const formattedBrief = superscriptCitations(rawText, validExtractedCitations);
  const usage = res.response.usageMetadata ?? {};
  const totalTokens = usage.totalTokenCount ?? ((usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0));
  const searchQueriesPerformed = candidate?.groundingMetadata?.webSearchQueries?.length ?? 0;
  const searchResultsPayload = groundingChunks
    .filter(chunk => chunk.web?.uri)
    .map((chunk) => ({
        url: chunk.web?.uri ?? '',
        title: chunk.web?.title ?? '',
        snippet: chunk.web?.htmlSnippet ?? '',
    }));

  if (prompt.includes("CITATIONS ARE REQUIRED") && validExtractedCitations.length === 0 && usedCitationMarkers.length > 0 && !rawText.includes("ERROR: INSUFFICIENT GROUNDING")) {
      console.error(`[${new Date().toISOString()}] Final Check Critical for ${name}: Citations required, markers present, but NO valid sources linked.`);
  }
   if (prompt.includes("CITATIONS ARE REQUIRED") && usedCitationMarkers.length === 0 && rawText.length > 50 && !rawText.includes("ERROR: INSUFFICIENT GROUNDING")) {
      console.warn(`[${new Date().toISOString()}] Final Check Warning for ${name}: Citations required, but no markers found in non-error response.`);
  }

  return {
    brief: formattedBrief,
    citations: validExtractedCitations,
    tokens: totalTokens,
    searches: searchQueriesPerformed,
    searchResults: searchResultsPayload,
  };
}