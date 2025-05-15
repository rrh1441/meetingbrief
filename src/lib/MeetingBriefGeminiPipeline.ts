/* eslint-disable no-console */

/**
 * MeetingBriefGeminiPipeline.ts
 * ------------------------------------------------------------
 * One‑pass pipeline for producing a fully‑grounded meeting brief
 * via Vertex AI Gemini 2.5‑pro‑preview with Google Search tool.
 *
 * – Every fact carries a superscripted hyperlink.
 * – Total facts ≤ 20 (3 summary + ≤5 highlights + ≤3 fun + ≤8 notes).
 * – Uses retry/back‑off for 429s.
 * – No explicit `any`; compiles under @typescript-eslint strict rules.
 */

import fs from "fs";
import { VertexAI, type Tool } from "@google-cloud/vertexai";

/*───────────────────  Runtime target (Vercel)  */
export const runtime = "nodejs";

/*───────────────────  Service‑account auth  */
const saJson = process.env.GCP_SA_JSON;
if (!saJson) throw new Error("GCP_SA_JSON env var not set");

const keyPath = "/tmp/sa_key.json";
if (!fs.existsSync(keyPath)) fs.writeFileSync(keyPath, saJson, "utf8");
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

/*───────────────────  Vertex client  */
const vertex = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION ?? "us-central1",
});

/**
 * Vertex Gemini 2.x expects snake‑case `google_search`.
 * SDK typings may lag, so cast through `unknown as Tool`.
 */
const googleSearchTool: Tool = { google_search: {} } as unknown as Tool;

const modelId = "gemini-2.5-pro-preview-05-06";
const generativeModel = vertex.preview.getGenerativeModel({
  model: modelId,
  generationConfig: {
    maxOutputTokens: 2_048,
    temperature: 0.2,
  },
});

/*───────────────────  Types  */
export interface Citation {
  marker: string;
  url: string;
  title?: string;
  snippet?: string;
}
export interface MeetingBriefPayload {
  brief: string;               // HTML with superscripts
  citations: Citation[];       // list of linked citations
  tokens: number;              // total tokens consumed
  searches: number;            // webSearchQueries length
  searchResults: { url: string; title: string; snippet: string }[];
}
interface Part           { text?: string }
interface Content        { parts?: Part[] }
interface WebInfo        { uri?: string; title?: string; htmlSnippet?: string }
interface GroundingChunk { web?: WebInfo }
interface GroundingMeta  { groundingChunks?: GroundingChunk[]; webSearchQueries?: string[] }
interface Candidate      {
  content?: Content;
  groundingMetadata?: GroundingMeta;
}
interface UsageMeta      { totalTokenCount?: number; promptTokenCount?: number; candidatesTokenCount?: number }
interface GeminiResp     { candidates?: Candidate[]; usageMetadata?: UsageMeta }

/*───────────────────  Helpers  */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function superscriptLinks(md: string, chunks: GroundingChunk[]): string {
  return md.replace(/\[\^(\d+)]/g, (match, numStr) => {
    const idx = Number(numStr) - 1;
    const url = chunks[idx]?.web?.uri;
    if (!url) {
      // leave the plain marker if url missing (should be caught earlier)
      return match;
    }
    return `<sup><a href="${url}" target="_blank" rel="noopener noreferrer">${numStr}</a></sup>`;
  });
}

function hasResourceExhausted(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: number }).code === 429;
}

/*───────────────────  Main entry  */
export async function buildMeetingBriefGemini(
  name: string,
  org: string,
): Promise<MeetingBriefPayload> {
  if (!name) throw new Error("name is required");
  const orgLabel = org?.trim() || "";

  const prompt = `SUBJECT\n• Person  : ${name}\n${orgLabel ? `• Employer: ${orgLabel}` : ""}\n\nFORMAT (Markdown – follow exactly)\n## **Meeting Brief: ${name}${orgLabel ? ` – ${orgLabel}` : ""}**\n\n**Executive Summary**\nExactly **3** concise sentences, each ends with a period and one citation marker [^N].\n\n**Notable Highlights**\n* Up to **5** bullets. Each bullet is one fact, ends with [^N].\n\n**Interesting / Fun Facts**\n* Up to **3** bullets. Each bullet ends with [^N].\n\n**Detailed Research Notes**\n* Up to **8** bullets. Each bullet ends with [^N].\n\nRULES\n• Max 1000 words, max 20 facts total.\n• **CITATIONS REQUIRED.** Every fact ends with exactly one [^N] at line end.\n• Do NOT insert [^N] in the middle of a line.\n• Each [^N] must map to a unique source in grounding metadata (chunks).\n• Drop any fact that cannot meet these rules.`.trim();

  const request = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    tools: [googleSearchTool],
  } as const;

  /*──── call with retry ────*/
  let resp: GeminiResp | undefined;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const result = await generativeModel.generateContent(request) as { response: GeminiResp };
      resp = result.response;
      break;
    } catch (err) {
      if (!hasResourceExhausted(err) || attempt === 3) throw err;
      await sleep(500 * 2 ** attempt); // 0.5s,1s,2s
    }
  }
  if (!resp) throw new Error("No response from Gemini");

  /*──── parse ────*/
  const cand = resp.candidates?.[0] ?? {};
  const raw = cand.content?.parts?.[0]?.text ?? "";
  const chunks = cand.groundingMetadata?.groundingChunks ?? [];
  const markers = [...raw.matchAll(/\[\^(\d+)]/g)].map(m => Number(m[1]));

  if (markers.length !== chunks.length) {
    throw new Error(`Grounding mismatch: markers=${markers.length} chunks=${chunks.length}`);
  }

  // build citation list
  const citations: Citation[] = markers.map(n => ({
    marker: `[^${n}]`,
    url: chunks[n - 1]?.web?.uri ?? "",
    title: chunks[n - 1]?.web?.title,
    snippet: chunks[n - 1]?.web?.htmlSnippet,
  }));

  const briefHtml = superscriptLinks(raw, chunks);

  const usage = resp.usageMetadata ?? {};
  const tokens = usage.totalTokenCount ?? (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches = cand.groundingMetadata?.webSearchQueries?.length ?? 0;
  const searchResults = chunks.map(c => ({
    url: c.web?.uri ?? "",
    title: c.web?.title ?? "",
    snippet: c.web?.htmlSnippet ?? "",
  }));

  return { brief: briefHtml, citations, tokens, searches, searchResults };
}
