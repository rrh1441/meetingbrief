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

/* ── ENV ────────────────────────────────────────────────────────────────── */
const {
  OPENAI_API_KEY,
  SERPER_KEY,
  FIRECRAWL_KEY,
  PROXYCURL_KEY,
} = process.env;

if (!OPENAI_API_KEY || !SERPER_KEY || !FIRECRAWL_KEY || !PROXYCURL_KEY) {
  console.error("CRITICAL ERROR: Missing one or more API keys (OPENAI, SERPER, FIRECRAWL, PROXYCURL). Application will not function correctly.");
  // Depending on deployment, you might throw an error here or handle it gracefully
  // For now, we'll log and let it proceed, but calls will fail if keys are truly missing.
}


/* ── CONSTANTS ──────────────────────────────────────────────────────────── */
const MODEL_ID = "gpt-4.1-mini-2025-04-14"; // Ensure this model identifier is current
const SERPER_API_URL = "https://google.serper.dev/search";
const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape";
const PROXYCURL_API_URL = "https://nubela.co/proxycurl/api/v2/linkedin";
const MAX_SOURCES_TO_LLM = 25;       // max sources fed to LLM
const FIRECRAWL_BATCH_SIZE = 10;     // parallel requests per batch
const FIRECRAWL_GLOBAL_BUDGET_MS = 35_000; // global time budget for all Firecrawl work

/* ── DOMAIN RULES ───────────────────────────────────────────────────────── */
const SOCIAL_DOMAINS_TO_AVOID_SCRAPING = [
  "x.com/",
  "twitter.com/",
  "mastodon.social/",
  "facebook.com/",
  "fb.com/",
  "instagram.com/",
];
const GENERIC_DOMAINS_TO_AVOID_SCRAPING = [
  // These googleusercontent links are often for cached AMP pages or similar, might not be valuable for direct scraping.
  // However, YouTube itself can be valuable, so this might need refinement based on specific needs.
  "youtube.com/",
  "youtu.be/",
  "reddit.com/", // Reddit has strict scraping policies; better to use API if possible or just snippets.
  "linkedin.com/pulse/", // LinkedIn articles can be scraped, but profiles are handled by ProxyCurl.
  "linkedin.com/posts/", // Individual posts might be hard to get context from.
];
const NO_SCRAPE_DOMAINS = [...SOCIAL_DOMAINS_TO_AVOID_SCRAPING, ...GENERIC_DOMAINS_TO_AVOID_SCRAPING];

/* ── TYPES ──────────────────────────────────────────────────────────────── */
interface SerpResult { title: string; link: string; snippet?: string }
interface FirecrawlScrapeV1Result { // Specific to /v1/scrape
    success: boolean;
    data?: { // This is the structure if success is true
        content: string; // HTML content
        markdown: string;
        text_content: string; // Cleaned text content
        metadata: {
            title?: string;
            description?: string;
            language?: string;
            keywords?: string;
            author?: string;
            // ... and other metadata fields
        };
        article?: { // This field seems to be what the original code was targeting
            title?: string;
            author?: string;
            publishedDate?: string;
            text_content?: string; // Content of the main article
        };
    };
    error?: string; // Error message if success is false
    status?: number; // HTTP status code from Firecrawl
}

interface YearMonthDay { year?: number; month?: number; day?: number; } // For ProxyCurl dates
interface LinkedInExperience { company?: string; title?: string; starts_at?: YearMonthDay; ends_at?: YearMonthDay }
interface ProxyCurlResult {
  public_identifier?: string;
  profile_pic_url?: string;
  background_cover_image_url?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  occupation?: string; // This is often the headline
  headline?: string;
  summary?: string;
  country_full_name?: string;
  city?: string;
  state?: string;
  experiences?: LinkedInExperience[];
  // ... and many other fields from ProxyCurl
}

interface BriefRow { text: string; source: number } // Source is 1-indexed
interface JsonBriefFromLLM {
  executive: BriefRow[];
  highlights: BriefRow[];
  funFacts: BriefRow[];
  researchNotes: BriefRow[];
}
export interface Citation {
  marker: string; // e.g., "[1]"
  url: string;
  title: string;
  snippet: string; // Usually the SERP snippet or start of scraped text
}
export interface MeetingBriefPayload {
  brief: string; // HTML formatted brief
  citations: Citation[];
  tokensUsed: number;
  serperSearchesMade: number;
  proxycurlCallsMade: number;
  firecrawlAttempts: number;
  firecrawlSuccesses: number;
  finalSourcesConsidered: { url: string; title: string; processed_snippet: string }[];
  possibleSocialLinks: string[];
}

