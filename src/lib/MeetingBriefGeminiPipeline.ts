/* ──────────────────────────────────────────────────────────────────────────
   src/lib/MeetingBriefGeminiPipeline.ts
   --------------------------------------------------------------------------
   HARD CONTRACT
   ─ model returns only:
        { executive: [], highlights: [], funFacts: [], researchNotes: [] }
   ─ each element { text: string, source: number }
   ─ no headings, no prose, no "source 3" strings inside text
   ------------------------------------------------------------------------ */

import OpenAI from "openai";
import fetch, { Response as FetchResponse, RequestInit } from "node-fetch"; // Ensure 'node-fetch' and '@types/node-fetch' are installed

export const runtime = "nodejs";

/* ── ENV ────────────────────────────────────────────────────────────────── */
const {
  OPENAI_API_KEY,
  SERPER_KEY,
  FIRECRAWL_KEY,
  HARVEST_API_KEY,
} = process.env;

const HARVEST_BASE = process.env.HARVEST_BASE || "https://api.harvest-api.com";

// run Harvest whenever we have an API key – let the API itself reject if the quota is exhausted
const canUseHarvest = Boolean(HARVEST_API_KEY);

if (!OPENAI_API_KEY || !SERPER_KEY || !FIRECRAWL_KEY) {
  console.error("CRITICAL ERROR: Missing one or more API keys (OPENAI, SERPER, FIRECRAWL). Application will not function correctly.");
}

/* ── CONSTANTS ──────────────────────────────────────────────────────────── */
const MODEL_ID = "gpt-4.1-mini-2025-04-14";
const SERPER_API_URL = "https://google.serper.dev/search";
const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape";

const MAX_SOURCES_TO_LLM = 25;
const FIRECRAWL_BATCH_SIZE = 10;
const FIRECRAWL_GLOBAL_BUDGET_MS = 35_000;

// Credit-aware LinkedIn resolution URLs
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROFILE_FRESH_DAYS = 30;

/* ── DOMAIN RULES ───────────────────────────────────────────────────────── */
const SOCIAL_DOMAINS = [
  "x.com/", "twitter.com/", "mastodon.social/", "facebook.com/", "fb.com/", "instagram.com/",
];
const GENERIC_NO_SCRAPE_DOMAINS = [
  "youtube.com/", "youtu.be/",
  "reddit.com/", 
  "linkedin.com/pulse/", "linkedin.com/posts/", "linkedin.com/in/", "linkedin.com/pub/",
];
const NO_SCRAPE_URL_SUBSTRINGS = [...SOCIAL_DOMAINS, ...GENERIC_NO_SCRAPE_DOMAINS];

// ------------------------------------------------------------------------
// Low-trust domains: keep them *only* when we'd otherwise feed the LLM
// fewer than MIN_RELIABLE_SOURCES sources (after Firecrawl skip logic).
// ------------------------------------------------------------------------
const LOW_TRUST_DOMAINS = ["rocketreach.co", "rocketreach.com"];
const MIN_RELIABLE_SOURCES = 5;

/* ── TYPES ──────────────────────────────────────────────────────────────── */
interface SerpResult { title: string; link: string; snippet?: string }
interface FirecrawlScrapeV1Result {
    success: boolean;
    data?: {
        content: string; markdown: string; text_content: string;
        metadata: Record<string, string | number | boolean | undefined | null>;
        article?: { title?: string; author?: string; publishedDate?: string; text_content?: string; };
    };
    error?: string; status?: number;
}
interface YearMonthDay { year?: number; month?: number; day?: number }
interface LinkedInExperience { company?: string; title?: string; starts_at?: YearMonthDay; ends_at?: YearMonthDay }
interface ProxyCurlResult {
    headline?: string;
    experiences?: LinkedInExperience[];
    last_updated?: number; // Unix timestamp for freshness checking
    [key: string]: unknown; // Changed from any to unknown
}

interface BriefRow { text: string; source: number }
interface JsonBriefFromLLM {
  executive: BriefRow[]; highlights: BriefRow[];
  funFacts: BriefRow[]; researchNotes: BriefRow[];
}

interface CompanySearch { 
  elements: { id: string }[] 
}

interface ProfSearch { 
  elements: { 
    linkedinUrl: string; 
    name: string; 
    headline?: string; 
    position?: string; 
    location?: { linkedinText: string };
    publicIdentifier?: string;
    hidden?: boolean;
  }[] 
}

interface HarvestLinkedInProfile {
  firstName?: string;
  lastName?: string;
  headline?: string;
  currentPosition?: { companyName?: string }[];
  experience?: { 
    companyName?: string; 
    position?: string; 
    endDate?: unknown;
    startDate?: YearMonthDay;
  }[];
  [key: string]: unknown;
}

interface ScrapeResult {
  url: string;
  fullProfile: HarvestLinkedInProfile;
  success: boolean;
}

export interface Citation { marker: string; url: string; title: string; snippet: string; }

export interface MeetingBriefPayload {
  brief: string; citations: Citation[]; tokensUsed: number;
  serperSearchesMade: number; 
  // Harvest credits
  harvestCreditsUsed: number;
  // Legacy Proxycurl counters (deprecated but kept for compatibility)
  proxycurlCompanyLookupCalls: number;
  proxycurlPersonLookupCalls: number;
  proxycurlProfileFreshCalls: number;
  proxycurlProfileDirectCalls: number;
  proxycurlCreditsUsed: number;
  proxycurlCallsMade: number;
  proxycurlLookupCallsMade: number; 
  proxycurlFreshProfileCallsMade: number;
  firecrawlAttempts: number; firecrawlSuccesses: number;
  finalSourcesConsidered: { url: string; title: string; processed_snippet: string }[];
  possibleSocialLinks: string[];
}

/* ── HELPERS ────────────────────────────────────────────────────────────── */
const getOpenAIClient = () => {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required but not set");
  }
  return new OpenAI({ apiKey: OPENAI_API_KEY });
};

