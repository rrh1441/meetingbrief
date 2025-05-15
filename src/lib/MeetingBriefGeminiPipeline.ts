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
   const MODEL_ID = "gpt-4.1-mini-2025-04-14"; // Verify this is your intended and available model
   const SERPER = "https://google.serper.dev/search";
   const FIRE = "https://api.firecrawl.dev/v1/scrape";
   const CURL = "https://nubela.co/proxycurl/api/v2/linkedin";
   const MAX_SRC = 15; // Max sources to feed into the LLM
   
   /* ── TYPES ---------------------------------------------------------------- */
   interface SerpResult { title: string; link: string; snippet?: string } // Changed from Serp to avoid confusion
   interface FirecrawlScrapeResult { article?: { text_content?: string } } // Changed from Fire
   interface Ymd { year?: number }
   interface LinkedInExperience { company?: string; title?: string; starts_at?: Ymd; ends_at?: Ymd } // Changed from Exp
   interface ProxyCurlResult { headline?: string; experiences?: LinkedInExperience[] } // Changed from Curl
   
   interface BriefRow { text: string; source: number } // Changed from Row
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
     snippet: string; // Using the scraped extract as the snippet for citation context
   }
   export interface MeetingBriefPayload {
     brief: string; // This will be an HTML string
     citations: Citation[];
     tokens: number;
     searches: number; // Number of Serper API calls made
     searchResults: { url: string; title: string; snippet: string }[]; // Using extracts for snippets here too
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
     org: string,
   ): Promise<MeetingBriefPayload> {
     let serperQueryCount = 0;
     let allSerpResults: SerpResult[] = [];
   
     // 1. Define Serper queries
     const serperQueries = [
       { q: `"${name}" "${org}" OR "${name}" "linkedin.com/in/"`, num: 10 }, // Primary query for general info and LinkedIn
       { q: `"${name}" "${org}" (achievements OR awards OR speaker OR panelist OR author OR published)`, num: 7 },
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
         // Continue with other queries if one fails
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
           linkedInProfile = liSearch.organic.find(s => s.link.includes("linkedin.com/in/")) || liSearch.organic[0]; // Take the best LI match or first result
           if (linkedInProfile) allSerpResults.push(linkedInProfile); // Add to allSerpResults if found and not already there
         }
       } catch (error) {
         console.warn(`Dedicated LinkedIn Serper query failed:`, error);
       }
     }
   
     if (!linkedInProfile || !linkedInProfile.link) {
       throw new Error(`LinkedIn profile not found for ${name}. ProxyCurl step cannot proceed.`);
     }
   
     // 4. ProxyCurl for LinkedIn data
     const curlResponse = await fetch(
       `${CURL}?linkedin_profile_url=${encodeURIComponent(linkedInProfile.link)}`,
       { headers: { Authorization: `Bearer ${PROXYCURL_KEY!}` } }
     );
     if (!curlResponse.ok) {
       const errorText = await curlResponse.text();
       throw new Error(`ProxyCurl error! status: ${curlResponse.status}, body: ${errorText}`);
     }
     const proxyCurlData = await curlResponse.json() as ProxyCurlResult;
   
     const jobTimeline = (proxyCurlData.experiences ?? []).map(e =>
       `${e.title ?? "Role"} — ${e.company ?? "Company"} (${span(e.starts_at, e.ends_at)})`);
   
     // 5. Prepare source list for scraping and LLM
     // Add LinkedIn profile to the top of the list if it's not already effectively there from serp results
     const uniqueSerpResults = Array.from(new Map(allSerpResults.map(item => [item.link, item])).values());
     
     let finalSourcesInput: SerpResult[] = [linkedInProfile, ...uniqueSerpResults]
         .filter((s, i, self) => s && s.link && self.findIndex(t => t.link === s.link) === i) // Ensure unique and valid
         .slice(0, MAX_SRC);
   
   
     // 6. Scrape text from sources
     const extracts: string[] = [];
     for (const s of finalSourcesInput) {
       if (s.link.includes("linkedin.com/in/")) {
         // For LinkedIn, use ProxyCurl data and the link itself
         extracts.push(`LinkedIn Profile for ${name}. Headline: ${proxyCurlData.headline ?? "N/A"}. Profile URL: ${s.link}. Experience summary: ${jobTimeline.slice(0,3).join("; ")}`);
       } else {
         try {
           const firecrawlResult = await postJSON<FirecrawlScrapeResult>(
             FIRE, { url: s.link, page_options: { only_main_content: true, include_html: false } }, // Ensure include_html: false
             { Authorization: `Bearer ${FIRECRAWL_KEY!}` }
           );
           extracts.push((firecrawlResult.article?.text_content ?? `${s.title}. ${s.snippet ?? ""}`).slice(0, 2500)); // Increased slice for more context
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
       {"text":"Sales Director at Flashpoint since 2024, previously Performance Analyst at SIGAR. Over 12 years of threat-intelligence experience. Holds a B.A. in International Affairs from The George Washington University.","source":1}
     ],
     "highlights":[
       {"text":"Co-recipient of a CIGIE Audit Excellence award for uncovering improper taxes while at SIGAR.","source":3},
       {"text":"Speaker on Flashpoint webinar 'Retail Security Unwrapped: Strategies to Prevent Retail Theft and Fraud'.","source":1},
       {"text":"Mentioned in connection with Flashpoint's work on mitigating executive risks.","source":2}
     ],
     "funFacts":[
       {"text":"Published a GWU study-abroad travel journal from Costa Rica.","source":6},
       {"text":"Active on X (formerly Twitter) with handle @rheger7, tweeting about cybersecurity and sports.","source":7}
     ],
     "researchNotes":[
       {"text":"Flashpoint’s sales function targets Fortune 500 security, fraud, and intel teams.","source":5},
       {"text":"One webinar topic included 'Key retail theft and fraud trends to monitor and prepare for this holiday season'.","source":1},
       {"text":"Conversation starter: Ask about key takeaways from his 'Think Like a Threat Actor: How To Mitigate Executive Risks' webinar.","source":2}
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
   RULE D: Use the ### EMPLOYMENT TIMELINE for context and factual data for roles, companies, and dates when synthesizing the executive summary or job history details.
   
   ### DETAILED INSTRUCTIONS FOR EACH JSON FIELD:
   
   * **"executive"**: Create a concise overview (around 2-4 key sentences). Include:
       * Current role, company, and start year (e.g., "Sales Director at Flashpoint since 2024").
       * Brief mention of 1-2 significant prior roles and their companies (e.g., "previously Performance Analyst at SIGAR").
       * If explicitly mentioned and clearly attributable, total years of relevant experience (e.g., "Over 12 years of threat-intelligence experience.").
       * One or two very significant, specific achievements or recognitions if clearly stated in sources (e.g., "Co-recipient of a CIGIE Audit Excellence award...").
       * Highest relevant education degree and university if clearly stated in sources like LinkedIn, official bios, or alumni pages (e.g., "Holds a B.A. in International Affairs from The George Washington University.").
   
   * **"highlights"**: List specific notable professional achievements, skills, and industry engagement. Aim for distinct points.
       * Specific awards or honors received with context (e.g., "CIGIE Audit Excellence awardee for uncovering multimillion-dollar tax overcharges..."). **Scan sources from targeted searches for award mentions, news articles, or bio pages.**
       * Unique or specialized skills/expertise if explicitly highlighted with clear context.
       * Significant projects, publications (e.g., "Published a study on X topic" or "Authored paper on Y subject"). **Check sources for author profiles, publication lists, or research mentions.**
       * Specific examples of industry engagement such as speaking roles at conferences/webinars (including event name and specific topic if available), or panel participation. (e.g., "Speaker on Flashpoint webinar 'Retail Security Unwrapped' covering retail theft and fraud trends."). Do not just say "active industry presence"; give the specific example and topic if found. **Scan sources for terms like "speaker," "panelist," "presentation," "webinar," and extract the event and topic.**
   
   * **"funFacts"**: List unique personal details, non-professional achievements, or explicitly stated public social media presence.
       * Specific hobbies, interests, or personal publications not directly tied to core professional work (e.g., "Published a GWU study-abroad travel journal..."). **Look for these in personal blogs, university alumni notes, or less formal profiles if found by targeted searches.**
       * Publicly stated social media presence IF a specific handle AND platform are explicitly mentioned in the sources (e.g., "Active on X (formerly Twitter) with handle @username, tweets about [topics]."). If no handle or platform is found, or if it's just a list of names on a generic social site, do not include it. **Prioritize finding actual handles and activity topics from profile pages or clear social media mentions.**
       * Other unique, publicly available, and light-hearted facts suitable for a professional brief, if clearly sourced.
   
   * **"researchNotes"**: Provide deeper context, supporting details for claims, and potential insights.
       * More detailed responsibilities or context for current/past key roles if available and insightful.
       * Relevant context about their current company or team's focus, or market positioning, if available (e.g., "Flashpoint’s sales function targets Fortune 500 security...").
       * Specific recent professional activities (from the last 1-2 years, if dates are available) not already covered in "highlights," including topics of discussions or contributions. (e.g., "Participated in 'Think Like a Threat Actor' webinar covering executive threat landscape.").
       * Potential conversation starters that are directly and reasonably inferred from specific, factual information found in the sourced material. (e.g., "Conversation starter: Ask about key takeaways from their 'Retail Security Unwrapped' webinar." or "Conversation starter: Inquire about their experience with [Specific Award/Project]."). Frame these as suggestions and ensure they are tied to concrete details from the sources. Avoid generic starters.
   
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
       // Provide a default empty structure on parse failure
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
       snippet: extracts[i].substring(0, 300) + (extracts[i].length > 300 ? "..." : ""), // Use a snippet of the extract
     }));
   
     // 11. HTML Generation
     const htmlBrief = renderToHtml(name, org, briefJson, finalCitations, jobTimeline);
   
     // 12. Payload
     return {
       brief: htmlBrief,
       citations: finalCitations,
       tokens: toks(prompt) + toks(JSON.stringify(briefJson)), // More accurate token count for response
       searches: serperQueryCount,
       searchResults: finalSourcesInput.map((s, i) => ({
         url: s.link,
         title: s.title,
         snippet: extracts[i].substring(0, 300) + (extracts[i].length > 300 ? "..." : ""),
       })),
     };
   }