/* ── HELPERS ────────────────────────────────────────────────────────────── */
const ai = new OpenAI({ apiKey: OPENAI_API_KEY! });

const postJSON = async <T>(
  url: string,
  body: unknown,
  headers: Record<string, string>,
  method: "POST" | "GET" = "POST", // Allow GET for ProxyCurl if needed (though it's often GET with params in URL)
): Promise<T> => {
  const options: RequestInit = {
    method: method,
    headers: { ...headers, "Content-Type": "application/json" },
  };
  if (method === "POST") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`HTTP Error ${response.status} for ${method} ${url}: ${errorText.slice(0, 500)}`);
    throw new Error(`HTTP ${response.status} – ${errorText}`);
  }
  return response.json() as Promise<T>;
};


const formatYear = (date?: YearMonthDay): string => date?.year?.toString() ?? "?";
const formatJobSpan = (startDate?: YearMonthDay, endDate?: YearMonthDay): string =>
  `${formatYear(startDate)} – ${endDate ? formatYear(endDate) : "Present"}`;

const estimateTokens = (text: string): number => Math.ceil((text || "").length / 3.5); // Refined average
const cleanLLMOutputText = (text: string): string => text.replace(/\s*\(?\s*source\s*\d+\s*\)?/gi, "").trim(); // Removes "(source N)"

const normalizeCompanyName = (companyName: string): string =>
  companyName
    .toLowerCase()
    .replace(/[,.]?\s*(inc|llc|ltd|gmbh|corp|corporation|limited|company|co)\s*$/i, "")
    .replace(/[.,]/g, "")
    .trim();

/* ── Firecrawl with Logging and Retry ───────────────────────────────────── */
let firecrawlAttempts = 0;
let firecrawlSuccesses = 0;