const postJSON = async <T>( // The flagged line was here (106 in your build)
  url: string,
  body: unknown,
  headers: Record<string, string>,
  method: "POST" | "GET" = "POST",
): Promise<T> => {
  const options: RequestInit = {
    method: method,
    headers: { ...headers, "Content-Type": "application/json" },
  };
  if (method === "POST") {
    options.body = JSON.stringify(body);
  }

  const response: FetchResponse = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`postJSON Error: HTTP ${response.status} for ${url}. Body: ${errorText.slice(0, 500)}`);
    throw new Error(`HTTP ${response.status} – ${errorText}`);
  }

  // Explicitly handle 'any' from response.json()
  const jsonDataFromFetch = await response.json(); // .json() from node-fetch types often returns Promise<any>
  const unknownResult: unknown = jsonDataFromFetch;   // Step through 'unknown'
  return unknownResult as T;                          // Cast from 'unknown' to the specific generic type 'T'
};


const estimateTokens = (text: string): number => Math.ceil((text || "").length / 3.5);
const cleanLLMOutputText = (text: string): string => (text || "").replace(/\s*\(?\s*source\s*\d+\s*\)?/gi, "").trim();
const normalizeCompanyName = (companyName: string): string =>
  (companyName || "")
    .toLowerCase()
    .replace(/[,.]?\s*(inc|llc|ltd|gmbh|corp|corporation|limited|company|co)\s*$/i, "")
    .replace(/[.,']/g, "")
    .trim();

/* ── Credit-Aware LinkedIn Resolution Helpers ──────────────────────────── */
const slugifyCompanyName = (org: string): string => {
  return org.toLowerCase().replace(/[^a-z0-9]/g, "");
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isOlderThan = (lastUpdatedEpoch: number, days: number): boolean => {
  const now = Date.now() / 1000; // Current time in Unix seconds
  const ageDays = (now - lastUpdatedEpoch) / 86400; // Convert to days
  return ageDays >= days;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LinkedInResolutionResult {
  url: string;
  profile: ProxyCurlResult | null;
  creditsUsed: number;
}

/* ── LinkedIn Person Lookup Helpers ─────────────────────────────────────── */
const splitFullName = (fullName: string): { first: string; last: string } => {
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 1) {
    return { first: nameParts[0], last: "" };
  }
  // Take first part as first name, everything else as last name
  const first = nameParts[0];
  const last = nameParts.slice(1).join(" ");
  return { first, last };
};


/* ── Firecrawl with Logging and Retry ───────────────────────────────────── */
let firecrawlGlobalAttempts = 0;
let firecrawlGlobalSuccesses = 0;

const firecrawlWithLogging = async (url: string, attemptInfoForLogs: string): Promise<string | null> => {
  firecrawlGlobalAttempts++;
  
  // Skip PDFs and known slow domains - use shorter timeout
  const isProbablySlowOrPdf = url.includes('.pdf') || 
    url.includes('newyorkfed.org') || 
    url.includes('fsb.org') || 
    url.includes('brokercheck.finra.org') ||
    url.includes('zoominfo.com');
  
  const tryScrapeOnce = async (timeoutMs: number): Promise<string | null> => {
    try {
      console.log(`[Firecrawl Attempt] ${attemptInfoForLogs} - URL: ${url}, Timeout: ${timeoutMs}ms`);
      const response = await Promise.race([
        postJSON<FirecrawlScrapeV1Result>(
          FIRECRAWL_API_URL, { url }, { Authorization: `Bearer ${FIRECRAWL_KEY!}` }
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);

      if (response && response.success && response.data?.article && typeof response.data.article.text_content === 'string') {
        console.log(`[Firecrawl Success] ${attemptInfoForLogs} - URL: ${url}. Got article.text_content (length: ${response.data.article.text_content.length})`);
        firecrawlGlobalSuccesses++;
        return response.data.article.text_content;
      } else if (response && response.success && response.data) {
         const fallbackText = response.data.text_content || response.data.markdown;
         if (fallbackText && typeof fallbackText === 'string') {
            console.warn(`[Firecrawl PartialSuccess] ${attemptInfoForLogs} - URL: ${url}. No article.text_content, but found other text (length: ${fallbackText.length}).`);
            firecrawlGlobalSuccesses++;
            return fallbackText;
         }
        console.warn(`[Firecrawl NoContent] ${attemptInfoForLogs} - URL: ${url}. Response success=true but no usable text_content/markdown. Full Response: ${JSON.stringify(response).slice(0,300)}...`);
        return null;
      } else if (response && !response.success) {
        console.error(`[Firecrawl API Error] ${attemptInfoForLogs} - URL: ${url}. Error: ${response.error || 'Unknown Firecrawl error'}. Status: ${response.status || 'N/A'}`);
        return null;
      } else {
        console.warn(`[Firecrawl OddResponse] ${attemptInfoForLogs} - URL: ${url}. Unexpected response structure: ${JSON.stringify(response).slice(0,300)}...`);
        return null;
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`[Firecrawl Exception] ${attemptInfoForLogs} - URL: ${url}, Timeout: ${timeoutMs}ms. Error: ${err.message}`, err.stack ? `\nStack: ${err.stack.slice(0,300)}` : '');
      return null;
    }
  };

  let content = await tryScrapeOnce(isProbablySlowOrPdf ? 3000 : 7000);
  if (content === null && !isProbablySlowOrPdf) {
    console.warn(`[Firecrawl Retry] First attempt failed for ${url} (${attemptInfoForLogs}). Retrying.`);
    content = await tryScrapeOnce(15000);
    if (content === null) console.error(`[Firecrawl FailedAllAttempts] URL: ${url} (${attemptInfoForLogs}).`);
  } else if (content === null && isProbablySlowOrPdf) {
    console.warn(`[Firecrawl Skip] Skipping retry for slow/PDF URL: ${url} (${attemptInfoForLogs}).`);
  }
  return content;
};

/* ── HTML Rendering Helpers ─────────────────────────────────────────────── */
const renderParagraphsWithCitations = (rows: BriefRow[], citations: Citation[]): string =>
  rows.map(row => {
      if (typeof row.source !== 'number' || row.source < 1 || row.source > citations.length) {
          console.warn("Invalid source number in BriefRow for pSent:", row, "Max citations:", citations.length);
          return `<p>${cleanLLMOutputText(row.text)} <sup>[source error]</sup></p>`;
      }
      const citation = citations[row.source - 1];
      const supLink = `<sup><a href="${citation.url}" target="_blank" rel="noopener noreferrer" title="${(citation.title || "").replace(/"/g, '"')}">${row.source}</a></sup>`;
      return `<p>${cleanLLMOutputText(row.text)} ${supLink}</p>`;
    }).join("\n");

const renderUnorderedListWithCitations = (rows: BriefRow[], citations: Citation[]): string =>
  rows.length
    ? `<ul class="list-disc pl-5">\n${rows.map(row => {
          if (typeof row.source !== 'number' || row.source < 1 || row.source > citations.length) {
              console.warn("Invalid source number in BriefRow for ulRows:", row, "Max citations:", citations.length);
              return `  <li>${cleanLLMOutputText(row.text)} <sup>[source error]</sup></li>`;
          }
          const citation = citations[row.source - 1];
          const supLink = `<sup><a href="${citation.url}" target="_blank" rel="noopener noreferrer" title="${(citation.title || "").replace(/"/g, '"')}">${row.source}</a></sup>`;
          return `  <li>${cleanLLMOutputText(row.text)} ${supLink}</li>`;
        }).join("\n")}\n</ul>`
    : "";

const renderJobHistoryList = (jobTimeline: string[]): string =>
  jobTimeline.length
    ? `<ul class="list-disc pl-5">\n${jobTimeline.map(job => `  <li>${job}</li>`).join("\n")}\n</ul>`
    : "<p>Timeline unavailable (private profile or no work history).</p>";

const renderFullHtmlBrief = (
  targetName: string, targetOrg: string, llmJsonBrief: JsonBriefFromLLM,
  citationsList: Citation[], jobHistory: string[],
): string => {
  const sectionSpacer = "<p> </p>";
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
export async function buildMeetingBriefGemini(name: string, org: string): Promise<MeetingBriefPayload> {
  firecrawlGlobalAttempts = 0;

  /* Track whether Harvest threw a quota/auth error */
  let harvestErrored = false;
  firecrawlGlobalSuccesses = 0;
  
  // Initialize counters
  let serperCallsMade = 0;

  const startTime = Date.now();
  let collectedSerpResults: SerpResult[] = [];
  let linkedInProfileResult: SerpResult | null = null;
  let proxyCurlData: ProxyCurlResult | null = null;
  let jobHistoryTimeline: string[] = [];

  const { first, last } = splitFullName(name);
  console.log(`[MB Pipeline] Starting LinkedIn resolution for "${first} ${last}" at "${org}"`);

  /* ─────────────  H A R V E S T   P I P E L I N E  ───────────── */
  if (canUseHarvest) {
    try {
      const harvestResult = await llmEnhancedHarvestPipeline(name, org);
      
      if (harvestResult.success) {
        proxyCurlData = harvestResult.profile as ProxyCurlResult | null;
        jobHistoryTimeline = harvestResult.jobTimeline || [];
        (globalThis as { hasResumeData?: boolean }).hasResumeData = true;

        linkedInProfileResult = {
          title: `${name} | LinkedIn`,
          link: harvestResult.linkedinUrl || '',
          snippet: (harvestResult.profile as { headline?: string }).headline ?? `LinkedIn profile for ${name}`
        };
        
        if (linkedInProfileResult.link) {
          collectedSerpResults.push(linkedInProfileResult);
        }
        
        console.log(`[MB] Successfully resolved LinkedIn profile via Harvest + LLM (${harvestResult.searchMethod} search)`);
        console.log(`[MB] LLM reasoning: ${harvestResult.llmReasoning}`);
        console.log(`[MB] Company evidence: ${harvestResult.companyEvidence?.join('; ') || 'None provided'}`);
      } else {
        console.log(`[Harvest] Failed: ${harvestResult.reason}`);
        harvestErrored = true;
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      harvestErrored = true;
      console.warn(`[Harvest] Pipeline failed: ${error.message}`);
    }
  } else {
    console.log("[Harvest] Skipped – no API key.");
  }

  // Apply SERP post-filter whenever we still lack resume data
  const hasResumeData = (globalThis as { hasResumeData?: boolean }).hasResumeData ?? false;
  if (!hasResumeData) {
    const orgToken = normalizeCompanyName(org);
    const heuristicDomain = `${slugifyCompanyName(org)}.com`;
    const initialSerpCount = collectedSerpResults.length;
    
    collectedSerpResults = collectedSerpResults.filter(r => {
      const titleSnippet = (r.title + " " + (r.snippet ?? "")).toLowerCase();
      const nameToken = name.toLowerCase();
      const nameInContent = titleSnippet.includes(nameToken);
      const orgInContent = titleSnippet.includes(orgToken);
      const urlContainsOrg = r.link.includes(heuristicDomain);
      
      return urlContainsOrg || (nameInContent && orgInContent);
    });
    
    console.log(`[MB] SERP post-filter applied – kept ${collectedSerpResults.length}/${initialSerpCount} results`);
    
    // Safety net: abort if nothing survives
    if (collectedSerpResults.length === 0) {
      jobHistoryTimeline = ["No public work, education, volunteer, or web mentions found."];
      console.log("[MB] No results survived filtering, returning minimal brief");
    }
  }

  // ── Continue with existing pipeline for general research ─────────────────
  console.log(`[MB Step 4] Running initial Serper queries for "${name}" and "${org}"`);
  const initialQueries = [
    { q: `"${name}" "${org}" OR "${name}" "linkedin.com/in/"`, num: 10 },
    { q: `"${name}" "${org}" (interview OR profile OR news OR "press release" OR biography)`, num: 10 },
    { q: `"${name}" (award OR recognition OR keynote OR webinar OR conference OR patent OR publication)`, num: 10 },
  ];

  for (const query of initialQueries) {
    try {
      const response = await postJSON<{ organic?: SerpResult[] }>(
        SERPER_API_URL, { q: query.q, num: query.num, gl: "us", hl: "en" }, { "X-API-KEY": SERPER_KEY! },
      );
      serperCallsMade++;
      if (response.organic) collectedSerpResults.push(...response.organic);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.warn(`[MB Step 4] Serper query failed for "${query.q}". Error: ${err.message}`);
    }
  }

  // ── STEP 5: Prior-Company Searches (when hasResumeData is true) ──────────
  if (hasResumeData && proxyCurlData?.experiences) {
    console.log(`[MB Step 5] Running additional Serper queries for prior organizations of "${name}".`);
    const priorCompanies = proxyCurlData.experiences
      .map(exp => exp.company)
      .filter((c): c is string => !!c);
    const uniquePriorCompanies = priorCompanies
      .filter((c, i, arr) => 
        i === arr.findIndex(x => normalizeCompanyName(x) === normalizeCompanyName(c)) && 
        normalizeCompanyName(c) !== normalizeCompanyName(org)
      )
      .slice(0, 3);
    
    for (const company of uniquePriorCompanies) {
      try {
        const response = await postJSON<{ organic?: SerpResult[] }>(
          SERPER_API_URL, { q: `"${name}" "${company}"`, num: 5, gl: "us", hl: "en" }, { "X-API-KEY": SERPER_KEY! },
        );
        serperCallsMade++;
        if (response.organic) collectedSerpResults.push(...response.organic);
      } catch (e: unknown) {
        const err = e instanceof Error ? e : new Error(String(e));
        console.warn(`[MB Step 5] Serper query failed for prior company "${company}". Error: ${err.message}`);
      }
    }
  }

  // ------------------------------------------------------------------------
  // SECOND-PASS SERP FILTER
  // If we still have **no resume data**, eliminate any results that
  // do NOT mention both the NAME **and** ORG token (or the org domain).
  // This closes the loophole where later Serper queries re-introduce
  // irrelevant matches (e.g., the college-football Thomas Nance).
  // ------------------------------------------------------------------------
  if (!(globalThis as { hasResumeData?: boolean }).hasResumeData) {
    const orgTok   = normalizeCompanyName(org);
    const domHint  = `${slugifyCompanyName(org)}.com`;
    const nameTok  = name.toLowerCase();

    const pre = collectedSerpResults.length;
    collectedSerpResults = collectedSerpResults.filter(r => {
      const txt = (r.title + ' ' + (r.snippet ?? '')).toLowerCase();
      const urlHasOrg   = r.link.includes(domHint);
      const nameAndOrg  = txt.includes(nameTok) && txt.includes(orgTok);
      return urlHasOrg || nameAndOrg;
    });
    console.log(`[MB] 2nd-pass SERP filter (no-resume path) – kept ${collectedSerpResults.length}/${pre}`);

    // Optional short-circuit: return a stub brief if truly nothing useful
    if (collectedSerpResults.length === 0) {
      jobHistoryTimeline = [
        "No public work, education, volunteer, or web mentions found."
      ];
      console.log("[MB] No results after 2nd-pass filter – returning minimal brief.");

      return {
        brief: renderFullHtmlBrief(
          name,
          org,
          { executive: [], highlights: [], funFacts: [], researchNotes: [] },
          [],
          jobHistoryTimeline
        ),
        citations: [],
        tokensUsed: 0,
        serperSearchesMade: serperCallsMade,
        // Harvest credits
        harvestCreditsUsed: 0,
        // Legacy counters (deprecated but kept for compatibility)
        proxycurlCompanyLookupCalls: 0,
        proxycurlPersonLookupCalls: 0,
        proxycurlProfileFreshCalls: 0,
        proxycurlProfileDirectCalls: 0,
        proxycurlCreditsUsed: 0,
        proxycurlCallsMade: 0,
        proxycurlLookupCallsMade: 0,
        proxycurlFreshProfileCallsMade: 0,
        firecrawlAttempts: firecrawlGlobalAttempts,
        firecrawlSuccesses: firecrawlGlobalSuccesses,
        finalSourcesConsidered: [],
        possibleSocialLinks: [],
      };
    }
  }
  // ------------------------------------------------------------------------

  console.log(`[MB Step 6] Deduplicating and filtering SERP results. Initial count: ${collectedSerpResults.length}`);
  const uniqueSerpResults = Array.from(new Map(collectedSerpResults.map(r => [r.link, r])).values());
  console.log(`[MB Step 6] Unique SERP results: ${uniqueSerpResults.length}`);

  // ── De-prioritise RocketReach etc. ─────────────────────────
  let filtered = uniqueSerpResults.filter(
    r => r.link === linkedInProfileResult?.link ||
         !NO_SCRAPE_URL_SUBSTRINGS.some(skip => r.link.includes(skip))
  );
  const reliable = filtered.filter(
    r => !LOW_TRUST_DOMAINS.some(d => r.link.includes(d))
  );
  if (reliable.length >= MIN_RELIABLE_SOURCES) {
    filtered = reliable.concat(              // keep good ones first
      filtered.filter(r => !reliable.includes(r))   // low-trust at the end
    );
  }
  const sourcesToProcessForLLM = filtered.slice(0, MAX_SOURCES_TO_LLM);

  console.log(`[MB Step 6] Sources to process for LLM: ${sourcesToProcessForLLM.length}`);

  const possibleSocialLinks = SOCIAL_DOMAINS
    .flatMap(domain => uniqueSerpResults.filter(r => r.link.includes(domain)).map(r => r.link))
    .filter((link, i, arr) => arr.indexOf(link) === i);

  console.log(`[MB Step 7] Starting Firecrawl for ${sourcesToProcessForLLM.length} sources.`);
  const extractedTextsForLLM = new Array(sourcesToProcessForLLM.length).fill("");
  let firecrawlTimeSpentMs = 0;

  for (let i = 0; i < sourcesToProcessForLLM.length; i += FIRECRAWL_BATCH_SIZE) {
    const remainingTimeBudget = FIRECRAWL_GLOBAL_BUDGET_MS - firecrawlTimeSpentMs;
    if (remainingTimeBudget <= 0) {
      console.warn(`[MB Step 7] Firecrawl global time budget exhausted. Remaining sources use snippets.`);
      for (let j = i; j < sourcesToProcessForLLM.length; j++) {
        const source = sourcesToProcessForLLM[j];
        extractedTextsForLLM[j] = source.link === linkedInProfileResult?.link && proxyCurlData?.headline
          ? `LinkedIn profile for ${name}. Headline: ${proxyCurlData.headline}. URL: ${source.link}`
          : `${source.title}. ${source.snippet ?? ""}`;
      }
      break;
    }
    const currentBatch = sourcesToProcessForLLM.slice(i, i + FIRECRAWL_BATCH_SIZE)
      .map((source, indexInBatch) => ({ sourceItem: source, globalIndex: i + indexInBatch, indexInBatch }));
    const batchStartTime = Date.now();
    await Promise.allSettled(
      currentBatch.map(async (batchItem) => {
        const { sourceItem: source, globalIndex, indexInBatch: itemIdxInBatch } = batchItem;
        const attemptInfoForLogs = `Batch ${Math.floor(i / FIRECRAWL_BATCH_SIZE) + 1}, ItemInBatch ${itemIdxInBatch + 1}/${currentBatch.length}, GlobalIdx ${globalIndex + 1}`;
        if (source.link === linkedInProfileResult?.link && proxyCurlData?.headline) {
          extractedTextsForLLM[globalIndex] = `LinkedIn profile for ${name}. Headline: ${proxyCurlData.headline}. URL: ${source.link}`; return;
        }
        if (NO_SCRAPE_URL_SUBSTRINGS.some(skip => source.link.includes(skip))) {
          extractedTextsForLLM[globalIndex] = `${source.title}. ${source.snippet ?? ""}`; return;
        }
        const scrapedText = await firecrawlWithLogging(source.link, attemptInfoForLogs);
        if (scrapedText) {
          const snippetText = source.snippet || "";
          const snippetIsLikelyRedundant = snippetText && scrapedText.toLowerCase().includes(snippetText.toLowerCase().slice(0, Math.min(50, snippetText.length > 0 ? snippetText.length -1 : 0)));
          extractedTextsForLLM[globalIndex] = (snippetIsLikelyRedundant ? scrapedText : `${scrapedText}\n\nSnippet for context: ${source.title}. ${snippetText}`).slice(0, 3500);
        } else {
          extractedTextsForLLM[globalIndex] = `${source.title}. ${source.snippet ?? ""}`;
        }
      }),
    );
    firecrawlTimeSpentMs += Date.now() - batchStartTime;
    console.log(`[MB Step 7] Batch ${Math.floor(i / FIRECRAWL_BATCH_SIZE) + 1} processed. Total Firecrawl time: ${firecrawlTimeSpentMs}ms`);
  }
  console.log(`[MB Step 7] Firecrawl processing finished. Global attempts: ${firecrawlGlobalAttempts}, Successes: ${firecrawlGlobalSuccesses}`);

  const llmSourceBlock = sourcesToProcessForLLM
    .map((source, index) => `SOURCE_${index + 1} URL: ${source.link}\nCONTENT:\n${extractedTextsForLLM[index] || "No content extracted or snippet used."}`)
    .join("\n\n---\n\n");
  const llmJsonTemplate = JSON.stringify({ executive: [{text:"",source:1}], highlights: [{text:"",source:1}], funFacts: [{text:"",source:1}], researchNotes: [{text:"",source:1}] }, null, 2);
  const systemPromptForLLM = `You are an AI assistant creating a concise meeting brief about a person for a professional meeting.
