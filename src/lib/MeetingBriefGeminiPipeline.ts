/* ──────────────────────────────────────────────────────────────────────────
   src/lib/MeetingBriefGeminiPipeline.ts
   ----------------------------------------------------------------------------
   • LLM returns strict JSON (no Markdown)
   • Robust renderer → Markdown (all spacing guaranteed)
   • Accepts string | {text,source} items in every list
   • Superscripts inserted during rendering
   • Uses gpt-4.1-mini-2025-04-14
   ────────────────────────────────────────────────────────────────────────── */

   import OpenAI from "openai";
   import fetch   from "node-fetch";
   
   export const runtime = "nodejs";
   
   /* ── ENV ------------------------------------------------------------------ */
   const {
     OPENAI_API_KEY,
     SERPER_KEY,
     FIRECRAWL_KEY,
     PROXYCURL_KEY,
   } = process.env;
   
   /* ── CONSTANTS ------------------------------------------------------------ */
   const MODEL_ID  = "gpt-4.1-mini-2025-04-14";
   const SERPER    = "https://google.serper.dev/search";
   const FIRE      = "https://api.firecrawl.dev/v1/scrape";
   const CURL      = "https://nubela.co/proxycurl/api/v2/linkedin";
   const MAX_LINKS = 15;
   
   /* ── TYPES ---------------------------------------------------------------- */
   interface Serp { title: string; link: string; snippet?: string }
   interface Fire { article?: { text_content?: string } }
   interface Ymd  { year?: number }
   interface Exp  { company?: string; title?: string; starts_at?: Ymd; ends_at?: Ymd }
   interface Curl { headline?: string; experiences?: Exp[] }
   
   interface JsonItem { text: string; source: number }
   type JsonOrStr = string | JsonItem;
   
   interface JsonBrief {
     executive     : JsonOrStr[];
     highlights    : JsonOrStr[];
     funFacts      : JsonOrStr[];
     researchNotes : JsonOrStr[];
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
   
   /* ── HELPERS -------------------------------------------------------------- */
   const ai = new OpenAI({ apiKey: OPENAI_API_KEY! });
   
   const postJSON = async <T>(
     url : string,
     body: unknown,
     hdr : Record<string, string>,
   ) =>
     fetch(url,{
       method :"POST",
       headers:{ ...hdr, "Content-Type":"application/json" },
       body   : JSON.stringify(body),
     }).then(r=>r.json() as Promise<T>);
   
   const year = (d?: Ymd|null) => d?.year?.toString() ?? "?";
   const span = (s?:Ymd|null,e?:Ymd|null)=>`${year(s)} – ${e?year(e):"Present"}`;
   const tokenCount = (s:string)=>Math.ceil(s.length/4);
   
   /* ── RENDERER ------------------------------------------------------------- */
   function render(
     json    : JsonBrief,
     cites   : Citation[],
     timeline: string[],
   ): string {
   
     const sup = (n:number)=>`<sup><a href="${cites[n].url}" target="_blank" rel="noopener noreferrer">${n+1}</a></sup>`;
   
     const norm = (x: JsonOrStr, idx:number): JsonItem =>
       typeof x === "string"
         ? { text: x, source: idx }
         : { text: x?.text ?? "", source: x?.source ?? idx };
   
     const bullets = (arr: JsonOrStr[]) => {
       const rows = arr
         .map(norm)
         .filter(({text})=>text.trim().length)
         .map(({text,source})=>`* ${text.trim()} ${sup(source)}`);
       return rows.length ? rows.join("\n") : "* _No data available_";
     };
   
     return [
       "**Executive Summary**",
       "",
       bullets(json.executive ?? []),
       "",
       "**Notable Highlights**",
       "",
       timeline.join("\n"),
       bullets(json.highlights ?? []),
       "",
       "**Fun Facts**",
       "",
       bullets(json.funFacts ?? []),
       "",
       "**Detailed Research Notes**",
       "",
       bullets(json.researchNotes ?? []),
     ]
       .join("\n")
       .replace(/\n{3,}/g,"\n\n")
       .trim();
   }
   
   /* ── MAIN ----------------------------------------------------------------- */
   export async function buildMeetingBriefGemini(
     name: string,
     org : string,
   ): Promise<MeetingBriefPayload> {
   
     /* 1 ── Google search -------------------------------------------------- */
     const serp1 = await postJSON<{organic?:Serp[]}>(SERPER,
       { q:`${name} ${org}`, num:10 }, { "X-API-KEY":SERPER_KEY! });
     const serp  = serp1.organic ?? [];
   
     /* 2 ── LinkedIn first ------------------------------------------------- */
     const linkedin = serp.find(s=>s.link.includes("linkedin.com/in/")) ??
       (await postJSON<{organic?:Serp[]}>(SERPER,
         { q:`${name} linkedin`, num:3 }, { "X-API-KEY":SERPER_KEY! }))
         .organic?.find(s=>s.link.includes("linkedin.com/in/"));
     if(!linkedin) throw new Error("LinkedIn profile not found");
   
     /* 3 ── ProxyCurl ------------------------------------------------------ */
     const curl = await fetch(
       `${CURL}?linkedin_profile_url=${encodeURIComponent(linkedin.link)}`,
       { headers:{ Authorization:`Bearer ${PROXYCURL_KEY}` } }
     ).then(r=>r.json()) as Curl;
   
     const timeline = (curl.experiences ?? []).map(e =>
       `* ${e.title ?? "Role"} — ${e.company ?? "Company"} (${span(e.starts_at,e.ends_at)})`
     );
   
     /* 4 ── Build sources -------------------------------------------------- */
     const sources = [linkedin, ...serp]
       .filter((s,i,self)=>self.findIndex(t=>t.link===s.link)===i)
       .slice(0, MAX_LINKS);
   
     /* 5 ── Extract text --------------------------------------------------- */
     const extracts: string[] = [];
     for(const s of sources){
       if(s.link.includes("linkedin.com/in/")){
         extracts.push(`LinkedIn headline: ${curl.headline ?? ""}.`);
       } else {
         const art = await postJSON<Fire>(FIRE,
           { url:s.link, simulate:false },
           { Authorization:`Bearer ${FIRECRAWL_KEY}` });
         extracts.push((art.article?.text_content ?? `${s.title}. ${s.snippet ?? ""}`).slice(0,1500));
       }
     }
   
     /* 6 ── LLM prompt ----------------------------------------------------- */
     const srcBlock = sources.map((s,i)=>
       `SOURCE_${i+1} ${s.link}\n${extracts[i]}`).join("\n\n");
   
     const template = `{
     "executive": [],
     "highlights": [{"text":"","source":0}],
     "funFacts":   [{"text":"","source":0}],
     "researchNotes":[{"text":"","source":0}]
   }`;
   
     const prompt = `
   Return **only** valid JSON matching the template.
   
   ### EMPLOYMENT TIMELINE
   ${timeline.join("\n")}
   
   ### SOURCES
   ${srcBlock}
   
   ### TEMPLATE
   \`\`\`json
   ${template}
   \`\`\`
   
   Rules:
   • Use only timeline or sources.  
   • Every list item cites "source" (1-based).  
   • No invented facts.`.trim();
   
     const chat = await ai.chat.completions.create({
       model: MODEL_ID,
       temperature: 0,
       response_format: { type:"json_object" },
       messages: [{ role:"user", content: prompt }],
     });
   
     let data: JsonBrief;
     try{
       data = JSON.parse(chat.choices[0].message.content!);
     }catch(err){
       throw new Error("LLM returned malformed JSON");
     }
   
     /* 7 ── Citations ------------------------------------------------------ */
     const citations: Citation[] = sources.map((s,i)=>({
       marker : `[^${i+1}]`,
       url    : s.link,
       title  : s.title,
       snippet: extracts[i],
     }));
   
     /* 8 ── Render Markdown ----------------------------------------------- */
     const md = `## **Meeting Brief: ${name} – ${org}**\n\n` +
                render(data, citations, timeline);
   
     /* 9 ── Payload -------------------------------------------------------- */
     return {
       brief : md,
       citations,
       tokens: tokenCount(prompt)+tokenCount(md),
       searches: 1,
       searchResults: sources.map((s,i)=>({url:s.link,title:s.title,snippet:extracts[i]})),
     };
   }