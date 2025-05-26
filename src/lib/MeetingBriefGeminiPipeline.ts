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
import fetch, { Response as FetchResponse } from "node-fetch"; // Ensure 'node-fetch' and '@types/node-fetch' are installed

export const runtime = "nodejs";

/* ── ENV ────────────────────────────────────────────────────────────────── */
const {
  OPENAI_API_KEY,
  SERPER_KEY,
  FIRECRAWL_KEY,
  PROXYCURL_KEY,
} = process.env;

if (!OPENAI_API_KEY || !SERPER_KEY || !FIRECRAWL_KEY || !PROXYCURL_KEY) {
  // In a real app, you might throw an error or have a more robust config check
  console.error("CRITICAL: Missing one or more API keys (OPENAI_API_KEY, SERPER_KEY, FIRECRAWL_KEY, PROXYCURL_KEY).");
  // For Vercel, functions might fail if env vars are missing. It's good practice to check.
}

/* ── CONSTANTS ──────────────────────────────────────────────────────────── */
const MODEL_ID = "gpt-4.1-mini-2025-04-14"; // Ensure this model is up-to-date with OpenAI offerings
const SERPER_API_URL = "https://google.serper.dev/search";
const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape"; // This is the /v1/scrape endpoint
const PROXYCURL_API_PROFILE_URL = "https://nubela.co/proxycurl/api/v2/linkedin"; // For individual profiles
// const PROXYCURL_API_COMPANY_URL = "https://nubela.co/proxycurl/api/linkedin/company"; // This was in your OsintSpiderV3, not used here but good to note

const MAX_SOURCES_TO_LLM = 25;
const FIRECRAWL_BATCH_SIZE = 10;
const FIRECRAWL_GLOBAL_BUDGET_MS = 35_000;

/* ── DOMAIN RULES ───────────────────────────────────────────────────────── */
const SOCIAL_DOMAINS = [
  "x.com/",
  "twitter.com/",
  "mastodon.social/",
  "facebook.com/",
  "fb.com/",
  "instagram.com/",
];
const GENERIC_NO_SCRAPE_DOMAINS = [
  "youtube.com/", // Example, refine as needed
  "youtu.be/", // Example
  "reddit.com/", // Reddit API preferred for scraping
  "linkedin.com/pulse/",
  "linkedin.com/posts/",
];
const NO_SCRAPE_URL_SUBSTRINGS = [...SOCIAL_DOMAINS, ...GENERIC_NO_SCRAPE_DOMAINS];

/* ── TYPES ──────────────────────────────────────────────────────────────── */
interface SerpResult { title: string; link: string; snippet?: string }
// Adjusted to Firecrawl's /v1/scrape response structure
interface FirecrawlScrapeV1Result {
    success: boolean;
    data?: {
        content: string; // HTML
        markdown: string;
        text_content: string; // This is often from <article> or main content
        metadata: Record<string, string | undefined | null | number | boolean>; // Generic metadata
        article?: { // This is what your original code targeted
            title?: string;
            author?: string;
            publishedDate?: string; // Note: dates from metadata can be tricky
            text_content?: string; // Main article text
        };
    };
    error?: string;
    status?: number;
}

interface YearMonthDay { year?: number; month?: number; day?: number }
interface LinkedInExperience { company?: string; title?: string; starts_at?: YearMonthDay; ends_at?: YearMonthDay }
interface ProxyCurlResult {
    headline?: string;
    experiences?: LinkedInExperience[];
    // Add other fields you expect from ProxyCurl to make this type more specific
    [key: string]: any; // Allow other fields, but use with caution or refine type
}

interface BriefRow { text: string; source: number } // source is 1-indexed
interface JsonBriefFromLLM {
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
  tokensUsed: number;
  serperSearchesMade: number;
  proxycurlCallsMade: number;
  firecrawlAttempts: number;
  firecrawlSuccesses: number;
  finalSourcesConsidered: { url: string; title: string; processed_snippet: string }[];
  possibleSocialLinks: string[];
}