The user will provide context about the person, their current organization, their job history from LinkedIn, and a list of numbered sources with URLs and extracted content.
Your task is to populate a JSON object strictly adhering to the TEMPLATE provided.
- Each item in the arrays ("executive", "highlights", "funFacts", "researchNotes") must be an object with "text" (a string) and "source" (the 1-based number of the source it came from, accurately referencing the provided SOURCES_FOR_ANALYSIS).
- "executive" summary: 2-3 key sentences about the person, highly relevant for someone about to meet them professionally. Focus on their current role and one major accomplishment or characteristic.
- "highlights": 3-5 bullet points covering notable achievements, skills, or significant public information. Prioritize information from fuller text sources if available.
- "funFacts": 1-3 interesting, lighter details if available (e.g., hobbies mentioned, unique experiences, personal website info). If none, this array MUST be empty ([]).
- "researchNotes": 4-6 distinct, concise notes or direct observations from the provided sources. These can be more granular than highlights. If a source is weak (e.g., just a snippet), a note might reflect that limited scope.
- For ALL "text" fields: Be very concise. Do NOT invent information or make assumptions beyond the provided text. If a category has no relevant information from the sources, its array MUST be empty ([]).
- Do NOT include phrases like "Source X says...", "According to Source Y...", or any citation markers like "[1]" or "(source 1)" directly within the "text" fields. The "source" number property provides all attribution.
- Ensure all "source" numbers are accurate integers corresponding to the provided source list (1 to N, where N is the number of sources in SOURCES_FOR_ANALYSIS).
- Validate that all "text" fields are strings, and all "source" fields are integers.
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

