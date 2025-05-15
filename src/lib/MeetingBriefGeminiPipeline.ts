/* src/lib/MeetingBriefGeminiPipeline.ts */

import OpenAI from "openai";
import fetch from "node-fetch";

export const runtime = "nodejs";

/*────────────────── ENV ──────────────────*/
const {
  OPENAI_API_KEY,
  SERPER_KEY,
  FIRECRAWL_KEY,
  PROXYCURL_KEY,
} = process.env;

/*───────────────── CONST ─────────────────*/
const MAX_LINKS = 15;
const SERPER    = "https://google.serper.dev/search";
const FIRE      = "https://api.firecrawl.dev/v1/scrape";
const CURL      = "https://nubela.co/proxycurl/api/v2/linkedin";

/*───────────────── TYPES ─────────────────*/
interface SerpResult { title: string; link: string; snippet?: string }
interface FireResp   { article?: { text_content?: string } }
interface Exp        { company?: string; title?: string; start_date?: string; end_date?: string }
interface CurlResp   { headline?: string; experiences?: Exp[] }

export interface Citation {
  marker : string;
  url    : string;
  title  : string;
  snippet: string;
}
export interface MeetingBriefPayload {
  brief        : string;
  citations    : Citation[];
  tokens       : number;
  searches     : number;
  searchResults: { url: string; title: string; snippet: string }[];
}

/*──────────────── HELPERS ────────────────*/
const openai = new OpenAI({ apiKey: OPENAI_API_KEY! });

const postJSON = async <T>(url: string, body: unknown, hdr: Record<string, string>): Promise<T> => {
  const res = await fetch(url, {
    method : "POST",
    headers: { "Content-Type": "application/json", ...hdr },
    body   : JSON.stringify(body),
  });
  return res.json() as Promise<T>;
};

const approxTokens = (s: string): number => Math.ceil(s.length / 4);

const yearRange = (start?: string, end?: string): string => {
  const s = start?.slice(0, 4) ?? "";
  const e = end ? end.slice(0, 4) : "Present";
  return s || e ? `${s || "?"} – ${e}` : "";
};

