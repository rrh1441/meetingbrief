/* MeetingBriefGeminiPipeline.ts – full-article extracts, mandatory lists */

import OpenAI from "openai";
import fetch from "node-fetch";

export const runtime = "nodejs";

/* ENV */
const {
  OPENAI_API_KEY,
  SERPER_KEY,
  FIRECRAWL_KEY,
  PROXYCURL_KEY,
} = process.env;

/* CONST */
const MAX_LINKS = 15;
const SERPER    = "https://google.serper.dev/search";
const FIRE      = "https://api.firecrawl.dev/v1/scrape";
const CURL      = "https://nubela.co/proxycurl/api/v2/linkedin";

/* TYPES */
interface Serp { title: string; link: string; snippet?: string }
interface Fire {
  article?: { text_content?: string; title?: string; description?: string };
}
interface Exp { company?: string; title?: string; start_date?: string; end_date?: string }
interface Curl { headline?: string; experiences?: Exp[] }

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

/* HELPERS */
const ai = new OpenAI({ apiKey: OPENAI_API_KEY! });

async function serper(query: string, num = 10): Promise<Serp[]> {
  const r = await fetch(SERPER, {
    method : "POST",
    headers: { "X-API-KEY": SERPER_KEY!, "Content-Type": "application/json" },
    body   : JSON.stringify({ q: query, num }),
  });
  const j = (await r.json()) as { organic?: Serp[] };
  return j.organic ?? [];
}

async function firecrawl(url: string): Promise<string> {
  const r = await fetch(FIRE, {
    method : "POST",
    headers: { Authorization: `Bearer ${FIRECRAWL_KEY}`, "Content-Type": "application/json" },
    body   : JSON.stringify({ url, simulate: false }),
  });
  const j = (await r.json()) as Fire;
  const raw = j.article?.text_content ?? "";
  if (raw.length <= 1_500) return raw.trim();

  /* >1500 chars ⇒ keep first paragraph + any paragraph mentioning name/org */
  const paras = raw.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const keep: string[] = [];
  if (paras.length) keep.push(paras[0]);                 // lead paragraph
  return keep.concat(
    paras.filter(p => /[A-Z][a-z]+ [A-Z]/.test(p))       // contains capitalised name-like phrase
  ).join("\n\n").slice(0, 1_500);
}

function tokens(s: string): number { return Math.ceil(s.length / 4); }

/* MAIN */
export async function buildMeetingBriefGemini(
  name: string,
  org: string,
): Promise<MeetingBriefPayload> {

  /* ── SERP */
  const primary = await serper(`${name} ${org}`, 10);
  const linkedin =
    primary.find(x => x.link.includes("linkedin.com/in/")) ||
    (await serper(`${name} linkedin`, 3)).find(x => x.link.includes("linkedin.com/in/"));
  if (!linkedin) throw new Error("LinkedIn profile not found");

  /* ── Proxycurl */
  const curlJson = await fetch(
    `${CURL}?linkedin_profile_url=${encodeURIComponent(linkedin.link)}`,
    { headers: { Authorization: `Bearer ${PROXYCURL_KEY}` } }
  ).then(r => r.json()) as Curl;
  console.log("[Proxycurl]", JSON.stringify(curlJson, null, 2));

  const timeline = (curlJson.experiences ?? []).map(e => ({
    org  : (e.company ?? "").trim(),
    role : (e.title   ?? "").trim(),
    span : `${e.start_date ?? ""}-${e.end_date ?? "Present"}`,
  })).filter(t => t.org);

  const orgTokens = timeline.map(t => t.org.toLowerCase());

  /* ── Awards query */
  const awards = await serper(`${name} ${org} award OR honor OR recognition`, 3);

  /* ── link selection */
  const combined = [...new Map([...primary, ...awards, linkedin].map(s => [s.link, s])).values()];
  const strict   = combined.filter(s =>
    orgTokens.some(tok => (s.title + " " + (s.snippet ?? "")).toLowerCase().includes(tok))
  );
  const sources: Serp[] =
    (strict.length >= 2 ? strict : combined).slice(0, MAX_LINKS);

  /* ── Extracts */
  const extracts: string[] = [];
  for (const s of sources) {
    extracts.push(
      s.link.includes("linkedin.com/in/")
        ? `LinkedIn headline: ${curlJson.headline ?? ""}.`
        : await firecrawl(s.link)
    );
    console.log(`[Extract] ${s.link} — ${extracts[extracts.length - 1].length} chars`);
  }

  /* ── TIMELINE bullets (all, up to 5 shown later) */
  const timelineBulletLines = timeline.map(t =>
    `* ${t.role || "Role"} at ${t.org} (${t.span}) – TIMELINE`
  );

  /* ── Prompt */
  const srcBlock = sources.map((s, i) =>
    `[^${i + 1}] ${s.link}\nExtract:\n${extracts[i]}`).join("\n\n");

  const prompt =
`### SOURCES
${srcBlock}

### EMPLOYMENT TIMELINE
${timeline.map(t => `${t.span} — ${t.role}, ${t.org}`).join("\n")}

## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
Exactly 3 concise sentences. End each with [^N] or cite TIMELINE.

**Notable Highlights**
${timelineBulletLines.slice(0, 5).join("\n")}
* Add more bullet facts until there are **≥ 3** total. Each ends with [^N] or TIMELINE.

**Interesting / Fun Facts**
* Write **1–3** bullet facts, each ends with [^N] or TIMELINE.

**Detailed Research Notes**
* Write **3–8** bullet facts, each ends with [^N] or TIMELINE.

RULES  
• Use only information present in Extracts or TIMELINE (paraphrasing allowed).  
• Do **not** invent facts.  
• Every non-timeline fact must cite exactly one marker.  
• Keep all section headers.`;

  /* ── GPT */
  const gpt = await ai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [{ role: "user", content: prompt }],
  });
  let md = gpt.choices[0].message.content ?? "";
  if (/^ERROR/i.test(md.trim())) throw new Error("GPT refused");

  /* ── Superscripts & spacing */
  md = md.replace(/([a-zA-Z])\s*(\[\^\d+\])/g, "$1 $2")
         .replace(/\[\^(\d+)\]/g, (_m, n) =>
           `<sup><a href="${sources[+n - 1].link}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`)
         .replace(/([a-zA-Z])(<sup>)/g, "$1 $2")
         /* autobullet any orphan lines in list sections */
         .replace(/(\*\*Notable[\s\S]*?)(?=\n\*\*|$)/,
           m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"))
         .replace(/(\*\*Interesting[\s\S]*?)(?=\n\*\*|$)/,
           m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"))
         .replace(/(\*\*Detailed[\s\S]*?)(?=\n\*\*|$)/,
           m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"));

  /* ── Citations */
  const citations: Citation[] = sources.map((s, i) => ({
    marker: `[^${i + 1}]`,
    url: s.link,
    title: s.title,
    snippet: extracts[i],
  }));

  return {
    brief: md,
    citations,
    tokens: tokens(prompt) + tokens(md),
    searches: 2,
    searchResults: sources.map((s, i) => ({
      url: s.link,
      title: s.title,
      snippet: extracts[i],
    })),
  };
}