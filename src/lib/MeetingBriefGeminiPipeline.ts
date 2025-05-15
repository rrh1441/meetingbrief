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
   import fetch   from "node-fetch"; // Make sure you have 'node-fetch' and '@types/node-fetch' installed

   export const runtime = "nodejs";

   /* ── ENV ------------------------------------------------------------------ */
   const {
     OPENAI_API_KEY,
     SERPER_KEY,
     FIRECRAWL_KEY,
     PROXYCURL_KEY,
   } = process.env;

   /* ── CONSTANTS ------------------------------------------------------------ */
   const MODEL_ID = "gpt-4.1-mini-2025-04-14"; // Verify this is your intended and available model
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
     brief        : string; // This will be an HTML string
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
   ): Promise<T> =>
     fetch(url,{
       method :"POST",
       headers:{ ...hdr, "Content-Type":"application/json" },
       body   : JSON.stringify(body),
     }).then(async r => {
         if (!r.ok) {
             const errorText = await r.text();
             throw new Error(`HTTP error! status: ${r.status}, body: ${errorText}`);
         }
         return r.json() as Promise<T>;
     });

   const yr   = (d?:Ymd|null): string =>d?.year?.toString() ?? "?";
   const span = (s?:Ymd|null,e?:Ymd|null): string =>`${yr(s)} – ${e?yr(e):"Present"}`;
   const toks = (s:string): number =>Math.ceil(s.length/4);

   const clean = (t:string): string =>
     t.replace(/\s*\(?\bsource\s*\d+\)?/gi,"").trim();

   /* ── HTML RENDER ---------------------------------------------------------- */

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

   const formatHtmlJobHistory = (timelineItems: string[]): string => {
     if (!timelineItems || timelineItems.length === 0) {
       return "<p>No job history available.</p>";
     }
     const listItems = timelineItems.map(item => `  <li>${item.startsWith("* ") ? item.substring(2) : item}</li>`).join("\n");
     return `<ul>\n${listItems}\n</ul>`;
   };

   function renderToHtml(
     name: string,
     org: string,
     jsonData: JsonBrief,
     citations: Citation[],
     jobTimelineData: string[]
   ): string {
     const emptyParagraphForSpacing = "<p>&nbsp;</p>";

     const combinedHighlightsAndFunFacts: Row[] = [
       ...(jsonData.highlights || []),
       ...(jsonData.funFacts || [])
     ];

     return `
<div>
  <h2><strong>Meeting Brief: ${name} – ${org}</strong></h2>
${emptyParagraphForSpacing}
  <h3><strong>Executive Summary</strong></h3>
${formatHtmlSentences(jsonData.executive, citations)}
${emptyParagraphForSpacing}
  <h3><strong>Job History</strong></h3>
${formatHtmlJobHistory(jobTimelineData)}
${emptyParagraphForSpacing}
  <h3><strong>Highlights & Fun Facts</strong></h3>
${formatHtmlBullets(combinedHighlightsAndFunFacts, citations)}
${emptyParagraphForSpacing}
  <h3><strong>Detailed Research Notes</strong></h3>
${formatHtmlBullets(jsonData.researchNotes, citations)}
</div>`.trim().replace(/^\s*\n/gm, "");
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

     if(!li) throw new Error("LinkedIn profile not found for " + name + " in organization " + org);

     /* 3 ── ProxyCurl ------------------------------------------------------ */
     const curlResponse = await fetch(
       `${CURL}?linkedin_profile_url=${encodeURIComponent(li.link)}`,
       { headers:{ Authorization:`Bearer ${PROXYCURL_KEY!}` } }
     );
     if (!curlResponse.ok) {
        const errorText = await curlResponse.text();
        throw new Error(`ProxyCurl error! status: ${curlResponse.status}, body: ${errorText}`);
     }
     const curl = await curlResponse.json() as Curl;


     const jobTimeline = (curl.experiences??[]).map(e=>
       `${e.title??"Role"} — ${e.company??"Company"} (${span(e.starts_at, e.ends_at)})`);

     /* 4 ── Source list ---------------------------------------------------- */
     const sources: Serp[] = [li, ...serp]
       .filter((s,i,self)=>self.findIndex(t=>t.link===s.link)===i)
       .slice(0, MAX_SRC);

     /* 5 ── Scrape text ---------------------------------------------------- */
     const extracts: string[] = [];
     for(const s of sources){
       if(s.link.includes("linkedin.com/in/")){
         extracts.push(`LinkedIn headline: ${curl.headline??"N/A"}. Profile URL: ${s.link}`);
       }else{
         try {
           const art = await postJSON<Fire>(
             FIRE,{ url:s.link, page_options: { only_main_content: true } },
             { Authorization:`Bearer ${FIRECRAWL_KEY!}` }
           );
           extracts.push((art.article?.text_content ?? `${s.title}. ${s.snippet??""}`).slice(0,1500));
         } catch (scrapeError: unknown) { // MODIFIED: any to unknown
           if (scrapeError instanceof Error) {
             console.warn(`Failed to scrape ${s.link}: ${scrapeError.message}`);
           } else {
             console.warn(`Failed to scrape ${s.link}: An unknown error occurred`);
           }
           extracts.push(`${s.title}. ${s.snippet??""} (Content not fully scraped).`);
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
      {"text":"Sales Director at Flashpoint since 2024 based on provided employment timeline.","source":1}
    ]
   }`;

     const prompt = `
   Return **only** JSON matching the template.
   The "text" field MUST be a plain sentence or concise statement.
   RULE A: "text" MUST NOT contain the word "source", brackets, or parenthetical
           numbers referring to sources (e.g., "(source 3)").
   RULE B: Each array item MUST have both "text" (plain sentence) and "source"
           (1-based index of SOURCE_N from the ### SOURCES block).
   RULE C: Base the executive summary and other points on the provided ### SOURCES.
   RULE D: Use the ### EMPLOYMENT TIMELINE for context, especially for roles and dates in the executive summary,
           but synthesize information, do not just copy timeline entries verbatim into JSON fields.

   ${example}

   ### EMPLOYMENT TIMELINE (for context and factual data)
   ${jobTimeline.join("\n")}

   ### SOURCES
   ${srcBlock}

   ### TEMPLATE (fill this structure)
   \`\`\`json
   ${template}
   \`\`\``.trim();

     /* 7 ── LLM call ------------------------------------------------------- */
     const resp = await ai.chat.completions.create({
       model: MODEL_ID,
       temperature: 0.1,
       response_format:{ type:"json_object"},
       messages:[{ role:"user", content:prompt }],
     });

     let j: JsonBrief;
     try{
       const content = resp.choices[0].message.content;
       if (!content) throw new Error("AI returned empty content");
       j = JSON.parse(content);
     }
     catch(e: unknown){ // MODIFIED: any to unknown
       console.error("Bad JSON from AI:", resp.choices[0]?.message?.content ?? "No content in response");
       if (e instanceof Error) {
         console.error("Error parsing JSON:", e.message);
       } else {
         console.error("Error parsing JSON: An unknown error occurred");
       }
       j = { executive: [], highlights: [], funFacts: [], researchNotes: [] };
     }

     /* 8 ── Validate / dedupe --------------------------------------------- */
     const fix = (rows?:Row[]): Row[] => {
       if (!rows || !Array.isArray(rows)) return [];
       return Array.from(
         new Map(
           rows
             .filter(r => r && typeof r.text === 'string' && r.text.trim() !== "" && typeof r.source === 'number' && r.source >= 1 && r.source <= sources.length)
             .map(r => [clean(r.text).toLowerCase(), { text: clean(r.text), source: r.source }])
         ).values()
       );
     }

     j.executive     = fix(j.executive);
     j.highlights    = fix(j.highlights);
     j.funFacts      = fix(j.funFacts);
     j.researchNotes = fix(j.researchNotes);

     /* 9 ── Citations ------------------------------------------------------ */
     const finalCitations: Citation[] = sources.map((s,i)=>({
       marker : `[${i+1}]`,
       url    : s.link,
       title  : s.title,
       snippet: extracts[i],
     }));

     /*10 ── HTML Generation ------------------------------------------------ */
     const htmlBrief = renderToHtml(name, org, j, finalCitations, jobTimeline);

     /*11 ── Payload -------------------------------------------------------- */
     return {
       brief : htmlBrief,
       citations: finalCitations,
       tokens: toks(prompt)+toks(htmlBrief),
       searches: 2,
       searchResults: sources.map((s,i)=>({url:s.link,title:s.title,snippet:extracts[i]})),
     };
   }