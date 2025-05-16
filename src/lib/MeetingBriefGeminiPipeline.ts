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
   import fetch from "node-fetch"; // Ensure 'node-fetch' and '@types/node-fetch' are installed
   
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
   const MAX_SRC = 15; // Max sources passed to the LLM
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
     brief: string;
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
         const text = await r.text();
         throw new Error(`HTTP ${r.status} – ${text} – ${url}`);
       }
       return r.json() as Promise<T>;
     });
   
   const yr = (d?: Ymd | null): string => d?.year?.toString() ?? "?";
   const span = (s?: Ymd | null, e?: Ymd | null): string =>
     `${yr(s)} – ${e ? yr(e) : "Present"}`;
   const toks = (s: string): number => Math.ceil(s.length / 4);
   const clean = (t: string): string =>
     t.replace(/\s*\(?\bsource\s*\d+\)?/gi, "").trim();
   
   const normalizeOrgName = (company: string): string =>
     company
       ? company
           .toLowerCase()
           .replace(
             /[,.]?\s*(inc|llc|ltd|gmbh|corp|corporation|limited|company|co)\s*$/i,
             "",
           )
           .replace(/[.,]/g, "")
           .trim()
       : "";
   
   /* ── Firecrawl wrapper (10-s timeout) ------------------------------------ */
   const scrapeWithTimeout = (url: string) =>
     Promise.race([
       postJSON<FirecrawlScrapeResult>(
         FIRE,
         { url },
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
         const sup = c
           ? `<sup><a href="${c.url}" target="_blank" rel="noopener noreferrer">${r.source}</a></sup>`
           : `<sup>[${r.source}]</sup>`;
         return `<p>${clean(r.text)} ${sup}</p>`;
       })
       .join("\n");
   
   const formatHtmlList = (rows: BriefRow[], cites: Citation[]): string =>
     rows.length === 0
       ? ""
       : `<ul class="list-disc pl-5">\n${rows
           .map((r) => {
             const c = cites[r.source - 1];
             const sup = c
               ? `<sup><a href="${c.url}" target="_blank" rel="noopener noreferrer">${r.source}</a></sup>`
               : `<sup>[${r.source}]</sup>`;
             return `  <li>${clean(r.text)} ${sup}</li>`;
           })
           .join("\n")}\n</ul>`;
   
   const formatHtmlJobs = (jobs: string[]): string =>
     jobs.length
       ? `<ul class="list-disc pl-5">\n${jobs
           .map((j) => `  <li>${j.startsWith("* ") ? j.slice(2) : j}</li>`)
           .join("\n")}\n</ul>`
       : "<p>No job history available.</p>";
   
   function toHtml(
     name: string,
     org: string,
     data: JsonBrief,
     cites: Citation[],
     jobs: string[],
   ): string {
     const spacer = "<p>&nbsp;</p>";
     return `
   <div>
     <h2><strong>Meeting Brief: ${name} – ${org}</strong></h2>
   ${spacer}
     <h3><strong>Executive Summary</strong></h3>
   ${formatHtmlSentences(data.executive, cites)}
   ${spacer}
     <h3><strong>Job History</strong></h3>
   ${formatHtmlJobs(jobs)}
   ${spacer}
     <h3><strong>Highlights & Fun Facts</strong></h3>
   ${formatHtmlList([...data.highlights, ...data.funFacts], cites)}
   ${spacer}
     <h3><strong>Detailed Research Notes</strong></h3>
   ${formatHtmlList(data.researchNotes, cites)}
   </div>`.trim().replace(/^\s*\n/gm, "");
   }
   
   /* ── MAIN ----------------------------------------------------------------- */
   export async function buildMeetingBriefGemini(
     name: string,
     org: string,
   ): Promise<MeetingBriefPayload> {
     let serperQueryCount = 0;
     const serpAll: SerpResult[] = [];
   
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
         if (r.organic) serpAll.push(...r.organic);
       } catch (e) {
         console.warn(`Serper query failed: ${q.q}`, e);
       }
     }
   
     /* 2 — LinkedIn */
     let li = serpAll.find((s) => s.link.includes("linkedin.com/in/"));
     if (!li) {
       console.warn("LinkedIn not found, running dedicated search");
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
           li = r.organic.find((s) => s.link.includes("linkedin.com/in/")) ||
             r.organic[0];
           if (li && !serpAll.some((s) => s.link === li!.link)) serpAll.push(li);
         }
       } catch (e) {
         console.warn("LinkedIn dedicated query failed", e);
       }
     }
     if (!li?.link) throw new Error(`LinkedIn profile not found for ${name}`);
   
     /* 3 — ProxyCurl */
     const curlRes = await fetch(
       `${CURL}?linkedin_profile_url=${encodeURIComponent(li.link)}`,
       { headers: { Authorization: `Bearer ${PROXYCURL_KEY!}` } },
     );
     if (!curlRes.ok) {
       throw new Error(
         `ProxyCurl ${curlRes.status} – ${await curlRes.text()}`,
       );
     }
     const curlData = (await curlRes.json()) as ProxyCurlResult;
     const jobTimeline = (curlData.experiences ?? []).map((e) =>
       `${e.title ?? "Role"} — ${e.company ?? "Company"} (${span(e.starts_at, e.ends_at)})`
     );
   
     /* 4 — Prioritise Serp results */
     const orgs = [org];
     curlData.experiences?.forEach((e) => {
       if (
         e.company &&
         !orgs.some((o) => normalizeOrgName(o) === normalizeOrgName(e.company!))
       ) orgs.push(e.company);
     });
     const normOrgs = orgs.map(normalizeOrgName).filter(Boolean);
   
     const dedup = Array.from(new Map(serpAll.map((s) => [s.link, s])).values());
     const rest = dedup.filter((s) => s.link !== li.link);
   
     const ach = [
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
     const p1 = [li];
     const p2: SerpResult[] = [];
     const p3: SerpResult[] = [];
     const p4: SerpResult[] = [];
     const p5: SerpResult[] = [];
   
     const nameParts = name.toLowerCase().split(" ").filter((p) => p.length > 2);
     rest.forEach((s) => {
       if (!s?.title) {
         p5.push(s);
         return;
       }
       const text = `${s.title} ${s.snippet ?? ""} ${s.link}`.toLowerCase();
       if (!nameParts.some((p) => text.includes(p))) {
         p5.push(s);
         return;
       }
       const isAch = ach.some((k) => text.includes(k));
       const orgHit = normOrgs.find((o) => text.includes(o));
       if (isAch && orgHit) p2.push(s);
       else if (orgHit) p3.push(s);
       else if (isAch) p4.push(s);
       else p5.push(s);
     });
   
     const sources: SerpResult[] = [...p1, ...p2, ...p3, ...p4, ...p5]
       .filter((s, i, a) => a.findIndex((t) => t.link === s.link) === i)
       .slice(0, MAX_SRC);
   
     /* 5 — Scrape with logs */
     const extracts: string[] = [];
     for (const s of sources) {
       console.info("firecrawl-candidate:", s.link);
       if (s.link.includes("linkedin.com/in/")) {
         const extract =
           `LinkedIn Profile for ${name}. Headline: ${curlData.headline ?? "N/A"}. ` +
           `URL: ${s.link}. Experience: ${jobTimeline.slice(0, 5).join("; ")}.`;
         extracts.push(extract);
         console.info("firecrawl-skipped: LinkedIn — using ProxyCurl");
         continue;
       }
       if (FIRECRAWL_SKIP_SUBSTRINGS.some((sub) => s.link.includes(sub))) {
         console.info("firecrawl-skipped:", s.link);
         extracts.push(`${s.title}. ${s.snippet ?? ""}`);
         continue;
       }
       const start = Date.now();
       try {
         const fc = await scrapeWithTimeout(s.link);
         console.info("firecrawl-ok:", s.link, Date.now() - start, "ms");
         extracts.push(
           (fc.article?.text_content ?? `${s.title}. ${s.snippet ?? ""}`).slice(
             0,
             3000,
           ),
         );
       } catch (err: unknown) {
         const msg = err instanceof Error ? err.message : String(err);
         console.warn("firecrawl-err:", s.link, Date.now() - start, "ms", msg);
         extracts.push(`${s.title}. ${s.snippet ?? ""} (scrape failed)`);
       }
     }
   
     /* 6 — Build prompt */
     const srcBlock = sources
       .map((s, i) => `SOURCE_${i + 1} URL: ${s.link}\nCONTENT:\n${extracts[i]}`)
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
   
     /* 7 — LLM */
     const resp = await ai.chat.completions.create({
       model: MODEL_ID,
       temperature: 0.1,
       response_format: { type: "json_object" },
       messages: [{ role: "user", content: prompt }],
     });
   
     let briefJson: JsonBrief;
     try {
       const c = resp.choices[0].message.content;
       if (!c) throw new Error("empty response");
       briefJson = JSON.parse(c);
     } catch (e) {
       console.error("LLM JSON parse error", e);
       briefJson = { executive: [], highlights: [], funFacts: [], researchNotes: [] };
     }
   
     /* 8 — Deduplicate */
     const dedupRows = (rows?: BriefRow[]): BriefRow[] =>
       Array.from(
         new Map(
           (rows ?? [])
             .filter(
               (r) =>
                 r &&
                 r.text?.trim() !== "" &&
                 typeof r.source === "number" &&
                 r.source >= 1 &&
                 r.source <= sources.length,
             )
             .map((r) => [clean(r.text).toLowerCase(), { ...r, text: clean(r.text) }]),
         ).values(),
       );
     briefJson.executive = dedupRows(briefJson.executive);
     briefJson.highlights = dedupRows(briefJson.highlights);
     briefJson.funFacts = dedupRows(briefJson.funFacts);
     briefJson.researchNotes = dedupRows(briefJson.researchNotes);
   
     /* 9 — Citations */
     const citations: Citation[] = sources.map((s, i) => ({
       marker: `[${i + 1}]`,
       url: s.link,
       title: s.title,
       snippet:
         extracts[i].substring(0, 300) + (extracts[i].length > 300 ? "..." : ""),
     }));
   
     /* 10 — HTML */
     const html = toHtml(name, org, briefJson, citations, jobTimeline);
   
     /* 11 — Payload */
     return {
       brief: html,
       citations,
       tokens: toks(prompt) + toks(JSON.stringify(briefJson)),
       searches: serperQueryCount,
       searchResults: sources.map((s, i) => ({
         url: s.link,
         title: s.title,
         snippet:
           extracts[i].substring(0, 300) +
           (extracts[i].length > 300 ? "..." : ""),
       })),
     };
   }