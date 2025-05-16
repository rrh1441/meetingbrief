/* ──────────────────────────────────────────────────────────────────────────
   src/lib/MeetingBriefGeminiPipeline.ts
   --------------------------------------------------------------------------
   HARD CONTRACT
   ─ model returns only:
        { executive: [], highlights: [], funFacts: [], researchNotes: [] }
        + socialLinks printed as last section (not part of LLM JSON)
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
   const MAX_SRC = 25; // give the LLM more material
   
   /* ── DOMAINS -------------------------------------------------------------- */
   const SOCIAL_DOMAINS = [
     "x.com/",
     "twitter.com/",
     "mastodon.social/",
     "facebook.com/",
     "fb.com/",
     "instagram.com/",
   ];
   const GENERIC_NO_SCRAPE = [
     "youtube.com/",
     "youtu.be/",
     "reddit.com/",
     "linkedin.com/pulse/",
     "linkedin.com/posts/",
   ];
   const NO_SCRAPE = [...SOCIAL_DOMAINS, ...GENERIC_NO_SCRAPE];
   
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
   
   /* ── Firecrawl with retry ------------------------------------------------- */
   const firecrawl = async (url: string): Promise<string | null> => {
     const tryOnce = (timeout: number) =>
       Promise.race([
         postJSON<FirecrawlScrapeResult>(
           FIRE,
           { url },
           { Authorization: `Bearer ${FIRECRAWL_KEY!}` },
         ),
         new Promise<never>((_, reject) =>
           setTimeout(() => reject(new Error("timeout")), timeout),
         ),
       ]).then(r => r.article?.text_content ?? null);
   
     try {
       const first = await tryOnce(5000);
       if (first) return first;
       const second = await tryOnce(10000);
       return second;
     } catch {
       return null;
     }
   };
   
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
   
   const ulSocial = (links: string[]) =>
     links.length
       ? `<ul class="list-disc pl-5">\n${links.map(l => `  <li><a href="${l}" target="_blank" rel="noopener noreferrer">${l}</a></li>`).join("\n")}\n</ul>`
       : "";
   
   /* ── MAIN ----------------------------------------------------------------- */
   export async function buildMeetingBriefGemini(
     name: string,
     org: string,
   ): Promise<MeetingBriefPayload> {
     let serperCalls = 0;
     const serp: SerpResult[] = [];
   
     /* 1 — Serper queries */
     const queries = [
       { q: `"${name}" "${org}" OR "${name}" "linkedin.com/in/"`, num: 10 },
       { q: `"${name}" "${org}" (interview OR profile OR news OR "press release")`, num: 10 },
       { q: `"${name}" (award OR keynote OR webinar OR conference)`, num: 10 },
     ];
     for (const q of queries) {
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
           { q: `"${name}" "linkedin.com/in/"`, num: 7 },
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
   
     /* 3 — ProxyCurl */
     const curlRes = await fetch(
       `${CURL}?linkedin_profile_url=${encodeURIComponent(li.link)}`,
       { headers: { Authorization: `Bearer ${PROXYCURL_KEY!}` } },
     );
     if (!curlRes.ok)
       throw new Error(`ProxyCurl ${curlRes.status} – ${await curlRes.text()}`);
     const pc = await curlRes.json() as unknown as ProxyCurlResult;
   
     const jobTimeline = (pc.experiences ?? []).map(
       e => `${e.title ?? "Role"} — ${e.company ?? "Company"} (${span(e.starts_at, e.ends_at)})`,
     );
   
     /* 4 — Additional queries per LinkedIn company */
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
           { q: `"${name}" "${c}"`, num: 10 },
           { "X-API-KEY": SERPER_KEY! },
         );
         serperCalls++;
         if (r.organic) serp.push(...r.organic);
       } catch (e) {
         console.warn(`Serper company query error (${c}):`, e);
       }
     }
   
     /* 5 — Build lists */
     const dedup = Array.from(new Map(serp.map(s => [s.link, s])).values());
     const sources = dedup
       .filter(s => !NO_SCRAPE.some(sub => s.link.includes(sub)) || s.link.includes("linkedin.com/in/"))
       .slice(0, MAX_SRC);
   
     const possibleSocialLinks = SOCIAL_DOMAINS
       .flatMap(dom => dedup.filter(s => s.link.includes(dom)).map(s => s.link))
       .filter((l, i, arr) => arr.indexOf(l) === i);
   
     /* 6 — Scrape */
     const extracts: string[] = [];
     for (const s of sources) {
       if (s.link.includes("linkedin.com/in/")) {
         extracts.push(`LinkedIn headline: ${pc.headline ?? "N/A"}. URL: ${s.link}.`);
         continue;
       }
       if (NO_SCRAPE.some(sub => s.link.includes(sub))) {
         extracts.push(`${s.title}. ${s.snippet ?? ""}`); // snippet only
         continue;
       }
       const text = await firecrawl(s.link);
       extracts.push(
         `${text ?? ""}\n${s.title}. ${s.snippet ?? ""}`.trim().slice(0, 3000),
       );
     }
   
     /* 7 — Prompt */
     const srcBlock = sources
       .map((s, i) => `SOURCE_${i + 1} URL: ${s.link}\nCONTENT:\n${extracts[i]}`)
       .join("\n\n---\n\n");
   
     const example = `{
     "executive":[
       {"text":"Sales Director at Flashpoint since 2024, previously Performance Analyst at SIGAR where he co-received a CIGIE Audit Excellence award. Over 12 years of threat-intelligence experience. Holds a B.A. in International Affairs from The George Washington University.","source":1}
     ],
     "highlights":[
       {"text":"Co-recipient of the CIGIE Audit Excellence award for uncovering improper taxes at SIGAR.","source":3},
       {"text":"Speaker on Flashpoint webinar 'Retail Security Unwrapped'.","source":2}
     ],
     "funFacts":[
       {"text":"Published a GWU study-abroad journal from Costa Rica.","source":6}
     ],
     "researchNotes":[
       {"text":"Flashpoint targets Fortune 500 security and fraud teams.","source":5}
     ]
   }`;
   
     const template = `{
     "executive":[{"text":"","source":1}],
     "highlights":[{"text":"","source":1}],
     "funFacts":[{"text":"","source":1}],
     "researchNotes":[{"text":"","source":1}]
   }`;
   
     const prompt = `
   Return ONLY JSON matching TEMPLATE.
   Follow EXAMPLE style and grammar.
   Do NOT pull content from SOCIAL_LINKS.
     
   ### TEMPLATE
   ${template}
   
   ### EXAMPLE
   ${example}
   
   ### EMPLOYMENT TIMELINE
   ${jobTimeline.join("\n")}
   
   ### SOURCES
   ${srcBlock}`.trim();
   
     /* 8 — LLM */
     const llm = await ai.chat.completions.create({
       model: MODEL_ID,
       temperature: 0,
       messages: [{ role: "user", content: prompt }],
     });
   
     let data: JsonBrief = {
       executive: [],
       highlights: [],
       funFacts: [],
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
     const htmlBrief = `
   ${toHtml(name, org, data, citations, jobTimeline)}
   <p>&nbsp;</p>
   <h3><strong>Possible Social Links</strong></h3>
   ${ulSocial(possibleSocialLinks)}`.trim();
   
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