### SOURCES_FOR_ANALYSIS (numbered 1 to ${sourcesToProcessForLLM.length})
${llmSourceBlock}
`.trim();

  console.log(`[MB Step 8] Sending ~${estimateTokens(systemPromptForLLM + userPromptForLLM)} tokens to LLM (${MODEL_ID}) for structured brief generation.`);
  let llmJsonBrief: JsonBriefFromLLM = { executive: [], highlights: [], funFacts: [], researchNotes: [] };
  let llmOutputTokens = 0;

  if (OPENAI_API_KEY) {
    try {
      const ai = getOpenAIClient();
      const llmResponse = await ai.chat.completions.create({
        model: MODEL_ID, temperature: 0.0, response_format: { type: "json_object" },
        messages: [{ role: "system", content: systemPromptForLLM }, { role: "user", content: userPromptForLLM }],
      });
      llmOutputTokens = llmResponse.usage?.completion_tokens ?? 0;
      const content = llmResponse.choices[0].message.content;
      if (content) {
        try {
          const parsedContent = JSON.parse(content) as Partial<JsonBriefFromLLM>; // Cast as Partial for safer access
          // Validate and structure the parsed content, providing defaults for missing arrays
          // and ensuring sub-objects have the correct shape.
          const validateRows = (rows: unknown[] | undefined): BriefRow[] => {
            if (!Array.isArray(rows)) return [];
            return rows.filter(
              r => r && typeof (r as BriefRow).text === 'string' && typeof (r as BriefRow).source === 'number' && (r as BriefRow).source > 0 && (r as BriefRow).source <= sourcesToProcessForLLM.length
            ).map(r => r as BriefRow); // Ensure the final map also casts to BriefRow
          };
          llmJsonBrief = {
            executive: validateRows(parsedContent.executive),
            highlights: validateRows(parsedContent.highlights),
            funFacts: validateRows(parsedContent.funFacts),
            researchNotes: validateRows(parsedContent.researchNotes),
          };
          console.log("[MB Step 8] Successfully parsed LLM JSON response.");
        } catch (e: unknown) {
          const err = e instanceof Error ? e : new Error(String(e));
          console.error(`[MB Step 8] LLM response was not valid JSON. Error: ${err.message}. Response snippet: ${(content || "").slice(0,1000)}...`);
        }
      } else { console.warn("[MB Step 8] LLM response content was null or empty. Using empty brief."); }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error(`[MB Step 8] OpenAI API call failed. Error: ${err.message}`);
    }
  } else { console.warn("[MB Step 8] Skipped OpenAI call: OPENAI_API_KEY not set. Using empty brief."); }

  const deduplicateBriefRows = (rows?: BriefRow[]): BriefRow[] => {
    if (!Array.isArray(rows)) return [];
    return Array.from(new Map(rows.map(row => [cleanLLMOutputText(row.text || "").toLowerCase(), { ...row, text: cleanLLMOutputText(row.text || "") }])).values());
  };
  llmJsonBrief.executive = deduplicateBriefRows(llmJsonBrief.executive);
  llmJsonBrief.highlights = deduplicateBriefRows(llmJsonBrief.highlights);
  llmJsonBrief.funFacts = deduplicateBriefRows(llmJsonBrief.funFacts);

  const finalCitations: Citation[] = sourcesToProcessForLLM.map((source, index) => ({
    marker: `[${index + 1}]`, url: source.link, title: source.title,
    snippet: (extractedTextsForLLM[index] || `${source.title}. ${source.snippet ?? ""}`).slice(0, 300) + ((extractedTextsForLLM[index]?.length || 0) > 300 ? "..." : ""),
  }));

  const htmlBriefOutput = renderFullHtmlBrief(name, org, llmJsonBrief, finalCitations, jobHistoryTimeline);
  const totalInputTokensForLLM = estimateTokens(systemPromptForLLM + userPromptForLLM);
  const totalTokensUsed = totalInputTokensForLLM + llmOutputTokens;
  const wallTimeSeconds = (Date.now() - startTime) / 1000;

  console.log(`[MB Finished] Processed for "${name}". Total tokens: ${totalTokensUsed}. Serper: ${serperCallsMade}. HarvestErrored=${harvestErrored}. Firecrawl attempts: ${firecrawlGlobalAttempts}, successes: ${firecrawlGlobalSuccesses}. Wall time: ${wallTimeSeconds.toFixed(1)}s`);

  return {
    brief: htmlBriefOutput, 
    citations: finalCitations, 
    tokensUsed: totalTokensUsed,
    serperSearchesMade: serperCallsMade, 
    // Harvest credits
    harvestCreditsUsed: 0,
    // Legacy counters (deprecated but kept for compatibility)
    proxycurlCompanyLookupCalls: 0,
    proxycurlPersonLookupCalls: 0,
    proxycurlProfileFreshCalls: 0,
    proxycurlProfileDirectCalls: 0,
    proxycurlCreditsUsed: 0,
    proxycurlCallsMade: 0,
    proxycurlLookupCallsMade: 0,
    proxycurlFreshProfileCallsMade: 0,
    firecrawlAttempts: firecrawlGlobalAttempts, 
    firecrawlSuccesses: firecrawlGlobalSuccesses,
    finalSourcesConsidered: sourcesToProcessForLLM.map((s, idx) => ({
      url: s.link, title: s.title,
      processed_snippet: (extractedTextsForLLM[idx] || "Snippet/Error").slice(0, 300) + ((extractedTextsForLLM[idx]?.length || 0) > 300 ? "..." : ""),
    })),
    possibleSocialLinks,
  };
}

/* ── Harvest helper ────────────────────────────────────────────────────── */
const harvestGet = async <T>(endpoint: string, qs: Record<string, string>): Promise<T> => {
  const url = `${HARVEST_BASE}${endpoint}?` + new URLSearchParams(qs).toString();
  const resp = await fetch(url, { headers: { "X-API-Key": HARVEST_API_KEY! } });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`[Harvest] ${endpoint} → ${resp.status}\n${body.slice(0,300)}`);
  }
  return resp.json() as Promise<T>;
};

const formatJobSpanFromProxyCurl = (starts_at?: YearMonthDay, ends_at?: YearMonthDay): string => {
  const startYear = starts_at?.year ? starts_at.year.toString() : "?";
  const endYear = ends_at?.year ? ends_at.year.toString() : "Present";
  return `${startYear} – ${endYear}`;
};

// Helper function to find company matches in full profile data
const findCompanyMatches = (fullProfile: unknown, targetOrg: string) => {
  const normalizedTarget = normalizeCompanyName(targetOrg);
  let score = 0;
  const evidence: string[] = [];
  
  // Check current positions
  if ((fullProfile as { currentPosition?: { companyName?: string }[] }).currentPosition?.length) {
    for (const pos of (fullProfile as { currentPosition: { companyName?: string }[] }).currentPosition) {
      if (pos.companyName) {
        const normalizedCompany = normalizeCompanyName(pos.companyName);
        if (normalizedCompany.includes(normalizedTarget) || normalizedTarget.includes(normalizedCompany)) {
          score += 10;
          evidence.push(`Current position at: ${pos.companyName}`);
        }
      }
    }
  }
  
  // Check experience
  if ((fullProfile as { experience?: { companyName?: string; position?: string; endDate?: unknown }[] }).experience?.length) {
    for (const exp of (fullProfile as { experience: { companyName?: string; position?: string; endDate?: unknown }[] }).experience) {
      if (exp.companyName) {
        const normalizedCompany = normalizeCompanyName(exp.companyName);
        if (normalizedCompany.includes(normalizedTarget) || normalizedTarget.includes(normalizedCompany)) {
          // Current role gets more points
          const isCurrentRole = !exp.endDate || exp.endDate === null;
          const points = isCurrentRole ? 8 : 4;
          score += points;
          evidence.push(`${isCurrentRole ? 'Current' : 'Past'} experience at: ${exp.companyName} (${exp.position || 'Unknown role'})`);
        }
      }
    }
  }
  
  // Check headline for company mentions (lower weight)
  if ((fullProfile as { headline?: string }).headline) {
    const normalizedHeadline = normalizeCompanyName((fullProfile as { headline: string }).headline);
    if (normalizedHeadline.includes(normalizedTarget)) {
      score += 2;
      evidence.push(`Company mentioned in headline: ${(fullProfile as { headline: string }).headline}`);
    }
  }
  
  return { score, evidence };
};

// LLM-powered profile selection
const llmProfileSelection = async (
  candidates: ProfSearch['elements'], 
  targetName: string, 
  targetOrg: string,
  openAiClient: OpenAI,
  wasCompanyFiltered: boolean = true
): Promise<{ selectedUrls: string[], reasoning: string }> => {
  
  const systemPrompt = `You are a LinkedIn profile matching expert. Your task is to identify which profiles from a search result most likely belong to a specific person at a specific company.

