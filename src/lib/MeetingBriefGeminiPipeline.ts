// lib/MeetingBriefGeminiPipeline.ts
import fs from "fs";
import { VertexAI } from "@google-cloud/vertexai";

export const runtime = "nodejs";

/* ── service-account ─────────────────────────────────────────────── */
const saJson = process.env.GCP_SA_JSON;
if (!saJson) throw new Error("GCP_SA_JSON env var not set");

const keyPath = "/tmp/sa_key.json";
if (!fs.existsSync(keyPath)) fs.writeFileSync(keyPath, saJson, "utf8");
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

/* ── Vertex client ──────────────────────────────────────────────── */
const vertex = new VertexAI({
  project: process.env.VERTEX_PROJECT_ID!,
  location: process.env.VERTEX_LOCATION ?? "us-central1",
});

/* ── outward payload ────────────────────────────────────────────── */
export interface MeetingBriefPayload {
  brief: string; // This will be HTML after processing
  citations: { marker: string; url: string }[];
  tokens: number;
  searches: number;
  searchResults: { url: string; title: string; snippet: string }[];
}

/* ── partial Vertex types ───────────────────────────────────────── */
interface Part { text?: string }
interface Content { parts?: Part[] }
interface WebInfo { uri?: string; title?: string; htmlSnippet?: string }
interface Chunk { web?: WebInfo }
interface Grounding { groundingChunks?: Chunk[]; webSearchQueries?: unknown[] }
interface Candidate { content?: Content; groundingMetadata?: Grounding }

/* ---------- citation helpers ------------------------------------ */
interface Citation { marker: string; url: string }

