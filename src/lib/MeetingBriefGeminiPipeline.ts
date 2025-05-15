/* ──────────────────────────────────────────────────────────────────────────
   src/lib/MeetingBriefGeminiPipeline.ts
   --------------------------------------------------------------------------
   HARD CONTRACT
   ─ model returns only:
        { executive: [], highlights: [], funFacts: [], researchNotes: [] }
   ─ each element { text: string, source: number }
   ─ no headings, no prose, no “source 3” strings inside text
   ------------------------------------------------------------------------ */

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
   const MODEL_ID = "gpt-4.1-mini-2025-04-14";
   const SERPER   = "https://google.serper.dev/search";
   const FIRE     = "https://api.firecrawl.dev/v1/scrape";
   const CURL     = "https://nubela.co/proxycurl/api/v2/linkedin";
   const MAX_SRC  = 15;
   
   /* ── TYPES ---------------------------------------------------------------- */
   interface Serp { title: string; link: string; snippet?: string }
   interface Fire { article?: { text_content?: string } }
   interface Ymd  { year?: number }
   interface Exp  { company?: string; title?: string; starts_at?: Ymd; ends_at?: Ymd }
   interface Curl { headline?: string; experiences?: Exp[] }
   
   interface Row { text: string; source: number }
   interface JsonBrief {
     executive     : Row[];
     highlights    : Row[];
     funFacts      : Row[];
     researchNotes : Row[];
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
   
   const yr   = (d?:Ymd|null)=>d?.year?.toString() ?? "?";
   const span = (s?:Ymd|null,e?:Ymd|null)=>`${yr(s)} – ${e?yr(e):"Present"}`;
   const toks = (s:string)=>Math.ceil(s.length/4);
   
   const clean = (t:string)=>
     t.replace(/\s*\(?\bsource\s*\d+\)?/gi,"").trim();
   
   /* ── RENDER --------------------------------------------------------------- */
   const bullets = (rows: Row[], cites: Citation[]) =>
     rows.map(r=>`* ${clean(r.text)} <sup><a href="${cites[r.source-1].url}" target="_blank" rel="noopener noreferrer">${r.source}</a></sup>`).join("\n");
   
   function render(name:string, org:string, j:JsonBrief, cites:Citation[], tl:string[]):string{
     return [
       `## **Meeting Brief: ${name} – ${org}**`,
       "",
       "**Executive Summary**",
       "",
       bullets(j.executive, cites),
       "",
       "**Notable Highlights**",
       "",
       tl.join("\n"),
       bullets(j.highlights, cites),
       "",
       "**Fun Facts**",
       "",
       bullets(j.funFacts, cites),
       "",
       "**Detailed Research Notes**",
       "",
       bullets(j.researchNotes, cites),
     ].join("\n").replace(/\n{3,}/g,"\n\n").trim();
   }
   
   /* ── MAIN ----------------------------------------------------------------- */
   export async function buildMeetingBriefGemini(
     name: string,
     org : string,
   ): Promise<MeetingBriefPayload> {
   
     /* 1 ── Google search -------------------------------------------------- */
     const serp1 = await postJSON<{organic?:Serp[]}>(
       SERPER, { q:`${name} ${org}`, num:10 }, { "X-API-KEY":SERPER_KEY! });
     const serp = serp1.organic ?? [];
   
     /* 2 ── LinkedIn profile ---------------------------------------------- */
     const li = serp.find(s=>s.link.includes("linkedin.com/in/")) ??
       (await postJSON<{organic?:Serp[]}>(
         SERPER,{ q:`${name} linkedin`, num:3 },{ "X-API-KEY":SERPER_KEY! }))
         .organic?.find(s=>s.link.includes("linkedin.com/in/"));
     if(!li) throw new Error("LinkedIn profile not found");
   
     /* 3 ── ProxyCurl ------------------------------------------------------ */
     const curl = await fetch(
       `${CURL}?linkedin_profile_url=${encodeURIComponent(li.link)}`,
       { headers:{ Authorization:`Bearer ${PROXYCURL_KEY}` } }
     ).then(r=>r.json()) as Curl;
   
     const timeline = (curl.experiences??[]).map(e=>
       `* ${e.title??"Role"} — ${e.company??"Company"} (${span(e.starts_at,e.ends_at)})`);
   
     /* 4 ── Source list ---------------------------------------------------- */
     const sources = [li, ...serp]
       .filter((s,i,self)=>self.findIndex(t=>t.link===s.link)===i)
       .slice(0, MAX_SRC);
   
     /* 5 ── Scrape text ---------------------------------------------------- */
     const extracts: string[] = [];
     for(const s of sources){
       if(s.link.includes("linkedin.com/in/")){
         extracts.push(`LinkedIn headline: ${curl.headline??""}.`);
       }else{
         const art = await postJSON<Fire>(
           FIRE,{ url:s.link, simulate:false },
           { Authorization:`Bearer ${FIRECRAWL_KEY}` }
         );
         extracts.push((art.article?.text_content ?? `${s.title}. ${s.snippet??""}`).slice(0,1500));
       }
     }
   
     /* 6 ── Prompt --------------------------------------------------------- */
     const srcBlock = sources.map((s,i)=>
       `SOURCE_${i+1} ${s.link}\n${extracts[i]}`).join("\n\n");
   
     const template = `{
    "executive":      [{"text":"","source":1}],
    "highlights":     [{"text":"","source":1}],
    "funFacts":       [{"text":"","source":1}],
    "researchNotes":  [{"text":"","source":1}]
   }`;
   
     const example = `// GOOD
   {
    "executive":[
      {"text":"Sales Director at Flashpoint since 2024","source":1}
    ]
   }`;
   
     const prompt = `
   Return **only** JSON matching the template.
   
   RULE A: "text" MUST NOT contain the word "source", brackets, or parenthetical
           numbers.
   RULE B: Each array item MUST have both "text" (plain sentence) and "source"
           (1-based index of SOURCE_N).
   
   ${example}
   
   ### EMPLOYMENT TIMELINE
   ${timeline.join("\n")}
   
   ### SOURCES
   ${srcBlock}
   
   ### TEMPLATE
   \`\`\`json
   ${template}
   \`\`\``.trim();
   
     /* 7 ── LLM call ------------------------------------------------------- */
     const resp = await ai.chat.completions.create({
       model: MODEL_ID,
       temperature: 0,
       response_format:{ type:"json_object"},
       messages:[{ role:"user", content:prompt }],
     });
   
     let j: JsonBrief;
     try{ j = JSON.parse(resp.choices[0].message.content!); }
     catch(e){ console.error(e); throw new Error("Bad JSON"); }
   
     /* 8 ── Validate / dedupe --------------------------------------------- */
     const fix = (rows:Row[]) =>
       Array.from(
         new Map(
           rows
             .filter(r=>r && r.text && r.source>=1 && r.source<=sources.length)
             .map(r=>[clean(r.text),{ text:clean(r.text),source:r.source }])
         ).values()
       );
   
     j.executive     = fix(j.executive     ?? []);
     j.highlights    = fix(j.highlights    ?? []);
     j.funFacts      = fix(j.funFacts      ?? []);
     j.researchNotes = fix(j.researchNotes ?? []);
   
     /* 9 ── Citations ------------------------------------------------------ */
     const citations: Citation[] = sources.map((s,i)=>({
       marker : `[^${i+1}]`,
       url    : s.link,
       title  : s.title,
       snippet: extracts[i],
     }));
   
     /*10 ── Markdown ------------------------------------------------------- */
     const md = render(name, org, j, citations, timeline);
   
     /*11 ── Payload -------------------------------------------------------- */
     return {
       brief : md,
       citations,
       tokens: toks(prompt)+toks(md),
       searches: 1,
       searchResults: sources.map((s,i)=>({url:s.link,title:s.title,snippet:extracts[i]})),
     };
   }