${wasCompanyFiltered 
  ? "IMPORTANT: These search results were already filtered by company, so all candidates work at or have worked at the target company. Focus on finding the person with the right NAME."
  : "IMPORTANT: These search results were NOT filtered by company, so candidates may work at different companies. You need to find profiles that match BOTH the name AND show evidence of working at the target company."
}

Return a JSON object with:
{
  "selectedUrls": ["url1", "url2"], // 1-2 URLs of most likely matches, ordered by confidence
  "reasoning": "Brief explanation of why these profiles were selected"
}

Consider:
1. Name similarity/matching (most important)
2. ${wasCompanyFiltered 
    ? "Professional title/seniority level consistency" 
    : "Evidence of working at target company (in position/title)"
   }
3. Location plausibility 
4. Profile completeness (profiles with positions vs empty ones)

If no good matches, return empty selectedUrls array.`;

  const candidatesJson = candidates.map(c => ({
    name: c.name,
    position: c.position || 'Not specified',
    location: c.location?.linkedinText || 'Not specified',
    linkedinUrl: c.linkedinUrl,
    publicIdentifier: c.publicIdentifier
  }));

  const userPrompt = `Target person: "${targetName}"
Target company: "${targetOrg}"

LinkedIn search results ${wasCompanyFiltered ? '(already filtered by company)' : '(NOT filtered by company - verify company match)'}:
${JSON.stringify(candidatesJson, null, 2)}

