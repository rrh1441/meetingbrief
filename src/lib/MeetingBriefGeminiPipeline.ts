/* MeetingBriefGeminiPipeline.ts – timeline-aware, OpenAI-based */

import OpenAI from "openai";
import fetch from "node-fetch";

export const runtime = "nodejs";

/*────────────────────  ENV KEYS  */
const OPENAI_API_KEY   = process.env.OPENAI_API_KEY!;
const SERPER_KEY       = process.env.SERPER_KEY!;
const FIRECRAWL_KEY    = process.env.FIRECRAWL_KEY!;
const PROXYCURL_KEY    = process.env.PROXYCURL_KEY!;

/*────────────────────  CONSTANTS  */
const MAX_LINKS      = 15;
const MAX_FACTS      = 40;
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

interface Serp { title: string; link: string; snippet?: string }
interface Firecrawl { article?: { text_content?: string } }
interface Exp { company?: string; title?: string; start_date?: string; end_date?: string }
interface Pcurl { headline?: string; experiences?: Exp[] }

/*────────────────────  HELPERS  */
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function serper(q: string, num: number): Promise<Serp[]> {
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

async function proxycurl(linkedin: string): Promise<Pcurl> {
  const u = new URL(PROXYCURL_URL);
  u.searchParams.set("linkedin_profile_url", linkedin);
  const r = await fetch(u.href, { headers: { Authorization: `Bearer ${PROXYCURL_KEY}` } });
  const j = await r.json() as Pcurl;
  /* log raw JSON to Vercel */
  console.log("[Proxycurl JSON]", JSON.stringify(j, null, 2));
  return j;
}

const approxTokens = (s: string): number => Math.ceil(s.length / 4);

/*────────────────────  MAIN  */

export async function buildMeetingBriefGemini(
  name: string,
  org:  string
): Promise<MeetingBriefPayload> {

  /* 1 ── primary SERP & LinkedIn */
  const primary = await serper(`${name} ${org}`, 10);

  let linkedin = primary.find(s => s.link.includes("linkedin.com/in/"));
  if (!linkedin) {
    const alt = await serper(`${name} linkedin`, 3);
    linkedin = alt.find(s => s.link.includes("linkedin.com/in/"));
  }
  if (linkedin && !primary.some(s => s.link === linkedin.link)) {
    primary.unshift(linkedin);
  }
  if (!linkedin) throw new Error("LinkedIn profile not found");

  /* 2 ── Proxycurl profile → timeline */
  const pcl = await proxycurl(linkedin.link);
  const timeline = (pcl.experiences ?? []).map(e => ({
    org : (e.company ?? "").trim(),
    title: (e.title ?? "").trim(),
    start: e.start_date ?? "",
    end  : e.end_date ?? "Present",
  })).filter(t => t.org);

  /* verify current org matches */
  if (timeline.length && !timeline[0].org.toLowerCase().includes(org.toLowerCase())) {
    throw new Error("LinkedIn profile org mismatch");
  }

  const orgTokens = timeline.map(t => t.org.toLowerCase());

  /* 3 ── awards SERP */
  const awards = await serper(`${name} ${org} award OR honor OR recognition`, 3);

  /* 4 ── filter SERP links by timeline orgs */
  function good(s: Serp): boolean {
    const text = (s.title + " " + (s.snippet ?? "")).toLowerCase();
    return text.includes(name.toLowerCase()) &&
           orgTokens.some(tok => text.includes(tok));
  }
  const sources: Serp[] = [];
  const seen = new Set<string>();
  for (const s of [...primary, ...awards]) {
    if (good(s) && !seen.has(s.link) && sources.length < MAX_LINKS) {
      sources.push(s); seen.add(s.link);
    }
  }

  /* 5 ── fetch extracts */
  const extracts: string[] = [];
  for (const s of sources) {
    extracts.push(
      s.link.includes("linkedin.com/in/") ? `LinkedIn Headline: ${pcl.headline ?? ""}.` :
      await firecrawl(s.link)
    );
  }

  /* 6 ── build TIMELINE + SOURCES */
  const timelineBlock = timeline.slice(0, 6).map(t =>
    `${t.start}-${t.end} — ${t.title}, ${t.org}`
  ).join("\n");

  const sourceBlock = sources.map((s, i) =>
    `[^${i + 1}] ${s.link}\nExtract: ${extracts[i]}`).join("\n\n");

  const prompt =
`### EMPLOYMENT TIMELINE
${timelineBlock}

### SOURCES
${sourceBlock}

## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
Exactly 3 plain factual sentences, each ends with [^N] *or* derives from TIMELINE.

**Notable Highlights**
* Up to 5 bullet facts (omit section if <1 fact). Cite [^N] or TIMELINE.

**Interesting / Fun Facts**
* Up to 3 bullet facts (optional). Cite [^N] or TIMELINE.

**Detailed Research Notes**
* Up to 8 bullet facts (optional). Cite [^N] or TIMELINE.

RULES  
• No inference or repetition; write only what appears in Extracts or TIMELINE.  
• ≤ ${MAX_FACTS} facts total. Sections may be shorter or omitted.  
• Every non-timeline fact must cite one marker from SOURCES.  
• If zero facts can be written, reply ERROR.`;

  /* 7 ── GPT-4 mini */
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.0,
    messages: [{ role: "user", content: prompt }],
  });
  let text = res.choices[0].message.content ?? "";
  if (/^ERROR/i.test(text.trim())) throw new Error("GPT returned ERROR");

  /* 8 ── superscripts + spacing */
  text = text.replace(/([a-zA-Z])\s*(\[\^\d+\])/g, "$1 $2");
  let brief = text.replace(/\[\^(\d+)\]/g, (_: string, n: string) =>
    `<sup><a href="${sources[Number(n) - 1].link}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`
  ).replace(/([a-zA-Z])(<sup>)/g, "$1 $2");

  /* auto-bullet orphan lines inside list sections */
  function autobullet(sec: RegExp): void {
    brief = brief.replace(sec, m =>
      m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"));
  }
  autobullet(/(\*\*Notable[\s\S]*?)(?=\n\*\*|$)/);
  autobullet(/(\*\*Interesting[\s\S]*?)(?=\n\*\*|$)/);
  autobullet(/(\*\*Detailed[\s\S]*?)(?=\n\*\*|$)/);

  /* 9 ── assemble payload */
  const citations: Citation[] = sources.map((s, i) => ({
    marker: `[^${i + 1}]`,
    url: s.link,
    title: s.title,
    snippet: extracts[i],
  }));

  return {
    brief,
    citations,
    tokens: approxTokens(prompt) + approxTokens(text),
    searches: 2,                 // primary + awards
    searchResults: sources.map((s, i) => ({
      url: s.link, title: s.title, snippet: extracts[i],
    })),
  };
}