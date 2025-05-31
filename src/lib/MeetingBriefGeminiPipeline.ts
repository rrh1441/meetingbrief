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
  PROXYCURL_KEY,
} = process.env;

if (!OPENAI_API_KEY || !SERPER_KEY || !FIRECRAWL_KEY || !PROXYCURL_KEY) {
  console.error("CRITICAL ERROR: Missing one or more API keys (OPENAI, SERPER, FIRECRAWL, PROXYCURL). Application will not function correctly.");
}

/* ── CONSTANTS ──────────────────────────────────────────────────────────── */
const MODEL_ID = "gpt-4.1-mini-2025-04-14";
const SERPER_API_URL = "https://google.serper.dev/search";
const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape";

// Credit-aware LinkedIn resolution URLs
const PERSON_LOOKUP_URL = "https://nubela.co/proxycurl/api/linkedin/profile/resolve";
const COMPANY_LOOKUP_URL = "https://nubela.co/proxycurl/api/linkedin/company/resolve";
const PROFILE_URL = "https://nubela.co/proxycurl/api/v2/linkedin";
const PROFILE_FRESH_DAYS = 30;
const CAP_CREDITS = 8;

const MAX_SOURCES_TO_LLM = 25;
const FIRECRAWL_BATCH_SIZE = 10;
const FIRECRAWL_GLOBAL_BUDGET_MS = 35_000;

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
export interface Citation { marker: string; url: string; title: string; snippet: string; }
export interface MeetingBriefPayload {
  brief: string; citations: Citation[]; tokensUsed: number;
  serperSearchesMade: number; 
  // Credit-aware LinkedIn resolution counters
  proxycurlCompanyLookupCalls: number;
  proxycurlPersonLookupCalls: number;
  proxycurlProfileFreshCalls: number;
  proxycurlProfileDirectCalls: number;
  proxycurlCreditsUsed: number;
  // Legacy counters (keeping for compatibility)
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

const formatYearFromProxyCurl = (date?: YearMonthDay): string => date?.year?.toString() ?? "?";
const formatJobSpanFromProxyCurl = (startDate?: YearMonthDay, endDate?: YearMonthDay): string =>
  `${formatYearFromProxyCurl(startDate)} – ${endDate ? formatYearFromProxyCurl(endDate) : "Present"}`;

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

const isOlderThan = (lastUpdatedEpoch: number, days: number): boolean => {
  const now = Date.now() / 1000; // Current time in Unix seconds
  const ageDays = (now - lastUpdatedEpoch) / 86400; // Convert to days
  return ageDays >= days;
};

interface LinkedInResolutionResult {
  url: string;
  profile: ProxyCurlResult | null;
  creditsUsed: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resolveViaPersonLookup = async (
  first: string, 
  last: string, 
  domain: string
): Promise<LinkedInResolutionResult | null> => {
  if (!PROXYCURL_KEY) {
    console.warn("[resolveViaPersonLookup] PROXYCURL_KEY not available");
    return null;
  }

  try {
    console.log(`[resolveViaPersonLookup] Querying for: ${first} ${last} at domain ${domain}`);
    
    const params = new URLSearchParams({
      first_name: first,
      last_name: last,
      company_domain: domain,
      similarity_checks: "skip",
      enrich_profile: "enrich"
    });

    const response = await fetch(`${PERSON_LOOKUP_URL}?${params}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${PROXYCURL_KEY}` }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[resolveViaPersonLookup] HTTP ${response.status}: ${errorText.slice(0, 500)}`);
      return null;
    }

    const jsonData: unknown = await response.json();
    const lookupResult = jsonData as { 
      linkedin_url?: string; 
      profile?: ProxyCurlResult; 
      [key: string]: unknown 
    };

    if (!lookupResult.linkedin_url) {
      console.log(`[resolveViaPersonLookup] No LinkedIn URL found for ${first} ${last} at ${domain}`);
      return null;
    }

    console.log(`[resolveViaPersonLookup] Found LinkedIn URL: ${lookupResult.linkedin_url}`);
    
    let creditsUsed = 3; // Base cost for Person Lookup with enrich_profile
    let finalProfile = lookupResult.profile || null;

    // Check if profile needs freshness upgrade
    if (finalProfile?.last_updated && isOlderThan(finalProfile.last_updated, PROFILE_FRESH_DAYS)) {
      console.log(`[resolveViaPersonLookup] Profile is stale, fetching fresh data`);
      
      try {
        const freshUrl = `${PROFILE_URL}?url=${encodeURIComponent(lookupResult.linkedin_url)}&use_cache=if-recent&fallback_to_cache=on-error`;
        const freshResponse = await fetch(freshUrl, {
          method: "GET",
          headers: { Authorization: `Bearer ${PROXYCURL_KEY}` }
        });

        if (freshResponse.ok) {
          const freshData: unknown = await freshResponse.json();
          finalProfile = freshData as ProxyCurlResult;
          creditsUsed += 2; // Additional cost for fresh profile fetch
          console.log(`[resolveViaPersonLookup] Successfully fetched fresh profile data`);
        } else {
          console.warn(`[resolveViaPersonLookup] Fresh profile fetch failed, using cached data`);
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`[resolveViaPersonLookup] Fresh profile fetch error: ${err.message}`);
      }
    }
    
    return {
      url: lookupResult.linkedin_url,
      profile: finalProfile,
      creditsUsed
    };

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[resolveViaPersonLookup] Exception: ${err.message}`);
    return null;
  }
};

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

const companyMatchesProfile = (profile: ProxyCurlResult, org: string): boolean => {
  const normalizedOrg = normalizeCompanyName(org);
  
  // Check headline
  if (profile.headline?.toLowerCase().includes(normalizedOrg)) {
    return true;
  }
  
  // Check experiences - look for current company match
  if (profile.experiences && Array.isArray(profile.experiences)) {
    return profile.experiences.some(exp => {
      if (!exp.company) return false;
      
      // Check if this is a current role (no end date)
      const isCurrent = !exp.ends_at || 
        (!exp.ends_at.year && !exp.ends_at.month && !exp.ends_at.day);
      
      if (isCurrent) {
        return normalizeCompanyName(exp.company) === normalizedOrg;
      }
      
      return false;
    });
  }
  
  return false;
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
    : "<p>No job history available from LinkedIn profile.</p>";

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
  firecrawlGlobalSuccesses = 0;
  
  // Credit tracking with hard cap
  let creditsSpent = 0;
  const charge = (n: number, endpoint: string, url?: string, expCount?: number, ageDays?: number) => {
    creditsSpent += n;
    console.log(`[PC] endpoint=${endpoint} creditsDelta=${n} creditsTotal=${creditsSpent} url=${url || 'N/A'} exp=${expCount ?? 'N/A'} ageDays=${ageDays?.toFixed(1) ?? 'N/A'}`);
    if (creditsSpent > CAP_CREDITS) {
      throw new Error(`Proxycurl credit cap exceeded: ${creditsSpent}/${CAP_CREDITS}`);
    }
  };
  
  // Initialize all counters
  let serperCallsMade = 0;
  let proxycurlCompanyLookupCalls = 0;
  let proxycurlPersonLookupCalls = 0;
  let proxycurlProfileFreshCalls = 0;
  let proxycurlProfileDirectCalls = 0;
  
  // Legacy counters for compatibility
  let proxycurlCallsMade = 0;
  let proxycurlLookupCallsMade = 0;
  let proxycurlFreshProfileCallsMade = 0;

  const startTime = Date.now();
  const collectedSerpResults: SerpResult[] = [];
  let linkedInProfileResult: SerpResult | null = null;
  let linkedInUrl: string | null = null;
  let proxyCurlData: ProxyCurlResult | null = null;
  let jobHistoryTimeline: string[] = [];

  const { first, last } = splitFullName(name);
  console.log(`[MB Pipeline] Starting deterministic LinkedIn resolution for "${first} ${last}" at "${org}" (credit cap: ${CAP_CREDITS})`);

  try {
    // ── STEP 1: Strict Google/Serper LinkedIn Search ─────────────────────
    console.log(`[MB Step 1] Strict LinkedIn search for "${name}" at "${org}"`);
    try {
      const strictQuery = `"${name}" "${org}" site:linkedin.com/in`;
      const response = await postJSON<{ organic?: SerpResult[] }>(
        SERPER_API_URL, 
        { q: strictQuery, num: 3, gl: "us", hl: "en" }, 
        { "X-API-KEY": SERPER_KEY! }
      );
      serperCallsMade++;

      if (response.organic && response.organic.length === 1) {
        // Exactly one result - fetch profile
        linkedInUrl = response.organic[0].link;
        console.log(`[MB Step 1] Found exactly one LinkedIn result: ${linkedInUrl}`);
        
        try {
          const profileUrl = `${PROFILE_URL}?url=${encodeURIComponent(linkedInUrl)}&use_cache=if-present`;
          const profileResponse = await fetch(profileUrl, {
            method: "GET",
            headers: { Authorization: `Bearer ${PROXYCURL_KEY!}` }
          });
          
          if (profileResponse.ok) {
            const profileData: unknown = await profileResponse.json();
            let profile = profileData as ProxyCurlResult;
            
            charge(1, "profile-direct", linkedInUrl, profile.experiences?.length);
            proxycurlProfileDirectCalls++;
            proxycurlCallsMade++; // Legacy counter

            // Fresh scrape if experiences empty
            if (profile.experiences?.length === 0) {
              console.log(`[MB Step 1] Experiences empty, attempting fresh scrape`);
              try {
                const freshUrl = `${PROFILE_URL}?url=${encodeURIComponent(linkedInUrl)}&use_cache=never`;
                const freshResponse = await fetch(freshUrl, {
                  method: "GET",
                  headers: { Authorization: `Bearer ${PROXYCURL_KEY!}` }
                });

                if (freshResponse.ok) {
                  const freshData: unknown = await freshResponse.json();
                  const freshProfile = freshData as ProxyCurlResult;
                  
                  charge(1, "profile-fresh-scrape", linkedInUrl, freshProfile.experiences?.length);
                  
                  if (freshProfile.experiences?.length) {
                    profile = freshProfile;
                    console.log(`[MB Step 1] Fresh scrape successful, found ${freshProfile.experiences.length} experiences`);
                  }
                }
              } catch (error: unknown) {
                const err = error instanceof Error ? error : new Error(String(error));
                console.warn(`[MB Step 1] Fresh scrape failed: ${err.message}`);
              }
            }
            
            // Company match guard
            if (companyMatchesProfile(profile, org)) {
              console.log(`[MB Step 1] Company match verified for LinkedIn profile`);
              
              proxyCurlData = profile;
              
              // Create job history and LinkedIn result
              jobHistoryTimeline = (proxyCurlData.experiences ?? []).map(exp =>
                `${exp.title ?? "Role"} — ${exp.company ?? "Company"} (${formatJobSpanFromProxyCurl(exp.starts_at, exp.ends_at)})`
              );
              
              linkedInProfileResult = {
                title: `${name} | LinkedIn`,
                link: linkedInUrl,
                snippet: proxyCurlData.headline ?? `LinkedIn profile for ${name}`
              };
              
              collectedSerpResults.push(linkedInProfileResult);
              console.log(`[MB Step 1] Successfully resolved LinkedIn profile via strict search`);
            } else {
              console.log(`[MB Step 1] Company mismatch detected, discarding profile`);
              linkedInUrl = null; // Reset for next steps
            }
          } else {
            console.warn(`[MB Step 1] Profile fetch failed: ${profileResponse.status}`);
          }
        } catch (error: unknown) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.error(`[MB Step 1] Profile fetch error: ${err.message}`);
        }
      } else if (response.organic && response.organic.length > 1) {
        console.log(`[MB Step 1] Multiple LinkedIn results found (${response.organic.length}), proceeding to Step 2`);
      } else {
        console.log(`[MB Step 1] No LinkedIn results found, proceeding to Step 2`);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`[MB Step 1] Strict LinkedIn search failed: ${err.message}`);
    }

    // ── STEP 2: Heuristic Domain Loop (if no URL yet) ────────────────────
    if (!linkedInUrl && first) {
      console.log(`[MB Step 2] Attempting heuristic domain guessing for "${first} ${last}"`);
      
      const slug = slugifyCompanyName(org);
      const candidateDomains = [`${slug}.com`, `${slug}.io`, `${slug}.ai`];
      
      for (const domain of candidateDomains) {
        if (creditsSpent >= CAP_CREDITS) {
          console.warn(`[MB Step 2] Credit cap reached, stopping domain search`);
          break;
        }
        
        console.log(`[MB Step 2] Trying domain: ${domain}`);
        
        try {
          const params = new URLSearchParams({
            first_name: first,
            last_name: last,
            company_domain: domain,
            similarity_checks: "skip",
            enrich_profile: "enrich"
          });

          const response = await fetch(`${PERSON_LOOKUP_URL}?${params}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${PROXYCURL_KEY}` }
          });

          if (response.ok) {
            const jsonData: unknown = await response.json();
            const lookupResult = jsonData as { 
              linkedin_url?: string; 
              profile?: ProxyCurlResult; 
              [key: string]: unknown 
            };

            if (lookupResult.linkedin_url) {
              // Hit - charge 3 credits
              charge(3, "person-lookup", lookupResult.linkedin_url, lookupResult.profile?.experiences?.length);
              proxycurlPersonLookupCalls++;
              proxycurlLookupCallsMade++; // Legacy counter
              
              console.log(`[MB Step 2] Found LinkedIn profile via domain ${domain}: ${lookupResult.linkedin_url}`);
              
              let profile = lookupResult.profile || null;
              linkedInUrl = lookupResult.linkedin_url;
              
              // Check if profile needs freshness upgrade
              if (profile?.last_updated) {
                const ageDays = (Date.now() / 1000 - profile.last_updated) / 86400;
                if (ageDays >= PROFILE_FRESH_DAYS) {
                  console.log(`[MB Step 2] Profile is stale (${ageDays.toFixed(1)} days), fetching fresh data`);
                  
                  try {
                    const freshUrl = `${PROFILE_URL}?url=${encodeURIComponent(linkedInUrl)}&use_cache=if-recent`;
                    const freshResponse = await fetch(freshUrl, {
                      method: "GET",
                      headers: { Authorization: `Bearer ${PROXYCURL_KEY}` }
                    });

                    if (freshResponse.ok) {
                      const freshData: unknown = await freshResponse.json();
                      profile = freshData as ProxyCurlResult;
                      
                      charge(2, "profile-refresh", linkedInUrl, profile.experiences?.length, ageDays);
                      proxycurlProfileFreshCalls++;
                      proxycurlFreshProfileCallsMade++; // Legacy counter
                      
                      console.log(`[MB Step 2] Successfully fetched fresh profile data`);
                    }
                  } catch (error: unknown) {
                    const err = error instanceof Error ? error : new Error(String(error));
                    console.error(`[MB Step 2] Fresh profile fetch error: ${err.message}`);
                  }
                }
              }
              
              // Fresh scrape if experiences empty
              if (profile?.experiences?.length === 0) {
                console.log(`[MB Step 2] Experiences empty, attempting fresh scrape`);
                try {
                  const freshUrl = `${PROFILE_URL}?url=${encodeURIComponent(linkedInUrl)}&use_cache=never`;
                  const freshResponse = await fetch(freshUrl, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${PROXYCURL_KEY}` }
                  });

                  if (freshResponse.ok) {
                    const freshData: unknown = await freshResponse.json();
                    const freshProfile = freshData as ProxyCurlResult;
                    
                    charge(1, "profile-fresh-scrape", linkedInUrl, freshProfile.experiences?.length);
                    
                    if (freshProfile.experiences?.length) {
                      profile = freshProfile;
                      console.log(`[MB Step 2] Fresh scrape successful, found ${freshProfile.experiences.length} experiences`);
                    }
                  }
                } catch (error: unknown) {
                  const err = error instanceof Error ? error : new Error(String(error));
                  console.warn(`[MB Step 2] Fresh scrape failed: ${err.message}`);
                }
              }
              
              // Company match guard
              if (profile && companyMatchesProfile(profile, org)) {
                console.log(`[MB Step 2] Company match verified for domain ${domain}`);
                
                proxyCurlData = profile;
                
                // Create job history and LinkedIn result
                jobHistoryTimeline = (proxyCurlData.experiences ?? []).map(exp =>
                  `${exp.title ?? "Role"} — ${exp.company ?? "Company"} (${formatJobSpanFromProxyCurl(exp.starts_at, exp.ends_at)})`
                );
                
                linkedInProfileResult = {
                  title: `${name} | LinkedIn`,
                  link: linkedInUrl,
                  snippet: proxyCurlData.headline ?? `LinkedIn profile for ${name}`
                };
                
                collectedSerpResults.push(linkedInProfileResult);
                console.log(`[MB Step 2] Successfully resolved LinkedIn profile via domain ${domain}`);
                break; // Exit loop on first success
              } else {
                console.log(`[MB Step 2] Company mismatch for domain ${domain}, continuing search`);
                linkedInUrl = null; // Reset for next iteration
              }
            } else {
              console.log(`[MB Step 2] No LinkedIn URL found for domain ${domain} (no charge)`);
            }
          } else {
            console.warn(`[MB Step 2] Person lookup failed for domain ${domain}: ${response.status}`);
          }
        } catch (error: unknown) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.error(`[MB Step 2] Person lookup failed for domain ${domain}: ${err.message}`);
        }
      }
    }

    // ── STEP 3: Company Lookup Fallback (if still no URL) ────────────────
    if (!linkedInUrl && first && creditsSpent < CAP_CREDITS) {
      console.log(`[MB Step 3] Attempting company lookup for "${org}"`);
      
      try {
        const params = new URLSearchParams({
          company_name: org,
          enrich_profile: "skip"
        });

        const response = await fetch(`${COMPANY_LOOKUP_URL}?${params}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${PROXYCURL_KEY}` }
        });

        if (response.ok) {
          const jsonData: unknown = await response.json();
          const companyResult = jsonData as { 
            website?: string; 
            domain?: string;
            [key: string]: unknown 
          };

          let companyDomain = companyResult.domain;
          if (!companyDomain && companyResult.website) {
            try {
              const url = new URL(companyResult.website.startsWith('http') 
                ? companyResult.website 
                : `https://${companyResult.website}`);
              companyDomain = url.hostname.replace(/^www\./, '');
            } catch {
              console.warn(`[MB Step 3] Could not parse website URL: ${companyResult.website}`);
            }
          }

          if (companyDomain) {
            charge(2, "company-lookup", undefined, undefined, undefined);
            proxycurlCompanyLookupCalls++;
            
            console.log(`[MB Step 3] Found company domain: ${companyDomain}`);
            
            // Now try Person Lookup with company domain
            try {
              const personParams = new URLSearchParams({
                first_name: first,
                last_name: last,
                company_domain: companyDomain,
                similarity_checks: "skip",
                enrich_profile: "enrich"
              });

              const personResponse = await fetch(`${PERSON_LOOKUP_URL}?${personParams}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${PROXYCURL_KEY}` }
              });

              if (personResponse.ok) {
                const personJsonData: unknown = await personResponse.json();
                const personLookupResult = personJsonData as { 
                  linkedin_url?: string; 
                  profile?: ProxyCurlResult; 
                  [key: string]: unknown 
                };

                if (personLookupResult.linkedin_url) {
                  charge(3, "person-lookup", personLookupResult.linkedin_url, personLookupResult.profile?.experiences?.length);
                  proxycurlPersonLookupCalls++;
                  proxycurlLookupCallsMade++; // Legacy counter
                  
                  console.log(`[MB Step 3] Found LinkedIn profile via company domain: ${personLookupResult.linkedin_url}`);
                  
                  let profile = personLookupResult.profile || null;
                  linkedInUrl = personLookupResult.linkedin_url;
                  
                  // Check if profile needs freshness upgrade
                  if (profile?.last_updated) {
                    const ageDays = (Date.now() / 1000 - profile.last_updated) / 86400;
                    if (ageDays >= PROFILE_FRESH_DAYS && creditsSpent < CAP_CREDITS - 2) {
                      console.log(`[MB Step 3] Profile is stale (${ageDays.toFixed(1)} days), fetching fresh data`);
                      
                      try {
                        const freshUrl = `${PROFILE_URL}?url=${encodeURIComponent(linkedInUrl)}&use_cache=if-recent`;
                        const freshResponse = await fetch(freshUrl, {
                          method: "GET",
                          headers: { Authorization: `Bearer ${PROXYCURL_KEY}` }
                        });

                        if (freshResponse.ok) {
                          const freshData: unknown = await freshResponse.json();
                          profile = freshData as ProxyCurlResult;
                          
                          charge(2, "profile-refresh", linkedInUrl, profile.experiences?.length, ageDays);
                          proxycurlProfileFreshCalls++;
                          proxycurlFreshProfileCallsMade++; // Legacy counter
                          
                          console.log(`[MB Step 3] Successfully fetched fresh profile data`);
                        }
                      } catch (error: unknown) {
                        const err = error instanceof Error ? error : new Error(String(error));
                        console.error(`[MB Step 3] Fresh profile fetch error: ${err.message}`);
                      }
                    }
                  }
                  
                  // Fresh scrape if experiences empty
                  if (profile?.experiences?.length === 0 && creditsSpent < CAP_CREDITS) {
                    console.log(`[MB Step 3] Experiences empty, attempting fresh scrape`);
                    try {
                      const freshUrl = `${PROFILE_URL}?url=${encodeURIComponent(linkedInUrl)}&use_cache=never`;
                      const freshResponse = await fetch(freshUrl, {
                        method: "GET",
                        headers: { Authorization: `Bearer ${PROXYCURL_KEY}` }
                      });

                      if (freshResponse.ok) {
                        const freshData: unknown = await freshResponse.json();
                        const freshProfile = freshData as ProxyCurlResult;
                        
                        charge(1, "profile-fresh-scrape", linkedInUrl, freshProfile.experiences?.length);
                        
                        if (freshProfile.experiences?.length) {
                          profile = freshProfile;
                          console.log(`[MB Step 3] Fresh scrape successful, found ${freshProfile.experiences.length} experiences`);
                        }
                      }
                    } catch (error: unknown) {
                      const err = error instanceof Error ? error : new Error(String(error));
                      console.warn(`[MB Step 3] Fresh scrape failed: ${err.message}`);
                    }
                  }
                  
                  // Company match guard
                  if (profile && companyMatchesProfile(profile, org)) {
                    console.log(`[MB Step 3] Company match verified for company domain`);
                    
                    proxyCurlData = profile;
                    
                    // Create job history and LinkedIn result
                    jobHistoryTimeline = (proxyCurlData.experiences ?? []).map(exp =>
                      `${exp.title ?? "Role"} — ${exp.company ?? "Company"} (${formatJobSpanFromProxyCurl(exp.starts_at, exp.ends_at)})`
                    );
                    
                    linkedInProfileResult = {
                      title: `${name} | LinkedIn`,
                      link: linkedInUrl,
                      snippet: proxyCurlData.headline ?? `LinkedIn profile for ${name}`
                    };
                    
                    collectedSerpResults.push(linkedInProfileResult);
                    console.log(`[MB Step 3] Successfully resolved LinkedIn profile via company lookup`);
                  } else {
                    console.log(`[MB Step 3] Company mismatch for company domain, proceeding without LinkedIn data`);
                  }
                } else {
                  console.log(`[MB Step 3] No LinkedIn result for company domain (no charge)`);
                }
              }
            } catch (error: unknown) {
              const err = error instanceof Error ? error : new Error(String(error));
              console.error(`[MB Step 3] Person lookup via company domain failed: ${err.message}`);
            }
          } else {
            console.log(`[MB Step 3] No domain found for company (no charge)`);
          }
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`[MB Step 3] Company lookup failed: ${err.message}`);
      }
    }