const firecrawlWithLogging = async (url: string, attemptInfo: string): Promise<string | null> => {
  firecrawlAttempts++;
  const tryScrapeOnce = async (timeoutMs: number): Promise<string | null> => {
    try {
      console.log(`[Firecrawl Attempt] ${attemptInfo} - URL: ${url}, Timeout: ${timeoutMs}ms`);
      // Using /v1/scrape which expects { url } in body and returns { ... article: { text_content: ... } }
      const response = await Promise.race([
        postJSON<FirecrawlScrapeV1Result>(
          FIRECRAWL_API_URL, // This is https://api.firecrawl.dev/v1/scrape
          { url }, // Body for /v1/scrape
          { Authorization: `Bearer ${FIRECRAWL_KEY!}` }
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);

      if (response && response.success && response.data?.article && typeof response.data.article.text_content === 'string') {
        console.log(`[Firecrawl Success] ${attemptInfo} - URL: ${url}. Got text_content (length: ${response.data.article.text_content.length})`);
        firecrawlSuccesses++;
        return response.data.article.text_content;
      } else if (response && response.success && response.data && !response.data.article?.text_content) {
         // Success true, but no article.text_content. Could be from metadata only or other fields.
         // For this pipeline, we need text_content. Try markdown as a fallback from data if v1 provides.
         const fallbackText = response.data.markdown || response.data.text_content; // Generic text_content if not in article
         if (fallbackText) {
            console.warn(`[Firecrawl PartialSuccess] ${attemptInfo} - URL: ${url}. No article.text_content, but found other text (length: ${fallbackText.length}). Using that.`);
            firecrawlSuccesses++; // Count as success if we get some text
            return fallbackText;
         }
        console.warn(`[Firecrawl NoContent] ${attemptInfo} - URL: ${url}. Response success true but no usable text_content or markdown. Full Response: ${JSON.stringify(response).slice(0,300)}`);
        return null;
      } else if (response && !response.success) {
        console.error(`[Firecrawl API Error] ${attemptInfo} - URL: ${url}. Error: ${response.error || 'Unknown Firecrawl error'}. Status: ${response.status || 'N/A'}`);
        return null;
      } else {
        // This case should ideally not be reached if response structure is as expected or error is thrown.
        console.warn(`[Firecrawl OddResponse] ${attemptInfo} - URL: ${url}. Unexpected response structure: ${JSON.stringify(response).slice(0,300)}`);
        return null;
      }
    } catch (error: any) {
      console.error(`[Firecrawl Exception] ${attemptInfo} - URL: ${url}, Timeout: ${timeoutMs}ms. Error: ${error.message}`, error.stack ? `\nStack: ${error.stack.slice(0,300)}` : '');
      return null;
    }
  };

  let content = await tryScrapeOnce(7000); // Initial attempt with 7s timeout
  if (content === null) {
    console.warn(`[Firecrawl Retry] First attempt failed for ${url} (${attemptInfo}). Retrying with longer timeout.`);
    content = await tryScrapeOnce(15000); // Retry with 15s timeout
    if (content === null) {
      console.error(`[Firecrawl FailedAllAttempts] URL: ${url} (${attemptInfo}).`);
    }
  }
  return content;
};

/* ── HTML Rendering Helpers ─────────────────────────────────────────────── */
const renderParagraphsWithCitations = (rows: BriefRow[], citations: Citation[]): string =>
  rows
    .map(row => {
      const citation = citations[row.source - 1]; // source is 1-indexed
      const supLink = citation
        ? `<sup><a href="${citation.url}" target="_blank" rel="noopener noreferrer" title="${citation.title.replace(/"/g, '&quot;')}">${row.source}</a></sup>`
        : `<sup>[${row.source}]</sup>`;
      return `<p>${cleanLLMOutputText(row.text)} ${supLink}</p>`;
    })
    .join("\n");

const renderUnorderedListWithCitations = (rows: BriefRow[], citations: Citation[]): string =>
  rows.length
    ? `<ul class="list-disc pl-5">\n${rows
        .map(row => {
          const citation = citations[row.source - 1]; // source is 1-indexed
          const supLink = citation
            ? `<sup><a href="${citation.url}" target="_blank" rel="noopener noreferrer" title="${citation.title.replace(/"/g, '&quot;')}">${row.source}</a></sup>`
            : `<sup>[${row.source}]</sup>`;
          return `  <li>${cleanLLMOutputText(row.text)} ${supLink}</li>`;
        })
        .join("\n")}\n</ul>`
    : "";

const renderJobHistoryList = (jobTimeline: string[]): string =>
  jobTimeline.length
    ? `<ul class="list-disc pl-5">\n${jobTimeline.map(job => `  <li>${job}</li>`).join("\n")}\n</ul>`
    : "<p>No job history available from LinkedIn profile.</p>";

const renderFullHtmlBrief = (
  targetName: string,
  targetOrg: string,
  llmJsonBrief: JsonBriefFromLLM,
  citationsList: Citation[],
  jobHistory: string[],
): string => {
  const sectionSpacer = "<p> </p>";
  return `
<div>
  <h2><strong>Meeting Brief: ${targetName} – ${targetOrg}</strong></h2>