Which profile(s) most likely belong to "${targetName}"${wasCompanyFiltered ? '' : ' AND work at "' + targetOrg + '"'}? Return 1-2 best matches.`;

  try {
    const response = await openAiClient.chat.completions.create({
      model: MODEL_ID,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from OpenAI');

    const result = JSON.parse(content);
    return {
      selectedUrls: result.selectedUrls || [],
      reasoning: result.reasoning || 'No reasoning provided'
    };

  } catch (error) {
    console.error('[LLM Selection] Failed:', error);
    // Fallback: pick the first candidate with a good name match
    const fallback = candidates.find(c => 
      c.name.toLowerCase().includes(targetName.toLowerCase()) ||
      targetName.toLowerCase().includes(c.name.toLowerCase())
    );
    
    return {
      selectedUrls: fallback ? [fallback.linkedinUrl] : [],
      reasoning: 'LLM selection failed, used name matching fallback'
    };
  }
};

// Updated Harvest pipeline using LLM selection
const llmEnhancedHarvestPipeline = async (name: string, org: string) => {
  try {
    // 1. Company search  
    console.log(`[Harvest] Company search for "${org}"`);
    const comp = await harvestGet<CompanySearch>("/linkedin/company-search", { search: org, limit: "3" });
    const companyId = comp.elements?.[0]?.id;

    if (!companyId) {
      console.log("[Harvest] Company search returned 0 results.");
      return { success: false, reason: 'Company not found' };
    }

    // 2. Profile search with company filter first
    console.log(`[Harvest] Profile search for "${name}" (companyId=${companyId})`);
    let prof = await harvestGet<ProfSearch>("/linkedin/profile-search", { 
      search: name, 
      companyId, 
      limit: "10" 
    });

    // 2b. Fallback: if company-filtered search returns 0 results, try without company filter
    let wasCompanyFiltered = true;
    if (!prof.elements?.length) {
      console.log(`[Harvest] Company-filtered search returned 0 results. Trying broader search without company filter.`);
      prof = await harvestGet<ProfSearch>("/linkedin/profile-search", { 
        search: name, 
        limit: "15" // Slightly higher limit for broader search
      });
      wasCompanyFiltered = false;
      
      if (!prof.elements?.length) {
        console.log("[Harvest] Even broader search returned 0 results.");
        return { success: false, reason: 'No profiles found in company-filtered or broader search' };
      }
      
      console.log(`[Harvest] Broader search found ${prof.elements.length} candidates (will verify company matches later)`);
    } else {
      console.log(`[Harvest] Company-filtered search found ${prof.elements.length} candidates`);
    }

    // 3. Filter out obviously bad matches (no URL, hidden profiles, etc.)
    const validCandidates = prof.elements.filter((profile: ProfSearch['elements'][0]) => 
      profile.linkedinUrl && 
      profile.name && 
      !profile.hidden &&
      profile.name.toLowerCase() !== 'linkedin member'
    );

    if (validCandidates.length === 0) {
      console.log("[Harvest] No valid candidates after filtering");
      return { success: false, reason: 'No valid candidates' };
    }

    console.log(`[Harvest] Found ${validCandidates.length} valid candidates using ${wasCompanyFiltered ? 'company-filtered' : 'broader'} search:`, 
      validCandidates.map((c: ProfSearch['elements'][0]) => ({ name: c.name, position: c.position }))
    );

    // 4. Use LLM to select best candidate(s)
    const openAiClient = getOpenAIClient();
    const selection = await llmProfileSelection(validCandidates, name, org, openAiClient, wasCompanyFiltered);
    
    console.log(`[LLM Selection] ${selection.reasoning}`);
    console.log(`[LLM Selection] Selected ${selection.selectedUrls.length} URLs for scraping`);

    if (selection.selectedUrls.length === 0) {
      console.log("[Harvest] LLM found no suitable matches");
      return { success: false, reason: 'LLM found no suitable matches' };
    }

    // 5. Scrape ALL selected profiles for company verification
    const scrapeResults = await Promise.allSettled(
      selection.selectedUrls.map(async url => {
        console.log(`[Harvest] Scraping selected profile: ${url}`);
        const fullProfile = await harvestGet<HarvestLinkedInProfile>("/linkedin/profile", { url });
        return { url, fullProfile, success: true };
      })
    );

    const successfulScrapes = scrapeResults
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value as ScrapeResult);

    if (successfulScrapes.length === 0) {
      console.log("[Harvest] Failed to scrape any selected profiles");
      return { success: false, reason: 'Failed to scrape selected profiles' };
    }

    // 6. Verify company matches in scraped profiles
    const verifiedProfiles = successfulScrapes.map(scrape => {
      const companyMatches = findCompanyMatches(scrape.fullProfile, org);
      return {
        ...scrape,
        companyMatches,
        hasCompanyMatch: companyMatches.score > 0
      };
    });

    console.log(`[Harvest] Company verification results:`, 
      verifiedProfiles.map(p => ({
        url: p.url.split('/').pop(), // just the identifier
        hasMatch: p.hasCompanyMatch,
        evidence: p.companyMatches.evidence
      }))
    );

    // 7. Filter to only profiles with actual company matches
    const profilesWithCompanyMatch = verifiedProfiles.filter(p => p.hasCompanyMatch);

    if (profilesWithCompanyMatch.length === 0) {
      console.log(`[Harvest] None of the selected profiles actually work at "${org}". Falling back to web search.`);
      
      // Log what companies the scraped profiles actually work for
      const actualCompanies = verifiedProfiles.map(p => {
        const companies = [];
        if (p.fullProfile.currentPosition) {
          companies.push(...p.fullProfile.currentPosition.map((pos: { companyName?: string }) => pos.companyName).filter(Boolean));
        }
        if (p.fullProfile.experience) {
          companies.push(...p.fullProfile.experience.slice(0, 3).map((exp: { companyName?: string }) => exp.companyName).filter(Boolean));
        }
        return { profileName: p.fullProfile.firstName + ' ' + p.fullProfile.lastName, companies };
      });
      
      console.log(`[Harvest] Scraped profiles work at:`, actualCompanies);
      console.log(`[Harvest] This suggests either: (1) wrong person selected, (2) person no longer works at ${org}, or (3) profile data incomplete`);
      
      return { success: false, reason: 'No selected profiles actually work at target company' };
    }

    // 8. Take the best company-verified profile (prefer higher company match scores)
    profilesWithCompanyMatch.sort((a, b) => b.companyMatches.score - a.companyMatches.score);
    const bestResult = profilesWithCompanyMatch[0];
    const fullProfile = bestResult.fullProfile;

    console.log(`[Harvest] Selected verified profile with company evidence:`, bestResult.companyMatches.evidence);

    // 9. Build job timeline
    const jobHistoryTimeline = (fullProfile.experience || []).map((exp: { position?: string; companyName?: string; startDate?: YearMonthDay; endDate?: unknown }) =>
      `${exp.position || "Role"} — ${exp.companyName || "Company"} (${formatJobSpanFromProxyCurl(exp.startDate, exp.endDate as YearMonthDay | undefined)})`
    );

    console.log(`[Harvest] Successfully selected, scraped, and verified profile using ${wasCompanyFiltered ? 'company-filtered' : 'broader'} search: ${bestResult.url}`);
    console.log(`[Harvest] Found ${jobHistoryTimeline.length} work experiences`);
    console.log(`[Harvest] Company verification: ${bestResult.companyMatches.evidence.join('; ')}`);

    return {
      success: true,
      profile: fullProfile,
      linkedinUrl: bestResult.url,
      jobTimeline: jobHistoryTimeline,
      llmReasoning: selection.reasoning,
      companyEvidence: bestResult.companyMatches.evidence,
      searchMethod: wasCompanyFiltered ? 'company-filtered' : 'broader'
    };

  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.warn(`[Harvest] Pipeline failed: ${error.message}`);
    return { success: false, reason: error.message };
  }
};