/*────────────────── MAIN ─────────────────*/
export async function buildMeetingBriefGemini(
  name: string,
  org : string,
): Promise<MeetingBriefPayload> {

  /*──── 1. SERP primary */
  const primary = await postJSON<{ organic?: SerpResult[] }>(
    SERPER, { q: `${name} ${org}`, num: 10 }, { "X-API-KEY": SERPER_KEY! }
  ).then(r => r.organic ?? []);

  /*──── 2. LinkedIn result */
  const linked =
    primary.find(r => r.link.includes("linkedin.com/in/")) ??
    await postJSON<{ organic?: SerpResult[] }>(
      SERPER, { q: `${name} linkedin`, num: 3 }, { "X-API-KEY": SERPER_KEY! }
    ).then(r => r.organic?.find(x => x.link.includes("linkedin.com/in/")) ?? null);

  if (!linked) throw new Error("LinkedIn profile not found");

  /*──── 3. Proxycurl timeline */
  const curl = await fetch(
    `${CURL}?linkedin_profile_url=${encodeURIComponent(linked.link)}`,
    { headers: { Authorization: `Bearer ${PROXYCURL_KEY}` } }
  ).then(r => r.json()) as CurlResp;

  console.log("[Proxycurl]", JSON.stringify(curl, null, 2));

  const timeline = (curl.experiences ?? []).map(exp => ({
    org : (exp.company ?? "").trim(),
    role: (exp.title   ?? "").trim(),
    span: yearRange(exp.start_date, exp.end_date),
    current: exp.end_date == null,
  })).filter(t => t.org);

  const companyTokens = timeline.map(t => t.org.toLowerCase());

  /*──── 4. Awards SERP */
  const awards = await postJSON<{ organic?: SerpResult[] }>(
    SERPER, { q: `${name} ${org} award OR honor OR recognition`, num: 3 },
    { "X-API-KEY": SERPER_KEY! }
  ).then(r => r.organic ?? []);

  /*──── 5. Link selection */
  const dedup = new Map<string, SerpResult>();
  [...primary, ...awards, linked].forEach(r => dedup.set(r.link, r));

  const isCompanyDomain = (url: string): boolean =>
    companyTokens.some(tok => url.toLowerCase().includes(tok.replace(/\s+/g, "").slice(0, 12)));

  const selected: SerpResult[] = [];
  for (const r of dedup.values()) {
    const text = (r.title + " " + (r.snippet ?? "")).toLowerCase();
    const hasName = text.includes(name.toLowerCase());
    const hasEmployer = companyTokens.some(tok => text.includes(tok));
    if ((hasName && hasEmployer) || isCompanyDomain(r.link)) {
      selected.push(r);
      if (selected.length >= MAX_LINKS) break;
    }
  }

  /*──── 6. Extracts */
  const extracts: string[] = [];
  for (const r of selected) {
    let txt: string;
    if (r.link.includes("linkedin.com/in/")) {
      txt = `LinkedIn headline: ${curl.headline ?? ""}.`;
    } else {
      txt = await postJSON<FireResp>(
        FIRE, { url: r.link, simulate: false },
        { Authorization: `Bearer ${FIRECRAWL_KEY}` }
      ).then(j => j.article?.text_content ?? "");
      if (txt.length < 100) txt = `${r.title}. ${r.snippet ?? ""}`;
    }
    extracts.push(txt.slice(0, 1_500));
    console.log(`[Extract] ${r.link} — ${txt.length} chars`);
  }

  /*──── 7. Timeline bullets (all) */
  const tlBullets = timeline.map(t =>
    `* ${t.role || "Role"} — ${t.org} (${t.span || "n.d."})`
  );

  /*──── 8. Prompt */
  const srcBlock = selected.map((s, i) =>
    `[^${i + 1}] ${s.link}\nExtract:\n${extracts[i]}`).join("\n\n");

  const prompt =
`### SOURCES
${srcBlock}

### EMPLOYMENT TIMELINE
${timeline.map(t => `${t.span} — ${t.role}, ${t.org}`).join("\n")}

## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
Exactly 3 concise sentences. End each with [^N] or base it on TIMELINE data (no marker required).

**Notable Highlights**
${tlBullets.slice(0, 5).join("\n")}
* Add further bullet facts until there are at least 3 total. Each web-sourced fact ends with [^N].

**Interesting / Fun Facts**
* Provide 1–3 bullets. Each web-sourced fact ends with [^N].

**Detailed Research Notes**
* Provide 3–8 bullets. Each web-sourced fact ends with [^N].

RULES  
• Use only information present in Extracts or TIMELINE.  
• Do **not** output bare numbers; cite [^N] exactly once at line end for web facts.  
• No invented facts. Keep all section headers.`;

  /*──── 9. GPT */
  const gpt = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [{ role: "user", content: prompt }],
  });
  let md = gpt.choices[0].message.content ?? "";
  if (/^ERROR/i.test(md.trim())) throw new Error("GPT refused");

  /*──── 10. Fix stray numbers → [^N] */
  md = md.replace(/\s(\d+)(?=[.])/g, " [^$1]");

  /*──── 11. Superscripts & spacing */
  md = md
    .replace(/([a-zA-Z])\s*(\[\^\d+\])/g, "$1 $2")
    .replace(/\[\^(\d+)\]/g, (_m, n) =>
      `<sup><a href="${selected[+n - 1].link}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`)
    .replace(/([a-zA-Z])(<sup>)/g, "$1 $2")
    /* one blank line after headers */
    .replace(/^(\*\*[^\n]*\*\*)(?!\n\n)/gm, "$1\n\n")
    .replace(/\n{3,}/g, "\n\n")                     /* collapse ≥3 blank lines */
    /* ensure bullets start with * */
    .replace(/(\*\*Notable[\s\S]*?)(?=\n\*\*|$)/,
      m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"))
    .replace(/(\*\*Interesting[\s\S]*?)(?=\n\*\*|$)/,
      m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"))
    .replace(/(\*\*Detailed[\s\S]*?)(?=\n\*\*|$)/,
      m => m.replace(/^(?![*-])(\S.*?<\/sup>)/gm, "* $1"));

  /*──── 12. Citations array */
  const citations: Citation[] = selected.map((s, i) => ({
    marker : `[^${i + 1}]`,
    url    : s.link,
    title  : s.title,
    snippet: extracts[i],
  }));

  return {
    brief: md,
    citations,
    tokens: approxTokens(prompt) + approxTokens(md),
    searches: 2,
    searchResults: selected.map((s, i) => ({
      url: s.link, title: s.title, snippet: extracts[i],
    })),
  };
}