${sectionSpacer}<h3><strong>Executive Summary</strong></h3>
${renderParagraphsWithCitations(llmJsonBrief.executive, citationsList)}
${sectionSpacer}<h3><strong>Job History</strong></h3>
${renderJobHistoryList(jobHistory)}
${sectionSpacer}<h3><strong>Highlights & Fun Facts</strong></h3>
${renderUnorderedListWithCitations([...(llmJsonBrief.highlights || []), ...(llmJsonBrief.funFacts || [])], citationsList)}
${sectionSpacer}<h3><strong>Detailed Research Notes</strong></h3>
${renderUnorderedListWithCitations(llmJsonBrief.researchNotes, citationsList)}
</div>`.trim().replace(/^\s*\n/gm, ""); // Clean up extra newlines
};

/* ── MAIN FUNCTION ──────────────────────────────────────────────────────── */
export async function buildMeetingBriefGemini(
  name: string,
  org: string,
): Promise<MeetingBriefPayload> {
  // Reset counters for each run if this function can be called multiple times in one server instance
  firecrawlAttempts = 0;
  firecrawlSuccesses = 0;
  let serperCallsMade = 0;
  let proxycurlCallsMade = 0;

  const startTime = Date.now();
  const collectedSerpResults: SerpResult[] = [];

  /* ── 1. Initial Serper queries for general info & LinkedIn ───────────── */
  console.log(`[MB Step 1] Running initial Serper queries for "${name}" and "${org}"`);
  const initialQueries = [
    { q: `"${name}" "${org}" OR "${name}" "linkedin.com/in/"`, num: 10, type: "main" },
    { q: `"${name}" "${org}" (interview OR profile OR news OR "press release" OR biography)`, num: 10, type: "news_profile" },
    { q: `"${name}" (award OR recognition OR keynote OR webinar OR conference OR patent OR publication)`, num: 10, type: "achievements" },
  ];

  for (const query of initialQueries) {
    try {
      const response = await postJSON<{ organic?: SerpResult[] }>(
        SERPER_API_URL,
        { q: query.q, num: query.num },
        { "X-API-KEY": SERPER_KEY! },
      );
      serperCallsMade++;
      if (response.organic) collectedSerpResults.push(...response.organic);
    } catch (e: any) {
      console.warn(`[MB Step 1] Serper query failed for "${query.q}". Error: ${e.message}`);
    }
  }

  /* ── 2. Ensure LinkedIn profile is found ──────────────────────────────── */
  let linkedInProfileResult = collectedSerpResults.find(r => r.link.includes("linkedin.com/in/"));
  if (!linkedInProfileResult) {
    console.log(`[MB Step 2] LinkedIn profile not in initial results. Dedicated search for "${name}".`);
    try {
      const response = await postJSON<{ organic?: SerpResult[] }>(
        SERPER_API_URL,
        { q: `"${name}" "linkedin.com/in/" site:linkedin.com`, num: 5 }, // More targeted
        { "X-API-KEY": SERPER_KEY! },
      );
      serperCallsMade++;
      if (response.organic?.length) {
        linkedInProfileResult = response.organic[0];
        collectedSerpResults.push(linkedInProfileResult); // Add to general pool if found
        console.log(`[MB Step 2] Found LinkedIn profile via dedicated search: ${linkedInProfileResult.link}`);
      }
    } catch (e: any) {
      console.warn(`[MB Step 2] LinkedIn dedicated Serper search failed. Error: ${e.message}`);
    }
  }

  if (!linkedInProfileResult?.link) {
    console.error(`[MB Critical] LinkedIn profile NOT FOUND for ${name}. Brief quality will be impacted.`);
    // Decide on fallback: throw error, or proceed with limited data?
    // For now, we'll proceed, but ProxyCurl call will fail or be skipped.
    // throw new Error(`LinkedIn profile not found for ${name}. Cannot proceed with ProxyCurl.`);
  }

  /* ── 3. ProxyCurl for LinkedIn Profile Data ───────────────────────────── */
  let proxyCurlData: ProxyCurlResult | null = null;
  let jobHistoryTimeline: string[] = [];
  if (linkedInProfileResult?.link) {
    console.log(`[MB Step 3] Fetching ProxyCurl data for LinkedIn URL: ${linkedInProfileResult.link}`);
    try {
      proxyCurlData = await fetch(
        `${PROXYCURL_API_URL}?url=${encodeURIComponent(linkedInProfileResult.link)}&fallback_to_cache=on-error&use_cache=if-present`,
        { headers: { Authorization: `Bearer ${PROXYCURL_KEY!}` } },
      ).then(async res => {
          proxycurlCallsMade++;
          if (!res.ok) {
            const errorText = await res.text();
            console.error(`[MB Step 3] ProxyCurl API Error ${res.status} for ${linkedInProfileResult?.link}: ${errorText.slice(0,500)}`);
            return null;
          }
          return res.json() as Promise<ProxyCurlResult>;
      });

      if (proxyCurlData) {
        jobHistoryTimeline = (proxyCurlData.experiences ?? []).map(
          exp =>
            `${exp.title ?? "Role"} — ${exp.company ?? "Company"} (${formatJobSpan(
              exp.starts_at,
              exp.ends_at,
            )})`,
        );
      }
    } catch (e: any) {
      console.error(`[MB Step 3] ProxyCurl call failed. Error: ${e.message}`);
    }
  } else {
    console.warn("[MB Step 3] Skipped ProxyCurl: No LinkedIn profile URL found.");
  }


  /* ── 4. Additional Serper queries for prior organizations ────────────── */
  if (proxyCurlData?.experiences) {
    console.log(`[MB Step 4] Running additional Serper queries for prior organizations of "${name}".`);
    const priorCompanies = (proxyCurlData.experiences ?? [])
      .map(exp => exp.company)
      .filter((company): company is string => !!company); // Type guard

    const uniquePriorCompanies = priorCompanies
      .filter(
        (company, index, self) =>
          index === self.findIndex(c => normalizeCompanyName(c) === normalizeCompanyName(company)) && // Deduplicate
          normalizeCompanyName(company) !== normalizeCompanyName(org), // Not the current org
      )
      .slice(0, 3); // Max 3 prior companies to query

    for (const company of uniquePriorCompanies) {
      try {
        const response = await postJSON<{ organic?: SerpResult[] }>(
          SERPER_API_URL,
          { q: `"${name}" "${company}"`, num: 5 }, // Fewer results per prior company
          { "X-API-KEY": SERPER_KEY! },
        );
        serperCallsMade++;
        if (response.organic) collectedSerpResults.push(...response.organic);
      } catch (e: any) {
        console.warn(`[MB Step 4] Serper query failed for prior company "${company}". Error: ${e.message}`);
      }
    }
  }

  /* ── 5. Deduplicate and Filter Source URLs for Scraping ───────────────── */
  console.log(`[MB Step 5] Deduplicating and filtering SERP results. Initial count: ${collectedSerpResults.length}`);
  const uniqueSerpResults = Array.from(new Map(collectedSerpResults.map(r => [r.link, r])).values());
  console.log(`[MB Step 5] Unique SERP results: ${uniqueSerpResults.length}`);

  // Filter out NO_SCRAPE domains UNLESS it's the primary LinkedIn profile (which we handle specially)
  const sourcesToConsiderForScraping = uniqueSerpResults
    .filter(r => {
        if (r.link === linkedInProfileResult?.link) return true; // Always keep the main LinkedIn profile
        return !NO_SCRAPE_DOMAINS.some(domainToSkip => r.link.includes(domainToSkip));
    })
    .slice(0, MAX_SOURCES_TO_LLM); // Limit sources to feed to LLM

  console.log(`[MB Step 5] Sources to consider for scraping/extraction (after NO_SCRAPE filter & MAX_SOURCES limit): ${sourcesToConsiderForScraping.length}`);

  const possibleSocialLinks = SOCIAL_DOMAINS_TO_AVOID_SCRAPING
    .flatMap(socialDomain => uniqueSerpResults.filter(r => r.link.includes(socialDomain)).map(r => r.link))
    .filter((link, index, self) => self.indexOf(link) === index); // Deduplicate social links


  /* ── 6. Firecrawl Content Extraction (Batched, with Global Time Budget) ─ */
  console.log(`[MB Step 6] Starting Firecrawl for ${sourcesToConsiderForScraping.length} sources.`);
  const extractedTextSnippets = new Array(sourcesToConsiderForScraping.length).fill("");
  let firecrawlTimeSpentMs = 0;

  for (let i = 0; i < sourcesToConsiderForScraping.length; i += FIRECRAWL_BATCH_SIZE) {
    const remainingTimeBudget = FIRECRAWL_GLOBAL_BUDGET_MS - firecrawlTimeSpentMs;
    if (remainingTimeBudget <= 0) {
      console.warn(`[MB Step 6] Firecrawl global time budget (${FIRECRAWL_GLOBAL_BUDGET_MS}ms) exhausted. Remaining sources will use snippets.`);
      for (let j = i; j < sourcesToConsiderForScraping.length; j++) {
        const source = sourcesToConsiderForScraping[j];
        // Fallback for URLs not processed due to budget
        extractedTextSnippets[j] = source.link === linkedInProfileResult?.link && proxyCurlData?.headline
          ? `LinkedIn profile for ${name}. Headline: ${proxyCurlData.headline}. URL: ${source.link}`
          : `${source.title}. ${source.snippet ?? ""}`; // Default to snippet
      }
      break; // Exit the batch loop
    }

    const currentBatch = sourcesToConsiderForScraping
      .slice(i, i + FIRECRAWL_BATCH_SIZE)
      .map((source, indexInBatch) => ({ sourceItem: source, globalIndex: i + indexInBatch }));

    const batchStartTime = Date.now();
    await Promise.allSettled( // Use Promise.allSettled to ensure all attempts complete
      currentBatch.map(async (batchItem) => {
        const source = batchItem.sourceItem;
        const globalIdx = batchItem.globalIndex;
        const attemptInfo = `Batch ${Math.floor(i / FIRECRAWL_BATCH_SIZE) + 1}, Item ${globalIdx + 1}/${sourcesToConsiderForScraping.length}`;

        if (source.link === linkedInProfileResult?.link && proxyCurlData?.headline) {
          extractedTextSnippets[globalIdx] = `LinkedIn profile for ${name}. Headline: ${proxyCurlData.headline}. URL: ${source.link}`;
          return;
        }
        // This check is slightly redundant due to earlier filtering, but good for safety.
        if (NO_SCRAPE_DOMAINS.some(domainToSkip => source.link.includes(domainToSkip))) {
          extractedTextSnippets[globalIdx] = `${source.title}. ${source.snippet ?? ""}`;
          return;
        }

        const scrapedText = await firecrawlWithLogging(source.link, attemptInfo);

        if (scrapedText) {
          // Check if snippet is already largely contained in scrapedText to avoid redundancy
          const snippetIsRedundant = source.snippet && scrapedText.toLowerCase().includes(source.snippet.toLowerCase().slice(0,50));
          const combinedText = snippetIsRedundant
            ? scrapedText
            : `${scrapedText}\n\nSnippet for context: ${source.title}. ${source.snippet ?? ""}`;
          extractedTextSnippets[globalIdx] = combinedText.slice(0, 3500); // Truncate for LLM context
        } else {
          extractedTextSnippets[globalIdx] = `${source.title}. ${source.snippet ?? ""}`; // Fallback
        }
      }),
    );
    firecrawlTimeSpentMs += Date.now() - batchStartTime;
    console.log(`[MB Step 6] Batch ${Math.floor(i / FIRECRAWL_BATCH_SIZE) + 1} processed. Total Firecrawl time: ${firecrawlTimeSpentMs}ms`);
  }
   console.log(`[MB Step 6] Firecrawl processing finished. Actual attempts: ${firecrawlAttempts}, Successes: ${firecrawlSuccesses}`);

  /* ── 7. Build LLM Prompt with Extracted Content ──────────────────────── */
  const llmSourceBlock = sourcesToConsiderForScraping
    .map(
      (source, index) =>
        `SOURCE_${index + 1} URL: ${source.link}\nCONTENT:\n${extractedTextSnippets[index] || "No content extracted."}`,
    )
    .join("\n\n---\n\n");

  const llmTemplate = `{
  "executive":[{"text":"","source":1}],
  "highlights":[{"text":"","source":1}],
  "funFacts":[{"text":"","source":1}],
  "researchNotes":[{"text":"","source":1}]
}`;

  const systemPrompt = `You are an AI assistant creating a concise meeting brief about a person.
