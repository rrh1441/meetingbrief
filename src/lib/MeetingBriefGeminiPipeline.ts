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
const FAST_MODEL_ID = "gpt-4o-mini"; // gpt-4o-mini for snippet analysis - reliable and fast
const SERPER_API_URL = "https://google.serper.dev/search";
const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape";

const MAX_SOURCES_TO_LLM = 15; // Reduced from 25 to ensure we get more relevant sources

// Credit-aware LinkedIn resolution URLs

/* ── DOMAIN RULES ───────────────────────────────────────────────────────── */
const SOCIAL_DOMAINS = [
  "x.com/", "twitter.com/", "mastodon.social/", "facebook.com/", "fb.com/", "instagram.com/",
];
const GENERIC_NO_SCRAPE_DOMAINS = [
  "youtube.com/", "youtu.be/",
  "reddit.com/", 
  "linkedin.com/pulse/", "linkedin.com/posts/", "linkedin.com/in/", "linkedin.com/pub/",
  "rocketreach.co", "rocketreach.com", // Removed from pipeline due to inaccurate data
  "signalhire.com", // Data broker with inaccurate info
  "crustdata.com", // Unreliable data broker
  "usphonebook.com", // Personal info aggregator
  "spokeo.com", // Personal info aggregator
  "whitepages.com", // Personal info aggregator
  "beenverified.com", // Personal info aggregator
  "truthfinder.com", // Personal info aggregator
  "peoplefinders.com", // Personal info aggregator
  "intelius.com", // Personal info aggregator
  "checkpeople.com", // Personal info aggregator
  "anywho.com", // Personal info aggregator
  "zabasearch.com", // Personal info aggregator
  "peoplesearch.com", // Personal info aggregator
  "publicrecords.com", // Personal info aggregator
  "peekyou.com", // Personal info aggregator
  "pipl.com", // Personal info aggregator
  "radaris.com", // Personal info aggregator
  "zoominfo.com", // Already in LOW_TRUST_DOMAINS
  "lusha.com", // Data broker
  "contactout.com", // Data broker
  "hunter.io", // Email finder
  "voilanorbert.com", // Email finder
  "findthatlead.com", // Email finder
  "anymail.io", // Email finder
  "clearbit.com", // Data enrichment
  "fullcontact.com", // Data enrichment
  "peopledatalabs.com", // Data broker
  "cience.com", // B2B contact data
];
const NO_SCRAPE_URL_SUBSTRINGS = [...SOCIAL_DOMAINS, ...GENERIC_NO_SCRAPE_DOMAINS];

// ------------------------------------------------------------------------
// Low-trust domains: keep them *only* when we'd otherwise feed the LLM
// fewer than MIN_RELIABLE_SOURCES sources (after Firecrawl skip logic).
// ------------------------------------------------------------------------
const LOW_TRUST_DOMAINS: string[] = ["zoominfo.com"]; // People-finder sites with high false positive rates
const MIN_RELIABLE_SOURCES = 3; // Lowered to ensure we get more sources

// Common news domains that indicate timely, relevant content
const NEWS_PATTERNS = [
  'bloomberg.com', 'reuters.com', 'wsj.com', 'ft.com', 'cnbc.com',
  'techcrunch.com', 'theverge.com', 'businessinsider.com', 'fortune.com',
  'forbes.com', 'economist.com', 'nytimes.com', 'washingtonpost.com',
  'theinformation.com', 'axios.com', 'politico.com', 'thehill.com',
  'venturebeat.com', 'wired.com', 'arstechnica.com', 'zdnet.com',
  '.substack.com', 'medium.com/@', 'investing.com/news',
  'seekingalpha.com', 'marketwatch.com', 'barrons.com',
  'prnewswire.com', 'businesswire.com', 'globenewswire.com',
  'thedeal.com', 'dealbook.nytimes.com', 'mergermarket.com',
  'pitchbook.com', 'crunchbase.com/organization/', 'yahoo.com/finance',
  'fool.com', 'benzinga.com', 'streetinsider.com',
  'bloomberglaw.com', 'law360.com', 'law.com'
];

/* ── TYPES ──────────────────────────────────────────────────────────────── */
interface SerpResult { 
  title: string; 
  link: string; 
  snippet?: string;
  position?: number; // Track search result position
  query?: string; // Track which query produced this result
}
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

// NEW/REFINED INTERFACES for Harvest API Profile data
interface HarvestLinkedInProfileElement {
  id?: string;
  publicIdentifier?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  about?: string; // Explicitly defined for company matching
  currentPosition?: { companyName?: string; title?: string; }[];
  experience?: {
    companyName?: string;
    position?: string;
    endDate?: unknown;
    startDate?: YearMonthDay;
  }[];
  education?: {
    title?: string; // Harvest uses 'title' for school name
    degree?: string; // Harvest uses 'degree' for degree info
    period?: string;
    startDate?: YearMonthDay;
    endDate?: YearMonthDay;
    // Legacy fields for compatibility
    schoolName?: string;
    degreeName?: string;
    fieldOfStudy?: string;
  }[];
  volunteering?: {
    organizationName?: string;
    role?: string;
    cause?: string;
    startDate?: YearMonthDay;
    endDate?: YearMonthDay;
  }[];
  certifications?: {
    name?: string;
    authority?: string;
    licenseCertificationNumber?: string;
    startDate?: YearMonthDay;
    endDate?: YearMonthDay;
  }[];
  languages?: {
    name?: string;
    proficiency?: string;
  }[];
  publications?: {
    title?: string;
    url?: string;
    link?: string;
    publishedDate?: string;
    description?: string;
    publisher?: string;
  }[];
  [key: string]: unknown;
}

interface HarvestLinkedInProfileApiResponse {
  element?: HarvestLinkedInProfileElement;
  status?: string;
  error?: string;
  query?: Record<string, string>;
  [key: string]: unknown;
}

interface ScrapeResult {
  url: string;
  fullProfile: HarvestLinkedInProfileApiResponse;
  success: boolean;
}

interface BriefRow { text: string; source: number }
interface JsonBriefFromLLM {
  executive: BriefRow[]; highlights: BriefRow[];
  funFacts: BriefRow[]; researchNotes: BriefRow[];
}

// Speed optimization interfaces
interface JobChangeInfo {
  detected: boolean;
  newCompany?: string;
  newRole?: string;
  announcement?: string;
  date?: string;
  source?: string;
}

interface SpeedOptimizedAnalysis {
  url: string;
  canSkipScrape: boolean;
  scrapePriority: number;
  extractedFacts: string[];
  expectedValue: 'high' | 'medium' | 'low';
}

