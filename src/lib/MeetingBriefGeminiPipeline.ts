/* MeetingBriefGeminiPipeline.ts – deterministic, OpenAI-based */

import OpenAI from "openai";
import fetch from "node-fetch";

export const runtime = "nodejs";

/*────────────────────  ENV KEYS  */
const OPENAI_API_KEY   = process.env.OPENAI_API_KEY!;
const SERPER_KEY       = process.env.SERPER_KEY!;
const FIRECRAWL_KEY    = process.env.FIRECRAWL_KEY!;
const PROXYCURL_KEY    = process.env.PROXYCURL_KEY!;

/*────────────────────  CONSTANTS  */
const MAX_LINKS          = 15;
const MAX_FACTS          = 40;
const FIRECRAWL_ENDPOINT = "https://r.jina.ai/http://api.firecrawl.dev/v1/scrape";
const SERPER_ENDPOINT    = "https://google.serper.dev/search";
const PROXYCURL_PROFILE  = "https://api.proxycurl.com/api/v2/linkedin";

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
interface SerperResult { title: string; link: string; snippet?: string; }
interface FirecrawlResp { article: { title?: string; text_content?: string } }

/*────────────────────  HELPERS  */
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const sleep  = (ms: number) => new Promise(r => setTimeout(r, ms));

async function serperSearch(q: string, num = 10): Promise<SerperResult[]> {
  const res = await fetch(SERPER_ENDPOINT, {
    method : "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body   : JSON.stringify({ q, num }),
  });
  const json = await res.json();
  return json.organic?.slice(0, num) ?? [];
}

async function fetchFirecrawl(url: string): Promise<string> {
  const res  = await fetch(FIRECRAWL_ENDPOINT, {
    method : "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${FIRECRAWL_KEY}` },
    body   : JSON.stringify({ url, simulate: false }),
  });
  const json = (await res.json()) as FirecrawlResp;
  return json.article?.text_content?.slice(0, 800).trim() ?? "";
}

async function fetchProxycurl(linkedin: string): Promise<string> {
  const u = new URL(PROXYCURL_PROFILE);
  u.searchParams.set("linkedin_profile_url", linkedin);
  const res = await fetch(u.href, {
    headers: { Authorization: `Bearer ${PROXYCURL_KEY}` },
  });
  const json = await res.json() as Record<string, unknown>;
  const headline = json?.headline ?? "";
  const current  = (json?.experiences as any[])?.[0]?.title ?? "";
  return `LinkedIn Headline: ${headline}. Current role: ${current}.`;
}

function tokenApprox(str: string): number {
  return Math.ceil(str.length / 4);   // rough 4-char per token average
}

/*────────────────────  MAIN  */

export async function buildMeetingBriefGemini(
  name: string,
  org: string,
  team?: string,                                   // optional team hint
): Promise<MeetingBriefPayload> {

  /* 1 ── harvest links ───────────────────────────*/
  const primary = await serperSearch(`${name} ${org}`, 10);

  // ensure LinkedIn present
  let linkedin = primary.find(r => r.link.includes("linkedin.com/in/"));
  if (!linkedin) {
    const lookup = await serperSearch(`${name} linkedin`, 3);
    linkedin = lookup.find(r => r.link.includes("linkedin.com/in/"));
  }
  if (linkedin && !primary.some(r => r.link === linkedin!.link)) {
    primary.unshift(linkedin);
  }

  // team search / fallback
  const teamQuery = team ? `${org} ${team}` : `${org} ${name.split(" ").pop()}`;
  const teamRes   = await serperSearch(teamQuery, 5);
  const sources   = [...primary, ...teamRes].slice(0, MAX_LINKS);

  // fetch extracts
  const extracts: string[] = [];
  for (const src of sources) {
    if (src.link.includes("linkedin.com/in/")) {
      extracts.push(await fetchProxycurl(src.link));
    } else {
      extracts.push(await fetchFirecrawl(src.link));
    }
  }

  /* 2 ── build prompt ────────────────────────────*/
  const sourceBlock = sources.map((s, i) =>
    `[^${i + 1}] ${s.link}\nExtract: ${extracts[i]}`).join("\n\n");

  const prompt =
`### SOURCES
${sourceBlock}

## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
Exactly 3 cited sentences, each ends with [^N].

**Notable Highlights**
* Up to 5 bullets, each ends with [^N].

**Interesting / Fun Facts**
* Up to 3 bullets, each ends with [^N].

**Detailed Research Notes**
* Up to 8 bullets, each ends with [^N].

RULES
• ≤ ${MAX_FACTS} total facts.  
• Every fact *must* cite one of the [^N] markers above.  
• If you cannot cite a fact, omit it.  
• If you cannot cite any fact, respond only: ERROR`;

  /* 3 ── call GPT-4 mini ─────────────────────────*/
  let completion: Awaited<ReturnType<typeof openai.chat.completions.create>>;
  for (let attempt = 0; attempt < 2; attempt++) {
    completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.15,
      messages: [{ role: "user", content: prompt }],
    });
    const txt = completion.choices[0].message.content ?? "";
    if (!/^ERROR/i.test(txt.trim())) break;
    await sleep(300);        // quick back-off then retry
  }
  const text = completion!.choices[0].message.content ?? "";
  const markers = text.match(/\[\^\d+\]/g) ?? [];
  if (markers.length === 0) throw new Error("LLM returned no citations");

  /* 4 ── post-process & payload ───────────────────*/
  const brief = text.replace(/\[\^(\d+)\]/g, (_, n) =>
    `<sup><a href="${sources[Number(n)-1].link}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`);

  const citations: Citation[] = sources.map((s, i) => ({
    marker: `[^${i + 1}]`,
    url   : s.link,
    title : s.title,
    snippet: extracts[i],
  }));

  const tokensIn  = tokenApprox(prompt);
  const tokensOut = tokenApprox(text);
  const tokens    = tokensIn + tokensOut;

  const searchResults = sources.map((s, i) => ({
    url: s.link,
    title: s.title,
    snippet: extracts[i],
  }));

  return {
    brief,
    citations,
    tokens,
    searches: 1,          // one Serper call
    searchResults,
  };
}