The user will provide context about the person, their current organization, their job history, and a list of numbered sources with URLs and extracted content.
Your task is to populate a JSON object strictly adhering to the TEMPLATE provided.
- Each item in the arrays ("executive", "highlights", "funFacts", "researchNotes") must be an object with "text" and "source" (the 1-based number of the source it came from).
- "executive" summary: 2-3 key facts about the person, relevant to a professional meeting.
- "highlights": 3-5 bullet points covering notable achievements, skills, or publicly available significant information.
- "funFacts": 1-3 interesting, lighter details if available from sources (e.g., hobbies, unique experiences). If none, this array can be empty.
- "researchNotes": 4-6 distinct, concise notes or direct observations from the provided sources. These can be more granular than highlights. If a source is weak (e.g., just a snippet), note that if relevant.
- For all "text" fields, be concise. Do NOT invent information. If a category has no relevant info, its array can be empty.
- Do NOT include phrases like "Source X says..." or "According to Source Y..." in the "text" fields. The "source" number itself provides attribution.
- Ensure "source" numbers are accurate and correspond to the provided source list.
- Return ONLY the JSON object. No other text, no explanations, no markdown.
`;

  const userPromptForLLM = `
### PERSON
${name}

### CURRENT ORGANIZATION
${org}

### TEMPLATE
${llmTemplate}

