/*  MeetingBriefGeminiPipeline.ts
 *  Deterministic SOURCES → GPT-4o-mini generator
 *  Implements: awards search, no inference, bullet spacing fix            */

import OpenAI from "openai";
import fetch from "node-fetch";

export const runtime = "nodejs";

/*────────────────────  ENV KEYS  */
const OPENAI_API_KEY   = process.env.OPENAI_API_KEY!;
const SERPER_KEY       = process.env.SERPER_KEY!;
const FIRECRAWL_KEY    = process.env.FIRECRAWL_KEY!;
const PROXYCURL_KEY    = process.env.PROXYCURL_KEY!;

/*────────────────────  CONSTANTS  */
const MAX_LINKS      = 15;          // total sources fed to model
const MAX_FACTS      = 40;          // cap across all sections
const SERPER_URL     = "https://google.serper.dev/search";
const FIRECRAWL_URL  = "https://api.firecrawl.dev/v1/scrape";
const PROXYCURL_URL  = "https://nubela.co/proxycurl/api/v2/linkedin";

/*────────────────────  TYPES  */
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
interface Serp { title: string; link: string; snippet?: string; }
interface Firecrawl { article?: { text_content?: string } }
interface Experience { title?: string }

/*────────────────────  HELPERS  */
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const sleep  = (ms: number) => new Promise(r => setTimeout(r, ms));

async function serper(q: string, num = 10): Promise<Serp[]> {
  const r = await fetch(SERPER_URL, {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body  : JSON.stringify({ q, num }),
  });
  const j = await r.json() as { organic?: Serp[] };
  return j.organic?.slice(0, num) ?? [];
}

async function firecrawl(url: string): Promise<string> {
  const r = await fetch(FIRECRAWL_URL, {
    method : "POST",
    headers: { Authorization: `Bearer ${FIRECRAWL_KEY}`, "Content-Type": "application/json" },
    body   : JSON.stringify({ url, simulate: false }),
  });
  const j = await r.json() as Firecrawl;
  return j.article?.text_content?.slice(0, 800).trim() ?? "";
}

async function proxycurl(linkedin: string): Promise<string> {
  const u = new URL(PROXYCURL_URL);
  u.searchParams.set("linkedin_profile_url", linkedin);
  const r = await fetch(u.href, { headers: { Authorization: `Bearer ${PROXYCURL_KEY}` } });
  const j = await r.json() as { headline?: string; experiences?: Experience[] };
  const headline = j.headline ?? "";
  const current  = j.experiences?.[0]?.title ?? "";
  return `LinkedIn Headline: ${headline}. Current role: ${current}.`;
}

const tokens = (s: string): number => Math.ceil(s.length / 4);

/*────────────────────  MAIN  */

export async function buildMeetingBriefGemini(
  name: string,
  org:  string
): Promise<MeetingBriefPayload> {

  /* 1 ── harvest links */
  const primary = await serper(`${name} ${org}`, 10);

  // ensure LinkedIn
  let linkedin = primary.find(s => s.link.includes("linkedin.com/in/"));
  if (!linkedin) {
    const alt = await serper(`${name} linkedin`, 3);
    linkedin = alt.find(s => s.link.includes("linkedin.com/in/"));
  }
  if (linkedin && !primary.some(s => s.link === linkedin!.link)) {
    primary.unshift(linkedin);
  }

  /* awards query */
  const awards = await serper(`${name} ${org} award OR honor OR recognition`, 3);

  /* combine + dedupe + cap */
  const seen = new Set<string>();
  const sources: Serp[] = [];
  for (const s of [...primary, ...awards]) {
    if (!seen.has(s.link) && sources.length < MAX_LINKS) {
      sources.push(s); seen.add(s.link);
    }
  }

  /* 2 ── fetch extracts */
  const extracts: string[] = [];
  for (const s of sources) {
    if (s.link.includes("linkedin.com/in/")) {
      extracts.push(await proxycurl(s.link));
    } else {
      extracts.push(await firecrawl(s.link));
    }
  }

  /* 3 ── prompt */
  const sourceBlock = sources.map((s, i) =>
    `[^${i + 1}] ${s.link}\nExtract: ${extracts[i]}`).join("\n\n");

  const prompt =
`### SOURCES
${sourceBlock}

## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
Exactly 3 concise sentences (plain factual), each ends with [^N].

**Notable Highlights**
* Up to 5 bullet facts. Use * fewer if sources limited. Each ends with [^N].

**Interesting / Fun Facts**
* Up to 3 bullet facts (optional). Each ends with [^N].

**Detailed Research Notes**
* Up to 8 bullet facts (optional). Each ends with [^N].

STYLE & RULES
• Write only what appears in the Extracts. **DO NOT infer skills, traits, or impact.**  
• Do not repeat the same fact or phrasing.  
• ≤ ${MAX_FACTS} facts total; sections may be shorter or omitted.  
• Every fact must cite exactly one marker from SOURCES.  
• If no facts can be cited, reply ERROR.`;

  /* 4 ── model */
  let txt = "ERROR";
  for (let i = 0; i < 2 && /^ERROR/i.test(txt.trim()); i += 1) {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.0,
      messages: [{ role: "user", content: prompt }],
    });
    txt = res.choices[0].message.content ?? "ERROR";
    if (/^ERROR/i.test(txt.trim())) await sleep(300);
  }
  if (/^ERROR/i.test(txt.trim())) throw new Error("GPT refused to cite");

  /* 5 ── superscript + spacing fix */
  let brief = txt.replace(/\[\^(\d+)\]/g, (_, n) =>
    `<sup><a href="${sources[Number(n)-1].link}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`
  );
  brief = brief.replace(/([a-zA-Z])(<sup>)/g, "$1 $2");

  const citations: Citation[] = sources.map((s, i) => ({
    marker: `[^${i + 1}]`,
    url: s.link,
    title: s.title,
    snippet: extracts[i],
  }));

  return {
    brief,
    citations,
    tokens: tokens(prompt) + tokens(txt),
    searches: 2,   // primary + awards
    searchResults: sources.map((s, i) => ({ url: s.link, title: s.title, snippet: extracts[i] })),
  };
}