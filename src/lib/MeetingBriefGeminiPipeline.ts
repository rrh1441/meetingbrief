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
   const MODEL_ID = "gpt-4.1-mini-2025-04-14"; // Ensure this is your intended model
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
     marker : string; // This might be less relevant if not using Markdown markers
     url    : string;
     title  : string;
     snippet: string;
   }
   export interface MeetingBriefPayload {
     brief        : string; // This will now be an HTML string
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
   const toks = (s:string)=>Math.ceil(s.length/4); // Token approximation

   // Cleans "source N" from text, important for AI output
   const clean = (t:string)=>
     t.replace(/\s*\(?\bsource\s*\d+\)?/gi,"").trim();

   /* ── HTML RENDER ---------------------------------------------------------- */

   /**
    * Formats an array of Row objects into an HTML unordered list.
    * Each list item includes text and a superscripted citation link.
    */
   const formatHtmlBullets = (rows: Row[], cites: Citation[]): string => {
     if (!rows || rows.length === 0) {
       return "";
     }
     const listItems = rows.map(r => {
       const citation = cites[r.source - 1];
       const citationLink = citation ? `<sup><a href="${citation.url}" target="_blank" rel="noopener noreferrer">${r.source}</a></sup>` : `<sup>[source ${r.source}]</sup>`;
       return `  <li>${clean(r.text)} ${citationLink}</li>`;
     }).join("\n");
     return `<ul>\n${listItems}\n</ul>`;
   };

   /**
    * Formats an array of Row objects into a series of HTML paragraphs.
    * Each paragraph includes text and a superscripted citation link.
    */
   const formatHtmlSentences = (rows: Row[], cites: Citation[]): string => {
     if (!rows || rows.length === 0) {
       return "";
     }
     return rows.map(r => {
       const citation = cites[r.source - 1];
       const citationLink = citation ? `<sup><a href="${citation.url}" target="_blank" rel="noopener noreferrer">${r.source}</a></sup>` : `<sup>[source ${r.source}]</sup>`;
       return `<p>${clean(r.text)} ${citationLink}</p>`;
     }).join("\n");
   };

   /**
    * Formats the employment timeline into an HTML unordered list.
    */
   const formatHtmlTimeline = (timelineItems: string[]): string => {
     if (!timelineItems || timelineItems.length === 0) {
       return "";
     }
     // Assuming timelineItems might start with "* " from previous Markdown generation
     const listItems = timelineItems.map(item => `  <li>${item.startsWith("* ") ? item.substring(2) : item}</li>`).join("\n");
     return `<ul>\n${listItems}\n</ul>`;
   };

   /**
    * Renders the meeting brief data directly into an HTML string.
    */
   function renderToHtml(
     name: string,
     org: string,
     jsonData: JsonBrief,
     citations: Citation[],
     timeline: string[] // Raw timeline strings
   ): string {
     // Using <h3> for section headers for better semantics and default spacing.
     // Using <p> for Executive Summary sentences.
     // Using <ul> for bulleted lists.
     // Browsers typically add default margins to h2, h3, p, ul, which should create visual separation.

     return `
<div>
  <h2><strong>Meeting Brief: ${name} – ${org}</strong></h2>

  <h3><strong>Executive Summary</strong></h3>
${formatHtmlSentences(jsonData.executive, citations)}

  <h3><strong>Notable Highlights</strong></h3>
${formatHtmlTimeline(timeline)}
${formatHtmlBullets(jsonData.highlights, citations)}

  <h3><strong>Fun Facts</strong></h3>
${formatHtmlBullets(jsonData.funFacts, citations)}

  <h3><strong>Detailed Research Notes</strong></h3>
${formatHtmlBullets(jsonData.researchNotes, citations)}
</div>`.trim().replace(/^\s*\n/gm, ""); // Basic trim and removal of excess blank lines from template literal
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
     if(!li) throw new Error("LinkedIn profile not found for " + name);

     /* 3 ── ProxyCurl ------------------------------------------------------ */
     const curl = await fetch(
       `${CURL}?linkedin_profile_url=${encodeURIComponent(li.link)}`,
       { headers:{ Authorization:`Bearer ${PROXYCURL_KEY}` } }
     ).then(r=>r.json()) as Curl;

     // Timeline now directly used by HTML formatter
     const timeline = (curl.experiences??[]).map(e=>
       `${e.title??"Role"} — ${e.company??"Company"} (${span(e.starts_at,e.ends_at)})`);

     /* 4 ── Source list ---------------------------------------------------- */
     const sources = [li, ...serp]
       .filter((s,i,self)=>self.findIndex(t=>t.link===s.link)===i)
       .slice(0, MAX_SRC);

     /* 5 ── Scrape text ---------------------------------------------------- */
     const extracts: string[] = [];
     for(const s of sources){
       if(s.link.includes("linkedin.com/in/")){
         extracts.push(`LinkedIn headline: ${curl.headline??""}. Profile URL: ${s.link}`);
       }else{
         try {
           const art = await postJSON<Fire>(
             FIRE,{ url:s.link, simulate:false }, // Ensure Firecrawl parameters are correct
             { Authorization:`Bearer ${FIRECRAWL_KEY}` }
           );
           extracts.push((art.article?.text_content ?? `${s.title}. ${s.snippet??""}`).slice(0,1500));
         } catch (scrapeError) {
           console.warn(`Failed to scrape ${s.link}:`, scrapeError);
           extracts.push(`${s.title}. ${s.snippet??""} (Content not fully scraped).`); // Fallback
         }
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
   The "text" field MUST be a plain sentence.
   RULE A: "text" MUST NOT contain the word "source", brackets, or parenthetical
           numbers referring to sources.
   RULE B: Each array item MUST have both "text" (plain sentence) and "source"
           (1-based index of SOURCE_N).

   ${example}

   ### EMPLOYMENT TIMELINE (for context, do not repeat in executive summary unless highly notable)
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
     try{
       const content = resp.choices[0].message.content;
       if (!content) throw new Error("AI returned empty content");
       j = JSON.parse(content);
     }
     catch(e){
       console.error("Bad JSON from AI:", resp.choices[0].message.content);
       console.error(e);
       // Fallback or re-throw:
       // Create a dummy JsonBrief to prevent downstream errors if you want to handle it gracefully
       j = { executive: [], highlights: [], funFacts: [], researchNotes: [] };
       // Or throw new Error("Bad JSON from AI");
     }

     /* 8 ── Validate / dedupe --------------------------------------------- */
     const fix = (rows?:Row[]): Row[] => { // Added optional chaining for rows
       if (!rows) return [];
       return Array.from(
         new Map(
           rows
             .filter(r => r && typeof r.text === 'string' && r.text.trim() !== "" && typeof r.source === 'number' && r.source >= 1 && r.source <= sources.length)
             .map(r => [clean(r.text), { text: clean(r.text), source: r.source }])
         ).values()
       );
     }

     j.executive     = fix(j.executive);
     j.highlights    = fix(j.highlights);
     j.funFacts      = fix(j.funFacts);
     j.researchNotes = fix(j.researchNotes);

     /* 9 ── Citations (still useful for linking and context) --------------- */
     const finalCitations: Citation[] = sources.map((s,i)=>({
       marker : `[${i+1}]`, // Less critical for HTML but good for reference
       url    : s.link,
       title  : s.title,
       snippet: extracts[i], // The snippet here is the scraped text used for AI
     }));

     /*10 ── HTML Generation ------------------------------------------------ */
     const htmlBrief = renderToHtml(name, org, j, finalCitations, timeline);

     /*11 ── Payload -------------------------------------------------------- */
     return {
       brief : htmlBrief, // This is now HTML
       citations: finalCitations,
       tokens: toks(prompt)+toks(htmlBrief), // Token count on the generated HTML
       searches: 1, // Assuming 2 Serper calls + LI search still count as 1 logical search operation for billing/metrics
       searchResults: sources.map((s,i)=>({url:s.link,title:s.title,snippet:extracts[i]})),
     };
   }