### EMPLOYMENT TIMELINE (from LinkedIn)
${jobHistoryTimeline.join("\n") || "Not available."}

### SOURCES
${llmSourceBlock}
`.trim();

  /* ── 8. OpenAI Call for JSON Brief ───────────────────────────────────── */
  console.log(`[MB Step 8] Sending ${estimateTokens(userPromptForLLM)} tokens to LLM for structured brief generation.`);
  let llmJsonBrief: JsonBriefFromLLM = { executive: [], highlights: [], funFacts: [], researchNotes: [] };
  let llmOutputTokens = 0;

  if (OPENAI_API_KEY) {
    try {
      const llmResponse = await ai.chat.completions.create({
        model: MODEL_ID,
        temperature: 0.1, // Low temperature for factual, structured output
        response_format: { type: "json_object" },
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPromptForLLM }
        ],
      });
      llmOutputTokens = llmResponse.usage?.completion_tokens ?? 0;
      const content = llmResponse.choices[0].message.content;
      if (content) {
        try {
          llmJsonBrief = JSON.parse(content);
          // Basic validation of the parsed structure
          if (!llmJsonBrief.executive || !llmJsonBrief.highlights || !llmJsonBrief.funFacts || !llmJsonBrief.researchNotes) {
            console.warn("[MB Step 8] LLM JSON output missing expected keys. Using empty brief. Output:", content.slice(0,500));
            llmJsonBrief = { executive: [], highlights: [], funFacts: [], researchNotes: [] }; // Fallback
          }
        } catch (e: any) {
          console.error(`[MB Step 8] LLM response was not valid JSON. Error: ${e.message}. Response: ${content.slice(0,1000)}`);
           // Fallback to an empty structure or try to partially parse if robustly possible
        }
      } else {
         console.warn("[MB Step 8] LLM response content was null or empty.");
      }
    } catch (e: any) {
      console.error(`[MB Step 8] OpenAI API call failed. Error: ${e.message}`);
    }
  } else {
      console.warn("[MB Step 8] Skipped OpenAI call: OPENAI_API_KEY not set.");
  }


  /* ── 9. Deduplicate Rows (except researchNotes) ──────────────────────── */
  const deduplicateBriefRows = (rows?: BriefRow[]): BriefRow[] =>
    Array.from(
      new Map(
        (rows ?? []).map(row => [
          cleanLLMOutputText(row.text).toLowerCase(), // Key by cleaned, lowercased text
          { ...row, text: cleanLLMOutputText(row.text) }, // Store cleaned text
        ]),
      ).values(),
    );

  llmJsonBrief.executive = deduplicateBriefRows(llmJsonBrief.executive);
  llmJsonBrief.highlights = deduplicateBriefRows(llmJsonBrief.highlights);
  llmJsonBrief.funFacts = deduplicateBriefRows(llmJsonBrief.funFacts);
  // researchNotes are intentionally not deduplicated to allow similar but distinct observations from different sources

  /* ── 10. Prepare Citations List for HTML Output ───────────────────────── */
  const finalCitations: Citation[] = sourcesToConsiderForScraping.map((source, index) => ({
    marker: `[${index + 1}]`,
    url: source.link,
    title: source.title,
    snippet: (extractedTextSnippets[index] || `${source.title}. ${source.snippet ?? ""}`).slice(0, 300) +
             ((extractedTextSnippets[index]?.length || 0) > 300 ? "..." : ""),
  }));

  /* ── 11. Render HTML Brief ─────────────────────────────────────────────── */
  const htmlBriefOutput = renderFullHtmlBrief(
    name,
    org,
    llmJsonBrief,
    finalCitations,
    jobHistoryTimeline,
  );

  /* ── 12. Construct Final Payload ───────────────────────────────────────── */
  const totalTokensUsed = estimateTokens(systemPrompt + userPromptForLLM) + llmOutputTokens;
  console.log(`[MB Finished] Total estimated tokens: ${totalTokensUsed}. Wall time: ${(Date.now() - startTime) / 1000}s`);

  return {
    brief: htmlBriefOutput,
    citations: finalCitations,
    tokensUsed: totalTokensUsed,
    serperSearchesMade: serperCallsMade,
    proxycurlCallsMade: proxycurlCallsMade,
    firecrawlAttempts: firecrawlAttempts,
    firecrawlSuccesses: firecrawlSuccesses,
    finalSourcesConsidered: sourcesToConsiderForScraping.map((s, idx) => ({ // For debugging/visibility
      url: s.link,
      title: s.title,
      processed_snippet: extractedTextSnippets[idx]?.slice(0, 300) + ((extractedTextSnippets[idx]?.length || 0) > 300 ? "..." : ""),
    })),
    possibleSocialLinks,
  };
}