    console.log(`[MB Result] Final credits spent: ${creditsSpent}/${CAP_CREDITS}`);
    
    if (!linkedInUrl) {
      console.log(`[MB Result] No deterministic LinkedIn match found, proceeding without LinkedIn data`);
    }

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[MB Error] LinkedIn resolution failed: ${err.message}`);
    if (err.message.includes("credit cap exceeded")) {
      console.warn(`[MB Error] Credit cap exceeded at ${creditsSpent} credits`);
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

  if (proxyCurlData?.experiences) {
    console.log(`[MB Step 5] Running additional Serper queries for prior organizations of "${name}".`);
    const priorCompanies = (proxyCurlData.experiences ?? []).map(exp => exp.company).filter((c): c is string => !!c);
    const uniquePriorCompanies = priorCompanies
      .filter((c, i, arr) => i === arr.findIndex(x => normalizeCompanyName(x) === normalizeCompanyName(c)) && normalizeCompanyName(c) !== normalizeCompanyName(org))
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

  console.log(`[MB Step 6] Deduplicating and filtering SERP results. Initial count: ${collectedSerpResults.length}`);
  const uniqueSerpResults = Array.from(new Map(collectedSerpResults.map(r => [r.link, r])).values());
  console.log(`[MB Step 6] Unique SERP results: ${uniqueSerpResults.length}`);

  const sourcesToProcessForLLM = uniqueSerpResults
    .filter(r => r.link === linkedInProfileResult?.link || !NO_SCRAPE_URL_SUBSTRINGS.some(skip => r.link.includes(skip)))
    .slice(0, MAX_SOURCES_TO_LLM);
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

  console.log(`[MB Finished] Processed for "${name}". Total tokens: ${totalTokensUsed}. Serper: ${serperCallsMade}. Proxycurl credits: ${creditsSpent}/${CAP_CREDITS}. Firecrawl attempts: ${firecrawlGlobalAttempts}, successes: ${firecrawlGlobalSuccesses}. Wall time: ${wallTimeSeconds.toFixed(1)}s`);

  return {
    brief: htmlBriefOutput, 
    citations: finalCitations, 
    tokensUsed: totalTokensUsed,
    serperSearchesMade: serperCallsMade, 
    // New credit-aware counters
    proxycurlCompanyLookupCalls,
    proxycurlPersonLookupCalls,
    proxycurlProfileFreshCalls,
    proxycurlProfileDirectCalls,
    proxycurlCreditsUsed: creditsSpent,
    // Legacy counters for compatibility
    proxycurlCallsMade,
    proxycurlLookupCallsMade,
    proxycurlFreshProfileCallsMade,
    firecrawlAttempts: firecrawlGlobalAttempts, 
    firecrawlSuccesses: firecrawlGlobalSuccesses,
    finalSourcesConsidered: sourcesToProcessForLLM.map((s, idx) => ({
      url: s.link, title: s.title,
      processed_snippet: (extractedTextsForLLM[idx] || "Snippet/Error").slice(0, 300) + ((extractedTextsForLLM[idx]?.length || 0) > 300 ? "..." : ""),
    })),
    possibleSocialLinks,
  };
}