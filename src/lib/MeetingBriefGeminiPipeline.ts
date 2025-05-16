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
   import fetch from "node-fetch"; // Make sure you have 'node-fetch' and '@types/node-fetch' installed
   
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
   const SERPER = "https://google.serper.dev/search";
   const FIRE = "https://api.firecrawl.dev/v1/scrape";
   const CURL = "https://nubela.co/proxycurl/api/v2/linkedin";
   const MAX_SRC = 15; // Max sources to feed into the LLM
   const FIRECRAWL_SKIP_SUBSTRINGS = [
     "youtube.com/",
     "youtu.be/",
     "x.com/",
     "twitter.com/",
     "reddit.com/",
     "linkedin.com/pulse/",
   ];
   
   /* ── TYPES ---------------------------------------------------------------- */
   interface SerpResult {
     title: string;
     link: string;
     snippet?: string;
   }
   interface FirecrawlScrapeResult {
     article?: { text_content?: string };
   }
   interface Ymd {
     year?: number;
   }
   interface LinkedInExperience {
     company?: string;
     title?: string;
     starts_at?: Ymd;
     ends_at?: Ymd;
   }
   interface ProxyCurlResult {
     headline?: string;
     experiences?: LinkedInExperience[];
   }
   
   interface BriefRow {
     text: string;
     source: number;
   }
   interface JsonBrief {
     executive: BriefRow[];
     highlights: BriefRow[];
     funFacts: BriefRow[];
     researchNotes: BriefRow[];
   }
   
   export interface Citation {
     marker: string;
     url: string;
     title: string;
     snippet: string;
   }
   export interface MeetingBriefPayload {
     brief: string; // HTML
     citations: Citation[];
     tokens: number;
     searches: number;
     searchResults: { url: string; title: string; snippet: string }[];
   }
   
   /* ── HELPERS -------------------------------------------------------------- */
   const ai = new OpenAI({ apiKey: OPENAI_API_KEY! });
   
   const postJSON = async <T>(
     url: string,
     body: unknown,
     hdr: Record<string, string>,
   ): Promise<T> =>
     fetch(url, {
       method: "POST",
       headers: { ...hdr, "Content-Type": "application/json" },
       body: JSON.stringify(body),
     }).then(async (r) => {
       if (!r.ok) {
         const errorText = await r.text();
         throw new Error(
           `HTTP error! status: ${r.status}, message: ${errorText}, url: ${url}`,
         );
       }
       return r.json() as Promise<T>;
     });
   
   const yr = (d?: Ymd | null): string => d?.year?.toString() ?? "?";
   const span = (s?: Ymd | null, e?: Ymd | null): string =>
     `${yr(s)} – ${e ? yr(e) : "Present"}`;
   const toks = (s: string): number => Math.ceil(s.length / 4);
   
   const clean = (t: string): string =>
     t.replace(/\s*\(?\bsource\s*\d+\)?/gi, "").trim();
   
   const normalizeOrgName = (companyName: string): string => {
     if (!companyName) return "";
     return companyName
       .toLowerCase()
       .replace(
         /[,.]?\s*(inc|llc|ltd|gmbh|corp|corporation|limited|company|co)\s*$/i,
         "",
       )
       .replace(/[.,]/g, "")
       .trim();
   };
   
   /* ── Firecrawl wrapper with 10-second timeout ---------------------------- */
   const scrapeWithTimeout = (url: string) =>
     Promise.race([
       postJSON<FirecrawlScrapeResult>(
         FIRE,
         { url }, // minimal valid body
         { Authorization: `Bearer ${FIRECRAWL_KEY!}` },
       ),
       new Promise<never>((_, reject) =>
         setTimeout(() => reject(new Error("timeout")), 10_000),
       ),
     ]) as Promise<FirecrawlScrapeResult>;
   
   /* ── HTML RENDER ---------------------------------------------------------- */
   const formatHtmlSentences = (rows: BriefRow[], cites: Citation[]): string =>
     rows
       .map((r) => {
         const c = cites[r.source - 1];
         const link = c
           ? `<sup><a href="${c.url}" target="_blank" rel="noopener noreferrer">${r.source}</a></sup>`
           : `<sup>[${r.source}]</sup>`;
         return `<p>${clean(r.text)} ${link}</p>`;
       })
       .join("\n");
   
   const formatHtmlJobHistory = (items: string[]): string =>
     items.length === 0
       ? "<p>No job history available.</p>"
       : `<ul class="list-disc pl-5">\n${items
           .map((i) => `  <li>${i.startsWith("* ") ? i.slice(2) : i}</li>`)
           .join("\n")}\n</ul>`;
   
   const formatHtmlBullets = (rows: BriefRow[], cites: Citation[]): string =>
     rows.length === 0
       ? ""
       : `<ul class="list-disc pl-5">\n${rows
           .map((r) => {
             const c = cites[r.source - 1];
             const link = c
               ? `<sup><a href="${c.url}" target="_blank" rel="noopener noreferrer">${r.source}</a></sup>`
               : `<sup>[${r.source}]</sup>`;
             return `  <li>${clean(r.text)} ${link}</li>`;
           })
           .join("\n")}\n</ul>`;
   
   function renderToHtml(
     name: string,
     org: string,
     data: JsonBrief,
     citations: Citation[],
     jobs: string[],
   ): string {
     const spacer = "<p>&nbsp;</p>";
     const hiFun: BriefRow[] = [...data.highlights, ...data.funFacts];
     return `
   <div>
     <h2><strong>Meeting Brief: ${name} – ${org}</strong></h2>
   ${spacer}
     <h3><strong>Executive Summary</strong></h3>
   ${formatHtmlSentences(data.executive, citations)}
   ${spacer}
     <h3><strong>Job History</strong></h3>
   ${formatHtmlJobHistory(jobs)}
   ${spacer}
     <h3><strong>Highlights & Fun Facts</strong></h3>
   ${formatHtmlBullets(hiFun, citations)}
   ${spacer}
     <h3><strong>Detailed Research Notes</strong></h3>
   ${formatHtmlBullets(data.researchNotes, citations)}
   </div>`.trim().replace(/^\s*\n/gm, "");
   }
   
   /* ── MAIN ----------------------------------------------------------------- */
   export async function buildMeetingBriefGemini(
     name: string,
     org: string,
   ): Promise<MeetingBriefPayload> {
     let serperQueryCount = 0;
     const allSerpResults: SerpResult[] = [];
   
     /* 1 — Serper searches */
     const queries = [
       { q: `"${name}" "${org}" OR "${name}" "linkedin.com/in/"`, num: 10 },
       {
         q: `"${name}" (achievement OR award OR "published work" OR author OR speaker OR panelist OR presenter OR keynote OR moderator OR "conference presentation" OR webinar OR forum OR seminar OR workshop OR "about page" OR biography OR profile OR "attendee list" OR "presented at" OR chaired OR masterclass OR discussion OR summit OR symposium OR convener OR delegate OR "roundtable discussion")`,
         num: 10,
       },
       {
         q: `"${name}" "${org}" (interview OR profile OR news OR article OR "press release" OR "quoted in" OR featured OR announced OR statement OR commentary OR insights OR appointed OR partnership OR acquisition OR funding OR "thought leadership" OR "expert opinion")`,
         num: 7,
       },
       {
         q: `"${name}" (leads OR "industry expert" OR "discussion with" OR "roundtable on" OR develops OR launches OR "featured in article" OR "statement by" OR "opinion piece" OR "appointed to board")`,
         num: 7,
       },
       {
         q: `"${name}" (education OR university OR "X handle" OR "Twitter profile" OR "personal blog" OR hobbies)`,
         num: 7,
       },
     ];
   
     for (const q of queries) {
       try {
         const r = await postJSON<{ organic?: SerpResult[] }>(
           SERPER,
           q,
           { "X-API-KEY": SERPER_KEY! },
         );
         serperQueryCount++;
         if (r.organic) allSerpResults.push(...r.organic);
       } catch (e) {
         console.warn(`Serper query failed "${q.q}"`, e);
       }
     }
   
     /* 3 — LinkedIn profile */
     let linkedInProfile = allSerpResults.find((s) =>
       s.link.includes("linkedin.com/in/")
     );
     if (!linkedInProfile) {
       console.warn("LinkedIn profile not in initial results; retrying search.");
       try {
         const r = await postJSON<{ organic?: SerpResult[] }>(
           SERPER,
           {
             q: `"${name}" "linkedin.com/in/" OR "${name}" "${org}" linkedin`,
             num: 5,
           },
           { "X-API-KEY": SERPER_KEY! },
         );
         serperQueryCount++;
         if (r.organic?.length) {
           linkedInProfile = r.organic.find((s) =>
             s.link.includes("linkedin.com/in/")
           ) || r.organic[0];
           if (
             linkedInProfile &&
             !allSerpResults.some((s) => s.link === linkedInProfile!.link)
           ) {
             allSerpResults.push(linkedInProfile);
           }
         }
       } catch (e) {
         console.warn("Dedicated LinkedIn search failed", e);
       }
     }
     if (!linkedInProfile?.link) {
       throw new Error(`LinkedIn profile not found for ${name}`);
     }
   
     /* 4 — ProxyCurl for LinkedIn data */
     const curlRes = await fetch(
       `${CURL}?linkedin_profile_url=${encodeURIComponent(linkedInProfile.link)}`,
       { headers: { Authorization: `Bearer ${PROXYCURL_KEY!}` } },
     );
     if (!curlRes.ok) {
       throw new Error(
         `ProxyCurl error ${curlRes.status} – ${await curlRes.text()}`,
       );
     }
     const proxyCurlData = (await curlRes.json()) as ProxyCurlResult;
     const jobTimeline = (proxyCurlData.experiences ?? []).map((e) =>
       `${e.title ?? "Role"} — ${e.company ?? "Company"} (${span(e.starts_at, e.ends_at)})`
     );
   
     /* 5 — Prioritise & dedupe Serper results */
     const significantOrgNames: string[] = [org];
     proxyCurlData.experiences?.forEach((e) => {
       if (
         e.company &&
         !significantOrgNames.some(
           (o) => normalizeOrgName(o) === normalizeOrgName(e.company!),
         )
       ) {
         significantOrgNames.push(e.company);
       }
     });
     const normalisedOrgs = significantOrgNames.map(normalizeOrgName).filter(Boolean);
   
     const dedupedSerps = Array.from(
       new Map(allSerpResults.map((s) => [s.link, s])).values(),
     );
     const otherSerps = dedupedSerps.filter((s) => s.link !== linkedInProfile.link);
   
     const achKeys = [
       "award",
       "prize",
       "honor",
       "recognition",
       "achievement",
       "speaker",
       "panelist",
       "webinar",
       "conference",
       "presentation",
       "author",
       "published",
       "paper",
       "study",
       "interview",
       "keynote",
       "medal",
       "fellowship",
       "laureate",
       "bio",
       "profile",
       "executive profile",
     ];
     const cat1 = [linkedInProfile];
     const cat2: SerpResult[] = [];
     const cat3: SerpResult[] = [];
     const cat4: SerpResult[] = [];
     const cat5: SerpResult[] = [];
   
     const nameParts = name.toLowerCase().split(" ").filter((p) => p.length > 2);
     otherSerps.forEach((s) => {
       if (!s?.link || !s.title) {
         cat5.push(s);
         return;
       }
       const text = `${s.title} ${s.snippet ?? ""} ${s.link}`.toLowerCase();
       if (!nameParts.some((p) => text.includes(p))) {
         cat5.push(s);
         return;
       }
       const isAch = achKeys.some((k) => text.includes(k));
       const orgHit = normalisedOrgs.find((o) => text.includes(o));
       if (isAch && orgHit) cat2.push(s);
       else if (orgHit) cat3.push(s);
       else if (isAch) cat4.push(s);
       else cat5.push(s);
     });
   
     const finalSourcesInput: SerpResult[] = [
       ...cat1,
       ...cat2,
       ...cat3,
       ...cat4,
       ...cat5,
     ]
       .filter((s, i, arr) => arr.findIndex((t) => t.link === s.link) === i)
       .slice(0, MAX_SRC);
   
     /* 6 — Scrape Firecrawl with verbose logs */
     const extracts: string[] = [];
     for (const s of finalSourcesInput) {
       console.info("firecrawl-candidate:", s.link);
       if (s.link.includes("linkedin.com/in/")) {
         const linkedInExtract =
           `LinkedIn Profile for ${name}. Headline: ${proxyCurlData.headline ?? "N/A"}. ` +
           `URL: ${s.link}. Experience: ${jobTimeline.slice(0, 5).join("; ")}.`;
         extracts.push(linkedInExtract);
         console.info("firecrawl-skipped: linkedIn – using ProxyCurl data");
         continue;
       }
       if (FIRECRAWL_SKIP_SUBSTRINGS.some((sub) => s.link.includes(sub))) {
         console.info("firecrawl-skipped:", s.link);
         extracts.push(`${s.title}. ${s.snippet ?? ""}`);
         continue;
       }
       const t0 = Date.now();
       try {
         const fc = await scrapeWithTimeout(s.link);
         console.info("firecrawl-ok:", s.link, Date.now() - t0, "ms");
         extracts.push(
           (fc.article?.text_content ?? `${s.title}. ${s.snippet ?? ""}`).slice(
             0,
             3000,
           ),
         );
       } catch (err: any) {
         const msg = err instanceof Error ? err.message : "unknown";
         console.warn("firecrawl-err:", s.link, Date.now() - t0, "ms", msg);
         extracts.push(`${s.title}. ${s.snippet ?? ""} (scrape failed)`);
       }
     }
   
     /* 7 — Build prompt */
     const srcBlock = finalSourcesInput
       .map(
         (s, i) => `SOURCE_${i + 1} URL: ${s.link}\nCONTENT:\n${extracts[i]}`,
       )
       .join("\n\n---\n\n");
   
     const template = `{
     "executive":[{"text":"","source":1}],
     "highlights":[{"text":"","source":1}],
     "funFacts":[{"text":"","source":1}],
     "researchNotes":[{"text":"","source":1}]
   }`;
   
     const prompt = `
   Return **only** JSON matching the template below.
   
   ### TEMPLATE
   \`\`\`json
   ${template}
   \`\`\`
   
   ### EMPLOYMENT TIMELINE
   ${jobTimeline.join("\n")}
   
   ### SOURCES
   ${srcBlock}`.trim();
   
     /* 8 — LLM call */
     const llmResp = await ai.chat.completions.create({
       model: MODEL_ID,
       temperature: 0.1,
       response_format: { type: "json_object" },
       messages: [{ role: "user", content: prompt }],
     });
   
     let briefJson: JsonBrief;
     try {
       const content = llmResp.choices[0].message.content;
       if (!content) throw new Error("LLM empty response");
       briefJson = JSON.parse(content);
     } catch (e) {
       console.error("JSON parse error", e);
       briefJson = {
         executive: [],
         highlights: [],
         funFacts: [],
         researchNotes: [],
       };
     }
   
     /* 9 — Deduplicate rows */
     const fix = (rows?: BriefRow[]): BriefRow[] =>
       Array.from(
         new Map(
           (rows ?? [])
             .filter(
               (r) =>
                 r &&
                 r.text?.trim() !== "" &&
                 typeof r.source === "number" &&
                 r.source >= 1 &&
                 r.source <= finalSourcesInput.length,
             )
             .map((r) => [clean(r.text).toLowerCase(), { ...r, text: clean(r.text) }]),
         ).values(),
       );
     briefJson.executive = fix(briefJson.executive);
     briefJson.highlights = fix(briefJson.highlights);
     briefJson.funFacts = fix(briefJson.funFacts);
     briefJson.researchNotes = fix(briefJson.researchNotes);
   
     /* 10 — Citations */
     const citations: Citation[] = finalSourcesInput.map((s, i) => ({
       marker: `[${i + 1}]`,
       url: s.link,
       title: s.title,
       snippet:
         extracts[i].substring(0, 300) +
         (extracts[i].length > 300 ? "..." : ""),
     }));
   
     /* 11 — HTML */
     const htmlBrief = renderToHtml(name, org, briefJson, citations, jobTimeline);
   
     /* 12 — Payload */
     return {
       brief: htmlBrief,
       citations,
       tokens: toks(prompt) + toks(JSON.stringify(briefJson)),
       searches: serperQueryCount,
       searchResults: finalSourcesInput.map((s, i) => ({
         url: s.link,
         title: s.title,
         snippet:
           extracts[i].substring(0, 300) +
           (extracts[i].length > 300 ? "..." : ""),
       })),
     };
   }