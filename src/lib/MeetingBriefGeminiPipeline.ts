/* MeetingBriefGeminiPipeline.ts – balanced strict+loose, logs Proxycurl */

import OpenAI from "openai";
import fetch from "node-fetch";

export const runtime = "nodejs";

/* ENV */
const { OPENAI_API_KEY, SERPER_KEY, FIRECRAWL_KEY, PROXYCURL_KEY } = process.env;

/* Const */
const MAX_LINKS = 15;
const SERPER = "https://google.serper.dev/search";
const FIRE   = "https://api.firecrawl.dev/v1/scrape";
const CURL   = "https://nubela.co/proxycurl/api/v2/linkedin";

/* Types */
interface Serp { title: string; link: string; snippet?: string }
interface Curl { headline?: string; experiences?: { company?: string; title?: string }[] }

/* Helpers */
const ai = new OpenAI({ apiKey: OPENAI_API_KEY! });
const post = (url: string, body: unknown, hdr = {}) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...hdr }, body: JSON.stringify(body) });
const tokens = (s: string) => Math.ceil(s.length / 4);

/* Build */
export async function buildMeetingBriefGemini(name: string, org: string) {
  /* ── Search */
  const q = (x: string, n = 10) => post(SERPER, { q: x, num: n }, { "X-API-KEY": SERPER_KEY! })
                                     .then(r => r.json() as any)
                                     .then(j => j.organic ?? []) as Promise<Serp[]>;

  const base   = await q(`${name} ${org}`, 10);
  const lookup = await q(`${name} linkedin`, 3);
  const linked = [...base, ...lookup].find(l => l.link.includes("linkedin.com/in/"));
  if (!linked) throw new Error("LinkedIn not found");

  /* ── Proxycurl */
  const curlUrl = `${CURL}?linkedin_profile_url=${encodeURIComponent(linked.link)}`;
  const curl = await fetch(curlUrl, { headers: { Authorization: `Bearer ${PROXYCURL_KEY}` } })
                .then(r => r.json()) as Curl;
  console.log("[Proxycurl]", JSON.stringify(curl));
  const timeline = (curl.experiences ?? []).map(e => e.company?.toLowerCase()).filter(Boolean);

  /* ── Awards search */
  const awards = await q(`${name} ${org} award OR honor OR recognition`, 3);

  /* ── Two-tier filtering */
  const full = [...new Map([...base, ...awards, linked].map(s => [s.link, s])).values()];
  const strict = full.filter(s => {
    const t = (s.title + s.snippet).toLowerCase();
    return t.includes(name.toLowerCase()) && timeline.some(o => t.includes(o!));
  });
  const loose = full.filter(s => {
    const t = (s.title + s.snippet).toLowerCase();
    return t.includes(name.toLowerCase()) && !strict.includes(s);
  });
  const sources = (strict.length >= 5 ? strict : [...strict, ...loose])
                  .slice(0, MAX_LINKS);

  /* ── Extracts */
  const extracts = await Promise.all(sources.map(s =>
    s.link.includes("linkedin.com/in/")
      ? `LinkedIn Headline: ${curl.headline ?? ""}.`
      : post(FIRE, { url: s.link, simulate: false }, { Authorization: `Bearer ${FIRECRAWL_KEY}` })
          .then(r => r.json()).then((j: any) => j.article?.text_content?.slice(0, 800).trim() ?? "")
  ));

  /* ── Prompt */
  const srcBlock = sources.map((s, i) => `[^${i+1}] ${s.link}\nExtract: ${extracts[i]}`).join("\n\n");
  const prompt = `### SOURCES
${srcBlock}

## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
Exactly 3 concise sentences, each ends with [^N].

**Notable Highlights**
* 2–5 bullet facts. Ends with [^N].

**Interesting / Fun Facts**
* Up to 3 bullet facts. Ends with [^N].

**Detailed Research Notes**
* Up to 8 bullet facts. Ends with [^N].

• You may paraphrase or merge facts but do NOT invent new ones.
• Always fill every section.  
• ≤ 40 facts total.  
• If no facts can be cited, reply ERROR.`;

  const out = await ai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.15,
    messages: [{ role: "user", content: prompt }],
  });
  let text = out.choices[0].message.content ?? "";
  if (/^ERROR/i.test(text.trim())) throw new Error("GPT refused");

  /* superscripts + spacing */
  text = text.replace(/([a-zA-Z])\s*(\[\^\d+\])/g, "$1 $2")
             .replace(/\[\^(\d+)\]/g,
               (_, n) => `<sup><a href="${sources[+n-1].link}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`)
             .replace(/([a-zA-Z])(<sup>)/g, "$1 $2");

  /* autobullet orphan lines */
  text = text.replace(/(\*\*Notable[\s\S]*?)(?=\n\*\*|$)/,
           m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"))
           .replace(/(\*\*Interesting[\s\S]*?)(?=\n\*\*|$)/,
           m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"))
           .replace(/(\*\*Detailed[\s\S]*?)(?=\n\*\*|$)/,
           m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"));

  const citations = sources.map((s, i) => ({
    marker: `[^${i+1}]`, url: s.link, title: s.title, snippet: extracts[i],
  }));

  return {
    brief: text,
    citations,
    tokens: tokens(prompt) + tokens(text),
    searches: 2,
    searchResults: sources.map((s, i) => ({ url: s.link, title: s.title, snippet: extracts[i] })),
  };
}