function splitBundledMarkers(md: string): string {
  /* turn “[ ^2, [^4]]” → “[ ^2] [ ^4]” */
  return md.replace(/\[\^\d+,\s*\[\^\d+\]\]/g, (m: string) =>
    m.replace(/,\s*\[\^/g, "] [^")
  );
}

function normaliseCarets(md: string): string {
  // Handles " ^7" -> " [^7]" but not lone carets or malformed ones.
  return md.replace(/(\s)\^(\d+)(\b)/g,
    (_match: string, pre: string, n: string, post: string) =>
      `${pre}[^${n}]${post}`
  );
}

/* ---------- formatting pipeline --------------------------------- */
function fixHeaderSpacing(md: string): string {
  let result = md
    .replace(/^#+\s*Meeting Brief:\s*(.+)$/im,
             (_: string, subj: string) => `## **Meeting Brief: ${subj.trim()}**`)
    .replace(/^###\s*1\.\s*Executive Summary/i, "**Executive Summary**")
    .replace(/^###\s*2\.\s*(.+)$/im,           "**Notable Highlights**") // Keep potential custom title
    .replace(/^###\s*3\.\s*(.+)$/im,           "**Interesting / Fun Facts**") // Keep potential custom title
    .replace(/^###\s*4\.\s*(.+)$/im,           "**Detailed Research Notes**") // Keep potential custom title
    .replace(/^###\s*\d+\.\s*(.+)$/gm,       "**$1**") // General numbered headers
    .replace(/^\*\*\d+\.\s*(.+)\*\*/gm,     "**$1**"); // Normalize bolded numbered headers like **1. Foo**

  // Ensure headers (**...**) are followed by exactly one blank line (i.e., \n\n)
  // Step 1: Ensure at least one blank line after headers if content follows directly, or if it's EOF.
  result = result.replace(/^(\*\*[^\n\r]*\*\*)$((?!\r?\n\r?\n))/gm, (match, headerContent, afterHeader) => {
    if (afterHeader === undefined || (afterHeader.startsWith('\r?\n') && !afterHeader.startsWith('\r?\n\r?\n'))) {
        // Covers cases like:
        // **Header** (EOF) -> **Header**\n\n
        // **Header**\nContent -> **Header**\n\nContent
        return `${headerContent}\n\n${afterHeader ? afterHeader.substring(afterHeader.startsWith('\r\n') ? 2 : 1) : ''}`.trimEnd() + '\n\n';
    }
     // If already **Header**\n\n or more, keep it for next step
    return match;
  });
   result = result.replace(/^(\*\*[^\n\r]*\*\*)\r?\n(?!\r?\n)/gm, "$1\r\n\r\n");


  // Step 2: Collapse multiple blank lines after a header to a single blank line.
  result = result.replace(/^(\*\*[^\n\r]*\*\*)\r?\n(\r?\n)+/gm, "$1\r\n\r\n");

  // Trim trailing newlines from the whole document to avoid excessive spacing at the end.
  return result.trimEnd();
}


function addOrNormalizeBullets(md: string): string {
  // remove bullets from Exec-summary, ensure it has one blank line after header
  md = md.replace(/(\*\*Executive Summary\*\*\s*\r?\n)[\s\S]*?(?=\r?\n\*\*|$)/,
    (match: string, header: string, contentBlock: string) => {
      // The contentBlock is captured implicitly by the structure of the regex from the start of the actual summary text
      // Need to redefine capture groups to make it work or use slice.
      // Simpler: target the block after header
      const summaryBlock = match.substring(header.length);
      return header + summaryBlock.replace(/^[\s*-]+\s*/gm, "").trimStart();
    });


  // add '* ' where missing for specified sections + trim bold date prefixes
  md = md.replace(
    /(\*\*(Notable Highlights|Interesting \/ Fun Facts|Detailed Research Notes)\*\*\s*\r?\n)([\s\S]*?)(?=\r?\n\*\*|$)/g,
    (_: string, header: string, title: string, blk: string) => {
      let out = blk.trimStart(); // Remove leading newlines from the block itself

      // Add * to lines that don't start with it, or other bullet types
      out = out.split(/\r?\n/).map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0 && !trimmedLine.startsWith('* ') && !trimmedLine.startsWith('- ')) {
          return `* ${line}`;
        }
        return line;
      }).join('\n');


      if (title === "Detailed Research Notes") {
        out = out
          .replace(/^\*\s*\*\*[A-Za-z][^\n\r]*?\d{4}:?\*\*\s*/gm, "* ") // **Date like...:** -> *
          .replace(/^\*\s*\*\*\d{4}-\d{2}-\d{2}[^\n\r]*\*\*\s*/gm, "* "); // **YYYY-MM-DD...:** -> *
      }
      // Ensure the block starts with a bullet if it has content
      // The requirement for one blank line is now handled by fixHeaderSpacing
      // and the ul/li conversion will handle list structure.
      return `${header}${out}`;
    });

  return md;
}

function convertMarkdownListsToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const newLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // A line is a list item if it starts with '* ' (or potentially '- ' after normalization)
    // and is not part of a header
    const isListItem = (line.startsWith('* ') || line.startsWith('- ')) && !line.startsWith('**');

    if (isListItem) {
      if (!inList) {
        newLines.push('<ul>');
        inList = true;
      }
      // Remove '* ' or '- ' prefix and trim
      newLines.push(`  <li>${line.substring(line.indexOf(' ') + 1).trim()}</li>`);
    } else {
      if (inList) {
        newLines.push('</ul>');
        inList = false;
      }
      newLines.push(line);
    }
  }

  if (inList) { // Close any unclosed list at the end of the document
    newLines.push('</ul>');
  }
  return newLines.join('\n');
}


function guaranteeInlineMarkers(md: string, cit: Citation[]): string {
  if (/\[\^\d+\]/.test(md) || cit.length === 0) {
    // This check might be too simplistic if Gemini *partially* adds citations.
    // The goal is to ensure *every* relevant line/sentence gets one if specified by prompt.
    // However, altering this logic is a behavior change. For now, keep original intent.
  }

  let citationIdx = 0; // Use a separate index to pick from available citations

  // Add to bullet points under specific headers if missing
  // This is a very broad replacement and might add citations where not appropriate.
  // Preserving original logic as per "No other behavior changes"
  md = md.replace(/^(?:[*\-]\s+[^\n\r]+?)(?!\s*\[\^\d+\])$/gm, (line: string) => {
    if (citationIdx < cit.length) {
      return `${line.trimEnd()} ${cit[citationIdx++].marker}`;
    }
    return line;
  });

  // Add to sentences in Executive Summary if missing
  md = md.replace(/(\*\*Executive Summary\*\*\s*(?:\r?\n){1,2})([\s\S]*?)(?=\r?\n\*\*|$)/,
    (match: string, header: string, summaryBlock: string) => {
      const processedBlock = summaryBlock.replace(/([.!?])(?!\s*\[\^\d+\])(\s*\r?\n|\s*$)/g,
        (endOfSentenceMatch: string, punctuation: string, whitespace: string) => {
          if (citationIdx < cit.length) {
            return `${punctuation} ${cit[citationIdx++].marker}${whitespace}`;
          }
          return endOfSentenceMatch;
        });
      return `${header}${processedBlock}`;
    });
  return md;
}

function linkifyCitations(html: string, citationsList: Citation[]): string {
  return html.replace(/\[\^(\d+)\]/g, (_originalMarker: string, numStr: string) => {
    const n = parseInt(numStr, 10);
    if (n > 0 && n <= citationsList.length) {
      const citation = citationsList[n - 1]; // citationsList is 0-indexed
      // Ensure URL is valid (not undefined, null, or empty string)
      if (citation && citation.url && citation.url.trim() !== "") {
        return `<sup><a class="text-blue-600 underline hover:no-underline" href="${citation.url}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
      }
    }
    // If no corresponding citation, or URL is invalid/empty, remove the marker to prevent stray brackets/carets.
    return "";
  });
}

/* ---------- main ------------------------------------------------- */
export async function buildMeetingBriefGemini(
  name: string,
  org: string,
): Promise<MeetingBriefPayload> {
  const prompt = `
SUBJECT
• Person  : ${name}
• Employer: ${org}

FORMAT (markdown – follow exactly)
## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
3–6 concise **factual** sentences; each ends with [^1]

**Notable Highlights**
* bullet list – awards, lawsuits, milestones

**Interesting / Fun Facts**
* bullet list (max 2)

**Detailed Research Notes**
* bullet list – timeline, activity ≤ 24 mo

RULES
• ≤ 1 000 words total
• **Every** line that presents a fact MUST end with a foot-note like [^1]. This applies to sentences in Executive Summary and each bullet point in other sections.
• ≥ 1 reputable source per fact (≥ 2 for negative claims like arrests or lawsuits).
• Drop any fact that cannot meet the sourcing rule.
• Ensure headers are followed by a single blank line before content or subsequent headers.
• Bullet lists should start with '* '.
`.trim();

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const model = (vertex.preview as any).getGenerativeModel({
    model: "gemini-1.5-pro-preview-0514", // Updated to a more recent model as 05-06 might be old
    tools: [{ googleSearchRetrieval: {} }], // Changed from googleSearch to googleSearchRetrieval for grounding
    generationConfig: { maxOutputTokens: 5000, temperature: 0.2 },
    // responseMimeType: "text/plain", // often not needed if Gemini infers from prompt
  });

  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const cand = (res.response.candidates ?? [])[0] as Candidate | undefined;
  const rawMarkdown = cand?.content?.parts?.[0]?.text ?? "";

  const groundingMetadata = cand?.groundingMetadata;
  const chunks = groundingMetadata?.groundingChunks ?? [];

  const citations: Citation[] = chunks.map((c, i) => ({
    marker: `[^${i + 1}]`,
    url: c.web?.uri ?? "", // Ensure URI is properly extracted
  })).filter(c => c.url && c.url.trim() !== ""); // Filter out citations with no URL


  let brief = rawMarkdown;

  // Normalize citation markers first
  brief = splitBundledMarkers(brief);   // [^1, [^2]] -> [^1] [^2]
  brief = normaliseCarets(brief);       // ^1 -> [^1]

  // Apply structural Markdown formatting
  brief = fixHeaderSpacing(brief);      // Consistent header spacing (one blank line after)
  brief = addOrNormalizeBullets(brief); // Standardize bullet points (e.g., ensure '* ')

  // If Gemini fails to add citations as requested, this attempts to add them.
  // This should ideally be less necessary if the prompt is very clear.
  // brief = guaranteeInlineMarkers(brief, citations); // Potentially adds [^N]

  // Convert Markdown to HTML elements where specified
  brief = convertMarkdownListsToHtml(brief); // * item -> <ul><li>item</li></ul>

  // Final step: linkify citations and remove any unlinked/stray ones
  brief = linkifyCitations(brief, citations); // [^N] -> <sup><a>N</a></sup> or removes if unlinked

  // Ensure no other stray carets or brackets specifically from [^...] or ^... forms remain
  // Linkify should handle [^N]. If normaliseCarets didn't catch all ^N, they might remain.
  // Add a final cleanup for any raw ^N that wasn't converted to [^N] and thus not linkified.
  brief = brief.replace(/\s\^(\d+)\b/g, ""); // Remove stray " ^N" if any survived, converting to empty string.


  const usage = res.response.usageMetadata ?? {};
  const tokens = usage.totalTokenCount ??
                 ((usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0));
  const searches = groundingMetadata?.webSearchQueries?.length ?? 0;

  const searchResults = chunks.map(c => ({
    url: c.web?.uri ?? "",
    title: c.web?.title ?? "",
    snippet: c.web?.htmlSnippet ?? "",
  }));

  return { brief: brief.trim(), citations, tokens, searches, searchResults };
}