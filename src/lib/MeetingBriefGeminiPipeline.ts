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
  // Ensure the /tmp directory exists (often guaranteed in serverless, but good practice)
  if (!fs.existsSync('/tmp')) {
    fs.mkdirSync('/tmp', { recursive: true });
  }
  // Write the key file only if it doesn't exist or needs to be updated
  // For simplicity here, we'll overwrite if it exists to ensure freshness in case of env var changes during a dev session.
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

// Internal type definitions for parsing Gemini response
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
  // Could also have `retrievedContext` for data store grounding
}
interface GroundingMetadata {
  groundingAttributions?: unknown[]; // Structure might vary, often less used than chunks for web
  groundingChunks?: GroundingChunk[];
  webSearchQueries?: string[];
}
interface Candidate {
  content?: Content;
  finishReason?: string;
  safetyRatings?: unknown[];
  groundingMetadata?: GroundingMetadata;
  // citationMetadata might still appear with some configurations/models,
  // but groundingMetadata.groundingChunks is more consistently where web sources appear
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
    // Other potential fields depending on the response
}


function superscriptCitations(markdownText: string, citations: Citation[]): string {
  let result = markdownText;
  citations.forEach((citation) => {
    if (!citation.marker || !citation.url || citation.url.startsWith('ERROR_')) {
      console.warn(`[superscriptCitations] Skipping superscript for invalid citation: ${citation.marker} -> ${citation.url}`);
      return;
    }
    // Escape the marker for regex special characters
    const escapedMarker = citation.marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const markerRegex = new RegExp(escapedMarker, 'g');

    // Extract the number from the marker for display
    const numericMatch = citation.marker.match(/\d+/);
    const displayNumber = numericMatch ? numericMatch[0] : '#'; // Fallback if no number found

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

  // Ensure you are using a model version that supports grounding and is available.
  // Check the Vertex AI documentation for the latest recommended models.
  const modelId = 'gemini-2.5-pro-preview-05-06'; // Or 'gemini-2.0-flash-001' or other supported model.
                                                 // Always check for the latest recommended preview or stable versions.

  console.log(`[${new Date().toISOString()}] Using model: ${modelId} for grounding.`);

  const generativeModel = vertexAI.getGenerativeModel({
    model: modelId,
    tools: [{
      googleSearch: {}, // <<< CRITICAL FIX: Use googleSearch as per API error
    }],
    generationConfig: {
      maxOutputTokens: 8192, // Ensure this is within the model's limits
      temperature: 0.0,      // Recommended for grounding to improve factuality
      // topP: 0.95,         // Consider adjusting if needed, but temperature 0.0 is often key
      // topK: 40,
    },
  });

  const request = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  };

  console.log(`[${new Date().toISOString()}] Sending request to Gemini for: ${name}, ${org}`);
  // For detailed debugging of the request structure:
  // console.log(`[${new Date().toISOString()}] Request Payload: ${JSON.stringify({contents: request.contents, tools: generativeModel.tools /* or [{googleSearch:{}}] directly */, generationConfig: generativeModel.generationConfig }, null, 2)}`);


  let res: { response: GeminiResponse }; // Type assertion for the expected response structure
  try {
    // Type the generateContent call if possible, or cast the result.
    // The SDK might return a more generic type, so casting or type guards can be useful.
    const rawResponse = await generativeModel.generateContent(request);
    res = rawResponse as { response: GeminiResponse }; // Adjust cast as per actual SDK return type
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error during Gemini API call:`, error);
    // Log more detailed error information if available
    if (error && typeof error === 'object') {
        const errObj = error as any; // Use 'any' for broader access, or define a more specific error type
        if (errObj.message) {
            console.error(`[${new Date().toISOString()}] Gemini API Error Message: ${errObj.message}`);
        }
        if (errObj.details) { // Often present in gRPC/Vertex AI errors
             console.error(`[${new Date().toISOString()}] Gemini API Error Details: ${JSON.stringify(errObj.details, null, 2)}`);
        }
        if (errObj.stack) {
            console.error(`[${new Date().toISOString()}] Gemini API Error Stack: ${errObj.stack}`);
        }
    }
    throw new Error(`Gemini API call failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log(`[${new Date().toISOString()}] Received response from Gemini.`);
  // For full response debugging:
  // console.log(`[${new Date().toISOString()}] Full Gemini Response Object: ${JSON.stringify(res?.response, null, 2)}`);


  if (!res || !res.response) {
    console.error(`[${new Date().toISOString()}] Invalid or empty response structure from Gemini.`);
    throw new Error('Invalid or empty response structure from Gemini.');
  }

  const candidate = (res.response.candidates ?? [])[0] as Candidate | undefined;
  const rawText = candidate?.content?.parts?.[0]?.text ?? '';

  console.log(`[${new Date().toISOString()}] RAW GEMINI TEXT OUTPUT for ${name}:\n${rawText}`);
  console.log(`[${new Date().toISOString()}] GROUNDING METADATA for ${name}:\n${JSON.stringify(candidate?.groundingMetadata, null, 2)}`);
  // Also log citationMetadata if present, as some models might populate it differently
  // console.log(`[${new Date().toISOString()}] CITATION METADATA for ${name}:\n${JSON.stringify(candidate?.citationMetadata, null, 2)}`);


  // --- Debug File Writing ---
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_'); // Make filename even safer
    const debugDir = '/tmp/gemini_debug';
    if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });

    fs.writeFileSync(`${debugDir}/${timestamp}_${name.replace(/[^a-zA-Z0-9]/g, '_')}_raw.txt`, rawText, 'utf8');
    fs.writeFileSync(`${debugDir}/${timestamp}_${name.replace(/[^a-zA-Z0-9]/g, '_')}_full_response.json`, JSON.stringify(res.response, null, 2), 'utf8');
    if (candidate?.groundingMetadata) {
      fs.writeFileSync(`${debugDir}/${timestamp}_${name.replace(/[^a-zA-Z0-9]/g, '_')}_grounding.json`, JSON.stringify(candidate.groundingMetadata, null, 2), 'utf8');
    }
     if (candidate?.citationMetadata) { // Also save citationMetadata if it exists
      fs.writeFileSync(`${debugDir}/${timestamp}_${name.replace(/[^a-zA-Z0-9]/g, '_')}_citation_meta.json`, JSON.stringify(candidate.citationMetadata, null, 2), 'utf8');
    }
  } catch (e) {
    console.warn(`[${new Date().toISOString()}] Failed to write debug files:`, e);
  }
  // --- End Debug File Writing ---

  if (/ERROR: INSUFFICIENT GROUNDING/i.test(rawText)) {
    console.error(`[${new Date().toISOString()}] Gemini explicitly stated: ERROR: INSUFFICIENT GROUNDING for ${name}.`);
    // Consider not throwing an error here immediately if you want to inspect partial results,
    // but for a production system, this might be an error condition.
    // For now, let it proceed to see if any partial citations were formed.
  }
  if (candidate?.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
     console.warn(`[${new Date().toISOString()}] Gemini response finishReason was not 'STOP' or 'MAX_TOKENS': ${candidate.finishReason} for ${name}. Response might be incomplete or problematic.`);
     if (candidate.finishReason === 'SAFETY') {
         throw new Error(`Gemini response flagged for safety reasons for ${name}.`);
     }
     // Other finish reasons like 'RECITATION' or 'OTHER' might also indicate issues with grounding or content generation.
  }

  const groundingChunks = candidate?.groundingMetadata?.groundingChunks ?? [];
  const extractedCitations: Citation[] = [];

  // Find all unique citation markers like [^1], [^23] in the raw text
  const usedCitationMarkers = [...new Set(rawText.match(/\[\^\d+\]/g) ?? [])]
    .sort((a, b) => { // Sort them numerically for consistent processing
      const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);
      return numA - numB;
    });

  if (groundingChunks.length > 0 && usedCitationMarkers.length > 0) {
    console.log(`[${new Date().toISOString()}] Found ${usedCitationMarkers.length} unique citation markers and ${groundingChunks.length} grounding chunks for ${name}.`);

    usedCitationMarkers.forEach(marker => {
      const numMatch = marker.match(/\d+/); // Extract the number from [^N]
      if (numMatch) {
        const citationNumber = parseInt(numMatch[0], 10);
        // IMPORTANT: The citation number N in [^N] usually corresponds to the (N-1)th index in groundingChunks
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
     console.warn(`[${new Date().toISOString()}] No citation markers found in text OR no grounding chunks returned for ${name}. Used Citation Markers Count: ${usedCitationMarkers.length}, Grounding Chunks Count: ${groundingChunks.length}`);
  }

  // Check for issues even if some citations were extracted
  const validExtractedCitations = extractedCitations.filter(c => c.url && !c.url.startsWith('ERROR_'));
  if (usedCitationMarkers.length > 0 && validExtractedCitations.length === 0) {
    console.error(`[${new Date().toISOString()}] Critical: ${usedCitationMarkers.length} citation markers found in text for ${name}, but NO valid URLs could be mapped from grounding chunks. Grounding effectively failed to provide sources.`);
  }
  if (usedCitationMarkers.length === 0 && rawText.length > 50 && !rawText.includes("ERROR: INSUFFICIENT GROUNDING")) {
      console.warn(`[${new Date().toISOString()}] Warning: No citation markers found in Gemini output for ${name}, but text was generated. Prompt adherence issue or grounding was not triggered/effective as expected.`);
  }
  if (usedCitationMarkers.length > 0 && validExtractedCitations.length < usedCitationMarkers.length) {
      console.warn(`[${new Date().toISOString()}] Warning: Mismatch for ${name}. Found ${usedCitationMarkers.length} markers but only ${validExtractedCitations.length} valid citations were extracted. Some markers may be dangling or linked to chunks without URIs.`);
  }


  const formattedBrief = superscriptCitations(rawText, validExtractedCitations); // Use only valid citations for superscripting
  const usage = res.response.usageMetadata ?? {};
  const totalTokens = usage.totalTokenCount ?? ((usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0));
  const searchQueriesPerformed = candidate?.groundingMetadata?.webSearchQueries?.length ?? 0;

  // Prepare searchResults for the payload, including only chunks that led to valid citations or all if preferred
  const searchResultsPayload = groundingChunks
    .filter(chunk => chunk.web?.uri) // Optional: only include chunks that had a URI
    .map((chunk) => ({
        url: chunk.web?.uri ?? '',
        title: chunk.web?.title ?? '',
        snippet: chunk.web?.htmlSnippet ?? '',
    }));


  // Final check on citation requirement from prompt
  if (prompt.includes("CITATIONS ARE REQUIRED") && validExtractedCitations.length === 0 && usedCitationMarkers.length > 0 && !rawText.includes("ERROR: INSUFFICIENT GROUNDING")) {
      console.error(`[${new Date().toISOString()}] Final Check Critical for ${name}: Citations were required and markers present, but NO valid sources could be linked.`);
  }
   if (prompt.includes("CITATIONS ARE REQUIRED") && usedCitationMarkers.length === 0 && rawText.length > 50 && !rawText.includes("ERROR: INSUFFICIENT GROUNDING")) {
      console.warn(`[${new Date().toISOString()}] Final Check Warning for ${name}: Citations required, but no markers found in non-error response.`);
  }

  return {
    brief: formattedBrief,
    citations: validExtractedCitations, // Return only the successfully extracted valid citations
    tokens: totalTokens,
    searches: searchQueriesPerformed,
    searchResults: searchResultsPayload,
  };
}