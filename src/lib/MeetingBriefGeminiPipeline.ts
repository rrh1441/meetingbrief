/* ──────────────────────────────────────────────────────────────────────────
   src/lib/MeetingBriefGeminiPipeline.ts
   --------------------------------------------------------------------------
   HARD CONTRACT
   ─ model returns only:
        { executive: [], highlights: [], funFacts: [], socialLinks: [], researchNotes: [] }
   ─ each element { text: string, source: number }
   ─ no headings, no prose, no “source 3” strings inside text
   ------------------------------------------------------------------------ */

   import OpenAI from "openai";
   import fetch from "node-fetch";
   
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
   const MAX_SRC = 15;
   
   /* ── DOMAINS TO SHORT-CIRCUIT -------------------------------------------- */
   const SOCIAL_SUBSTRINGS = ["instagram.com/", "facebook.com/", "fb.com/"];
   const GENERIC_SKIP_SUBSTRINGS = [
     "youtube.com/",
     "youtu.be/",
     "x.com/",
     "twitter.com/",
     "reddit.com/",
     "linkedin.com/pulse/",
     "linkedin.com/posts/",
   ];
   const NO_SCRAPE = [...SOCIAL_SUBSTRINGS, ...GENERIC_SKIP_SUBSTRINGS];
   
   /* ── TYPES ---------------------------------------------------------------- */
   interface SerpResult { title: string; link: string; snippet?: string }
   interface FirecrawlScrapeResult { article?: { text_content?: string } }
   interface Ymd { year?: number }
   interface LinkedInExperience { company?: string; title?: string; starts_at?: Ymd; ends_at?: Ymd }
   interface ProxyCurlResult { headline?: string; experiences?: LinkedInExperience[] }
   
   interface BriefRow { text: string; source: number }
   interface JsonBrief {
     executive: BriefRow[];
     highlights: BriefRow[];
     funFacts: BriefRow[];
     socialLinks: BriefRow[];
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
     possibleSocialLinks: string[];
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
     }).then(async r => {
       if (!r.ok) throw new Error(`HTTP ${r.status} – ${await r.text()}`);
       return r.json() as Promise<T>;
     });
   
   const yr = (d?: Ymd): string => d?.year?.toString() ?? "?";
   const span = (s?: Ymd, e?: Ymd): string => `${yr(s)} – ${e ? yr(e) : "Present"}`;
   const toks = (s: string): number => Math.ceil(s.length / 4);
   const clean = (t: string) => t.replace(/\s*\(?\bsource\s*\d+\)?/gi, "").trim();
   const normalize = (c: string) =>
     c.toLowerCase()
       .replace(/[,.]?\s*(inc|llc|ltd|gmbh|corp|corporation|limited|company|co)\s*$/i, "")
       .replace(/[.,]/g, "")
       .trim();
   
   /* ── Firecrawl wrapper (15-s timeout) ------------------------------------ */
   const scrapeWithTimeout = (url: string) =>
     Promise.race([
       postJSON<FirecrawlScrapeResult>(
         FIRE,
         { url },
         { Authorization: `Bearer ${FIRECRAWL_KEY!}` },
       ),
       new Promise<never>((_, reject) =>
         setTimeout(() => reject(new Error("timeout")), 15_000),
       ),
     ]) as Promise<FirecrawlScrapeResult>;
   
   /* ── HTML helpers --------------------------------------------------------- */
   const pSent = (rows: BriefRow[], cites: Citation[]) =>
     rows.map(r => {
       const c = cites[r.source - 1];
       const sup = c
         ? `<sup><a href="${c.url}" target="_blank" rel="noopener noreferrer">${r.source}</a></sup>`
         : `<sup>[${r.source}]</sup>`;
       return `<p>${clean(r.text)} ${sup}</p>`;
     }).join("\n");
   
   const ulRows = (rows: BriefRow[], cites: Citation[]) =>
     rows.length
       ? `<ul class="list-disc pl-5">\n${rows.map(r => {
           const c = cites[r.source - 1];
           const sup = c
             ? `<sup><a href="${c.url}" target="_blank" rel="noopener noreferrer">${r.source}</a></sup>`
             : `<sup>[${r.source}]</sup>`;
           return `  <li>${clean(r.text)} ${sup}</li>`;
         }).join("\n")}\n</ul>`
       : "";
   
   const ulJobs = (jobs: string[]) =>
     jobs.length
       ? `<ul class="list-disc pl-5">\n${jobs.map(j => `  <li>${j}</li>`).join("\n")}\n</ul>`
       : "<p>No job history available.</p>";
   
   const toHtml = (
     name: string,
     org: string,
     data: JsonBrief,
     cites: Citation[],
     jobs: string[],
   ) => {
     const s = "<p>&nbsp;</p>";
     return `
   <div>
     <h2><strong>Meeting Brief: ${name} – ${org}</strong></h2>
   ${s}<h3><strong>Executive Summary</strong></h3>
   ${pSent(data.executive, cites)}
   ${s}<h3><strong>Job History</strong></h3>
   ${ulJobs(jobs)}
   ${s}<h3><strong>Highlights & Fun Facts</strong></h3>
   ${ulRows([...data.highlights, ...data.funFacts], cites)}
   ${s}<h3><strong>Social Links (unverified)</strong></h3>
   ${ulRows(data.socialLinks, cites)}
   ${s}<h3><strong>Detailed Research Notes</strong></h3>
   ${ulRows(data.researchNotes, cites)}
   </div>`.trim().replace(/^\s*\n/gm, "");
   };
   
   /* ── MAIN ----------------------------------------------------------------- */
   export async function buildMeetingBriefGemini(
     name: string,
     org: string,
   ): Promise<MeetingBriefPayload> {
     let serperCalls = 0;
     const serp: SerpResult[] = [];
   
     /* 1 — Initial Serper queries */
     const baseQs = [
       { q: `"${name}" "${org}" OR "${name}" "linkedin.com/in/"`, num: 10 },
       { q: `"${name}" "${org}" (interview OR profile OR news OR "press release")`, num: 7 },
       { q: `"${name}" (achievement OR award OR keynote OR webinar OR conference)`, num: 7 },
     ];
     for (const q of baseQs) {
       try {
         const r = await postJSON<{ organic?: SerpResult[] }>(
           SERPER,
           q,
           { "X-API-KEY": SERPER_KEY! },
         );
         serperCalls++;
         if (r.organic) serp.push(...r.organic);
       } catch (e) {
         console.warn("Serper error:", e);
       }
     }
   
     /* 2 — LinkedIn profile */
     let li = serp.find(s => s.link.includes("linkedin.com/in/"));
     if (!li) {
       try {
         const r = await postJSON<{ organic?: SerpResult[] }>(
           SERPER,
           { q: `"${name}" "linkedin.com/in/"`, num: 5 },
           { "X-API-KEY": SERPER_KEY! },
         );
         serperCalls++;
         if (r.organic?.length) {
           li = r.organic[0];
           serp.push(li);
         }
       } catch (e) {
         console.warn("LinkedIn dedicated search error:", e);
       }
     }
     if (!li?.link) throw new Error(`LinkedIn profile not found for ${name}`);
   
     /* 3 — ProxyCurl (LinkedIn data) */
     const curlRes = await fetch(
       `${CURL}?linkedin_profile_url=${encodeURIComponent(li.link)}`,
       { headers: { Authorization: `Bearer ${PROXYCURL_KEY!}` } },
     );
     if (!curlRes.ok)
       throw new Error(`ProxyCurl ${curlRes.status} – ${await curlRes.text()}`);
     const pc = (await curlRes.json()) as ProxyCurlResult;
   
     const jobTimeline = (pc.experiences ?? []).map(
       e => `${e.title ?? "Role"} — ${e.company ?? "Company"} (${span(e.starts_at, e.ends_at)})`,
     );
   
     /* 4 — Extra Serper queries per LinkedIn company */
     const companies = (pc.experiences ?? [])
       .map(e => e.company)
       .filter(Boolean)
       .map(c => c!)
       .filter(
         (c, i, arr) =>
           i === arr.findIndex(x => normalize(x) === normalize(c)) &&
           normalize(c) !== normalize(org),
       )
       .slice(0, 3);
   
     for (const c of companies) {
       try {
         const r = await postJSON<{ organic?: SerpResult[] }>(
           SERPER,
           { q: `"${name}" "${c}"`, num: 7 },
           { "X-API-KEY": SERPER_KEY! },
         );
         serperCalls++;
         if (r.organic) serp.push(...r.organic);
       } catch (e) {
         console.warn(`Serper company query error (${c}):`, e);
       }
     }
   
     /* 5 — Build final source list */
     const dedup = Array.from(new Map(serp.map(s => [s.link, s])).values());
     const sources = dedup
       .filter(s =>
         !NO_SCRAPE.some(sub => s.link.includes(sub)) ||
         s.link.includes("linkedin.com/in/"),
       )
       .slice(0, MAX_SRC);
   
     const possibleSocialLinks = dedup
       .filter(s => SOCIAL_SUBSTRINGS.some(sub => s.link.includes(sub)))
       .map(s => s.link);
   
     /* 6 — Scrape or short-circuit */
     const extracts: string[] = [];
     for (const s of sources) {
       console.info("candidate:", s.link);
   
       if (s.link.includes("linkedin.com/in/")) {
         extracts.push(
           `LinkedIn headline: ${pc.headline ?? "N/A"}. URL: ${s.link}.`,
         );
         console.info("skipped scrape: LinkedIn profile");
         continue;
       }
   
       if (NO_SCRAPE.some(sub => s.link.includes(sub))) {
         extracts.push(`${s.title}. ${s.snippet ?? ""}`);
         console.info("skipped scrape:", s.link);
         continue;
       }
   
       const t0 = Date.now();
       try {
         const fc = await scrapeWithTimeout(s.link);
         console.info("scrape OK:", s.link, Date.now() - t0, "ms");
         extracts.push(
           (fc.article?.text_content ?? `${s.title}. ${s.snippet ?? ""}`).slice(
             0,
             3000,
           ),
         );
       } catch (err: unknown) {
         const msg = err instanceof Error ? err.message : String(err);
         console.warn("scrape ERR:", s.link, Date.now() - t0, "ms", msg);
         extracts.push(`${s.title}. ${s.snippet ?? ""} (scrape failed)`);
       }
     }
   
     /* 7 — Prompt */
     const srcBlock = sources
       .map((s, i) => `SOURCE_${i + 1} URL: ${s.link}\nCONTENT:\n${extracts[i]}`)
       .join("\n\n---\n\n");
   
     const template = `{
     "executive":[{"text":"","source":1}],
     "highlights":[{"text":"","source":1}],
     "funFacts":[{"text":"","source":1}],
     "socialLinks":[{"text":"","source":1}],
     "researchNotes":[{"text":"","source":1}]
   }`;
   
     const prompt = `Return ONLY JSON matching TEMPLATE.
   
   ### TEMPLATE
   ${template}
   
   ### EMPLOYMENT TIMELINE
   ${jobTimeline.join("\n")}
   
   ### SOURCES
   ${srcBlock}`;
   
     /* 8 — LLM */
     const llm = await ai.chat.completions.create({
       model: MODEL_ID,
       temperature: 0.1,
       response_format: { type: "json_object" },
       messages: [{ role: "user", content: prompt }],
     });
   
     let data: JsonBrief = {
       executive: [],
       highlights: [],
       funFacts: [],
       socialLinks: [],
       researchNotes: [],
     };
     try {
       data = JSON.parse(llm.choices[0].message.content ?? "{}");
     } catch (e) {
       console.error("LLM JSON parse error", e);
     }
   
     /* 9 — Deduplicate rows */
     const uniq = (rows?: BriefRow[]) =>
       Array.from(
         new Map(
           (rows ?? []).map(r => [clean(r.text).toLowerCase(), { ...r, text: clean(r.text) }]),
         ).values(),
       );
     data.executive = uniq(data.executive);
     data.highlights = uniq(data.highlights);
     data.funFacts = uniq(data.funFacts);
     data.socialLinks = uniq(data.socialLinks);
     data.researchNotes = uniq(data.researchNotes);
   
     /* 10 — Citations */
     const citations: Citation[] = sources.map((s, i) => ({
       marker: `[${i + 1}]`,
       url: s.link,
       title: s.title,
       snippet:
         extracts[i].slice(0, 300) +
         (extracts[i].length > 300 ? "..." : ""),
     }));
   
     /* 11 — HTML */
     const htmlBrief = toHtml(name, org, data, citations, jobTimeline);
   
     /* 12 — Payload */
     return {
       brief: htmlBrief,
       citations,
       tokens: toks(prompt) + toks(JSON.stringify(data)),
       searches: serperCalls,
       searchResults: sources.map((s, i) => ({
         url: s.link,
         title: s.title,
         snippet:
           extracts[i].slice(0, 300) +
           (extracts[i].length > 300 ? "..." : ""),
       })),
       possibleSocialLinks,
     };
   }