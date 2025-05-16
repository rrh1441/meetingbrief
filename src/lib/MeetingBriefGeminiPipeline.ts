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
   interface SerpResult { title: string; link: string; snippet?: string }
   interface FirecrawlScrapeResult { article?: { text_content?: string } }
   interface Ymd { year?: number }
   interface LinkedInExperience { company?: string; title?: string; starts_at?: Ymd; ends_at?: Ymd }
   interface ProxyCurlResult { headline?: string; experiences?: LinkedInExperience[]; /* other standard fields */ }
   
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
     brief: string; // This will be an HTML string
     citations: Citation[];
     tokens: number;
     searches: number; // Number of Serper API calls made
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
     }).then(async r => {
       if (!r.ok) {
         const errorText = await r.text();
         throw new Error(`HTTP error! status: ${r.status}, message: ${errorText}, url: ${url}`);
       }
       return r.json() as Promise<T>;
     });
   
   const yr = (d?: Ymd | null): string => d?.year?.toString() ?? "?";
   const span = (s?: Ymd | null, e?: Ymd | null): string => `${yr(s)} – ${e ? yr(e) : "Present"}`;
   const toks = (s: string): number => Math.ceil(s.length / 4);
   
   const clean = (t: string): string =>
     t.replace(/\s*\(?\bsource\s*\d+\)?/gi, "").trim();
   
   const normalizeOrgName = (companyName: string): string => {
       if (!companyName) return "";
       return companyName
           .toLowerCase()
           .replace(/[,.]?\s*(inc|llc|ltd|gmbh|corp|corporation|limited|company|co)\s*$/i, '') // Remove common suffixes
           .replace(/[.,]/g, '') // Remove periods and commas
           .trim();
   };
   
   // ── Firecrawl wrapper with 10-second timeout ──────────────────────────────
   const scrapeWithTimeout = (url: string) =>
     Promise.race([
       postJSON<FirecrawlScrapeResult>(
         FIRE,
         { url, only_main_content: true, include_html: false },
         { Authorization: `Bearer ${FIRECRAWL_KEY!}` }
       ),
       new Promise<never>((_, reject) =>
         setTimeout(() => reject(new Error("timeout")), 10000)
       ),
     ]) as Promise<FirecrawlScrapeResult>;
   
   /* ── HTML RENDER ---------------------------------------------------------- */
   const formatHtmlSentences = (rows: BriefRow[], cites: Citation[]): string => {
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
     return `<ul class="list-disc pl-5">\n${listItems}\n</ul>`;
   };
   
   const formatHtmlBullets = (rows: BriefRow[], cites: Citation[]): string => {
     if (!rows || rows.length === 0) {
       return "";
     }
     const listItems = rows.map(r => {
       const citation = cites[r.source - 1];
       const citationLink = citation ? `<sup><a href="${citation.url}" target="_blank" rel="noopener noreferrer">${r.source}</a></sup>` : `<sup>[source ${r.source}]</sup>`;
       return `  <li>${clean(r.text)} ${citationLink}</li>`;
     }).join("\n");
     return `<ul class="list-disc pl-5">\n${listItems}\n</ul>`;
   };
   
   function renderToHtml(
     name: string,
     org: string,
     jsonData: JsonBrief,
     citations: Citation[],
     jobTimelineData: string[]
   ): string {
     const emptyParagraphForSpacing = "<p>&nbsp;</p>";
   
     const combinedHighlightsAndFunFacts: BriefRow[] = [
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
     org: string, // Current organization
   ): Promise<MeetingBriefPayload> {
     let serperQueryCount = 0;
     const allSerpResults: SerpResult[] = [];
   
     // 1. Define Serper queries with expanded keywords
     const serperQueries = [
       // Query 1: Core identity and LinkedIn (Essential, kept as is)
       { q: `"${name}" "${org}" OR "${name}" "linkedin.com/in/"`, num: 10 },
   
       // Query 2: Expanded Achievements, Publications, and Event Participation
       // Combines achievements with a broader range of event-related terms.
       { q: `"${name}" (achievement OR award OR "published work" OR author OR speaker OR panelist OR presenter OR keynote OR moderator OR "conference presentation" OR webinar OR forum OR seminar OR workshop OR "about page" OR biography OR profile OR "attendee list" OR "presented at" OR chaired OR masterclass OR discussion OR summit OR symposium OR convener OR delegate OR "roundtable discussion")`, num: 10 },
   
       // Query 3: News specifically linking person and current organization
       // Focuses on news, announcements, and thought leadership related to their current role.
       { q: `"${name}" "${org}" (interview OR profile OR news OR article OR "press release" OR "quoted in" OR featured OR announced OR statement OR commentary OR insights OR appointed OR partnership OR acquisition OR funding OR "thought leadership" OR "expert opinion")`, num: 7 },
   
       // Query 4: Broader professional news, contributions, and general online presence not strictly tied to the current org
       // Aims to catch other significant professional mentions.
       { q: `"${name}" (leads OR "industry expert" OR "discussion with" OR "roundtable on" OR develops OR launches OR "featured in article" OR "statement by" OR "opinion piece" OR "appointed to board")`, num: 7 },
   
       // Query 5: Education, social media, and personal details (Existing, kept as is)
       { q: `"${name}" (education OR university OR "X handle" OR "Twitter profile" OR "personal blog" OR hobbies)`, num: 7 },
     ];
   
     // 2. Execute Serper queries
     for (const query of serperQueries) {
       try {
         const results = await postJSON<{ organic?: SerpResult[] }>(
           SERPER, query, { "X-API-KEY": SERPER_KEY! }
         );
         serperQueryCount++;
         if (results.organic) {
           allSerpResults.push(...results.organic);
         }
       } catch (error) {
         console.warn(`Serper query failed for "${query.q}":`, error);
       }
     }
   
     // 3. Find LinkedIn profile
     let linkedInProfile = allSerpResults.find(s => s.link.includes("linkedin.com/in/"));
   
     if (!linkedInProfile) {
       console.warn("LinkedIn profile not found in initial combined searches. Trying dedicated LinkedIn search.");
       try {
         const liSearch = await postJSON<{ organic?: SerpResult[] }>(
           SERPER, { q: `"${name}" "linkedin.com/in/" OR "${name}" "${org}" linkedin`, num: 5 }, { "X-API-KEY": SERPER_KEY! }
         );
         serperQueryCount++;
         if (liSearch.organic && liSearch.organic.length > 0) {
           linkedInProfile = liSearch.organic.find(s => s.link.includes("linkedin.com/in/")) || liSearch.organic[0];
           if (linkedInProfile && !allSerpResults.some(s => s.link === linkedInProfile!.link)) {
               allSerpResults.push(linkedInProfile);
           }
         }
       } catch (error) {
         console.warn(`Dedicated LinkedIn Serper query failed:`, error);
       }
     }
   
     if (!linkedInProfile || !linkedInProfile.link) {
       throw new Error(`LinkedIn profile not found for ${name}. ProxyCurl step cannot proceed.`);
     }
   
     // 4. ProxyCurl for LinkedIn data - REVERTED TO STANDARD CALL
     const curlResponse = await fetch(
       `${CURL}?linkedin_profile_url=${encodeURIComponent(linkedInProfile.link)}`, // Standard ProxyCurl URL
       { headers: { Authorization: `Bearer ${PROXYCURL_KEY!}` } }
     );
   
     if (!curlResponse.ok) {
       const errorText = await curlResponse.text();
       throw new Error(`ProxyCurl error! status: ${curlResponse.status}, body: ${errorText}`);
     }
     const proxyCurlData = await curlResponse.json() as ProxyCurlResult;
   
     const jobTimeline = (proxyCurlData.experiences ?? []).map(e =>
       `${e.title ?? "Role"} — ${e.company ?? "Company"} (${span(e.starts_at, e.ends_at)})`);
   
     // 5. Prepare source list for scraping and LLM (NUANCED PRIORITIZATION LOGIC)
     const significantOrgNames: string[] = [org];
     proxyCurlData.experiences?.forEach(exp => {
         if (exp.company && !significantOrgNames.some(o => normalizeOrgName(o) === normalizeOrgName(exp.company!))) {
             significantOrgNames.push(exp.company);
         }
     });
     const normalizedSignificantOrgNames = significantOrgNames.map(normalizeOrgName).filter(name => name.length > 1);
   
     const allInitiallyDedupedSerpResults = Array.from(new Map(allSerpResults.map(item => [item.link, item])).values());
     const otherSerpResults = allInitiallyDedupedSerpResults.filter(s => s.link !== linkedInProfile!.link);
   
     const achievementKeywords = ["award", "prize", "honor", "recognition", "achievement", "speaker", "panelist", "webinar", "conference", "presentation", "author", "published", "paper", "study", "interview", "keynote", "medal", "fellowship", "laureate", "bio", "profile", "executive profile"];
   
     const category1_LinkedIn = [linkedInProfile!];
     const category2_AchievementsWithAnyListedOrg: SerpResult[] = [];
     const category3_MentionsWithAnyListedOrg: SerpResult[] = [];
     const category4_GeneralAchievements: SerpResult[] = [];
     const category5_OtherSources: SerpResult[] = [];
   
     const personNameKeywords = name.toLowerCase().split(' ').filter(n => n.length > 2);
   
     otherSerpResults.forEach(s => {
         if (!s || !s.link || !s.title) {
             if(s) category5_OtherSources.push(s);
             return;
         }
   
         const linkText = `${s.title.toLowerCase()} ${s.snippet?.toLowerCase() || ''} ${s.link.toLowerCase()}`;
         const nameInLinkText = personNameKeywords.some(namePart => linkText.includes(namePart));
   
         if (!nameInLinkText) {
             category5_OtherSources.push(s);
             return;
         }
   
         const isAchievementRelated = achievementKeywords.some(keyword => linkText.includes(keyword));
         let mentionedOrgNormalized: string | null = null;
   
         for (const normOrgName of normalizedSignificantOrgNames) {
             if (normOrgName && linkText.includes(normOrgName)) {
                 mentionedOrgNormalized = normOrgName;
                 break;
             }
         }
   
         if (isAchievementRelated && mentionedOrgNormalized) {
             category2_AchievementsWithAnyListedOrg.push(s);
         } else if (mentionedOrgNormalized) {
             category3_MentionsWithAnyListedOrg.push(s);
         } else if (isAchievementRelated) {
             category4_GeneralAchievements.push(s);
         } else {
             category5_OtherSources.push(s);
         }
     });
   
     const thoughtfullyPrioritizedList: SerpResult[] = [
         ...category1_LinkedIn,
         ...category2_AchievementsWithAnyListedOrg,
         ...category3_MentionsWithAnyListedOrg,
         ...category4_GeneralAchievements,
         ...category5_OtherSources
     ];
   
     const finalSourcesInput: SerpResult[] = thoughtfullyPrioritizedList
         .filter((s, i, self) => s && s.link && self.findIndex(t => t.link === s.link) === i)
         .slice(0, MAX_SRC);
   
     // 6. Scrape text from sources
     const extracts: string[] = [];
     for (const s of finalSourcesInput) {
       if (s.link.includes("linkedin.com/in/")) {
         const linkedInExtract = `LinkedIn Profile for ${name}. Headline: ${proxyCurlData.headline ?? "N/A"}. Profile URL: ${s.link}. Experience summary: ${jobTimeline.slice(0,5).join("; ")}.`;
         extracts.push(linkedInExtract);
       } else if (FIRECRAWL_SKIP_SUBSTRINGS.some(sub => s.link.includes(sub))) {
         // Short-circuit: use Serper title/snippet and skip Firecrawl scrape
         extracts.push(`${s.title}. ${s.snippet ?? ""}`);
       } else {
         try {
           const firecrawlResult = await scrapeWithTimeout(s.link);
           extracts.push((firecrawlResult.article?.text_content ?? `${s.title}. ${s.snippet ?? ""}`).slice(0, 3000));
         } catch (scrapeError: unknown) {
           const errorMessage = scrapeError instanceof Error ? scrapeError.message : "An unknown error occurred";
           console.warn(`Failed to scrape ${s.link}: ${errorMessage}`);
           extracts.push(`${s.title}. ${s.snippet ?? ""} (Content not fully scraped).`);
         }
       }
     }
   
     // 7. Construct LLM Prompt
     const srcBlock = finalSourcesInput.map((s, i) =>
       `SOURCE_${i + 1} URL: ${s.link}\nCONTENT:\n${extracts[i]}`).join("\n\n---\n\n");
   
     const template = `{
     "executive":      [{"text":"","source":1}],
     "highlights":     [{"text":"","source":1}],
     "funFacts":       [{"text":"","source":1}],
     "researchNotes":  [{"text":"","source":1}]
   }`;
   
     const example = `// GOOD EXAMPLE OF STRUCTURE AND CONTENT STYLE:
   {
     "executive":[
       {"text":"Sales Director at Flashpoint since 2024, previously Performance Analyst at SIGAR where he co-received a CIGIE Audit Excellence award. Over 12 years of threat-intelligence experience. Holds a B.A. in International Affairs from The George Washington University.","source":1}
     ],
     "highlights":[
       {"text":"Co-recipient of a CIGIE Audit Excellence award for uncovering improper taxes while at SIGAR.","source":3},
       {"text":"Speaker on Flashpoint webinar 'Retail Security Unwrapped: Strategies to Prevent Retail Theft and Fraud'.","source":2},
       {"text":"Authored a study on geopolitical risk factors impacting supply chains during his tenure at a prior advisory firm.","source":4}
     ],
     "funFacts":[
       {"text":"Published a GWU study-abroad travel journal from Costa Rica.","source":6},
       {"text":"Active on X (formerly Twitter) with handle @rheger7, tweeting about cybersecurity and international affairs.","source":7}
     ],
     "researchNotes":[
       {"text":"The CIGIE award recognized work related to financial oversight in Afghanistan reconstruction efforts.","source":3},
       {"text":"Flashpoint’s sales function targets Fortune 500 security, fraud, and intel teams.","source":5},
       {"text":"Conversation starter: Ask about the key challenges in transitioning from public sector analysis (SIGAR) to private sector threat intelligence sales (Flashpoint).","source":1}
     ]
   }
   // Ensure all text fields are plain sentences and correctly cite a source.`;
   
     const prompt = `
   Return **only** JSON matching the template.
   The "text" field MUST be a plain sentence or concise statement. Do not use markdown (e.g., bolding, italics, lists) within the "text" field.
   All years should be in YYYY format.
   
   RULE A: "text" MUST NOT contain the word "source", brackets, or parenthetical
           numbers referring to sources (e.g., "(source 3)") inside the text itself. The source number is a separate field.
   RULE B: Each array item MUST have both "text" (plain sentence) and "source"
           (1-based index of SOURCE_N from the ### SOURCES block).
   RULE C: Base all information strictly on the provided ### SOURCES. Do not invent or infer information beyond what is stated. If a detail isn't in the sources, do not include it.
   RULE D: Use the ### EMPLOYMENT TIMELINE for context and factual data for roles, companies, and dates when synthesizing the executive summary or job history details. Prioritize achievements and specific contributions from ANY relevant past or current role if found in sources.
   
   ### DETAILED INSTRUCTIONS FOR EACH JSON FIELD:
   
   * **"executive"**: Create a concise overview (around 2-4 key sentences). Include:
       * Current role, company, and start year.
       * Briefly mention 1-2 significant prior roles and their companies, especially if associated with a key achievement found in sources (e.g., "previously Performance Analyst at SIGAR where he co-received a CIGIE Audit Excellence award").
       * If explicitly mentioned, total years of relevant experience.
       * One or two very significant, specific achievements or recognitions from any point in their career if clearly stated in sources.
       * Highest relevant education degree and university.
   
   * **"highlights"**: List specific notable professional achievements, skills, and industry engagement from any point in their career. Aim for distinct points.
       * Specific awards or honors received with context (e.g., "CIGIE Audit Excellence awardee for work at SIGAR..."). **Scan all sources, especially those prioritized for achievements, for these details.**
       * Significant projects, publications (e.g., "Authored paper on Y subject while at Z company").
       * Specific examples of industry engagement such as speaking roles (event name, topic, and associated organization if available).
   
   * **"funFacts"**: List unique personal details, non-professional achievements, or explicitly stated public social media presence.
       * Specific hobbies, interests, or personal publications.
       * Publicly stated social media presence IF a specific handle AND platform AND general topic of discussion are explicitly mentioned.
   
   * **"researchNotes"**: Provide deeper context, supporting details for claims, and potential insights.
       * More detailed context for key achievements or roles (current or past).
       * Relevant context about their current company's focus, or significant past projects/initiatives.
       * Potential conversation starters based on specific, factual information found (e.g., relating to a past award, a significant project, or a transition between notable roles).
   
   ${example}
   
   ### EMPLOYMENT TIMELINE (for context and factual data from LinkedIn Profile)
   ${jobTimeline.join("\n")}
   
   ### SOURCES
   ${srcBlock}
   
   ### TEMPLATE (fill this structure)
   \`\`\`json
   ${template}
   \`\`\``.trim();
   
     // 8. LLM Call
     const llmResponse = await ai.chat.completions.create({
       model: MODEL_ID,
       temperature: 0.1,
       response_format: { type: "json_object" },
       messages: [{ role: "user", content: prompt }],
     });
   
     let briefJson: JsonBrief;
     try {
       const content = llmResponse.choices[0].message.content;
       if (!content) throw new Error("AI returned empty content");
       briefJson = JSON.parse(content);
     } catch (e: unknown) {
       console.error("Bad JSON from AI:", llmResponse.choices[0]?.message?.content ?? "No content in response");
       if (e instanceof Error) {
         console.error("Error parsing JSON:", e.message);
       } else {
         console.error("Error parsing JSON: An unknown error occurred");
       }
       briefJson = { executive: [], highlights: [], funFacts: [], researchNotes: [] };
     }
   
     // 9. Validate / Dedupe JSON content
     const fix = (rows?: BriefRow[]): BriefRow[] => {
       if (!rows || !Array.isArray(rows)) return [];
       return Array.from(
         new Map(
           rows
             .filter(r => r && typeof r.text === 'string' && r.text.trim() !== "" && typeof r.source === 'number' && r.source >= 1 && r.source <= finalSourcesInput.length)
             .map(r => [clean(r.text).toLowerCase(), { text: clean(r.text), source: r.source }])
         ).values()
       );
     };
   
     briefJson.executive = fix(briefJson.executive);
     briefJson.highlights = fix(briefJson.highlights);
     briefJson.funFacts = fix(briefJson.funFacts);
     briefJson.researchNotes = fix(briefJson.researchNotes);
   
     // 10. Citations
     const finalCitations: Citation[] = finalSourcesInput.map((s, i) => ({
       marker: `[${i + 1}]`,
       url: s.link,
       title: s.title,
       snippet: extracts[i].substring(0, 300) + (extracts[i].length > 300 ? "..." : ""),
     }));
   
     // 11. HTML Generation
     const htmlBrief = renderToHtml(name, org, briefJson, finalCitations, jobTimeline);
   
     // 12. Payload
     return {
       brief: htmlBrief,
       citations: finalCitations,
       tokens: toks(prompt) + toks(JSON.stringify(briefJson)),
       searches: serperQueryCount,
       searchResults: finalSourcesInput.map((s, i) => ({
         url: s.link,
         title: s.title,
         snippet: extracts[i].substring(0, 300) + (extracts[i].length > 300 ? "..." : ""),
       })),
     };
   }