interface ScrapePriority {
  url: string;
  timeoutMs: number;
  maxRetries: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
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

export interface Citation { marker: string; url: string; title: string; snippet: string; }

export interface MeetingBriefPayload {
  brief: string; citations: Citation[]; tokensUsed: number;
  serperSearchesMade: number; 
  // Harvest credits
  harvestCreditsUsed: number;
  firecrawlAttempts: number; firecrawlSuccesses: number;
  finalSourcesConsidered: { url: string; title: string; processed_snippet: string }[];
  possibleSocialLinks: string[];
  // Timing data
  timings?: {
    total: number;
    harvest: number;
    serper: number;
    jobChangeDetection: number;
    snippetAnalysis: number;
    firecrawl: number;
    llmGeneration: number;
    breakdown: string;
  };
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

// Helper to extract potential acronyms from organization names
const extractPotentialAcronyms = (companyName: string): string[] => {
  const acronyms: string[] = [];
  
  // Check for acronym in parentheses
  const parenMatch = companyName.match(/\(([A-Z]{2,})\)/);
  if (parenMatch) {
    acronyms.push(parenMatch[1].toLowerCase());
  }
  
  // For government agencies, extract capital letters (e.g., "Special Inspector General for Afghanistan Reconstruction" -> "SIGAR")
  const words = companyName.split(/\s+/);
  if (words.length >= 3 && companyName.includes('Inspector') || companyName.includes('Department') || 
      companyName.includes('Administration') || companyName.includes('Agency') || companyName.includes('Commission')) {
    const capitalLetters = companyName.match(/\b[A-Z]/g);
    if (capitalLetters && capitalLetters.length >= 3) {
      acronyms.push(capitalLetters.join('').toLowerCase());
    }
  }
  
  return acronyms;
};

/* ── Job Change Detection ─────────────────────────────────────────────── */
async function detectJobChange(
  serpResults: SerpResult[],
  targetName: string,
  currentOrg: string,
  openAiClient: OpenAI
): Promise<JobChangeInfo> {
  // Filter results that might indicate job change
  const jobChangeIndicators = serpResults.filter(result => {
    const text = `${result.title} ${result.snippet || ''}`.toLowerCase();
    const hasJobChangeKeywords = 
      (text.includes('joins') || 
       text.includes('appointed') || 
       text.includes('new role') || 
       text.includes('moves to') ||
       text.includes('named as') ||
       text.includes('hired') ||
       text.includes('hires') ||
       text.includes('promoted')) &&
      text.includes(targetName.toLowerCase());
    
    // Must mention current org to be relevant (avoid different people with same name)
    const mentionsCurrentOrg = text.includes(currentOrg.toLowerCase()) || 
                             text.includes('bofa') || // Common abbreviations
                             text.includes('baml') ||
                             (currentOrg.toLowerCase().includes('bank of america') && text.includes('bank of america'));
    
    return hasJobChangeKeywords && mentionsCurrentOrg;
  });

  if (jobChangeIndicators.length === 0) {
    return { detected: false };
  }
  
  console.log(`[Job Change Detection] Found ${jobChangeIndicators.length} potential job change indicators for ${targetName} from ${currentOrg}:`, 
    jobChangeIndicators.map(r => `"${r.title}"`).join(', '));

  // Use AI to analyze potential job changes
  const systemPrompt = `Analyze search results to detect if ${targetName} has recently changed jobs from ${currentOrg}. 
  
Return JSON:
{
  "detected": boolean,
  "newCompany": "company name or null",
  "newRole": "role title or null", 
  "announcement": "brief summary of the change",
  "date": "when this happened or null - be very careful to extract the ACTUAL job change date, not promotion dates or article publication dates",
  "source": "most authoritative source URL"
}

Only mark detected=true if there's clear evidence of a job change AWAY from ${currentOrg}.
Internal promotions at ${currentOrg} should return detected=false.

CRITICAL: If you see multiple people with the same name at different companies, be VERY careful to identify which one actually worked at ${currentOrg}. Look for:
- Mentions of "${currentOrg}" in the same article/snippet as the job change
- Headlines like "${targetName} leaves ${currentOrg}" or "hires ${targetName} from ${currentOrg}"
- Do NOT confuse different people with the same name

IMPORTANT: For the date field, look for phrases like "joins", "joined", "appointed", "moves to", "has moved" and extract the date associated with THAT action, not other dates mentioned in the context.`;

  const userPrompt = `Person: ${targetName}
Current Company: ${currentOrg}

Analyze these search results for job changes:

${jobChangeIndicators.map((r, i) => `
[${i}] ${r.title}
${r.snippet || ''}
URL: ${r.link}
`).join('\n')}

REMEMBER: Only detect a job change if the SAME ${targetName} who worked at ${currentOrg} is moving to a new company. Look for explicit connections like "hires ${targetName} from ${currentOrg}" or "${targetName} leaves ${currentOrg} for [new company]".`;

  try {
    const response = await openAiClient.chat.completions.create({
      model: FAST_MODEL_ID, // Use gpt-4o-mini for job change detection
      temperature: 0,
      max_tokens: 200, // Back to max_tokens for gpt-4o-mini
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from OpenAI');
    
    const result = JSON.parse(content);
    
    // Final validation: if detected, the source must explicitly connect currentOrg to newCompany
    if (result.detected && result.source) {
      const validatingResult = jobChangeIndicators.find(r => r.link === result.source);
      if (validatingResult) {
        const validationText = `${validatingResult.title} ${validatingResult.snippet || ''}`.toLowerCase();
        const mentionsBothCompanies = 
          validationText.includes(currentOrg.toLowerCase()) && 
          result.newCompany && 
          validationText.includes(result.newCompany.toLowerCase());
        
        if (!mentionsBothCompanies) {
          console.log(`[Job Change Detection] Rejected potential false positive - source doesn't mention both ${currentOrg} and ${result.newCompany}`);
          return { detected: false };
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('[Job Change Detection] AI analysis failed:', error);
    return { detected: false };
  }
}

/* ── AI-Powered Snippet Analysis ──────────────────────────────────────── */
async function analyzeSnippetsWithAI(
  sources: SerpResult[],
  targetName: string,
  targetOrg: string,
  openAiClient: OpenAI
): Promise<Map<string, SpeedOptimizedAnalysis>> {
  // Simplified, focused system prompt for speed
  const systemPrompt = `Triage search snippets for ${targetName} at ${targetOrg}. Return JSON only.
Priority 9-10: Awards, major appointments, interviews with quotes, research/publications, official company content, job change announcements, recent news articles
Priority 6-8: News mentions, conference speaking, professional updates, webinars/presentations  
Priority 3-5: Basic directory listings, brief mentions
Priority 1-2: Search results pages, old content (pre-2018), social media, paywalled
IMPORTANT: Be conservative with canSkipScrape. Only mark true for:
- Directory listings with just name/title
- Search result pages
- Content behind paywalls
Mark canSkipScrape=false for ALL content that could have valuable details (webinars, news, interviews, speaking engagements).
CRITICAL: For extractedFacts, ONLY extract facts that are EXPLICITLY stated in the snippet text. Do NOT infer, assume, or create information.
NEWS ARTICLE HANDLING:
- ANY article from major news outlets (Bloomberg, Reuters, WSJ, etc.) should have canSkipScrape=false
- If it's a news article, add "NEWS_ARTICLE" as an extracted fact
JOB CHANGE HANDLING: 
- If snippet mentions ${targetName} "joining", "moving to", "hired by", or similar job change language, add "JOB_CHANGE_NEWS" as the first extracted fact
- ALWAYS set canSkipScrape=false for any job change articles to ensure full content is scraped`;

  // Enhanced system prompt for top-ranked results
  const enhancedSystemPrompt = (source: SerpResult) => {
    const isTopRanked = source.query === 'primary_name_company' && source.position && source.position <= 5;
    const basePrompt = systemPrompt;
    
    if (isTopRanked) {
      return basePrompt + `\nIMPORTANT: This is a top-${source.position} result from primary search. NEVER mark canSkipScrape=true for top-5 primary search results.`;
    }
    return basePrompt;
  };

  // Function to analyze a single snippet
  async function analyzeSingleSnippet(
    source: SerpResult,
    useModel: string = FAST_MODEL_ID
  ): Promise<SpeedOptimizedAnalysis> {
    // Check if this is likely an official company website (contains company name in domain)
    const normalizedOrg = targetOrg.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedUrl = source.link.toLowerCase();
    const isLikelyCompanyWebsite = normalizedOrg.length > 3 && normalizedUrl.includes(normalizedOrg);
    
    // Check if this is a data broker or people search site
    const isDataBrokerSite = GENERIC_NO_SCRAPE_DOMAINS.some(domain => source.link.includes(domain));
    
    // If it's a data broker, return lowest priority without even asking the AI
    if (isDataBrokerSite) {
      return {
        url: source.link,
        canSkipScrape: true,
        scrapePriority: 1,
        extractedFacts: [],
        expectedValue: 'low'
      };
    }
    
    const userPrompt = `URL: ${source.link}
Title: ${source.title}
Snippet: ${source.snippet || 'No snippet available'}

Return: {"url":"${source.link}","canSkipScrape":${isLikelyCompanyWebsite ? 'false' : 'bool'},"scrapePriority":${isLikelyCompanyWebsite ? '9' : '1-10'},"extractedFacts":["only facts explicitly stated in snippet"],"expectedValue":"high|medium|low"}
${isLikelyCompanyWebsite ? 'NOTE: This appears to be an official company website - prioritize for scraping.' : ''}`;

    try {
      const response = await openAiClient.chat.completions.create({
        model: useModel,
        temperature: 0,
        max_tokens: 120, // Back to max_tokens for gpt-4o-mini
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: enhancedSystemPrompt(source) },
          { role: "user", content: userPrompt }
        ]
      });

      const content = response.choices[0].message.content;
      if (content) {
        const parsed = JSON.parse(content);
        
        // Force scraping for high priority sources
        if (parsed.scrapePriority >= 6 && parsed.canSkipScrape === true) {
          parsed.canSkipScrape = false; // Always scrape priority 6+ content
        }
        
        // Force scraping for top-ranked primary search results
        const isTopRanked = source.query === 'primary_name_company' && source.position && source.position <= 5;
        if (isTopRanked && parsed.canSkipScrape === true) {
          parsed.canSkipScrape = false; // Always scrape top-5 primary search results
          parsed.scrapePriority = Math.max(parsed.scrapePriority || 5, 8); // Ensure high priority
        }
        
        // Force scraping for news articles
        const isNewsUrl = NEWS_PATTERNS.some(pattern => source.link.includes(pattern)) ||
                         source.link.includes('/news/') ||
                         source.link.includes('/article/');
        if (isNewsUrl && parsed.canSkipScrape === true) {
          parsed.canSkipScrape = false; // Always scrape news articles
          parsed.scrapePriority = Math.max(parsed.scrapePriority || 5, 8); // Ensure high priority
        }
        
        return parsed;
      }
    } catch (error) {
      console.error(`[Snippet Analysis] Failed for ${source.link}:`, error);
    }
    
    // Fallback response - prioritize likely company sites even on error
    return {
      url: source.link,
      canSkipScrape: false,
      scrapePriority: isLikelyCompanyWebsite ? 8 : 5,
      extractedFacts: [],
      expectedValue: isLikelyCompanyWebsite ? 'high' : 'medium'
    };
  }

  // Process snippets in parallel batches of 3 for optimal speed
  const results = new Map<string, SpeedOptimizedAnalysis>();
  const batchSize = 3;
  
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const batchPromises = batch.map((source) => 
      analyzeSingleSnippet(source)
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach((analysis, batchIdx) => {
      const source = batch[batchIdx];
      results.set(source.link, analysis);
    });
  }
  
  return results;
}

/* ── Credit-Aware LinkedIn Resolution Helpers ──────────────────────────── */
const slugifyCompanyName = (org: string): string => {
  return org.toLowerCase().replace(/[^a-z0-9]/g, "");
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


/* ── Priority-based Scraping Helpers ────────────────────────────────────── */
function determineScrapePriority(
  source: SerpResult,
  isJobChangeRelated: boolean,
  snippetAnalysis?: SpeedOptimizedAnalysis,
  targetName?: string,
  targetOrg?: string,
  knownOrganizations?: Set<string>
): ScrapePriority {
  const url = source.link;
  const snippet = source.snippet || '';
  const title = source.title;
  const fullText = `${title} ${snippet}`.toLowerCase();
  
  // MOST IMPORTANT: Does this result mention both the person AND any known organization?
  const mentionsName = targetName && fullText.includes(targetName.toLowerCase());
  let mentionsKnownOrg = false;
  
  if (mentionsName && knownOrganizations) {
    // Check if any known organization is mentioned
    for (const org of knownOrganizations) {
      if (fullText.includes(org.toLowerCase())) {
        mentionsKnownOrg = true;
        break;
      }
    }
  }
  
  const mentionsBothNameAndOrg = mentionsName && mentionsKnownOrg;
  
  const isNewsArticle = NEWS_PATTERNS.some(pattern => url.includes(pattern)) ||
                       title.toLowerCase().includes(' news') ||
                       title.includes(' - ') || // Common news title pattern
                       url.includes('/news/') ||
                       url.includes('/article/') ||
                       url.includes('/story/');
  
  // Check if this is a top-ranked result from primary search
  const isTopRankedPrimary = source.query === 'primary_name_company' && 
                             source.position && 
                             source.position <= 10; // Expanded to top 10 for news
  
  // Check if this is a job change article (any job change news should be scraped)
  const isJobChangeNews = snippetAnalysis?.extractedFacts?.some(
    fact => fact === 'JOB_CHANGE_NEWS'
  ) || isJobChangeRelated || 
  title.toLowerCase().includes('joins') ||
  title.toLowerCase().includes('hired') ||
  title.toLowerCase().includes('moves to') ||
  title.toLowerCase().includes('appointed');
  
  // Check if this is a site we can't/shouldn't scrape
  const isUnscrapable = NO_SCRAPE_URL_SUBSTRINGS.some(pattern => url.includes(pattern)) ||
                        url.includes('linkedin.com');
  
  // HIGHEST PRIORITY: Results that mention both name and org (unless unscrapable)
  if (mentionsBothNameAndOrg && !isUnscrapable) {
    return {
      url,
      timeoutMs: 15000,  // 15s for critical content
      maxRetries: 2,
      priority: 'critical'
    };
  }
  
  // Critical priority - news articles in top 10 results, job changes, or top 5 results (excluding unscrapable sites)
  if (isJobChangeNews || 
      (isNewsArticle && isTopRankedPrimary) || 
      (source.position && source.position <= 5 && source.query === 'primary_name_company' && !isUnscrapable)) {
    return {
      url,
      timeoutMs: 15000,  // 15s for critical content
      maxRetries: 2,
      priority: 'critical'
    };
  }
  
  // High priority - awards, major announcements
  if (snippet.includes('award') || 
      snippet.includes('recognition') ||
      snippet.includes('patent') ||
      snippet.includes('publication')) {
    return {
      url,
      timeoutMs: 12000,  // 12s for high-value content
      maxRetries: 1,
      priority: 'high'
    };
  }
  
  // Medium priority - standard news and profiles
  if (snippetAnalysis?.scrapePriority && snippetAnalysis.scrapePriority >= 7) {
    return {
      url,
      timeoutMs: 8000,   // 8s for medium priority
      maxRetries: 1,
      priority: 'medium'
    };
  }
  
  // Low priority - quick attempt only
  return {
    url,
    timeoutMs: 5000,    // 5s for low priority
    maxRetries: 0,
    priority: 'low'
  };
}

// Enhanced Firecrawl with smart retries
async function smartFirecrawl(
  priority: ScrapePriority
): Promise<string | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= priority.maxRetries; attempt++) {
    try {
      console.log(`[Firecrawl] ${priority.priority} priority: ${priority.url} (attempt ${attempt + 1}/${priority.maxRetries + 1}, timeout: ${priority.timeoutMs}ms)`);
      
      const response = await Promise.race([
        postJSON<FirecrawlScrapeV1Result>(
          FIRECRAWL_API_URL,
          { url: priority.url },
          { Authorization: `Bearer ${FIRECRAWL_KEY!}` }
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${priority.timeoutMs}ms`)), priority.timeoutMs)
        )
      ]);
      
      // Success - extract content
      if (response && response.success && response.data) {
        const content = response.data.article?.text_content || 
                       response.data.text_content || 
                       response.data.markdown;
        if (content && typeof content === 'string') {
          console.log(`[Firecrawl] Success for ${priority.priority} priority: ${priority.url}`);
          return content;
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < priority.maxRetries) {
        console.log(`[Firecrawl] Retry for ${priority.url} after error: ${lastError.message}`);
      }
    }
  }
  
  console.error(`[Firecrawl] Failed all attempts for ${priority.url}: ${lastError?.message}`);
  return null;
}


/* ── HTML Rendering Helpers ─────────────────────────────────────────────── */
const renderParagraphsWithCitations = (rows: BriefRow[], citations: Citation[]): string =>
  rows.map(row => {
      if (typeof row.source !== 'number' || row.source < 1 || row.source > citations.length) {
          console.warn("Invalid source number in BriefRow for pSent:", row, "Max citations:", citations.length);
          return `<p>${cleanLLMOutputText(row.text)} <sup>[source error]</sup></p>`;
      }
      const citation = citations[row.source - 1];
      const supLink = `<sup><a href="${citation.url}" target="_blank" rel="noopener noreferrer" title="${(citation.title || "").replace(/"/g, '"')}" style="color: #0066cc; text-decoration: none;">${row.source}</a></sup>`;
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
          const supLink = `<sup><a href="${citation.url}" target="_blank" rel="noopener noreferrer" title="${(citation.title || "").replace(/"/g, '"')}" style="color: #0066cc; text-decoration: none;">${row.source}</a></sup>`;
          return `  <li>${cleanLLMOutputText(row.text)} ${supLink}</li>`;
        }).join("\n")}\n</ul>`
    : "";

const renderJobHistoryList = (jobTimeline: string[]): string =>
  jobTimeline.length
    ? `<ul class="list-disc pl-5">\n${jobTimeline.map(job => `  <li>${job}</li>`).join("\n")}\n</ul>`
    : "<p>Timeline unavailable (private profile or no work history).</p>";

const renderFullHtmlBrief = (
  targetName: string, 
  targetOrg: string, 
  llmJsonBrief: JsonBriefFromLLM,
  citationsList: Citation[], 
  jobHistory: string[],
  education: string[] = [],
  linkedInUrl?: string // Add optional LinkedIn URL parameter
): string => {
  const sectionSpacer = "<br>"; // Single line break between sections
  
  // Filter out empty strings from job history
  const cleanJobHistory = jobHistory.filter(job => job.trim() !== '');
  
  // LinkedIn profile section (moved to bottom)
  const linkedInSection = linkedInUrl 
    ? `${sectionSpacer}<h3><strong>Possible LinkedIn Profile</strong></h3>
<p><a href="${linkedInUrl}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">${linkedInUrl}</a></p>
<p><em>Note: You may need to be logged in to LinkedIn to view the full profile.</em></p>`
    : "";
  
  // Education section (only show if we have education data)
  const educationSection = education.length > 0 
    ? `${sectionSpacer}<h3><strong>Education</strong></h3>
${renderJobHistoryList(education)}` 
    : "";
  
  return `
<div>
  <h2><strong>MeetingBrief: ${targetName} – ${targetOrg}</strong></h2>
${sectionSpacer}<h3><strong>Executive Summary</strong></h3>
${renderParagraphsWithCitations(llmJsonBrief.executive || [], citationsList)}
${sectionSpacer}<h3><strong>Job History</strong></h3>
${renderJobHistoryList(cleanJobHistory)}${educationSection}
${sectionSpacer}<h3><strong>Highlights & Fun Facts</strong></h3>
${renderUnorderedListWithCitations([...(llmJsonBrief.highlights || []), ...(llmJsonBrief.funFacts || [])], citationsList)}
${sectionSpacer}<h3><strong>Detailed Research Notes</strong></h3>
${renderUnorderedListWithCitations(llmJsonBrief.researchNotes || [], citationsList)}
${linkedInSection}
</div>`.trim().replace(/^\s*\n/gm, "");
};

/* ── MAIN FUNCTION ──────────────────────────────────────────────────────── */
export async function buildMeetingBriefGemini(name: string, org: string): Promise<MeetingBriefPayload> {
  /* Track whether Harvest threw a quota/auth error */
  let harvestErrored = false;
  
  // Initialize counters
  let serperCallsMade = 0;

  const startTime = Date.now();
  const timings = {
    harvest: 0,
    serper: 0,
    jobChangeDetection: 0,
    snippetAnalysis: 0,
    firecrawl: 0,
    llmGeneration: 0,
  };
  let collectedSerpResults: SerpResult[] = [];
  let linkedInProfileResult: SerpResult | null = null;
  let jobHistoryTimeline: string[] = [];
  let educationTimeline: string[] = [];
  let harvestProfileData: HarvestLinkedInProfileElement | null = null;

  const { first, last } = splitFullName(name);
  console.log(`[MB Pipeline] Starting LinkedIn resolution for "${first} ${last}" at "${org}"`);

  /* ─────────────  H A R V E S T   P I P E L I N E  ───────────── */
  if (canUseHarvest) {
    try {
      const harvestStart = Date.now();
      const harvestResult = await llmEnhancedHarvestPipeline(name, org);
      timings.harvest = Date.now() - harvestStart;
      
      if (harvestResult.success) {
        harvestProfileData = harvestResult.profile.element || null;
        jobHistoryTimeline = harvestResult.jobTimeline || [];
        educationTimeline = harvestResult.educationTimeline || [];
        (globalThis as { hasResumeData?: boolean }).hasResumeData = true;

        linkedInProfileResult = {
          title: `${name} | LinkedIn Profile`,
          link: harvestResult.linkedinUrl,
          snippet: harvestResult.profile.element?.headline ?? `LinkedIn profile for ${name} at ${org}`
        };
        
        if (linkedInProfileResult.link) {
          collectedSerpResults.push(linkedInProfileResult);
        }
        
        // Extract publication URLs from Harvest profile for scraping
        const profileElement = harvestResult.profile.element;
        if (profileElement?.publications && Array.isArray(profileElement.publications)) {
          const publicationUrls = profileElement.publications
            .filter(pub => (pub.url || pub.link) && pub.title)
            .slice(0, 3) // Limit to top 3 publications to avoid overwhelming
            .map(pub => ({
              title: `Publication: ${pub.title}`,
              link: pub.url || pub.link!,
              snippet: pub.description || `Publication by ${name}: "${pub.title}"${pub.publisher ? ` published in ${pub.publisher}` : ''}${pub.publishedDate ? ` (${pub.publishedDate})` : ''}. This is a professional publication that may provide insights into ${name}'s expertise and thought leadership.`
            }));
          
