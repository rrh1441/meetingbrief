import OpenAI from "openai";
import fetch from "node-fetch";

export const runtime = "nodejs";

/* ENV */
const { OPENAI_API_KEY, SERPER_KEY, FIRECRAWL_KEY, PROXYCURL_KEY } = process.env;

/* CONSTANTS */
const MAX_LINKS = 15;
const SERPER = "https://google.serper.dev/search";
const FIRE   = "https://api.firecrawl.dev/v1/scrape";
const CURL   = "https://nubela.co/proxycurl/api/v2/linkedin";
const NEWS   = ["reuters.", "bloomberg.", "forbes.", "nytimes.", "ft.com", "wsj."];

/* TYPES */
interface Serp { title: string; link: string; snippet?: string }
interface Fire { article?: { text_content?: string } }
interface Ymd  { year?: number }
interface Exp  { company?: string; title?: string; starts_at?: Ymd; ends_at?: Ymd }
interface Curl { headline?: string; experiences?: Exp[] }

interface Citation { marker: string; url: string; title: string; snippet: string }
export interface MeetingBriefPayload {
  brief: string; citations: Citation[]; tokens: number; searches: number;
  searchResults: { url: string; title: string; snippet: string }[];
}

/* HELPERS */
const ai = new OpenAI({ apiKey: OPENAI_API_KEY! });
const tokens = (s: string) => Math.ceil(s.length / 4);
const basename = (u: string) => new URL(u).hostname.replace(/^www\./, "");
const postJSON = async <T>(url: string, body: unknown, hdr: Record<string,string>) =>
  fetch(url,{method:"POST",headers:{...hdr,"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json() as Promise<T>);
const year = (d?: Ymd|null) => d?.year?.toString() ?? "?";
const span  = (s?: Ymd|null,e?:Ymd|null) => `${year(s)} – ${e?year(e):"Present"}`;

/* MAIN */
export async function buildMeetingBriefGemini(name: string, org: string): Promise<MeetingBriefPayload>{

  /* 1 ── SERP & LinkedIn */
  const primary = await postJSON<{organic?:Serp[]}>(SERPER,{q:`${name} ${org}`,num:10},{ "X-API-KEY":SERPER_KEY! }).then(r=>r.organic??[]);
  const linked  = primary.find(r=>r.link.includes("linkedin.com/in/")) ??
                  (await postJSON<{organic?:Serp[]}>(SERPER,{q:`${name} linkedin`,num:3},{ "X-API-KEY":SERPER_KEY! })).organic?.find(r=>r.link.includes("linkedin.com/in/"));
  if(!linked) throw new Error("LinkedIn profile not found");

  /* 2 ── Proxycurl */
  const curl = await fetch(`${CURL}?linkedin_profile_url=${encodeURIComponent(linked.link)}`,
                {headers:{Authorization:`Bearer ${PROXYCURL_KEY}`}}).then(r=>r.json()) as Curl;

  const timeline = (curl.experiences??[]).map(e=>({
      org :(e.company??"").trim(),
      role:(e.title  ??"").trim(),
      span:span(e.starts_at,e.ends_at),
  })).filter(t=>t.org);

  const tokensOrg = timeline.map(t=>t.org.toLowerCase()).filter(t=>t.length>=4);
  const companyDomains = tokensOrg.map(t=>t.replace(/\s+/g,""));

  /* 3 ── awards */
  const awards = await postJSON<{organic?:Serp[]}>(SERPER,{q:`${name} ${org} award OR honor`,num:3},{ "X-API-KEY":SERPER_KEY! }).then(r=>r.organic??[]);

  /* 4 ── link filter */
  const uniq=new Map<string,Serp>(); [...primary,...awards,linked].forEach(r=>uniq.set(r.link,r));
  const allowed:Serp[]=[];
  for(const r of uniq.values()){
     const text=(r.title+" "+(r.snippet??"")).toLowerCase();
     const hasName=text.includes(name.toLowerCase());
     const hasEmployer=tokensOrg.some(tok=>text.includes(tok));
     const dom=basename(r.link);
     const companyDomain=companyDomains.some(d=>dom.includes(d));
     const news=NEWS.some(d=>dom.includes(d));
     const isMil=dom.endsWith(".mil");
     if(!hasName) continue;
     if(isMil && !tokensOrg.includes("navy")) continue;          // ban navy homonym
     if(companyDomain || (hasEmployer&&(!isMil)) || (news&&hasEmployer)) allowed.push(r);
     if(allowed.length>=MAX_LINKS) break;
  }

  /* 5 ── extracts */
  const extracts:string[]=[];
  for(const r of allowed){
     let txt:string;
     if(r.link.includes("linkedin.com/in/")) txt=`LinkedIn headline: ${curl.headline??""}.`;
     else{
       txt=await postJSON<Fire>(FIRE,{url:r.link,simulate:false},{Authorization:`Bearer ${FIRECRAWL_KEY}`})
            .then(j=>j.article?.text_content??"");
       if(txt.length<100) txt=`${r.title}. ${r.snippet??""}`;
     }
     extracts.push(txt.slice(0,1500));
  }

  /* 6 ── prompt */
  const src=allowed.map((s,i)=>`[^${i+1}] ${s.link}\nExtract:\n${extracts[i]}`).join("\n\n");
  const tlBullets=timeline.map(t=>`* ${t.role||"Role"} — ${t.org} (${t.span})`);

  const prompt=`
### SOURCES
${src}

### EMPLOYMENT TIMELINE
${timeline.map(t=>`${t.span} — ${t.role}, ${t.org}`).join("\n")}

## **Meeting Brief: ${name} – ${org}**

**Executive Summary**
Exactly 3 sentences. End each with [^N] or rely on TIMELINE data (no marker).

**Notable Highlights**
${tlBullets.slice(0,5).join("\n")}
* Add more bullet facts until there are ≥3. Each web fact ends with [^N].

**Interesting / Fun Facts**
* Provide 1–3 bullets. Each web fact ends with [^N].

**Detailed Research Notes**
* Provide 3–8 bullets. Each web fact ends with [^N].

RULES
• Use only Extracts or TIMELINE.  
• Every web fact **must** end with one marker [^N].  
• Do not output bare numbers.  
• No invented facts. Keep headers.`.trim();

  /* 7 ── GPT */
  const gpt=await ai.chat.completions.create({model:"gpt-4o-mini",temperature:0.1,messages:[{role:"user",content:prompt}]});
  let md=gpt.choices[0].message.content??"";

  /* 8 ── wrap stray numbers */
  md=md.replace(/\s(\d+)(?=[.])/g," [^$1]");

  /* 9 ── superscripts + spacing */
  md=md
     .replace(/([a-zA-Z])\s*(\[\^\d+\])/g,"$1 $2")
     .replace(/\[\^(\d+)\]/g,(_m,n)=>`<sup><a href="${allowed[+n-1].link}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`)
     .replace(/([a-zA-Z])(<sup>)/g,"$1 $2")
     .replace(/^(\*\*[^\n]*\*\*)(?!\n\n)/gm,"$1\n\n")
     .replace(/\n{3,}/g,"\n\n")
     .replace(/(\*\*Notable[\s\S]*?)(?=\n\*\*|$)/,m=>m.replace(/^(?![*-])(\S.*?<\/sup>)/gm,"* $1"))
     .replace(/(\*\*Interesting[\s\S]*?)(?=\n\*\*|$)/,m=>m.replace(/^(?![*-])(\S.*?<\/sup>)/gm,"* $1"))
     .replace(/(\*\*Detailed[\s\S]*?)(?=\n\*\*|$)/,m=>m.replace(/^(?![*-])(\S.*?<\/sup>)/gm,"* $1"));

  /*10 ── citations array */
  const citations:Citation[]=allowed.map((s,i)=>({marker:`[^${i+1}]`,url:s.link,title:s.title,snippet:extracts[i]}));

  return{brief:md,citations,tokens:tokens(prompt)+tokens(md),searches:2,
         searchResults:allowed.map((s,i)=>({url:s.link,title:s.title,snippet:extracts[i]}))};
}