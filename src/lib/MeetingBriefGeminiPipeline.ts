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
  brief: string;
  citations: { marker: string; url: string }[];
  tokens: number;
  searches: number;
  searchResults: { url: string; title: string; snippet: string }[];
}

/* ── partial Vertex types ───────────────────────────────────────── */
interface Part      { text?: string }
interface Content   { parts?: Part[] }
interface WebInfo   { uri?: string; title?: string; htmlSnippet?: string }
interface Chunk     { web?: WebInfo }
interface Grounding { groundingChunks?: Chunk[]; webSearchQueries?: unknown[] }
interface Candidate { content?: Content; groundingMetadata?: Grounding }

/* ---------- formatting pipeline --------------------------------- */
// Fix header spacing and ensure exactly one blank line after headers
function fixHeaderSpacing(md: string): string {
  // Standardize Meeting Brief header
  md = md.replace(/^#+\s*Meeting Brief:\s*(.+)$/im,
    (_: string, subj: string) => `## **Meeting Brief: ${subj.trim()}**`);
  // Standardize all section headers and ensure bold
  md = md
    .replace(/^###\s*1\.\s*Executive Summary/i, "**Executive Summary**")
    .replace(/^###\s*2\.\s*.+$/im, "**Notable Highlights**")
    .replace(/^###\s*3\.\s*.+$/im, "**Interesting / Fun Facts**")
    .replace(/^###\s*4\.\s*.+$/im, "**Detailed Research Notes**")
    .replace(/^###\s*\d+\.\s*(.+)$/gm, "**$1**")
    .replace(/^\*\*\d+\.\*\*\s*(.+)$/gm, "**$1**");

  // Ensure exactly one blank line after every header (bold line)
  md = md.replace(/^(\*\*[^\n]*\*\*)(?!\n\n)/gm, "$1\n\n");
  // Remove excess blank lines (convert 3+ to 2)
  md = md.replace(/\n{3,}/g, "\n\n");
  return md;
}

// Parse out the relevant blocks and convert all bullet lists to <ul><li> in HTML
function addBulletsAndStripDates(md: string): string {
  // Remove bullets from Exec-summary (make it plain text, sentences)
  md = md.replace(/\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_: string, blk: string) =>
      "**Executive Summary**\n\n" + blk.replace(/^[\s*-]+\s+/gm, ""));

  // For the other sections, ensure bullets and remove date prefixes in "Detailed Research Notes"
  md = md.replace(
    /\*\*(Notable Highlights|Interesting \/ Fun Facts|Detailed Research Notes)\*\*([\s\S]*?)(?=\n\*\*|$)/g,
    (_: string, title: string, blk: string) => {
      let out = blk
        .replace(/^(?![*\-\s])([^\n]+)/gm, "* $1"); // Add missing '* ' for lines
      if (title === "Detailed Research Notes") {
        out = out
          .replace(/^\*\*[A-Za-z][^\n]*?\d{4}:?\*\*\s*/gm, "* ")
          .replace(/^\*\*\d{4}-\d{2}-\d{2}[^\n]*\*\*\s*/gm, "* ");
      }
      // Ensure blank line before first bullet
      out = out.replace(/^\n?(\* )/, "\n\n$1");
      return `**${title}**${out}`;
    }
  );
  return md;
}

// Used for citation markers
interface Citation { marker: string; url: string }

// Split bundled markers, e.g., [^2, [^4]] → [^2] [^4]
function splitBundledMarkers(md: string): string {
  return md.replace(/\[\^\d+,[^\]]+\]/g, (m: string) =>
    m.replace(/,\s*\[\^/g, "] [^"));
}

// Normalize caret notation, e.g., ^7 → [^7]
function normaliseCarets(md: string): string {
  return md.replace(/(\s)\^(\d{1,4})(\b)/g,
    (_: string, pre: string, n: string, post: string) =>
      `${pre}[^${n}]${post}`);
}

// Ensure every fact gets a citation (if any exist)
function guaranteeInlineMarkers(md: string, cit: Citation[]): string {
  if (/\[\^\d+\]/.test(md) || cit.length === 0) return md;

  let idx = 0;
  md = md.replace(/^(?:[*\-]\s+[^\n]+?)(?!\s+\[\^\d+\])/gm, (ln: string) =>
    idx < cit.length ? `${ln} ${cit[idx++].marker}` : ln);

  md = md.replace(/\*\*Executive Summary\*\*([\s\S]*?)(?=\n\*\*|$)/,
    (_: string, blk: string) =>
      "**Executive Summary**\n\n" +
      blk.replace(/([.!?])(\s+|$)/g,
        (_2: string, p: string, s: string) =>
          idx < cit.length ? `${p} ${cit[idx++].marker}${s}` : `${p}${s}`));

  return md;
}

// Convert [^n] into blue, clickable superscript using groundingChunks order (1-based)
function linkify(md: string, cit: Citation[]): string {
  // Track already linked markers to avoid double-replacement
  const usedMarkers = new Set<string>();
  cit.forEach((c: Citation, i: number) => {
    const n = i + 1;
    const sup = `<sup><a class="text-blue-600 underline hover:no-underline" href="${c.url}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
    // Replace ALL forms of the marker: [^n], ^n, [ ^n ]
    const patterns = [
      new RegExp(`\\[\\^${n}\\]`, "g"),
      new RegExp(`\\^${n}(?![\\d])`, "g"),
      new RegExp(`\\[\\s*\\^${n}\\s*\\]`, "g")
    ];
    for (const pat of patterns) {
      md = md.replace(pat, (match: string) => {
        if (usedMarkers.has(match + "-" + n)) return match;
        usedMarkers.add(match + "-" + n);
        return sup;
      });
    }
  });
  return md;
}

// Remove stray carets/brackets left from messy citation emission
function removeStrayCaretsAndBrackets(md: string): string {
  // Remove [^ ] or ^ with no digits, and unlinked square brackets/carets
  md = md.replace(/\[\^\s*\]/g, "");
  md = md.replace(/\[\s*\^/, "");
  md = md.replace(/\^(\D|$)/g, "");
  // Remove stray "[" or "]" not part of <a> or <sup> tags
  md = md.replace(/(\s|^)\[(?=[^\[]*?(?:\s|$))/g, "$1");
  md = md.replace(/(\s|^)\](?=[^\]]*?(?:\s|$))/g, "$1");
  // Remove any remaining isolated carets
  md = md.replace(/(\s|^)\^(?=\s|$)/g, "$1");
  return md;
}

// Render Markdown with HTML lists and inline citation superscripts (final transformation)
function markdownToHtml(md: string): string {
  // Convert bullet lists to <ul><li>
  // We want each block of consecutive lines starting with "* " to become a <ul>
  let html = md;
  html = html.replace(/(?:\n{2,}|\A)((\* .+\n)+)/g, (_: string, blk: string) => {
    const items = blk
      .trim()
      .split(/\n/)
      .filter(line => line.startsWith("* "))
      .map(line => `<li>${line.slice(2).trim()}</li>`)
      .join("");
    return `<ul>${items}</ul>\n\n`;
  });
  // Convert remaining newlines to <br> (for Executive Summary), but not inside lists
  html = html.replace(/([^\n>])\n([^\n*])/g, "$1<br>$2");
  // Remove excess line breaks after lists
  html = html.replace(/<\/ul>\s*<br>/g, "</ul>");
  return html.trim();
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
• **Every** line ends with a foot-note like [^1]
• ≥ 1 reputable source per fact (≥ 2 for negative claims)
• Drop any fact that cannot meet the rule
`.trim();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = (vertex.preview as any).getGenerativeModel({
    model: "gemini-2.5-pro-preview-05-06",
    tools: [{ googleSearch: {} }],
    generationConfig: { maxOutputTokens: 5000, temperature: 0.2 },
  });

  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    responseMimeType: "text/plain",
  });

  const cand = (res.response.candidates ?? [])[0] as Candidate | undefined;
  const raw = cand?.content?.parts?.[0]?.text ?? "";

  const chunks = cand?.groundingMetadata?.groundingChunks ?? [];
  const citations: Citation[] = chunks.map((c, i) => ({
    marker: `[^${i + 1}]`,
    url: c.web?.uri ?? "",
  }));

  let brief = raw;
  brief = splitBundledMarkers(brief);
  brief = normaliseCarets(brief);
  brief = fixHeaderSpacing(brief);
  brief = addBulletsAndStripDates(brief);
  brief = guaranteeInlineMarkers(brief, citations);
  brief = linkify(brief, citations);
  brief = removeStrayCaretsAndBrackets(brief);
  brief = markdownToHtml(brief);

  const usage = res.usageMetadata ?? {};
  const tokens = usage.totalTokenCount ??
    (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0);
  const searches = cand?.groundingMetadata?.webSearchQueries?.length ?? 0;

  const searchResults = chunks.map(c => ({
    url: c.web?.uri ?? "",
    title: c.web?.title ?? "",
    snippet: c.web?.htmlSnippet ?? "",
  }));

  return { brief, citations, tokens, searches, searchResults };
}
