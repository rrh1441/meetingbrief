/* MeetingBriefGeminiPipeline.ts – sane timeline, robust citations */

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

/* CONSTANTS */
const MAX_LINKS = 15;
const SERPER    = "https://google.serper.dev/search";
const FIRE      = "https://api.firecrawl.dev/v1/scrape";
const CURL      = "https://nubela.co/proxycurl/api/v2/linkedin";

/* TYPES */
interface Serp { title: string; link: string; snippet?: string }
interface Fire { article?: { text_content?: string } }
interface Exp  { company?: string; title?: string; start_date?: string; end_date?: string }
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

async function serper(q: string, num = 10): Promise<Serp[]> {
  const r = await fetch(SERPER, {
    method : "POST",
    headers: { "X-API-KEY": SERPER_KEY!, "Content-Type": "application/json" },
    body   : JSON.stringify({ q, num }),
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
  return (j.article?.text_content ?? "").trim();
}

const approxTokens = (s: string): number => Math.ceil(s.length / 4);

/* MAIN */
export async function buildMeetingBriefGemini(
  name: string,
  org: string,
): Promise<MeetingBriefPayload> {

  /* ── SERP primary + LinkedIn */
  const primary = await serper(`${name} ${org}`, 10);
  const linked =
    primary.find(x => x.link.includes("linkedin.com/in/")) ??
    (await serper(`${name} linkedin`, 3)).find(x => x.link.includes("linkedin.com/in/"));
  if (!linked) throw new Error("LinkedIn profile not found");

  /* ── Proxycurl timeline */
  const curlJson = await fetch(
    `${CURL}?linkedin_profile_url=${encodeURIComponent(linked.link)}`,
    { headers: { Authorization: `Bearer ${PROXYCURL_KEY}` } }
  ).then(r => r.json()) as Curl;
  console.log("[Proxycurl]", JSON.stringify(curlJson, null, 2));

  const timeline = (curlJson.experiences ?? []).map(e => ({
    org : (e.company ?? "").trim(),
    role: (e.title   ?? "").trim(),
    span: `${e.start_date ?? ""}-${e.end_date ?? "Present"}`,
  })).filter(t => t.org);

  /* ── awards search */
  const awards = await serper(`${name} ${org} award OR honor OR recognition`, 3);

  /* ── link selection  (keep everything mentioning the person) */
  const dedup = new Map<string, Serp>();
  [...primary, ...awards, linked].forEach(x => dedup.set(x.link, x));
  const allLinks = Array.from(dedup.values())
                    .filter(l => (l.title + " " + (l.snippet ?? "")).toLowerCase()
                      .includes(name.toLowerCase()))
                    .slice(0, MAX_LINKS);

  /* ── Extracts (Firecrawl or snippet fallback) */
  const extracts: string[] = [];
  for (const s of allLinks) {
    if (s.link.includes("linkedin.com/in/")) {
      extracts.push(`LinkedIn headline: ${curlJson.headline ?? ""}.`);
    } else {
      let txt = await firecrawl(s.link);
      if (txt.length < 100) txt = `${s.title}. ${s.snippet ?? ""}`;
      extracts.push(txt.slice(0, 1_500));
    }
    console.log(`[Extract] ${s.link} — ${extracts[extracts.length - 1].length} chars`);
  }

  /* ── timeline bullets (not marked) */
  const tlBullets = timeline.map(t =>
    `* ${t.role || "Role"} at ${t.org} (${t.span})`
  );

  /* ── prompt */
  const srcBlock = allLinks.map((s, i) =>
    `[^${i + 1}] ${s.link}\nExtract:\n${extracts[i]}`).join("\n\n");

  const prompt =
`### SOURCES
${srcBlock}

### EMPLOYMENT TIMELINE
${timeline.map(t => `${t.span} — ${t.role}, ${t.org}`).join("\n")}

## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
Exactly 3 concise sentences. End each with [^N] or use TIMELINE data (no marker required).

**Notable Highlights**
${tlBullets.slice(0, 5).join("\n")}
* Add additional bullet facts until there are **at least 3** total. Each web-sourced fact ends with [^N].

**Interesting / Fun Facts**
* Provide **1–3** bullets. Each web-sourced fact ends with [^N].

**Detailed Research Notes**
* Provide **3–8** bullets. Each web-sourced fact ends with [^N].

RULES  
• Use only information present in Extracts or TIMELINE (paraphrasing allowed).  
• **Do NOT output bare numbers**; cite \\[^N] exactly for web sources. 
• No invented facts. Keep all section headers.`;

  /* ── GPT */
  const gpt = await ai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [{ role: "user", content: prompt }],
  });
  let md = gpt.choices[0].message.content ?? "";
  if (/^ERROR/i.test(md.trim())) throw new Error("GPT refused");

  /* ── Fix stray numbers → [^N] */
  md = md.replace(/\s(\d+)(?=[.])/g, " [^$1]");

  /* ── superscripts + spacing */
  md = md
    .replace(/([a-zA-Z])\s*(\[\^\d+\])/g, "$1 $2")
    .replace(/\[\^(\d+)\]/g,
      (_m, n) => `<sup><a href="${allLinks[+n - 1].link}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`)
    .replace(/([a-zA-Z])(<sup>)/g, "$1 $2")
    /* ensure bullet prefix */
    .replace(/(\*\*Notable[\s\S]*?)(?=\n\*\*|$)/,
      m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"))
    .replace(/(\*\*Interesting[\s\S]*?)(?=\n\*\*|$)/,
      m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"))
    .replace(/(\*\*Detailed[\s\S]*?)(?=\n\*\*|$)/,
      m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"));

  /* ── citations array */
  const citations: Citation[] = allLinks.map((s, i) => ({
    marker: `[^${i + 1}]`,
    url: s.link,
    title: s.title,
    snippet: extracts[i],
  }));

  return {
    brief: md,
    citations,
    tokens: approxTokens(prompt) + approxTokens(md),
    searches: 2,
    searchResults: allLinks.map((s, i) => ({
      url: s.link,
      title: s.title,
      snippet: extracts[i],
    })),
  };
}