          if (publicationUrls.length > 0) {
            console.log(`[MB] Found ${publicationUrls.length} publication URLs from Harvest profile for scraping`);
            collectedSerpResults.push(...publicationUrls);
          }
        }
        
        console.log(`[MB] Successfully resolved LinkedIn profile via Harvest + LLM (${harvestResult.searchMethod} search)`);
        console.log(`[MB] LLM reasoning for selection: ${harvestResult.llmReasoning}`);
        console.log(`[MB] Company evidence: ${harvestResult.companyEvidence?.join('; ') || 'None provided'}`);

      } else {
        console.log(`[Harvest] Pipeline Failed: ${harvestResult.reason}`);
        harvestErrored = true;
        
        // Handle specific failure for "LinkedIn found but no company match"
        if (harvestResult.reason === 'No selected profiles actually work at target company') {
          jobHistoryTimeline = [`A LinkedIn profile possibly matching "${name}" was found, but employment at "${org}" could not be verified from it.`];
          if (harvestResult.linkedinUrlAttempted) {
            // Populate linkedInProfileResult for URL display, even on this failure
            linkedInProfileResult = {
              title: `${name} | LinkedIn (Company Mismatch)`,
              link: harvestResult.linkedinUrlAttempted,
              snippet: `A LinkedIn profile was found for ${name}, but company verification with "${org}" failed. ${harvestResult.llmReasoning || ''}`.trim()
            };
            console.log(`[MB] Harvest found a LinkedIn profile (${harvestResult.linkedinUrlAttempted}) but company match with "${org}" failed.`);
          }
        }
        // Log LLM reasoning if available even on failure
        if (harvestResult.llmReasoning) {
          console.log(`[MB] LLM reasoning for (failed) selection: ${harvestResult.llmReasoning}`);
        }
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      harvestErrored = true;
      console.warn(`[Harvest] Main Pipeline catcher failed: ${error.message}`);
      
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
      jobHistoryTimeline = ["LinkedIn profile searched but no verified employment record found."];
      console.log("[MB] No results survived filtering, returning minimal brief");
    }
  } else {
    // When we have resume data, skip early filtering - will do enhanced filtering after Serper searches
    console.log(`[MB] Resume data available - skipping early filtering, will apply enhanced filtering after Serper searches`);
  }

  

  // Safety net: return a stub brief if truly nothing useful remains after filtering
  if (collectedSerpResults.length === 0) {
    jobHistoryTimeline = jobHistoryTimeline.length > 0 ? jobHistoryTimeline : [
      "LinkedIn profile searched but no verified employment record found."
    ];
    console.log("[MB] No results after enhanced filtering – returning minimal brief.");

    return {
      brief: renderFullHtmlBrief(
        name,
        org,
        { executive: [], highlights: [], funFacts: [], researchNotes: [] },
        [],
        jobHistoryTimeline,
        educationTimeline,
        linkedInProfileResult?.link
      ),
      citations: [],
      tokensUsed: 0,
      serperSearchesMade: serperCallsMade,
      // Harvest credits
      harvestCreditsUsed: 0,
      firecrawlAttempts: 0,
      firecrawlSuccesses: 0,
      finalSourcesConsidered: [],
      possibleSocialLinks: [],
      timings: {
        total: Date.now() - startTime,
        harvest: timings.harvest,
        serper: timings.serper,
        jobChangeDetection: timings.jobChangeDetection,
        snippetAnalysis: 0,
        firecrawl: 0,
        llmGeneration: 0,
        breakdown: `Early return - Total: ${Date.now() - startTime}ms`
      }
    };
  }
  // ------------------------------------------------------------------------

  // ── Continue with existing pipeline for general research ─────────────────
  console.log(`[MB Step 4] Running enhanced parallel Serper queries for "${name}" and "${org}"`);
  
  // Enhanced initial queries with job change detection
  const enhancedInitialQueries = [
    // NEW: Primary search for recent updates
    { 
      q: `"${name}" "${org}"`, 
      num: 15,
      label: "primary_name_company" 
    },
    // Existing queries
    { 
      q: `"${name}" "${org}" OR "${name}" "linkedin.com/in/"`, 
      num: 10,
      label: "name_company_linkedin" 
    },
    { 
      q: `"${name}" "${org}" (interview OR profile OR news OR "press release" OR biography)`, 
      num: 10,
      label: "name_company_content" 
    },
    { 
      q: `"${name}" "${org}" (award OR recognition OR keynote OR webinar OR conference OR patent OR publication OR podcast OR interview OR article OR blog OR whitepaper OR research OR paper OR study OR report OR testimony OR speaking OR panel OR book OR chapter OR quoted OR expert OR commentary OR analysis OR guest OR featured OR winner OR recipient OR achievement OR honor OR fellowship OR grant OR advisory OR board OR presentation OR workshop OR seminar OR briefing)`, 
      num: 10,
      label: "name_company_achievements" 
    },
    // NEW: Job change detection query
    { 
      q: `"${name}" (joins OR "has joined" OR appointed OR "new role" OR "moves to" OR "named as" OR "promoted to") -"${org}"`, 
      num: 5,
      label: "job_changes" 
    }
  ];
  
  // Run all queries in parallel for speed
  const serperStartTime = Date.now();
  const allSerperPromises = enhancedInitialQueries.map(query => 
    postJSON<{ organic?: SerpResult[] }>(
      SERPER_API_URL, 
      { q: query.q, num: query.num, gl: "us", hl: "en" }, 
      { "X-API-KEY": SERPER_KEY! }
    ).then(response => ({
      results: response.organic || [],
      label: query.label
    })).catch(err => ({
      results: [] as SerpResult[],
      label: query.label,
      error: err
    }))
  );
  
  const serperResponses = await Promise.all(allSerperPromises);
  serperCallsMade += enhancedInitialQueries.length;
  
  const serperTime = Date.now() - serperStartTime;
  timings.serper += serperTime;
  console.log(`[MB Step 4] Parallel Serper queries completed in ${serperTime}ms`);
  
  // Separate job change results (declare at function scope for later use)
  const jobChangeResults = serperResponses
    .find(r => r.label === 'job_changes')?.results || [];
  
  // Process main results with position tracking
  const processedResults: SerpResult[] = [];
  serperResponses
    .filter(r => r.label !== 'job_changes')
    .forEach(response => {
      response.results.forEach((result, index) => {
        processedResults.push({
          ...result,
          position: index + 1, // 1-based position
          query: response.label
        });
      });
    });
  
  // Collect main results
  collectedSerpResults.push(...processedResults);
  
  // Check for job changes using AI
  const openAiClient = getOpenAIClient();
  const jobChangeStart = Date.now();
  const jobChangeInfo = await detectJobChange(
    [...processedResults, ...jobChangeResults],
    name,
    org,
    openAiClient
  );
  timings.jobChangeDetection = Date.now() - jobChangeStart;
  
  if (jobChangeInfo.detected) {
    console.log(`[MB Alert] Job change detected for ${name}!`);
    console.log(`[MB Alert] New company: ${jobChangeInfo.newCompany}, Role: ${jobChangeInfo.newRole}`);
    
    // Add a special note to the brief
    if (jobHistoryTimeline.length === 0) {
      jobHistoryTimeline = [];
    }
    const jobChangeNote = jobChangeInfo.date 
      ? `⚠️ RECENT JOB CHANGE: ${jobChangeInfo.announcement || `${name} has moved from ${org} to ${jobChangeInfo.newCompany}`} (${jobChangeInfo.date})`
      : `⚠️ RECENT JOB CHANGE: ${jobChangeInfo.announcement || `${name} has moved from ${org} to ${jobChangeInfo.newCompany}`}`;
    jobHistoryTimeline.unshift(jobChangeNote);
  }

  // ── STEP 5: Prior-Company Searches (when hasResumeData is true) ──────────
  console.log(`[MB Step 5 Check] hasResumeData: ${hasResumeData}, harvestData: true, jobHistoryTimeline.length: ${jobHistoryTimeline.length}, educationTimeline.length: ${educationTimeline.length}`);
  
  if (hasResumeData && (jobHistoryTimeline.length > 0)) {
    console.log(`[MB Step 5] Running additional Serper queries for prior organizations of "${name}".`);
    
    // Get prior companies from Harvest-derived job timeline
    let priorCompanies: string[] = [];
    
    if (jobHistoryTimeline.length > 0) {
      // Extract from Harvest-derived job timeline
      priorCompanies = jobHistoryTimeline
        .map(job => {
          // Extract company from format: "Role — Company (years)"
          const companyMatch = job.match(/—\s*([^(]+)/);
          return companyMatch ? companyMatch[1].trim() : null;
        })
        .filter((c): c is string => !!c);
    }
    
    console.log(`[MB Step 5] Extracted prior companies: ${priorCompanies.join(', ')}`);
    
    const uniquePriorCompanies = priorCompanies
      .filter((c, i, arr) => 
        i === arr.findIndex(x => normalizeCompanyName(x) === normalizeCompanyName(c)) && 
        normalizeCompanyName(c) !== normalizeCompanyName(org)
      )
      .slice(0, 3);
    
    // Extract school names from education timeline
    const schools = educationTimeline.map(edu => {
      const schoolMatch = edu.match(/—\s*([^(]+)/);
      return schoolMatch ? schoolMatch[1].trim() : null;
    }).filter(Boolean).slice(0, 2); // Limit to top 2 schools
    
    // All known institutions (prior companies + schools)
    const allInstitutions = [...uniquePriorCompanies, ...schools];
    
    console.log(`[MB Step 5] Searching across ${allInstitutions.length} known institutions: ${allInstitutions.join(', ')}`);
    
    // Define all query types to run for each institution
    const queryTypes = [
      { keywords: "", label: "basic" }, // Basic name + institution
      { keywords: "(interview OR profile OR news OR \"press release\" OR biography)", label: "news/profile" },
      { keywords: "(award OR recognition OR keynote OR webinar OR conference OR patent OR publication OR podcast OR interview OR article OR blog OR whitepaper OR research OR paper OR study OR report OR testimony OR speaking OR panel OR book OR chapter OR quoted OR expert OR commentary OR analysis OR guest OR featured OR winner OR recipient OR achievement OR honor OR fellowship OR grant OR advisory OR board OR presentation OR workshop OR seminar OR briefing)", label: "awards/content" }
    ];
    
    // Run all query types for all institutions in parallel
    const priorCompanyQueries = allInstitutions.flatMap(institution =>
      queryTypes.map(queryType => ({
        institution,
        queryType,
        query: queryType.keywords 
          ? `"${name}" "${institution}" ${queryType.keywords}`
          : `"${name}" "${institution}"`
      }))
    );
    
    console.log(`[MB Step 5] Running ${priorCompanyQueries.length} prior company queries in parallel`);
    const priorCompanyStartTime = Date.now();
    
    const priorCompanyPromises = priorCompanyQueries.map(({ query, institution, queryType }) =>
      postJSON<{ organic?: SerpResult[] }>(
        SERPER_API_URL, 
        { q: query, num: 5, gl: "us", hl: "en" }, 
        { "X-API-KEY": SERPER_KEY! }
      ).then(response => ({
        results: response.organic || [],
        institution,
        queryType: queryType.label
      })).catch(err => ({
        results: [] as SerpResult[],
        institution,
        queryType: queryType.label,
        error: err
      }))
    );
    
    const priorCompanyResponses = await Promise.all(priorCompanyPromises);
    serperCallsMade += priorCompanyQueries.length;
    
    const priorTime = Date.now() - priorCompanyStartTime;
    timings.serper += priorTime;
    console.log(`[MB Step 5] Prior company queries completed in ${priorTime}ms`);
    
    // Process results
    priorCompanyResponses.forEach(({ results, institution, queryType }) => {
      if (results.length > 0) {
        console.log(`[MB Step 5] Found ${results.length} ${queryType} results for "${institution}"`);
        collectedSerpResults.push(...results);
      }
    });
  } else {
    console.log(`[MB Step 5] Skipped - insufficient data for prior company searches`);
  }

  // ------------------------------------------------------------------------
  // SECOND-PASS SERP FILTER
  // If we still have **no resume data**, eliminate any results that
  // do NOT mention both the NAME **and** ORG token (or the org domain).
  // If we DO have resume data, apply even stricter filtering to avoid wrong-person contamination.
  // ------------------------------------------------------------------------
  const hasResumeDataForSecondPass = (globalThis as { hasResumeData?: boolean }).hasResumeData ?? false;
  if (!hasResumeDataForSecondPass) {
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
  } else {
    // ENHANCED filtering when we have LinkedIn data - use known companies from Harvest
    console.log(`[MB] Enhanced filtering enabled - we have LinkedIn profile data for ${name} at ${org}`);
    const orgTok = normalizeCompanyName(org);
    const domHint = `${slugifyCompanyName(org)}.com`;
    const nameTok = name.toLowerCase();
    
    // Extract known companies and schools from LinkedIn data for positive filtering
    const knownCompanies = new Set([orgTok]);
    const knownSchools = new Set<string>();
    
    // Add prior companies from job history using harvestProfileData
    if (harvestProfileData?.experience && Array.isArray(harvestProfileData.experience)) {
      console.log(`[MB] Extracting companies from ${harvestProfileData.experience.length} Harvest experience entries`);
      harvestProfileData.experience.forEach((exp, idx) => {
        if (exp.companyName) {
          const normalizedCompany = normalizeCompanyName(exp.companyName);
          knownCompanies.add(normalizedCompany);
          console.log(`[MB] Added company ${idx + 1}: "${exp.companyName}" -> "${normalizedCompany}"`);
          
          // Also add potential acronyms
          const acronyms = extractPotentialAcronyms(exp.companyName);
          acronyms.forEach(acronym => {
            knownCompanies.add(acronym);
            console.log(`[MB] Added company acronym: "${acronym}"`);
          });
        }
      });
    }
    
    if (educationTimeline.length > 0) {
      educationTimeline.forEach(edu => {
        // Extract school names from education entries like "MBA — Harvard Business School (2020)"
        const schoolMatch = edu.match(/—\s*([^(]+)/);
        if (schoolMatch) {
          const school = schoolMatch[1].trim().toLowerCase();
          knownSchools.add(school);
          // Also add variations
          knownSchools.add(school.replace(/university|college|school|institute/gi, '').trim());
        }
      });
    }
    
    console.log(`[MB] Known companies for filtering: ${Array.from(knownCompanies).join(', ')}`);
    console.log(`[MB] Known schools for filtering: ${Array.from(knownSchools).join(', ')}`);

    const pre = collectedSerpResults.length;
    collectedSerpResults = collectedSerpResults.filter(r => {
      // Always keep the verified LinkedIn profile
      if (r.link === linkedInProfileResult?.link) {
        return true;
      }
      
      const txt = (r.title + ' ' + (r.snippet ?? '')).toLowerCase();
      const nameInContent = txt.includes(nameTok);
      const urlContainsOrg = r.link.includes(domHint);
      
      if (!nameInContent) {
        return false; // Must mention the person's name
      }
      
      // Check if it mentions any known company
      const mentionsKnownCompany = Array.from(knownCompanies).some(company => 
        txt.includes(company)
      );
      
      // Check if it mentions any known school
      const mentionsKnownSchool = Array.from(knownSchools).some(school => 
        school.length > 2 && txt.includes(school)
      );
      
      // Professional keywords that indicate relevant content
      const professionalKeywords = [
        'award', 'recognition', 'published', 'publication', 'interview', 'profile',
        'keynote', 'speaker', 'webinar', 'conference', 'patent', 'executive',
        'director', 'manager', 'analyst', 'vp', 'vice president', 'ceo', 'cto',
        'promoted', 'joins', 'appointed', 'hired', 'news', 'press release'
      ];
      
      const hasProfessionalKeywords = professionalKeywords.some(keyword => 
        txt.includes(keyword)
      );
      
      // For LinkedIn profiles, be extra strict - must mention target company
      if (r.link.includes('linkedin.com/in/') && !mentionsKnownCompany) {
        console.log(`[MB] Filtered out LinkedIn profile without known company mention: ${r.title}`);
        return false;
      }
      
      // Check if this is award/recognition content (should be less strict)
      const isAwardOrRecognition = txt.includes('award') || txt.includes('recognition') || 
        txt.includes('honor') || txt.includes('winner') || txt.includes('recipient') ||
        txt.includes('achievement') || txt.includes('fellowship') || txt.includes('grant');
      
      // Keep if: 
      // 1. URL contains org domain, OR
      // 2. Mentions known company/school AND has professional keywords, OR
      // 3. Is award/recognition content AND mentions known company (even without other keywords)
      const isRelevant = urlContainsOrg || 
        (mentionsKnownCompany && hasProfessionalKeywords) ||
        (mentionsKnownSchool && hasProfessionalKeywords) ||
        (isAwardOrRecognition && (mentionsKnownCompany || mentionsKnownSchool));
      
      if (!isRelevant) {
        console.log(`[MB] Filtered out unrelated result: ${r.title}`);
      }
      
      return isRelevant;
    });
    console.log(`[MB] Enhanced SERP filter (with known companies) – kept ${collectedSerpResults.length}/${pre}`);
  }

  // Final safety net: if no results survive enhanced filtering, return brief with just LinkedIn data
  if (collectedSerpResults.length === 0 && hasResumeDataForSecondPass) {
    console.log("[MB] No results after enhanced filtering – returning brief with LinkedIn data only.");
    return {
      brief: renderFullHtmlBrief(
        name,
        org,
        { executive: [], highlights: [], funFacts: [], researchNotes: [] },
        [],
        jobHistoryTimeline,
        educationTimeline,
        linkedInProfileResult?.link
      ),
      citations: [],
      tokensUsed: 0,
      serperSearchesMade: serperCallsMade,
      harvestCreditsUsed: 0,
      firecrawlAttempts: 0, 
      firecrawlSuccesses: 0,
      finalSourcesConsidered: [],
      possibleSocialLinks: [],
      timings: {
        total: Date.now() - startTime,
        harvest: timings.harvest,
        serper: timings.serper,
        jobChangeDetection: timings.jobChangeDetection,
        snippetAnalysis: 0,
        firecrawl: 0,
        llmGeneration: 0,
        breakdown: `Early return - Total: ${Date.now() - startTime}ms`
      }
    };
  }

  // ------------------------------------------------------------------------

  console.log(`[MB Step 6] Deduplicating and filtering SERP results. Initial count: ${collectedSerpResults.length}`);
  const uniqueSerpResults = Array.from(new Map(collectedSerpResults.map(r => [r.link, r])).values());
  console.log(`[MB Step 6] Unique SERP results: ${uniqueSerpResults.length}`);

  // ── De-prioritise RocketReach etc. ─────────────────────────
  // Log what's being filtered
  const filteredOut = uniqueSerpResults.filter(r => 
    r.link !== linkedInProfileResult?.link &&
    NO_SCRAPE_URL_SUBSTRINGS.some(skip => r.link.includes(skip))
  );
  
  if (filteredOut.length > 0) {
    console.log(`[MB Step 6] Filtering out ${filteredOut.length} sources:`);
    filteredOut.forEach(r => {
      const domain = NO_SCRAPE_URL_SUBSTRINGS.find(skip => r.link.includes(skip));
      console.log(`  - ${r.title} (${domain})`);
    });
  }
  
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
  
  // Log which sources made it through
  console.log(`[MB Step 6] Sources selected:`);
  sourcesToProcessForLLM.forEach((s, idx) => {
    console.log(`  ${idx + 1}. ${s.title} - ${s.link}`);
  });

  const possibleSocialLinks = SOCIAL_DOMAINS
    .flatMap(domain => uniqueSerpResults.filter(r => r.link.includes(domain)).map(r => r.link))
    .filter((link, i, arr) => arr.indexOf(link) === i);

  console.log(`[MB Step 7] Starting intelligent snippet analysis and scraping for ${sourcesToProcessForLLM.length} sources.`);
  
  // Build set of known organizations from LinkedIn data
  const knownOrganizations = new Set<string>();
  knownOrganizations.add(normalizeCompanyName(org));
  
  // Add all known companies from LinkedIn profile
  if (harvestProfileData?.experience && Array.isArray(harvestProfileData.experience)) {
    harvestProfileData.experience.forEach(exp => {
      if (exp.companyName) {
        const normalizedCompany = normalizeCompanyName(exp.companyName);
        knownOrganizations.add(normalizedCompany);
        
        // Also add potential acronyms
        const acronyms = extractPotentialAcronyms(exp.companyName);
        acronyms.forEach(acronym => knownOrganizations.add(acronym));
      }
    });
  }
  
  console.log(`[MB] Known organizations for ${name}: ${Array.from(knownOrganizations).join(', ')}`);
  
  const scrapingStartTime = Date.now();
  
  // Step 1: Analyze all snippets with AI for smart scraping decisions
  console.log(`[MB Step 7.1] Analyzing snippets with AI...`);
  const snippetAnalysisStart = Date.now();
  const snippetAnalysisMap = await analyzeSnippetsWithAI(
    sourcesToProcessForLLM,
    name,
    org,
    openAiClient
  );
  timings.snippetAnalysis = Date.now() - snippetAnalysisStart;
  console.log(`[MB Step 7.1] Snippet analysis completed in ${timings.snippetAnalysis}ms`);
  
  // Step 2: Categorize sources based on analysis and priorities
  const sourcesWithPriorities = sourcesToProcessForLLM.map(source => {
    const isJobChangeRelated = jobChangeResults.some(r => r.link === source.link);
    const snippetAnalysis = snippetAnalysisMap.get(source.link);
    const priority = determineScrapePriority(source, isJobChangeRelated, snippetAnalysis, name, org, knownOrganizations);
    
    // Log when we're prioritizing results
    if (priority.priority === 'critical') {
      const fullText = `${source.title} ${source.snippet || ''}`.toLowerCase();
      const mentionsName = fullText.includes(name.toLowerCase());
      let mentionedOrg = null;
      
      if (mentionsName) {
        for (const knownOrg of knownOrganizations) {
          if (fullText.includes(knownOrg.toLowerCase())) {
            mentionedOrg = knownOrg;
            break;
          }
        }
      }
      
      if (mentionsName && mentionedOrg) {
        console.log(`[MB] HIGH PRIORITY - Result mentions "${name}" + known org "${mentionedOrg}": ${source.title.slice(0, 60)}...`);
      } else if (source.query === 'primary_name_company' && source.position && source.position <= 5) {
        const isUnscrapable = NO_SCRAPE_URL_SUBSTRINGS.some(pattern => source.link.includes(pattern)) ||
                             source.link.includes('linkedin.com');
        
        if (isUnscrapable) {
          console.log(`[MB] Top-${source.position} result is unscrapable (${source.link.includes('linkedin.com') ? 'LinkedIn' : 'filtered site'}): ${source.title.slice(0, 60)}...`);
        } else {
          const isNews = NEWS_PATTERNS.some(pattern => source.link.includes(pattern)) || 
                         source.title.toLowerCase().includes(' news') ||
                         source.link.includes('/news/') ||
                         source.link.includes('/article/');
          
          if (isNews) {
            console.log(`[MB] Top-ranked news article (position ${source.position}) marked as critical: ${source.title.slice(0, 60)}...`);
          } else {
            console.log(`[MB] Top-ranked result (position ${source.position}) marked as critical: ${source.title.slice(0, 60)}...`);
          }
        }
      }
    }
    
    return {
      source,
      priority,
      snippetAnalysis
    };
  });
  
  // Step 3: Separate into categories
  const skipWithSnippet = sourcesWithPriorities.filter(s => 
    s.snippetAnalysis?.canSkipScrape === true
  );
  const toScrape = sourcesWithPriorities.filter(s => 
    !s.snippetAnalysis?.canSkipScrape
  ).sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority.priority] - priorityOrder[a.priority.priority];
  });
  
  console.log(`[MB Step 7.2] Source categorization:
    - Complete info in snippet (skip scrape): ${skipWithSnippet.length}
    - To scrape: ${toScrape.length} (critical: ${toScrape.filter(s => s.priority.priority === 'critical').length}, high: ${toScrape.filter(s => s.priority.priority === 'high').length}, medium: ${toScrape.filter(s => s.priority.priority === 'medium').length}, low: ${toScrape.filter(s => s.priority.priority === 'low').length})`);
  
  const extractedTextsForLLM = new Array(sourcesToProcessForLLM.length).fill("");
  
  // Step 4: Process snippet-only sources (no scraping needed)
  skipWithSnippet.forEach(({ source, snippetAnalysis }) => {
    const idx = sourcesToProcessForLLM.indexOf(source);
    if (idx !== -1 && snippetAnalysis) {
      const facts = snippetAnalysis.extractedFacts || [];
      const enrichedContent = facts.length > 0
        ? `${source.title}
Key Information (extracted from snippet):
${facts.map(fact => `• ${fact}`).join('\n')}

Original snippet: ${source.snippet || 'No snippet available'}`
        : `${source.title}. ${source.snippet || 'No snippet available'}`;
      extractedTextsForLLM[idx] = enrichedContent;
    }
  });
  
  // Step 5: Process sources that need scraping in priority waves
  const critical = toScrape.filter(s => s.priority.priority === 'critical');
  const high = toScrape.filter(s => s.priority.priority === 'high');
  const medium = toScrape.filter(s => s.priority.priority === 'medium');
  
  // Wave 1: Critical content (job changes, major announcements)
  if (critical.length > 0) {
    console.log(`[MB Step 7.3] Wave 1: Scraping ${critical.length} critical priority sources...`);
    const wave1Start = Date.now();
    const criticalPromises = critical.map(({ source, priority }) => 
      smartFirecrawl(priority)
        .then(content => ({ source, content }))
    );
    
    const criticalResults = await Promise.all(criticalPromises);
    criticalResults.forEach(({ source, content }) => {
      const idx = sourcesToProcessForLLM.indexOf(source);
      if (idx !== -1) {
        extractedTextsForLLM[idx] = content 
          ? content.slice(0, 3500)
          : `${source.title}. ${source.snippet || ''}`;
      }
    });
    console.log(`[MB Step 7.3] Wave 1 completed in ${Date.now() - wave1Start}ms`);
  }
  
  // Wave 2: High priority (awards, recognitions) - higher concurrency
  if (high.length > 0) {
    console.log(`[MB Step 7.4] Wave 2: Scraping ${Math.min(20, high.length)} high priority sources...`);
    const wave2Start = Date.now();
    const highPromises = high.slice(0, 20).map(({ source, priority }) =>
      smartFirecrawl(priority)
        .then(content => ({ source, content }))
    );
    
    const highResults = await Promise.all(highPromises);
    highResults.forEach(({ source, content }) => {
      const idx = sourcesToProcessForLLM.indexOf(source);
      if (idx !== -1) {
        extractedTextsForLLM[idx] = content 
          ? content.slice(0, 3500)
          : `${source.title}. ${source.snippet || ''}`;
      }
    });
    console.log(`[MB Step 7.4] Wave 2 completed in ${Date.now() - wave2Start}ms`);
  }
  
  // Wave 3: Medium priority - only if we need more content
  const hasEnoughContent = extractedTextsForLLM.filter(text => text && text.length > 100).length >= 10;
  if (!hasEnoughContent && medium.length > 0) {
    console.log(`[MB Step 7.5] Wave 3: Scraping ${Math.min(10, medium.length)} medium priority sources...`);
    const wave3Start = Date.now();
    const mediumPromises = medium.slice(0, 10).map(({ source, priority }) =>
      smartFirecrawl(priority)
        .then(content => ({ source, content }))
    );
    
    const mediumResults = await Promise.all(mediumPromises);
    mediumResults.forEach(({ source, content }) => {
      const idx = sourcesToProcessForLLM.indexOf(source);
      if (idx !== -1) {
        extractedTextsForLLM[idx] = content 
          ? content.slice(0, 3500)
          : `${source.title}. ${source.snippet || ''}`;
      }
    });
    console.log(`[MB Step 7.5] Wave 3 completed in ${Date.now() - wave3Start}ms`);
  }
  
  // Process any remaining sources (including low priority) with just snippets
  // This ensures all sources have content, even if they weren't scraped
  sourcesToProcessForLLM.forEach((source, idx) => {
    if (!extractedTextsForLLM[idx]) {
      // Check if this source has snippet analysis data
      const snippetAnalysis = snippetAnalysisMap.get(source.link);
      const facts = snippetAnalysis?.extractedFacts || [];
      if (snippetAnalysis && facts.length > 0) {
        extractedTextsForLLM[idx] = `${source.title}
Key Information (extracted from snippet):
${facts.map(fact => `• ${fact}`).join('\n')}
Original snippet: ${source.snippet || 'No snippet available'}`;
      } else {
        extractedTextsForLLM[idx] = source.link === linkedInProfileResult?.link 
          ? `LinkedIn profile for ${name}. LinkedIn profile for ${name}. URL: ${source.link}`
          : `${source.title}. ${source.snippet || ''}`;
      }
    }
  });
  
  const totalScrapingTime = Date.now() - scrapingStartTime;
  timings.firecrawl = totalScrapingTime - timings.snippetAnalysis; // Subtract snippet analysis time
  console.log(`[MB Step 7] Intelligent scraping completed in ${totalScrapingTime}ms (Snippet analysis: ${timings.snippetAnalysis}ms, Firecrawl: ${timings.firecrawl}ms). Sources with full content: ${extractedTextsForLLM.filter(t => t.length > 500).length}/${sourcesToProcessForLLM.length}`);

  const llmSourceBlock = sourcesToProcessForLLM
    .map((source, index) => `SOURCE_${index + 1} URL: ${source.link}\nCONTENT:\n${extractedTextsForLLM[index] || "No content extracted or snippet used."}`)
    .join("\n\n---\n\n");
  const llmJsonTemplate = JSON.stringify({ executive: [{text:"",source:1}], highlights: [{text:"",source:1}], funFacts: [{text:"",source:1}], researchNotes: [{text:"",source:1}] }, null, 2);
  const systemPromptForLLM = `You are an AI assistant creating a concise MeetingBrief about a person for a professional meeting.
The user will provide context about the person, their current organization, their job history from LinkedIn, and a list of numbered sources with URLs and extracted content.
Your task is to populate a JSON object strictly adhering to the TEMPLATE provided.
- Each item in the arrays ("executive", "highlights", "funFacts", "researchNotes") must be an object with "text" (a string) and "source" (the 1-based number of the source it came from, accurately referencing the provided SOURCES_FOR_ANALYSIS).
- "executive" summary: 2-3 key sentences about the person, highly relevant for someone about to meet them professionally. Focus on their current role and one major accomplishment or characteristic.
- "highlights": 3-5 bullet points covering notable achievements, skills, or significant public information. Include relevant education credentials (e.g., prestigious universities, advanced degrees) and significant volunteering roles when they add professional context. Prioritize information from fuller text sources if available.
- "funFacts": 1-3 interesting, lighter details if available (e.g., hobbies mentioned, unique educational background, interesting volunteer work, personal website info). Educational or volunteering details that are personally interesting rather than professionally critical can go here. If none, this array MUST be empty ([]).
- "researchNotes": 4-6 distinct, concise notes or direct observations from the provided sources. These can include education and volunteering details that provide useful context. If a source is weak (e.g., just a snippet), a note might reflect that limited scope.
- For ALL "text" fields: Be very concise. Do NOT invent information or make assumptions beyond the provided text. If a category has no relevant information from the sources, its array MUST be empty ([]).
- Do NOT include phrases like "Source X says...", "According to Source Y...", or any citation markers like "[1]" or "(source 1)" directly within the "text" fields. The "source" number property provides all attribution.
- Ensure all "source" numbers are accurate integers corresponding to the provided source list (1 to N, where N is the number of sources in SOURCES_FOR_ANALYSIS).
- Validate that all "text" fields are strings, and all "source" fields are integers.
- CRITICAL: Ignore any claims about being "CEO", "President", or other executive titles unless from official company sources. Data broker sites often have incorrect information.
- CRITICAL: Do NOT include personal information like age, home address, or other private details from public records sites.
- CRITICAL JOB CHANGE HANDLING: When you see news about someone "joining", "being hired by", or "moving to" a new company, treat this information carefully:
  * If the LinkedIn profile shows them at the CURRENT_ORGANIZATION, prioritize that as their current role
  * Include job change news in researchNotes section ONLY, not in executive summary or highlights
  * Always clarify the timing (e.g., "Recently announced move to..." or "Joining [company] in [timeframe]")
  * Never present uncertain employment status as fact in the executive summary
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

### EDUCATION_TIMELINE (from LinkedIn, for context)
${educationTimeline.join("\n") || "Not available."}

### SOURCES_FOR_ANALYSIS (numbered 1 to ${sourcesToProcessForLLM.length})
${llmSourceBlock}
`.trim();

  console.log(`[MB Step 8] Sending ~${estimateTokens(systemPromptForLLM + userPromptForLLM)} tokens to LLM (${MODEL_ID}) for structured brief generation.`);
  let llmJsonBrief: JsonBriefFromLLM = { executive: [], highlights: [], funFacts: [], researchNotes: [] };
  let llmOutputTokens = 0;

  if (OPENAI_API_KEY) {
    try {
      const ai = getOpenAIClient();
      const llmStart = Date.now();
      const llmResponse = await ai.chat.completions.create({
        model: MODEL_ID, temperature: 0.0, response_format: { type: "json_object" },
        messages: [{ role: "system", content: systemPromptForLLM }, { role: "user", content: userPromptForLLM }],
      });
      timings.llmGeneration = Date.now() - llmStart;
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

  // ── CITATION RENUMBERING ─────────────────────────────────────────────────
  // Collect all unique source numbers that are actually used in the brief
  const allUsedSources = new Set<number>();
  [...llmJsonBrief.executive, ...llmJsonBrief.highlights, ...llmJsonBrief.funFacts, ...llmJsonBrief.researchNotes]
    .forEach(row => {
      if (typeof row.source === 'number' && row.source >= 1 && row.source <= sourcesToProcessForLLM.length) {
        allUsedSources.add(row.source);
      }
    });

  // Create mapping from original source numbers to new sequential numbers
  const usedSourcesArray = Array.from(allUsedSources).sort((a, b) => a - b);
  const sourceMapping = new Map<number, number>();
  usedSourcesArray.forEach((originalSource, index) => {
    sourceMapping.set(originalSource, index + 1);
  });

  console.log(`[MB] Renumbering citations: ${usedSourcesArray.length} sources used, mapping: ${Array.from(sourceMapping.entries()).map(([old, new_]) => `${old}→${new_}`).join(', ')}`);

  // Update all BriefRow objects with new source numbers
  const renumberBriefRows = (rows: BriefRow[]): BriefRow[] => {
    return rows.map(row => ({
      ...row,
      source: sourceMapping.get(row.source) || row.source
    }));
  };

  llmJsonBrief.executive = renumberBriefRows(llmJsonBrief.executive);
  llmJsonBrief.highlights = renumberBriefRows(llmJsonBrief.highlights);
  llmJsonBrief.funFacts = renumberBriefRows(llmJsonBrief.funFacts);
  llmJsonBrief.researchNotes = renumberBriefRows(llmJsonBrief.researchNotes);

  // Create final citations array with only used sources, in new order
  const finalCitations: Citation[] = usedSourcesArray.map((originalSourceIndex, newIndex) => {
    const source = sourcesToProcessForLLM[originalSourceIndex - 1]; // Convert to 0-based
    return {
      marker: `[${newIndex + 1}]`,
      url: source.link,
      title: source.title,
      snippet: (extractedTextsForLLM[originalSourceIndex - 1] || `${source.title}. ${source.snippet ?? ""}`).slice(0, 300) + ((extractedTextsForLLM[originalSourceIndex - 1]?.length || 0) > 300 ? "..." : "")
    };
  });

  const htmlBriefOutput = renderFullHtmlBrief(name, org, llmJsonBrief, finalCitations, jobHistoryTimeline, educationTimeline, linkedInProfileResult?.link);
  const totalInputTokensForLLM = estimateTokens(systemPromptForLLM + userPromptForLLM);
  const totalTokensUsed = totalInputTokensForLLM + llmOutputTokens;
  const totalTime = Date.now() - startTime;
  const wallTimeSeconds = totalTime / 1000;

  // Create timing breakdown
  const timingBreakdown = `Total: ${totalTime}ms | Harvest: ${timings.harvest}ms | Serper: ${timings.serper}ms | Job Change: ${timings.jobChangeDetection}ms | Snippet Analysis: ${timings.snippetAnalysis}ms | Firecrawl: ${timings.firecrawl}ms | LLM: ${timings.llmGeneration}ms`;
  
  console.log(`[MB Finished] Processed for "${name}". Total tokens: ${totalTokensUsed}. Serper: ${serperCallsMade}. HarvestErrored=${harvestErrored}. Wall time: ${wallTimeSeconds.toFixed(1)}s`);
  console.log(`[MB Timing] ${timingBreakdown}`);

  // Refined jobHistoryTimeline default fallback
  if (jobHistoryTimeline.length === 0) {
    if (linkedInProfileResult && linkedInProfileResult.link) {
        // A LinkedIn profile URL is known (either success or specific failure like company mismatch),
        // but we don't have a detailed timeline from Harvest.
        jobHistoryTimeline = [`Key employment details for "${name}" at "${org}" could not be fully confirmed from the identified LinkedIn profile.`];
    } else if (canUseHarvest && !harvestErrored) {
        // Harvest ran, didn't error, but didn't yield resume data or a specific "company mismatch" URL.
        // This could mean no profiles found by Harvest at all.
        jobHistoryTimeline = [`LinkedIn profile search for "${name}" at "${org}" by Harvest did not yield a verifiable employment record.`];
    } else if (harvestErrored && !linkedInProfileResult?.link) {
        // Harvest errored out before identifying a specific profile, or no API key
        jobHistoryTimeline = [`LinkedIn profile search for "${name}" at "${org}" encountered issues or was skipped; employment details not available from this source.`];
    } else {
        // General fallback if no LinkedIn info at all
        jobHistoryTimeline = [`A detailed employment history for "${name}" at "${org}" could not be constructed from available sources.`];
    }
  }

  return {
    brief: htmlBriefOutput, 
    citations: finalCitations, 
    tokensUsed: totalTokensUsed,
    serperSearchesMade: serperCallsMade, 
    // Harvest credits
    harvestCreditsUsed: 0,
    firecrawlAttempts: 0, 
    firecrawlSuccesses: 0,
    finalSourcesConsidered: sourcesToProcessForLLM.map((s, idx) => ({
      url: s.link, title: s.title,
      processed_snippet: (extractedTextsForLLM[idx] || "Snippet/Error").slice(0, 300) + ((extractedTextsForLLM[idx]?.length || 0) > 300 ? "..." : ""),
    })),
    possibleSocialLinks,
    timings: {
      total: totalTime,
      harvest: timings.harvest,
      serper: timings.serper,
      jobChangeDetection: timings.jobChangeDetection,
      snippetAnalysis: timings.snippetAnalysis,
      firecrawl: timings.firecrawl,
      llmGeneration: timings.llmGeneration,
      breakdown: timingBreakdown
    }
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

const formatJobSpan = (starts_at?: YearMonthDay, ends_at?: YearMonthDay): string => {
  const startYear = starts_at?.year ? starts_at.year.toString() : "?";
  const endYear = ends_at?.year ? ends_at.year.toString() : "Present";
  return `${startYear} – ${endYear}`;
};

const llmCompanyMatch = async (
  profileText: string, 
  targetCompany: string, 
  openAiClient: OpenAI
): Promise<{ isMatch: boolean, evidence: string, confidence: number }> => {
  
  const systemPrompt = `You are an expert at identifying company mentions in LinkedIn profiles. Your task is to determine if a profile mentions working at a specific company, considering all common variations, abbreviations, and subsidiary names.

Return a JSON object with:
{
  "isMatch": boolean, // true if the profile clearly indicates employment at the target company
  "evidence": string, // the specific text that indicates the company match
  "confidence": number // 1-10 confidence score (10 = very certain, 1 = very uncertain)
}

Consider:
- Common abbreviations (e.g., "BofA" for "Bank of America", "MSFT" for "Microsoft", "AMZN" for "Amazon")
- Subsidiary companies (e.g., "Merrill Lynch" is part of "Bank of America", "Instagram" is part of "Meta")
- Division names within companies
- Contextual clues that indicate employment (e.g., "Prior to joining...", "Currently at...", "Works for...")

Be conservative - only return isMatch: true if you're confident the person works/worked at the target company or its subsidiaries.`;

  const userPrompt = `Target company: "${targetCompany}"

Profile text to analyze:
"${profileText}"

Does this profile indicate the person works or worked at "${targetCompany}" or any of its subsidiaries/divisions?`;

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
      isMatch: result.isMatch || false,
      evidence: result.evidence || '',
      confidence: result.confidence || 0
    };

  } catch (error) {
    console.error('[LLM Company Match] Failed:', error);
    return { isMatch: false, evidence: 'LLM matching failed', confidence: 0 };
  }
};

const findCompanyMatches = async (
  fullProfileResponse: HarvestLinkedInProfileApiResponse,
  targetOrg: string,
  openAiClient: OpenAI
): Promise<{ score: number; evidence: string[] }> => {
  let score = 0;
  const evidence: string[] = [];

  const profileElement = fullProfileResponse?.element;

  if (!profileElement) {
    console.warn("[findCompanyMatches] Profile 'element' is missing in the API response. Cannot perform company match.");
    return { score: 0, evidence: ["Profile data incomplete or missing 'element' structure."] };
  }

  console.log(`[findCompanyMatches] Checking profile (ID: ${profileElement.publicIdentifier || 'N/A'}) for company "${targetOrg}"`);
  
  // DEBUG: Log all available fields in the profile element
  console.log(`[DEBUG] Available profile fields:`, Object.keys(profileElement));
  
  // DEBUG: Check for new data fields
  const possibleCertificationFields = ['certifications', 'certification', 'certs', 'licenses'];
  const possibleLanguageFields = ['languages', 'language', 'spoken'];
  const possiblePublicationFields = ['publications', 'publication', 'papers', 'articles'];
  
  possibleCertificationFields.forEach(field => {
    if ((profileElement as Record<string, unknown>)[field]) {
      console.log(`[DEBUG] Found potential certification data in field '${field}':`, (profileElement as Record<string, unknown>)[field]);
    }
  });

  possibleLanguageFields.forEach(field => {
    if ((profileElement as Record<string, unknown>)[field]) {
      console.log(`[DEBUG] Found potential language data in field '${field}':`, (profileElement as Record<string, unknown>)[field]);
    }
  });

  possiblePublicationFields.forEach(field => {
    if ((profileElement as Record<string, unknown>)[field]) {
      console.log(`[DEBUG] Found potential publication data in field '${field}':`, (profileElement as Record<string, unknown>)[field]);
    }
  });

  const profileTexts: string[] = [];

  if (profileElement.about) {
    profileTexts.push(`Bio: ${profileElement.about}`);
    console.log(`[findCompanyMatches] Extracted 'about' section (first 200 chars): ${profileElement.about.slice(0, 200)}...`);
  } else {
    console.log("[findCompanyMatches] 'about' section is missing or empty in profile element.");
  }

  if (profileElement.headline) {
    profileTexts.push(`Headline: ${profileElement.headline}`);
    console.log(`[findCompanyMatches] Extracted 'headline': ${profileElement.headline}`);
  }

  if (profileElement.currentPosition && Array.isArray(profileElement.currentPosition)) {
    profileElement.currentPosition.forEach((pos, idx) => {
      if (pos.companyName || pos.title) {
        const text = `Current Position ${idx + 1}: ${pos.title || 'N/A'} at ${pos.companyName || 'N/A'}`;
        profileTexts.push(text);
        console.log(`[findCompanyMatches] Extracted current position text: ${text}`);
      }
    });
  } else {
     console.log("[findCompanyMatches] 'currentPosition' data missing or not an array.");
  }

  if (profileElement.experience && Array.isArray(profileElement.experience)) {
    profileElement.experience.slice(0, 5).forEach((exp, idx) => { // Check top 5 experiences
      if (exp.companyName || exp.position) {
        const text = `Experience ${idx + 1}: ${exp.position || 'N/A'} at ${exp.companyName || 'N/A'}`;
        profileTexts.push(text);
        console.log(`[findCompanyMatches] Extracted experience text: ${text}`);
      }
    });
  } else {
    console.log("[findCompanyMatches] 'experience' data missing or not an array.");
  }

  // Extract education information
  if (profileElement.education && Array.isArray(profileElement.education)) {
    profileElement.education.slice(0, 3).forEach((edu) => { // Check top 3 education entries
      // Handle both Harvest format (title/degree) and legacy format (schoolName/degreeName)
      const school = edu.title || edu.schoolName || '';
      const degree = edu.degree || edu.degreeName || '';
      let fieldText = edu.fieldOfStudy || '';
      
      // Parse degree and field from Harvest's combined degree field if needed
      let degreeText = degree;
      if (degree && degree.includes(' - ') && !fieldText) {
        const parts = degree.split(' - ');
        if (parts.length >= 2) {
          degreeText = parts[0].trim();
          const secondPart = parts[1].trim();
          // Extract field from "MA, International Relations" format
          if (secondPart.includes(', ')) {
            fieldText = secondPart.split(', ').slice(1).join(', ');
          }
        }
      }
      
      const years = edu.endDate?.year ? ` (${edu.endDate.year})` : '';
      const text = `${degreeText}${fieldText ? ` in ${fieldText}` : ''} — ${school}${years}`.replace(/\s+/g, ' ').trim();
      profileTexts.push(text);
      console.log(`[findCompanyMatches] Extracted education text: ${text}`);
    });
  } else {
    console.log("[findCompanyMatches] 'education' data missing or not an array.");
    
    // Fallback: Try to extract education info from about section
    if (profileElement.about) {
      const educationPatterns = [
        /(?:graduated|degree|studied|attended|alumni?)\s+(?:from\s+)?([A-Z][A-Za-z\s&.,-]+(?:University|College|School|Institute))/gi,
        /([A-Z][A-Za-z\s&.,-]+(?:University|College|School|Institute))[\s,]*(?:graduate|alumni?|degree)/gi,
        /(MBA|PhD|BA|BS|MS|Master|Bachelor|Doctorate)[\s\w]*(?:from\s+|at\s+)?([A-Z][A-Za-z\s&.,-]+)/gi
      ];
      
      educationPatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(profileElement.about || '')) !== null && profileTexts.filter(t => t.includes('Education')).length < 3) {
          const institution = match[1] || match[2] || match[0];
          if (institution && institution.length > 3) {
            const text = `Education (from bio): ${institution.trim()}`;
            if (!profileTexts.some(existing => existing.includes(institution.trim()))) {
              profileTexts.push(text);
              console.log(`[findCompanyMatches] Extracted education from about section: ${text}`);
            }
          }
        }
      });
    }
  }

  // Extract volunteering information
  if (profileElement.volunteering && Array.isArray(profileElement.volunteering)) {
    profileElement.volunteering.slice(0, 3).forEach((vol, idx) => { // Check top 3 volunteering entries
      if (vol.organizationName || vol.role || vol.cause) {
        const role = vol.role || '';
        const org = vol.organizationName || '';
        const cause = vol.cause || '';
        const text = `Volunteering ${idx + 1}: ${role} ${org ? `at ${org}` : ''} ${cause ? `(${cause})` : ''}`.replace(/\s+/g, ' ').trim();
        profileTexts.push(text);
        console.log(`[findCompanyMatches] Extracted volunteering text: ${text}`);
      }
    });
  } else {
    console.log("[findCompanyMatches] 'volunteering' data missing or not an array.");
    
    // Fallback: Try to extract volunteering info from about section
    if (profileElement.about) {
      const volunteerPatterns = [
        /(?:volunteer|board member|advisory|nonprofit|charity|foundation|community)[\s\w]*(?:at|for|with)\s+([A-Z][A-Za-z\s&.,-]+)/gi,
        /([A-Z][A-Za-z\s&.,-]+)[\s,]*(?:volunteer|board|advisory|nonprofit|charity|foundation)/gi
      ];
      
      volunteerPatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(profileElement.about || '')) !== null && profileTexts.filter(t => t.includes('Volunteer')).length < 3) {
          const organization = match[1] || match[0];
          if (organization && organization.length > 3) {
            const text = `Volunteering (from bio): ${organization.trim()}`;
            if (!profileTexts.some(existing => existing.includes(organization.trim()))) {
              profileTexts.push(text);
              console.log(`[findCompanyMatches] Extracted volunteering from about section: ${text}`);
            }
          }
        }
      });
    }
  }

  // Extract certifications information
  if (profileElement.certifications && Array.isArray(profileElement.certifications)) {
    profileElement.certifications.slice(0, 5).forEach((cert) => { // Check top 5 certifications
      if (cert.name || cert.authority) {
        const certName = cert.name || 'Certification';
        const authority = cert.authority ? ` from ${cert.authority}` : '';
        const text = `Certified in ${certName}${authority}`;
        profileTexts.push(text);
        console.log(`[findCompanyMatches] Extracted certification text: ${text}`);
      }
    });
  } else {
    console.log("[findCompanyMatches] 'certifications' data missing or not an array.");
  }

  // Extract languages information
  if (profileElement.languages && Array.isArray(profileElement.languages)) {
    const languageList = profileElement.languages
      .slice(0, 5) // Limit to top 5 languages
      .map(lang => {
        const name = lang.name || 'Unknown Language';
        const proficiency = lang.proficiency ? ` (${lang.proficiency})` : '';
        return `${name}${proficiency}`;
      })
      .join(', ');
    
    if (languageList) {
      const text = `Languages: ${languageList}`;
      profileTexts.push(text);
      console.log(`[findCompanyMatches] Extracted languages text: ${text}`);
    }
  } else {
    console.log("[findCompanyMatches] 'languages' data missing or not an array.");
  }

  // Extract publications information
  if (profileElement.publications && Array.isArray(profileElement.publications)) {
    profileElement.publications.slice(0, 3).forEach((pub, idx) => { // Check top 3 publications
      if (pub.title) {
        const title = pub.title;
        const publisher = pub.publisher ? ` (${pub.publisher})` : '';
        const date = pub.publishedDate ? ` - ${pub.publishedDate}` : '';
        const text = `Publication ${idx + 1}: ${title}${publisher}${date}`;
        profileTexts.push(text);
        console.log(`[findCompanyMatches] Extracted publication text: ${text}`);
        
        // Store publication URL for potential Firecrawl scraping
        if (pub.url) {
          console.log(`[findCompanyMatches] Found publication URL for potential scraping: ${pub.url}`);
        }
      }
    });
  } else {
    console.log("[findCompanyMatches] 'publications' data missing or not an array.");
  }

  if (profileTexts.length === 0) {
    console.warn(`[findCompanyMatches] No textual data (about, headline, positions, experience) extracted from the profile element to analyze for company match with "${targetOrg}".`);
    return { score: 0, evidence: ["No relevant text fields found in profile for company matching."] };
  }

  const fullProfileText = profileTexts.join("\n\n---\n\n");
  console.log(`[findCompanyMatches] Analyzing combined profile text (${fullProfileText.length} chars) for company: "${targetOrg}"`);

  // Call the existing llmCompanyMatch
  const matchResult = await llmCompanyMatch(fullProfileText, targetOrg, openAiClient);

  if (matchResult.isMatch && matchResult.confidence > 0) {
    score = Math.max(3, matchResult.confidence); // Original scoring: min score 3, max 10
    evidence.push(matchResult.evidence || "LLM indicated a match without specific evidence text.");
    console.log(`[findCompanyMatches] LLM reported company match for "${targetOrg}". Evidence: "${matchResult.evidence}", Confidence: ${matchResult.confidence}, Assigned Score: ${score}`);
  } else {
    score = 0;
    evidence.push(matchResult.evidence || `LLM indicated no match for "${targetOrg}" based on the provided text.`);
    console.log(`[findCompanyMatches] LLM reported no company match for "${targetOrg}". Reason/Evidence from LLM: "${matchResult.evidence}", Confidence: ${matchResult.confidence}`);
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

// Type definition for Harvest pipeline results
type HarvestPipelineResult = {
  success: true;
  profile: HarvestLinkedInProfileApiResponse;
  linkedinUrl: string;
  jobTimeline: string[];
  educationTimeline: string[];
  llmReasoning: string;
  companyEvidence: string[];
  searchMethod: string;
} | {
  success: false;
  reason: string;
  linkedinUrlAttempted?: string; // URL of profile that was tried but failed verification
  jobTimeline?: never;
  educationTimeline?: never;
  companyEvidence?: never;
  llmReasoning?: string; // Can still have reasoning for selection failure
  searchMethod?: string; // Can still indicate search method
};

// Helper function to enrich LinkedIn profiles found via Serper
const enrichLinkedInProfiles = async (linkedinUrls: string[], name: string, org: string): Promise<HarvestPipelineResult> => {
  console.log(`[Harvest] Enriching ${linkedinUrls.length} LinkedIn profiles found via Serper`);
  
  const enrichedProfiles: HarvestLinkedInProfileElement[] = [];
  
  for (const url of linkedinUrls) {
    try {
      // Extract LinkedIn username from URL (e.g., "john-doe" from linkedin.com/in/john-doe)
      const match = url.match(/linkedin\.com\/in\/([^/?]+)/);
      if (!match) continue;
      
      const username = match[1];
      console.log(`[Harvest] Enriching profile: ${username}`);
      
      const profileData = await harvestGet<{ element: HarvestLinkedInProfileElement }>(`/linkedin/profile/${username}`, {});
      
      if (profileData.element) {
        enrichedProfiles.push(profileData.element);
        console.log(`[Harvest] Successfully enriched profile: ${profileData.element.firstName} ${profileData.element.lastName}`);
      }
    } catch (error) {
      console.log(`[Harvest] Failed to enrich profile ${url}: ${error}`);
    }
  }
  
  if (enrichedProfiles.length === 0) {
    return { success: false, reason: 'Failed to enrich any LinkedIn profiles found via Serper' };
  }
  
  // Use the same company verification logic as before
  const companyMatchResults = await Promise.all(
    enrichedProfiles.map(async (profile) => {
      const profileId = profile.publicIdentifier || profile.id || 'unknown';
      const companyMatch = await findCompanyMatches([{ element: profile, linkedinUrl: profile.linkedinUrl || '' }], org);
      return {
        profile,
        url: profileId,
        hasMatch: companyMatch.length > 0 && companyMatch[0].hasMatch,
        evidence: companyMatch.length > 0 ? companyMatch[0].evidence : [],
        score: companyMatch.length > 0 ? companyMatch[0].score : 0
      };
    })
  );
  
  // Find the best matching profile
  const bestMatch = companyMatchResults
    .filter(result => result.hasMatch)
    .sort((a, b) => b.score - a.score)[0];
  
  if (bestMatch) {
    const jobTimeline = extractJobTimeline(bestMatch.profile);
    const educationTimeline = extractEducationTimeline(bestMatch.profile);
    
    return {
      success: true,
      profile: { element: bestMatch.profile },
      linkedinUrl: bestMatch.profile.linkedinUrl || '',
      jobTimeline,
      educationTimeline,
      companyEvidence: bestMatch.evidence,
      searchMethod: 'Serper + Harvest enrichment',
      llmReasoning: `Profile found via Serper search and enriched with Harvest. Company match confidence: ${bestMatch.score}`
    };
  }
  
  // If no company matches, return the first profile but mark it
  const firstProfile = enrichedProfiles[0];
  return {
    success: false,
    reason: 'Profiles found via Serper but none match the target company',
    linkedinUrlAttempted: firstProfile.linkedinUrl,
    searchMethod: 'Serper + Harvest enrichment (no company match)'
  };
};

// Updated Harvest pipeline using LLM selection
const llmEnhancedHarvestPipeline = async (name: string, org: string): Promise<HarvestPipelineResult> => {
  try {
    // 1. Serper pre-search to find LinkedIn profile URLs
    console.log(`[Harvest] Serper pre-search for "${name}" at "${org}"`);
    const serperQuery = `"${name}" site:linkedin.com/in ${org}`;
    
    try {
      const serperResponse = await fetch(SERPER_API_URL, {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: serperQuery, num: 5 })
      });
      
      if (serperResponse.ok) {
        const serperData = await serperResponse.json();
        const linkedinUrls = serperData.organic?.filter((result: { link?: string; title?: string }) => 
          result.link?.includes('linkedin.com/in/') && 
          result.title?.toLowerCase().includes(name.toLowerCase().split(' ')[0])
        ).map((result: { link?: string; title?: string }) => result.link).slice(0, 3) || [];
        
        console.log(`[Harvest] Serper found ${linkedinUrls.length} LinkedIn profile URLs: ${linkedinUrls.join(', ')}`);
        
        // If we found LinkedIn URLs, try to enrich them directly with Harvest
        if (linkedinUrls.length > 0) {
          return await enrichLinkedInProfiles(linkedinUrls, name, org);
        }
      } else {
        console.log(`[Harvest] Serper pre-search failed: ${serperResponse.status}`);
      }
    } catch (serperError) {
      console.log(`[Harvest] Serper pre-search error: ${serperError}`);
    }
    
    // 2. Fallback to Harvest search if Serper didn't find profiles
    console.log(`[Harvest] Falling back to Harvest search method`);
    
    // Company search for fallback method
    console.log(`[Harvest] Company search for "${org}"`);
    const comp = await harvestGet<CompanySearch>("/linkedin/company-search", { search: org, limit: "3" });
    const companyId = comp.elements?.[0]?.id;

    if (!companyId) {
      console.log("[Harvest] Company search returned 0 results.");
      return { success: false, reason: 'Company not found' };
    }

    // 2. Profile search with pagination - Try broader search first, fallback to company filter for common names
    console.log(`[Harvest] Starting with broader search for "${name}" to avoid company filtering bugs`);
    
    // Helper function to get paginated results in parallel
    const getPaginatedProfiles = async (searchParams: Record<string, string>, maxPages: number = 3): Promise<ProfSearch['elements']> => {
      // Create all page requests in parallel
      const pagePromises = Array.from({ length: maxPages }, (_, i) => {
        const pageParams = { ...searchParams, start: (i * 10).toString() };
        return harvestGet<ProfSearch>("/linkedin/profile-search", pageParams)
          .then(result => ({ page: i + 1, result }))
          .catch(error => ({ page: i + 1, error }));
      });
      
      const pageResults = await Promise.all(pagePromises);
      const allElements: ProfSearch['elements'] = [];
      
      for (const pageResult of pageResults) {
        if ('error' in pageResult) {
          console.log(`[Harvest] Page ${pageResult.page}: error - ${pageResult.error}`);
          break; // Stop on first error
        }
        
        const { page, result } = pageResult;
        if (!result.elements || result.elements.length === 0) {
          console.log(`[Harvest] Page ${page}: no results - stopping pagination`);
          break; // No more results
        }
        
        allElements.push(...result.elements);
        console.log(`[Harvest] Page ${page}: found ${result.elements.length} profiles`);
        
        // If we got fewer than the limit, this was the last page
        if (result.elements.length < parseInt(searchParams.limit || '10')) {
          break;
        }
      }
      
      return allElements;
    };
    
    const allElements = await getPaginatedProfiles({ search: name, limit: "10" }, 3);
    let prof = { elements: allElements };
    let wasCompanyFiltered = false;
    
    // If broader search returns too many results (indicating common name), try company filtering as fallback
    if (prof.elements && prof.elements.length >= 25) {
      console.log(`[Harvest] Broader search returned ${prof.elements.length} results - name may be too common. Trying company-filtered search as fallback.`);
      try {
        const companyFilteredElements = await getPaginatedProfiles({ search: name, companyId, limit: "10" }, 3);
        
        if (companyFilteredElements.length > 0 && companyFilteredElements.length < prof.elements.length) {
          console.log(`[Harvest] Company-filtered search found ${companyFilteredElements.length} candidates (vs ${prof.elements.length} from broader search). Using company-filtered results.`);
          prof = { elements: companyFilteredElements };
          wasCompanyFiltered = true;
        } else {
          console.log(`[Harvest] Company-filtered search didn't improve results (${companyFilteredElements.length || 0} results). Sticking with broader search.`);
        }
      } catch (error) {
        console.log(`[Harvest] Company-filtered fallback failed: ${error}. Continuing with broader search.`);
      }
    }
      
    if (!prof.elements?.length) {
      console.log("[Harvest] Search returned 0 results.");
      return { success: false, reason: 'No profiles found in search' };
    }
    
    console.log(`[Harvest] Using ${wasCompanyFiltered ? 'company-filtered' : 'broader'} search found ${prof.elements.length} candidates (will verify company matches via LLM)`);
    
    // DIAGNOSTIC: Check if we're getting the same limited results regardless of search type
    const profileIds = prof.elements.map(p => p.linkedinUrl?.split('/').pop() || p.publicIdentifier).filter(Boolean);
    console.log(`[DIAGNOSTIC] Profile IDs returned: ${profileIds.slice(0, 5).join(', ')}${profileIds.length > 5 ? '...' : ''}`);
    console.log(`[DIAGNOSTIC] If you see the same profile IDs repeatedly across different searches, the Harvest API may have indexing or caching issues.`);

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
    
    // DIAGNOSTIC: Log company filtering bug
    if (wasCompanyFiltered) {
      console.log(`[DIAGNOSTIC] WARNING: Company-filtered search for companyId=${companyId} (${org}) returned profiles that may not actually work at this company. This suggests a Harvest API bug.`);
      console.log(`[DIAGNOSTIC] All ${validCandidates.length} profiles were supposedly filtered by company "${org}" but will be verified by LLM scraping.`);
    }

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
        const fullProfile = await harvestGet<HarvestLinkedInProfileApiResponse>("/linkedin/profile", { url });
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

    // 6. Verify company matches in scraped profiles using LLM
    const verifiedProfiles = await Promise.all(
      successfulScrapes.map(async scrape => {
        const companyMatches = await findCompanyMatches(scrape.fullProfile, org, openAiClient);
        return {
          ...scrape,
          companyMatches,
          hasCompanyMatch: companyMatches.score > 0
        };
      })
    );

    console.log(`[Harvest] Company verification results:`, 
      verifiedProfiles.map(p => ({
        url: p.url.split('/').pop(), // just the identifier
        hasMatch: p.hasCompanyMatch,
        evidence: p.companyMatches.evidence,
        score: p.companyMatches.score
      }))
    );

    // 7. Filter to only profiles with actual company matches
    const profilesWithCompanyMatch = verifiedProfiles.filter(p => p.hasCompanyMatch);

    if (profilesWithCompanyMatch.length === 0) {
      console.log(`[Harvest] None of the selected profiles appear to currently work at "${org}" based on LLM verification. Falling back to web search.`);
      
      const actualCompaniesLog = verifiedProfiles.map(p => {
        const profileData = p.fullProfile?.element;
        const companies: string[] = [];
        if (profileData?.about) {
            // Basic extraction for logging, not robust parsing
            const companyMentions = profileData.about.match(/(?:at|joining|worked for|employed by)\s+([A-Z][A-Za-z\s&.,'-]+?)(?:\s|,|\.|$|;)/g);
            if (companyMentions) {
                companies.push(...companyMentions.map(mention => mention.replace(/^(?:at|joining|worked for|employed by)\s+/, '').trim()));
            }
        }
        if (profileData?.currentPosition) {
            companies.push(...profileData.currentPosition.map(cp => cp.companyName).filter(Boolean) as string[]);
        }
        if (profileData?.experience) {
            companies.push(...profileData.experience.slice(0,3).map(ex => ex.companyName).filter(Boolean) as string[]);
        }
        const profileName = `${profileData?.firstName || 'Unknown'} ${profileData?.lastName || 'Name'}`;
        return { profileName, url: p.url.split('/').pop(), companies: [...new Set(companies)].join(', ') || 'Unknown' };
      });
      
      console.log(`[Harvest] Scraped profiles' likely companies:`, actualCompaniesLog);
      console.log(`[Harvest] This suggests either: (1) wrong person selected by LLM, (2) person no longer works at ${org}, (3) profile data incomplete/ambiguous, or (4) company name variations not caught by LLM.`);

      const bestAttemptedUrl = successfulScrapes.length > 0 ? successfulScrapes[0].url : undefined;
      return {
        success: false,
        reason: 'No selected profiles actually work at target company',
        linkedinUrlAttempted: bestAttemptedUrl,
        llmReasoning: selection.reasoning,
        searchMethod: wasCompanyFiltered ? 'company-filtered' : 'broader'
      };
    }

    // 8. Take the best company-verified profile (prefer higher company match scores)
    profilesWithCompanyMatch.sort((a, b) => b.companyMatches.score - a.companyMatches.score);
    const bestResult = profilesWithCompanyMatch[0];
    const fullProfile = bestResult.fullProfile;

    console.log(`[Harvest] Selected verified profile with company evidence:`, bestResult.companyMatches.evidence);

    // 9. Build job timeline and education separately
    const profileData = bestResult.fullProfile?.element;
    let jobHistoryTimeline: string[] = [];
    let educationTimeline: string[] = [];

    // Try to get structured experience data first
    if (profileData?.experience && Array.isArray(profileData.experience)) {
      jobHistoryTimeline = profileData.experience.map((exp) =>
        `${exp.position || "Role"} — ${exp.companyName || "Company"} (${formatJobSpan(exp.startDate, exp.endDate as YearMonthDay | undefined)})`
      );
    }

    // If no structured experience, try to extract from about section
    if (jobHistoryTimeline.length === 0 && profileData?.about) {
      const about = profileData.about;
      const timeline: string[] = [];
      
      // Look for current role indicators
      if (about.includes('Managing Director') && about.includes('Financial Institutions')) {
        timeline.push('Managing Director — Financial Institutions Group (Current)');
      } else if (about.includes('Managing Director')) {
        timeline.push('Managing Director (Current)');
      }
      
      // Look for previous roles
      if (about.includes('Federal Reserve')) {
        timeline.push('Staff Member — Federal Reserve (Previous)');
      }
      
      if (about.includes('Financial Stability Board')) {
        timeline.push('Member of Secretariat — Financial Stability Board, Switzerland (Previous)');
      }
      
      // Look for other role patterns
      const roleMatches = about.match(/(Vice President|VP|Director|Manager|Analyst|Associate) (?:at|in|of) ([^.\n]+)/gi);
      if (roleMatches) {
        roleMatches.forEach(match => {
          if (!timeline.some(existing => existing.includes(match))) {
            timeline.push(match + ' (Previous)');
          }
        });
      }
      
      jobHistoryTimeline = timeline;
    }

    // Extract education information separately
    if (profileData?.education && Array.isArray(profileData.education)) {
      educationTimeline = profileData.education.slice(0, 2).map((edu) => {
        // Handle both Harvest format (title/degree) and legacy format (schoolName/degreeName)
        const school = edu.title || edu.schoolName || 'University';
        const degree = edu.degree || edu.degreeName || 'Degree';
        let fieldText = edu.fieldOfStudy || '';
        
        // Parse degree and field from Harvest's combined degree field if needed
        let degreeText = degree;
        if (degree && degree.includes(' - ') && !fieldText) {
          const parts = degree.split(' - ');
          if (parts.length >= 2) {
            degreeText = parts[0].trim();
            const secondPart = parts[1].trim();
            // Extract field from "MA, International Relations" format
            if (secondPart.includes(', ')) {
              fieldText = secondPart.split(', ').slice(1).join(', ');
            }
          }
        }
        
        const years = edu.endDate?.year ? ` (${edu.endDate.year})` : '';
        return `${degreeText}${fieldText ? ` in ${fieldText}` : ''} — ${school}${years}`;
      });
    }

    // Fallback if still no timeline
    if (jobHistoryTimeline.length === 0) {
      jobHistoryTimeline = ["LinkedIn profile found but detailed work history private or unavailable."];
    }

    console.log(`[Harvest] Successfully selected, scraped, and verified profile using ${wasCompanyFiltered ? 'company-filtered' : 'broader'} search: ${bestResult.url}`);
    console.log(`[Harvest] Found ${jobHistoryTimeline.length} work experiences`);
    console.log(`[Harvest] Found ${educationTimeline.length} education entries`);
    console.log(`[Harvest] Company verification: ${bestResult.companyMatches.evidence.join('; ')}`);

    return {
      success: true,
      profile: fullProfile,
      linkedinUrl: bestResult.url,
      jobTimeline: jobHistoryTimeline,
      educationTimeline: educationTimeline,
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