/* ── HELPERS ────────────────────────────────────────────────────────────── */
const ai = new OpenAI({ apiKey: OPENAI_API_KEY! }); // Assuming OPENAI_API_KEY is always present due to initial check

const postJSON = async <T>(
  url: string,
  body: unknown, // Body can be any JSON-serializable structure
  headers: Record<string, string>,
): Promise<T> => {
  const response: FetchResponse = await fetch(url, { // Explicitly type response
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text();
    // Log the error more informatively
    console.error(`postJSON Error: HTTP ${response.status} for ${url}. Body: ${errorText.slice(0, 500)}`);
    throw new Error(`HTTP ${response.status} – ${errorText}`);
  }
  return response.json() as Promise<T>; // Casting here is common if T is known by the caller
};

const formatYearFromProxyCurl = (date?: YearMonthDay): string => date?.year?.toString() ?? "?";
const formatJobSpanFromProxyCurl = (startDate?: YearMonthDay, endDate?: YearMonthDay): string =>
  `${formatYearFromProxyCurl(startDate)} – ${endDate ? formatYearFromProxyCurl(endDate) : "Present"}`;

const estimateTokens = (text: string): number => Math.ceil((text || "").length / 3.5); // A common rough estimate
const cleanLLMOutputText = (text: string): string => (text || "").replace(/\s*\(?\s*source\s*\d+\s*\)?/gi, "").trim();
const normalizeCompanyName = (companyName: string): string =>
  (companyName || "")
    .toLowerCase()
    .replace(/[,.]?\s*(inc|llc|ltd|gmbh|corp|corporation|limited|company|co)\s*$/i, "")
    .replace(/[.,']/g, "") // Removed apostrophe from replace to keep names like "O'Malley's"
    .trim();

/* ── Firecrawl with Logging and Retry ───────────────────────────────────── */
let firecrawlGlobalAttempts = 0;
let firecrawlGlobalSuccesses = 0;

const firecrawlWithLogging = async (url: string, attemptInfoForLogs: string): Promise<string | null> => {
  firecrawlGlobalAttempts++;
  const tryScrapeOnce = async (timeoutMs: number): Promise<string | null> => {
    try {
      console.log(`[Firecrawl Attempt] ${attemptInfoForLogs} - URL: ${url}, Timeout: ${timeoutMs}ms`);
      const response = await Promise.race([
        postJSON<FirecrawlScrapeV1Result>( // Expecting FirecrawlScrapeV1Result
          FIRECRAWL_API_URL,
          { url }, // Body for /v1/scrape
          { Authorization: `Bearer ${FIRECRAWL_KEY!}` }
        ),
        new Promise<never>((_, reject) => // No explicit type for reject needed here
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);

      if (response && response.success && response.data?.article && typeof response.data.article.text_content === 'string') {
        console.log(`[Firecrawl Success] ${attemptInfoForLogs} - URL: ${url}. Got article.text_content (length: ${response.data.article.text_content.length})`);
        firecrawlGlobalSuccesses++;
        return response.data.article.text_content;
      } else if (response && response.success && response.data) {
         // Fallback if article.text_content is missing but data.text_content (more generic) or data.markdown might exist
         const fallbackText = response.data.text_content || response.data.markdown;
         if (fallbackText && typeof fallbackText === 'string') {
            console.warn(`[Firecrawl PartialSuccess] ${attemptInfoForLogs} - URL: ${url}. No article.text_content, but found other text (length: ${fallbackText.length}).`);
            firecrawlGlobalSuccesses++;
            return fallbackText;
         }
        console.warn(`[Firecrawl NoContent] ${attemptInfoForLogs} - URL: ${url}. Response success=true but no usable text_content/markdown. Response: ${JSON.stringify(response).slice(0,300)}...`);
        return null;
      } else if (response && !response.success) {
        console.error(`[Firecrawl API Error] ${attemptInfoForLogs} - URL: ${url}. Error: ${response.error || 'Unknown Firecrawl error'}. Status: ${response.status || 'N/A'}`);
        return null;
      } else {
        console.warn(`[Firecrawl OddResponse] ${attemptInfoForLogs} - URL: ${url}. Unexpected response structure: ${JSON.stringify(response).slice(0,300)}...`);
        return null;
      }
    } catch (error: unknown) { // Changed from any to unknown
      const err = error instanceof Error ? error : new Error(String(error)); // Ensure it's an Error object
      console.error(`[Firecrawl Exception] ${attemptInfoForLogs} - URL: ${url}, Timeout: ${timeoutMs}ms. Error: ${err.message}`, err.stack ? `\nStack: ${err.stack.slice(0,300)}` : '');
      return null;
    }
  };

  let content = await tryScrapeOnce(7000); // Increased initial timeout
  if (content === null) {
    console.warn(`[Firecrawl Retry] First attempt failed for ${url} (${attemptInfoForLogs}). Retrying with longer timeout.`);
    content = await tryScrapeOnce(15000); // Increased retry timeout
    if (content === null) {
      console.error(`[Firecrawl FailedAllAttempts] URL: ${url} (${attemptInfoForLogs}).`);
    }
  }
  return content;
};


/* ── HTML Rendering Helpers ─────────────────────────────────────────────── */
const renderParagraphsWithCitations = (rows: BriefRow[], citations: Citation[]): string =>
  rows
    .map(row => {
      if (typeof row.source !== 'number' || row.source < 1) { // Basic validation
          console.warn("Invalid source number in BriefRow:", row);
          return `<p>${cleanLLMOutputText(row.text)} <sup>[invalid source]</sup></p>`;
      }
      const citation = citations[row.source - 1];
      const supLink = citation
        ? `<sup><a href="${citation.url}" target="_blank" rel="noopener noreferrer" title="${(citation.title || "").replace(/"/g, '&quot;')}">${row.source}</a></sup>`
        : `<sup>[${row.source}]</sup>`;
      return `<p>${cleanLLMOutputText(row.text)} ${supLink}</p>`;
    })
    .join("\n");

const renderUnorderedListWithCitations = (rows: BriefRow[], citations: Citation[]): string =>
  rows.length
    ? `<ul class="list-disc pl-5">\n${rows
        .map(row => {
          if (typeof row.source !== 'number' || row.source < 1) {
              console.warn("Invalid source number in BriefRow:", row);
              return `  <li>${cleanLLMOutputText(row.text)} <sup>[invalid source]</sup></li>`;
          }
          const citation = citations[row.source - 1];
          const supLink = citation
            ? `<sup><a href="${citation.url}" target="_blank" rel="noopener noreferrer" title="${(citation.title || "").replace(/"/g, '&quot;')}">${row.source}</a></sup>`
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
${renderParagraphsWithCitations(llmJsonBrief.executive || [], citationsList)}
${sectionSpacer}<h3><strong>Job History</strong></h3>
${renderJobHistoryList(jobHistory)}
${sectionSpacer}<h3><strong>Highlights & Fun Facts</strong></h3>
${renderUnorderedListWithCitations([...(llmJsonBrief.highlights || []), ...(llmJsonBrief.funFacts || [])], citationsList)}
${sectionSpacer}<h3><strong>Detailed Research Notes</strong></h3>
${renderUnorderedListWithCitations(llmJsonBrief.researchNotes || [], citationsList)}
</div>`.trim().replace(/^\s*\n/gm, "");
};

/* ── MAIN FUNCTION ──────────────────────────────────────────────────────── */
export async function buildMeetingBriefGemini(
  name: string,
  org: string,
): Promise<MeetingBriefPayload> {
  firecrawlGlobalAttempts = 0; // Reset global counters for this run
  firecrawlGlobalSuccesses = 0;
  let serperCallsMade = 0;
  let proxycurlCallsMade = 0;

  const startTime = Date.now();
  const collectedSerpResults: SerpResult[] = [];

  /* ── 1. Initial Serper queries ───────────────────────────────────────── */
  console.log(`[MB Step 1] Running initial Serper queries for "${name}" and "${org}"`);
  const initialQueries = [
    { q: `"${name}" "${org}" OR "${name}" "linkedin.com/in/"`, num: 10 },
    { q: `"${name}" "${org}" (interview OR profile OR news OR "press release" OR biography)`, num: 10 },
    { q: `"${name}" (award OR recognition OR keynote OR webinar OR conference OR patent OR publication)`, num: 10 },
  ];

  for (const query of initialQueries) {
    try {
      const response = await postJSON<{ organic?: SerpResult[] }>(
        SERPER_API_URL,
        { q: query.q, num: query.num, gl: "us", hl: "en" }, // Added gl and hl
        { "X-API-KEY": SERPER_KEY! },
      );
      serperCallsMade++;
      if (response.organic) collectedSerpResults.push(...response.organic);
    } catch (e: unknown) { // FIXED: any to unknown
      const err = e instanceof Error ? e : new Error(String(e));
      console.warn(`[MB Step 1] Serper query failed for "${query.q}". Error: ${err.message}`);
    }
  }

  /* ── 2. LinkedIn profile search (if not found) ───────────────────────── */
  let linkedInProfileResult = collectedSerpResults.find(r => r.link.includes("linkedin.com/in/"));
  if (!linkedInProfileResult) {
    console.log(`[MB Step 2] LinkedIn profile not in initial results. Dedicated search for "${name}".`);
    try {
      const response = await postJSON<{ organic?: SerpResult[] }>(
        SERPER_API_URL,
        { q: `"${name}" "linkedin.com/in/" site:linkedin.com`, num: 5, gl: "us", hl: "en" },
        { "X-API-KEY": SERPER_KEY! },
      );
      serperCallsMade++;
      if (response.organic?.length) {
        linkedInProfileResult = response.organic[0];
        collectedSerpResults.push(linkedInProfileResult);
        console.log(`[MB Step 2] Found LinkedIn profile via dedicated search: ${linkedInProfileResult.link}`);
      }
    } catch (e: unknown) { // FIXED: any to unknown
      const err = e instanceof Error ? e : new Error(String(e));
      console.warn(`[MB Step 2] LinkedIn dedicated Serper search failed. Error: ${err.message}`);
    }
  }

  // It's better to proceed with potentially less data than to throw an error hard stopping the process
  if (!linkedInProfileResult?.link) {
    console.warn(`[MB Critical] LinkedIn profile NOT FOUND for ${name}. Brief quality will be impacted. Proceeding without ProxyCurl.`);
  }

  /* ── 3. ProxyCurl Call ─────────────────────────────────────────────────── */
  let proxyCurlData: ProxyCurlResult | null = null;
  let jobHistoryTimeline: string[] = [];
  if (linkedInProfileResult?.link && PROXYCURL_KEY) { // Ensure key exists
    console.log(`[MB Step 3] Fetching ProxyCurl data for LinkedIn URL: ${linkedInProfileResult.link}`);
    try {
      // ProxyCurl's API for profiles is typically a GET request with URL in query param
      const proxyCurlUrl = `${PROXYCURL_API_PROFILE_URL}?url=${encodeURIComponent(linkedInProfileResult.link)}&fallback_to_cache=on-error&use_cache=if-present`;
      const response = await fetch(proxyCurlUrl, {
          method: "GET",
          headers: { Authorization: `Bearer ${PROXYCURL_KEY!}` },
        }
      );
      proxycurlCallsMade++;
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[MB Step 3] ProxyCurl API Error ${response.status} for ${linkedInProfileResult?.link}: ${errorText.slice(0,500)}`);
        // No throw, just log and proceed
      } else {
        proxyCurlData = await response.json() as ProxyCurlResult;
        if (proxyCurlData) {
          jobHistoryTimeline = (proxyCurlData.experiences ?? []).map(
            exp =>
              `${exp.title ?? "Role"} — ${exp.company ?? "Company"} (${formatJobSpanFromProxyCurl(
                exp.starts_at,
                exp.ends_at,
              )})`,
          );
        }
      }
    } catch (e: unknown) { // FIXED: any to unknown
      const err = e instanceof Error ? e : new Error(String(e));
      console.error(`[MB Step 3] ProxyCurl call failed. Error: ${err.message}`);
    }
  } else {
    console.warn("[MB Step 3] Skipped ProxyCurl: No LinkedIn profile URL or PROXYCURL_KEY missing.");
  }

  /* ── 4. Extra Serper queries for prior orgs ──────────────────────────── */
  if (proxyCurlData?.experiences) {
    console.log(`[MB Step 4] Running additional Serper queries for prior organizations of "${name}".`);
    const priorCompanies = (proxyCurlData.experiences ?? [])
      .map(exp => exp.company)
      .filter((company): company is string => !!company);

    const uniquePriorCompanies = priorCompanies
      .filter(
        (company, index, self) =>
          index === self.findIndex(c => normalizeCompanyName(c) === normalizeCompanyName(company)) &&
          normalizeCompanyName(company) !== normalizeCompanyName(org),
      )
      .slice(0, 3);

    for (const company of uniquePriorCompanies) {
      try {
        const response = await postJSON<{ organic?: SerpResult[] }>(
          SERPER_API_URL,
          { q: `"${name}" "${company}"`, num: 5, gl: "us", hl: "en" },
          { "X-API-KEY": SERPER_KEY! },
        );
        serperCallsMade++;
        if (response.organic) collectedSerpResults.push(...response.organic);
      } catch (e: unknown) { // FIXED: any to unknown
        const err = e instanceof Error ? e : new Error(String(e));
        console.warn(`[MB Step 4] Serper query failed for prior company "${company}". Error: ${err.message}`);
      }
    }
  }

  /* ── 5. Build source lists for scraping and LLM ──────────────────────── */
  console.log(`[MB Step 5] Deduplicating and filtering SERP results. Initial count: ${collectedSerpResults.length}`);
  const uniqueSerpResults = Array.from(new Map(collectedSerpResults.map(r => [r.link, r])).values());
  console.log(`[MB Step 5] Unique SERP results: ${uniqueSerpResults.length}`);

  const sourcesToProcessForLLM = uniqueSerpResults
    .filter(r => {
      if (r.link === linkedInProfileResult?.link) return true; // Always keep the main LinkedIn profile for context
      return !NO_SCRAPE_URL_SUBSTRINGS.some(substringToSkip => r.link.includes(substringToSkip));
    })
    .slice(0, MAX_SOURCES_TO_LLM); // Hard cap on sources to LLM

  console.log(`[MB Step 5] Sources to process for LLM (after NO_SCRAPE filter & MAX_SOURCES_TO_LLM limit): ${sourcesToProcessForLLM.length}`);

  const possibleSocialLinks = SOCIAL_DOMAINS
    .flatMap(socialDomain => uniqueSerpResults.filter(r => r.link.includes(socialDomain)).map(r => r.link))
    .filter((link, index, self) => self.indexOf(link) === index);


  /* ── 6. Firecrawl in parallel batches with global budget ─────────────── */
  console.log(`[MB Step 6] Starting Firecrawl for ${sourcesToProcessForLLM.length} sources.`);
  const extractedTextsForLLM = new Array(sourcesToProcessForLLM.length).fill("");
  let firecrawlTimeSpentMs = 0;

  for (let i = 0; i < sourcesToProcessForLLM.length; i += FIRECRAWL_BATCH_SIZE) {
    const remainingTimeBudget = FIRECRAWL_GLOBAL_BUDGET_MS - firecrawlTimeSpentMs;
    if (remainingTimeBudget <= 0) {
      console.warn(`[MB Step 6] Firecrawl global time budget (${FIRECRAWL_GLOBAL_BUDGET_MS}ms) exhausted. Remaining sources will use snippets.`);
      for (let j = i; j < sourcesToProcessForLLM.length; j++) {
        const source = sourcesToProcessForLLM[j];
        extractedTextsForLLM[j] = source.link === linkedInProfileResult?.link && proxyCurlData?.headline
          ? `LinkedIn profile for ${name}. Headline: ${proxyCurlData.headline}. URL: ${source.link}`
          : `${source.title}. ${source.snippet ?? ""}`;
      }
      break;
    }

    const currentBatch = sourcesToProcessForLLM
      .slice(i, i + FIRECRAWL_BATCH_SIZE)
      .map((source, indexInBatch) => ({ sourceItem: source, globalIndex: i + indexInBatch }));

    const batchStartTime = Date.now();
    // Using allSettled to ensure all promises in a batch resolve or reject before moving on
    await Promise.allSettled(
      currentBatch.map(async (batchItem) => {
        const source = batchItem.sourceItem;
        const globalIdx = batchItem.globalIndex;
        const attemptInfoForLogs = `Batch ${Math.floor(i / FIRECRAWL_BATCH_SIZE) + 1}, ItemInBatch ${currentBatch.findIndex(item => item.sourceItem.link === source.link) + 1}/${currentBatch.length}, GlobalIdx ${globalIdx + 1}`;

        if (source.link === linkedInProfileResult?.link && proxyCurlData?.headline) {
          extractedTextsForLLM[globalIdx] = `LinkedIn profile for ${name}. Headline: ${proxyCurlData.headline}. URL: ${source.link}`;
          return;
        }
        if (NO_SCRAPE_URL_SUBSTRINGS.some(substringToSkip => source.link.includes(substringToSkip))) {
          extractedTextsForLLM[globalIdx] = `${source.title}. ${source.snippet ?? ""}`;
          return;
        }

        const scrapedText = await firecrawlWithLogging(source.link, attemptInfoForLogs);

        if (scrapedText) {
          const snippetText = source.snippet || "";
          const snippetIsLikelyRedundant = snippetText && scrapedText.toLowerCase().includes(snippetText.toLowerCase().slice(0, Math.min(50, snippetText.length -1 ))); // Check if first 50 chars of snippet in text
          
          const combinedText = snippetIsLikelyRedundant
            ? scrapedText
            : `${scrapedText}\n\nSnippet for context: ${source.title}. ${snippetText}`;
          extractedTextsForLLM[globalIdx] = combinedText.slice(0, 3500); // Truncate for LLM
        } else {
          extractedTextsForLLM[globalIdx] = `${source.title}. ${source.snippet ?? ""}`; // Fallback
        }
      }),
    );
    firecrawlTimeSpentMs += Date.now() - batchStartTime;
    console.log(`[MB Step 6] Batch ${Math.floor(i / FIRECRAWL_BATCH_SIZE) + 1} processed. Total Firecrawl time: ${firecrawlTimeSpentMs}ms`);
  }
  console.log(`[MB Step 6] Firecrawl processing finished. Global attempts: ${firecrawlGlobalAttempts}, Global successes: ${firecrawlGlobalSuccesses}`);


  /* ── 7. Build LLM prompt ─────────────────────────────────────────────── */
  const llmSourceBlock = sourcesToProcessForLLM
    .map(
      (source, index) =>
        `SOURCE_${index + 1} URL: ${source.link}\nCONTENT:\n${extractedTextsForLLM[index] || "No content extracted or snippet used."}`,
    )
    .join("\n\n---\n\n");

  const llmJsonTemplate = `{
  "executive":[{"text":"","source":1}],
  "highlights":[{"text":"","source":1}],
  "funFacts":[{"text":"","source":1}],
  "researchNotes":[{"text":"","source":1}]
}`;

  const systemPromptForLLM = `You are an AI assistant creating a concise meeting brief about a person for a professional meeting.
The user will provide context about the person, their current organization, their job history from LinkedIn, and a list of numbered sources with URLs and extracted content (which may be full text or just snippets).
Your task is to populate a JSON object strictly adhering to the TEMPLATE provided.
- Each item in the arrays ("executive", "highlights", "funFacts", "researchNotes") must be an object with "text" (a string) and "source" (the 1-based number of the source it came from).
- "executive" summary: 2-3 key sentences about the person, highly relevant for someone about to meet them professionally. Focus on their current role and one major accomplishment or characteristic.
- "highlights": 3-5 bullet points covering notable achievements, skills, or significant public information. Prioritize information from fuller text sources if available.
- "funFacts": 1-3 interesting, lighter details if available (e.g., hobbies mentioned, unique experiences, personal website info). If none, this array MUST be empty ([]).
- "researchNotes": 4-6 distinct, concise notes or direct observations from the provided sources. These can be more granular than highlights. If a source is just a snippet, a note might reflect that limited scope.
- For ALL "text" fields: Be very concise. Do NOT invent information or make assumptions beyond the provided text. If a category has no relevant information from the sources, its array MUST be empty ([]).
- Do NOT include phrases like "Source X says...", "According to Source Y...", or any citation markers like "[1]" or "(source 1)" directly within the "text" fields. The "source" number property provides all attribution.
- Ensure all "source" numbers are accurate integers corresponding to the provided source list (1 to N).
- Validate that all "text" fields are strings.
- Return ONLY the JSON object. No other text, no explanations, no apologies, no markdown formatting around the JSON.`;

  const userPromptForLLM = `
### PERSON_NAME
${name}

### CURRENT_ORGANIZATION
${org}

### RESPONSE_JSON_TEMPLATE
${llmJsonTemplate}

### EMPLOYMENT_TIMELINE (from LinkedIn, for context)
${jobHistoryTimeline.join("\n") || "Not available."}

### SOURCES_FOR_ANALYSIS (numbered 1 to N)
${llmSourceBlock}
`.trim();

  /* ── 8. OpenAI call for JSON Brief ───────────────────────────────────── */
  console.log(`[MB Step 8] Sending ~${estimateTokens(systemPromptForLLM + userPromptForLLM)} tokens to LLM (${MODEL_ID}) for structured brief generation.`);
  let llmJsonBrief: JsonBriefFromLLM = { executive: [], highlights: [], funFacts: [], researchNotes: [] };
  let llmOutputTokens = 0;

  if (OPENAI_API_KEY) { // Check if key is present
    try {
      const llmResponse = await ai.chat.completions.create({
        model: MODEL_ID,
        temperature: 0.0, // Very low temperature for factual, structured output
        response_format: { type: "json_object" },
        messages: [
            { role: "system", content: systemPromptForLLM },
            { role: "user", content: userPromptForLLM }
        ],
      });
      llmOutputTokens = llmResponse.usage?.completion_tokens ?? 0;
      const content = llmResponse.choices[0].message.content;

      if (content) {
        try {
          // Attempt to parse the LLM response as the target JSON structure
          const parsedContent = JSON.parse(content) as Partial<JsonBriefFromLLM>;
          // Validate and structure the parsed content, providing defaults for missing arrays
          llmJsonBrief = {
            executive: Array.isArray(parsedContent.executive) ? parsedContent.executive : [],
            highlights: Array.isArray(parsedContent.highlights) ? parsedContent.highlights : [],
            funFacts: Array.isArray(parsedContent.funFacts) ? parsedContent.funFacts : [],
            researchNotes: Array.isArray(parsedContent.researchNotes) ? parsedContent.researchNotes : [],
          };
          console.log("[MB Step 8] Successfully parsed LLM JSON response.");
        } catch (e: unknown) { // FIXED: any to unknown
          const err = e instanceof Error ? e : new Error(String(e));
          console.error(`[MB Step 8] LLM response was not valid JSON. Error: ${err.message}. Response snippet: ${content.slice(0,1000)}...`);
          // llmJsonBrief remains as its empty default
        }
      } else {
         console.warn("[MB Step 8] LLM response content was null or empty. Using empty brief.");
      }
    } catch (e: unknown) { // FIXED: any to unknown
      const err = e instanceof Error ? e : new Error(String(e));
      console.error(`[MB Step 8] OpenAI API call failed. Error: ${err.message}`);
      // llmJsonBrief remains as its empty default
    }
  } else {
      console.warn("[MB Step 8] Skipped OpenAI call: OPENAI_API_KEY not set. Using empty brief.");
  }


  /* ── 9. Deduplicate Rows (except researchNotes) ──────────────────────── */
  const deduplicateBriefRows = (rows?: BriefRow[]): BriefRow[] => {
    if (!Array.isArray(rows)) return [];
    return Array.from(
      new Map(
        rows.map(row => [
          cleanLLMOutputText(row.text || "").toLowerCase(),
          { ...row, text: cleanLLMOutputText(row.text || "") },
        ]),
      ).values(),
    );
  };

  llmJsonBrief.executive = deduplicateBriefRows(llmJsonBrief.executive);
  llmJsonBrief.highlights = deduplicateBriefRows(llmJsonBrief.highlights);
  llmJsonBrief.funFacts = deduplicateBriefRows(llmJsonBrief.funFacts);
  // researchNotes are intentionally not deduplicated

  /* ── 10. Citations ───────────────────────────────────────────────────── */
  const finalCitations: Citation[] = sourcesToProcessForLLM.map((source, index) => ({
    marker: `[${index + 1}]`,
    url: source.link,
    title: source.title,
    snippet: (extractedTextsForLLM[index] || `${source.title}. ${source.snippet ?? ""}`).slice(0, 300) +
             ((extractedTextsForLLM[index]?.length || 0) > 300 ? "..." : ""),
  }));

  /* ── 11. HTML report ─────────────────────────────────────────────────── */
  const htmlBriefOutput = renderFullHtmlBrief(
    name,
    org,
    llmJsonBrief,
    finalCitations,
    jobHistoryTimeline,
  );

  /* ── 12. Payload ─────────────────────────────────────────────────────── */
  const totalInputTokensForLLM = estimateTokens(systemPromptForLLM + userPromptForLLM);
  const totalTokensUsed = totalInputTokensForLLM + llmOutputTokens;
  const wallTimeSeconds = (Date.now() - startTime) / 1000;
  console.log(`[MB Finished] Processed for "${name}". Total estimated tokens: ${totalTokensUsed}. Serper calls: ${serperCallsMade}. Proxycurl: ${proxycurlCallsMade}. Firecrawl attempts: ${firecrawlGlobalAttempts}, successes: ${firecrawlGlobalSuccesses}. Wall time: ${wallTimeSeconds.toFixed(1)}s`);

  return {
    brief: htmlBriefOutput,
    citations: finalCitations,
    tokensUsed: totalTokensUsed,
    serperSearchesMade: serperCallsMade,
    proxycurlCallsMade: proxycurlCallsMade, // Added this field
    firecrawlAttempts: firecrawlGlobalAttempts,
    firecrawlSuccesses: firecrawlGlobalSuccesses,
    finalSourcesConsidered: sourcesToProcessForLLM.map((s, idx) => ({
      url: s.link,
      title: s.title,
      processed_snippet: (extractedTextsForLLM[idx] || "Snippet/Error").slice(0, 300) + ((extractedTextsForLLM[idx]?.length || 0) > 300 ? "..." : ""),
    })),
    possibleSocialLinks,
  };
}