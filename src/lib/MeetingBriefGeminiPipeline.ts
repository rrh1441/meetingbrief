/* src/lib/MeetingBriefGeminiPipeline.ts */

import OpenAI from "openai";
import fetch from "node-fetch";

export const runtime = "nodejs";

/* ── ENV ──────────────────────────────────────────────────────────────── */
const {
  OPENAI_API_KEY,
  SERPER_KEY,
  FIRECRAWL_KEY,
  PROXYCURL_KEY,
} = process.env;

/* ── CONSTANTS ───────────────────────────────────────────────────────── */
const SERPER = "https://google.serper.dev/search";
const FIRE   = "https://api.firecrawl.dev/v1/scrape";
const CURL   = "https://nubela.co/proxycurl/api/v2/linkedin";
const NEWS   = ["reuters.", "bloomberg.", "forbes.", "nytimes.", "ft.com", "wsj."];

const MAX_LINKS = 15;

/* ── TYPES ───────────────────────────────────────────────────────────── */
interface Serp { title: string; link: string; snippet?: string }
interface Fire { article?: { text_content?: string } }
interface Ymd  { year?: number }
interface Exp  { company?: string; title?: string; starts_at?: Ymd; ends_at?: Ymd }
interface Curl { headline?: string; experiences?: Exp[] }

interface JsonBrief {
  executive      : string[];
  highlights     : { text: string; source: number }[];
  funFacts       : { text: string; source: number }[];
  researchNotes  : { text: string; source: number }[];
}

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

/* ── UTILS ───────────────────────────────────────────────────────────── */
const ai = new OpenAI({ apiKey: OPENAI_API_KEY! });
const postJSON = async <T>(url: string, body: unknown, hdr: Record<string,string>) =>
  fetch(url,{method:"POST",headers:{...hdr,"Content-Type":"application/json"},body:JSON.stringify(body)})
  .then(r=>r.json() as Promise<T>);

const year = (d?: Ymd|null) => d?.year?.toString() ?? "?";
const span = (s?:Ymd|null,e?:Ymd|null) => `${year(s)} – ${e?year(e):"Present"}`;
const htmlSup = (n: number, href: string) =>
  `<sup><a href="${href}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
const basename = (u: string) => new URL(u).hostname.replace(/^www\./,"");

/* ── RENDERER (JSON → MD) ────────────────────────────────────────────── */
function render(json: JsonBrief, cites: Citation[], timeline: string[]): string {
  const sup = (n: number) => htmlSup(n + 1, cites[n].url);

  const bullets = (arr: { text:string; source:number }[]) =>
    arr.map(({ text, source }) => `* ${text} ${sup(source)}`).join("\n");

  const md = [
    "## **Meeting Brief:**",           // title inserted elsewhere by caller
    "",
    "**Executive Summary**",
    "",
    json.executive.map((s,i)=>`${s} ${sup(i)}`).join("\n"),
    "",
    "**Notable Highlights**",
    "",
    timeline.join("\n"),
    bullets(json.highlights),
    "",
    "**Fun Facts**",
    "",
    bullets(json.funFacts),
    "",
    "**Detailed Research Notes**",
    "",
    bullets(json.researchNotes),
    "",
  ].join("\n");

  return md.replace(/\n{3,}/g,"\n\n").trim();
}

/* ── MAIN ────────────────────────────────────────────────────────────── */
export async function buildMeetingBriefGemini(
  name: string,
  org : string
): Promise<MeetingBriefPayload> {

  /* 1 ── find LinkedIn profile ----------------------------------------- */
  const serp = await postJSON<{organic?:Serp[]}>(SERPER,{q:`${name} ${org}`,num:10},
             {"X-API-KEY":SERPER_KEY!}).then(r=>r.organic??[]);
  const linked = serp.find(s=>s.link.includes("linkedin.com/in/"));
  if(!linked) throw new Error("LinkedIn profile not found");

  /* 2 ── proxycurl ------------------------------------------------------ */
  const curl = await fetch(
     `${CURL}?linkedin_profile_url=${encodeURIComponent(linked.link)}`,
     { headers:{ Authorization:`Bearer ${PROXYCURL_KEY}` } }
  ).then(r=>r.json()) as Curl;

  const timeline = (curl.experiences??[]).map(e=>
    `* ${e.title ?? "Role"} — ${e.company ?? "Company"} (${span(e.starts_at,e.ends_at)})`
  );

  /* 3 ── minimal sources list (LinkedIn + company/news) ---------------- */
  const allowed: Serp[] = [linked, ...serp]
    .filter((s,i,self)=>self.findIndex(t=>t.link===s.link)===i)
    .slice(0, MAX_LINKS);

  /* 4 ── scrape extracts ----------------------------------------------- */
  const extracts: string[] = [];
  for(const s of allowed){
    if(s.link.includes("linkedin.com/in/")){
      extracts.push(`LinkedIn headline: ${curl.headline??""}.`);
      continue;
    }
    const art = await postJSON<Fire>(FIRE,{url:s.link,simulate:false},
                {Authorization:`Bearer ${FIRECRAWL_KEY}`});
    extracts.push((art.article?.text_content ?? `${s.title}. ${s.snippet??""}`).slice(0,1500));
  }

  /* 5 ── JSON-only prompt ---------------------------------------------- */
  const srcBlock = allowed.map((s,i)=>
    `SOURCE_${i+1} ${s.link}\n${extracts[i]}`).join("\n\n");

  const schema = `{
  "executive": [],
  "highlights": [{"text":"", "source":0}],
  "funFacts":   [{"text":"", "source":0}],
  "researchNotes":[{"text":"", "source":0}]
}`;

  const prompt = `
You are generating structured data, **not** prose.

### TASK
Using only the information in the sources below and the Employment Timeline,
populate the JSON template exactly.

### RULES
• Each list item **must** cite a source using its numeric id (1-based).  
• Never invent facts.  
• Do not add or remove keys.

### EMPLOYMENT TIMELINE
${timeline.join("\n")}

### SOURCES
${srcBlock}

### TEMPLATE
\`\`\`json
${schema}
\`\`\`
Return **only the filled JSON**`.trim();

  /* 6 ── LLM call ------------------------------------------------------- */
  const llm = await ai.chat.completions.create({
    model:"gpt-4o-mini",
    temperature:0,
    response_format:{ type:"json_object" },
    messages:[{role:"user",content:prompt}],
  });

  let json: JsonBrief;
  try{ json = JSON.parse(llm.choices[0].message.content!); }
  catch{ throw new Error("Model returned invalid JSON"); }

  /* 7 ── citations ------------------------------------------------------ */
  const citations: Citation[] = allowed.map((s,i)=>({
    marker:`[^${i+1}]`,
    url:s.link,
    title:s.title,
    snippet:extracts[i],
  }));

  /* 8 ── render markdown ----------------------------------------------- */
  const md = `## **Meeting Brief: ${name} – ${org}**\n\n` +
             render(json, citations, timeline);

  /* 9 ── payload -------------------------------------------------------- */
  return {
    brief: md,
    citations,
    tokens : Math.ceil(prompt.length/4)+Math.ceil(md.length/4),
    searches: 1,
    searchResults: allowed.map((s,i)=>({url:s.link,title:s.title,snippet:extracts[i]})),
  };
}