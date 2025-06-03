import { OpenAI } from "openai";

/* ── Environment Variables ─────────────────────────────────────────────── */
const PROXYCURL_API_KEY = process.env.PROXYCURL_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL_ID = "gpt-4o-mini-2024-07-18";

// ProxyCurl API endpoints
const PROXYCURL_BASE = "https://nubela.co/proxycurl/api";
const PERSON_LOOKUP_ENDPOINT = `${PROXYCURL_BASE}/linkedin/profile/resolve`;

/* ── ProxyCurl Interfaces ──────────────────────────────────────────────── */
interface ProxyCurlDate {
  day?: number;
  month?: number;
  year?: number;
}

interface ProxyCurlExperience {
  company?: string;
  title?: string;
  description?: string;
  location?: string;
  starts_at?: ProxyCurlDate;
  ends_at?: ProxyCurlDate;
  company_linkedin_profile_url?: string;
}

interface ProxyCurlEducation {
  school?: string;
  degree_name?: string;
  field_of_study?: string;
  description?: string;
  starts_at?: ProxyCurlDate;
  ends_at?: ProxyCurlDate;
  school_linkedin_profile_url?: string;
}

interface ProxyCurlPersonProfile {
  public_identifier?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  headline?: string;
  summary?: string;
  country?: string;
  city?: string;
  state?: string;
  experiences?: ProxyCurlExperience[];
  education?: ProxyCurlEducation[];
  profile_pic_url?: string;
  occupation?: string;
  [key: string]: unknown;
}

interface ProxyCurlLookupResponse {
  url?: string;
  profile?: ProxyCurlPersonProfile;
  name_similarity_score?: number;
  company_similarity_score?: number;
  title_similarity_score?: number;
  location_similarity_score?: number;
  last_updated?: string;
}

interface ProxyCurlBackupResult {
  success: boolean;
  profile?: ProxyCurlPersonProfile;
  linkedinUrl?: string;
  jobTimeline: string[];
  educationTimeline: string[];
  creditsUsed: number;
  reason?: string;
  companyEvidence?: string[];
}

/* ── Helper Functions ──────────────────────────────────────────────────── */
const splitFullName = (fullName: string): { first: string; last: string } => {
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 1) {
    return { first: nameParts[0], last: "" };
  }
  const first = nameParts[0];
  const last = nameParts.slice(1).join(" ");
  return { first, last };
};

const formatJobSpan = (starts_at?: ProxyCurlDate, ends_at?: ProxyCurlDate): string => {
  const startYear = starts_at?.year ? starts_at.year.toString() : "?";
  const endYear = ends_at?.year ? ends_at.year.toString() : "Present";
  return `${startYear} – ${endYear}`;
};

const extractCompanyDomain = (org: string): string => {
  // Simple heuristic to convert company name to domain
  const cleanOrg = org.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .replace(/inc|llc|corp|corporation|ltd|limited|company|co$/g, '');
  
  // For well-known companies, return known domains
  const domainMap: Record<string, string> = {
    'google': 'google.com',
    'microsoft': 'microsoft.com',
    'apple': 'apple.com',
    'amazon': 'amazon.com',
    'meta': 'meta.com',
    'facebook': 'facebook.com',
    'tesla': 'tesla.com',
    'nvidia': 'nvidia.com',
    'netflix': 'netflix.com',
    'salesforce': 'salesforce.com',
    'oracle': 'oracle.com',
    'adobe': 'adobe.com',
    'intel': 'intel.com',
    'ibm': 'ibm.com',
    'cisco': 'cisco.com',
    'uber': 'uber.com',
    'airbnb': 'airbnb.com',
    'spotify': 'spotify.com',
    'twitter': 'twitter.com',
    'linkedin': 'linkedin.com',
    'goldman': 'gs.com',
    'jpmorgan': 'jpmorganchase.com',
    'morgenstanley': 'morganstanley.com',
    'blackrock': 'blackrock.com',
    'mckinsey': 'mckinsey.com',
    'bcg': 'bcg.com',
    'bain': 'bain.com',
    'deloitte': 'deloitte.com',
    'pwc': 'pwc.com',
    'ey': 'ey.com',
    'kpmg': 'kpmg.com'
  };

  if (domainMap[cleanOrg]) {
    return domainMap[cleanOrg];
  }

  // Fallback: assume .com domain
  return `${cleanOrg}.com`;
};

const proxyCurlRequest = async <T>(
  url: string,
  params: Record<string, string>
): Promise<T> => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${url}?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${PROXYCURL_API_KEY}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ProxyCurl API error ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<T>;
};

const llmCompanyMatch = async (
  profile: ProxyCurlPersonProfile,
  targetCompany: string,
  openAiClient: OpenAI
): Promise<{ isMatch: boolean; confidence: number; evidence: string }> => {
  const profileTexts: string[] = [];

  // Add summary/about
  if (profile.summary) {
    profileTexts.push(`Summary: ${profile.summary}`);
  }

  // Add current occupation
  if (profile.occupation) {
    profileTexts.push(`Current role: ${profile.occupation}`);
  }

  // Add work experiences
  if (profile.experiences && Array.isArray(profile.experiences)) {
    profile.experiences.slice(0, 5).forEach((exp) => {
      const company = exp.company || 'Unknown Company';
      const title = exp.title || 'Unknown Role';
      const timespan = formatJobSpan(exp.starts_at, exp.ends_at);
      profileTexts.push(`${title} — ${company} (${timespan})`);
    });
  }

  // Add education
  if (profile.education && Array.isArray(profile.education)) {
    profile.education.slice(0, 3).forEach((edu) => {
      const school = edu.school || 'Unknown School';
      const degree = edu.degree_name || '';
      const field = edu.field_of_study || '';
      const timespan = formatJobSpan(edu.starts_at, edu.ends_at);
      const degreeText = `${degree}${field ? ` in ${field}` : ''}`;
      profileTexts.push(`${degreeText} — ${school} (${timespan})`);
    });
  }

  if (profileTexts.length === 0) {
    return { isMatch: false, confidence: 0, evidence: "No profile data available for company matching" };
  }

  const combinedText = profileTexts.join('\n');
  
  const systemPrompt = `You are a company matching expert. Analyze the given LinkedIn profile text and determine if this person currently works or has worked at the target company.

Consider:
1. Current employment status (most important)
2. Recent work history
3. Company name variations (e.g., "Meta" vs "Facebook", "Alphabet" vs "Google")
4. Subsidiary relationships
5. Contractor/consultant relationships

Return JSON with:
{
  "isMatch": boolean,
  "confidence": number (0-10, where 10 = definitely works there),
  "evidence": "specific text or reasoning supporting the decision"
}`;

  const userPrompt = `Target company: "${targetCompany}"

LinkedIn profile data:
${combinedText}

Does this person currently work or recently work at "${targetCompany}"?`;

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
      confidence: result.confidence || 0,
      evidence: result.evidence || 'No evidence provided'
    };
  } catch (error) {
    console.error('[ProxyCurl] LLM company matching failed:', error);
    return { isMatch: false, confidence: 0, evidence: "LLM matching failed" };
  }
};

/* ── Main ProxyCurl Backup Function ────────────────────────────────────── */
export const proxyCurlBackupPipeline = async (
  name: string,
  org: string
): Promise<ProxyCurlBackupResult> => {
  if (!PROXYCURL_API_KEY) {
    return {
      success: false,
      jobTimeline: [],
      educationTimeline: [],
      creditsUsed: 0,
      reason: 'ProxyCurl API key not configured'
    };
  }

  console.log(`[ProxyCurl Backup] Starting lookup for "${name}" at "${org}"`);
  
  const openAiClient = new OpenAI({ apiKey: OPENAI_API_KEY! });
  const { first, last } = splitFullName(name);
  const companyDomain = extractCompanyDomain(org);
  let creditsUsed = 0;

  try {
    // Step 1: Person Lookup
    console.log(`[ProxyCurl Backup] Attempting person lookup with domain: ${companyDomain}`);
    
    const lookupParams = {
      first_name: first,
      last_name: last,
      company_domain: companyDomain,
      similarity_checks: 'include',
      enrich_profile: 'enrich'
    };

    const lookupResult = await proxyCurlRequest<ProxyCurlLookupResponse>(
      PERSON_LOOKUP_ENDPOINT,
      lookupParams
    );
    
    creditsUsed += 2; // Person lookup costs 2 credits + 1 for enrichment
    
    if (!lookupResult.profile || !lookupResult.url) {
      console.log('[ProxyCurl Backup] Person lookup returned no results');
      return {
        success: false,
        jobTimeline: [],
        educationTimeline: [],
        creditsUsed,
        reason: 'No profile found via person lookup'
      };
    }

    console.log(`[ProxyCurl Backup] Found profile: ${lookupResult.profile.full_name}`);
    console.log(`[ProxyCurl Backup] Similarity scores - Name: ${lookupResult.name_similarity_score}, Company: ${lookupResult.company_similarity_score}`);

    // Step 2: Company verification using LLM
    const companyMatch = await llmCompanyMatch(lookupResult.profile, org, openAiClient);
    
    if (!companyMatch.isMatch || companyMatch.confidence < 3) {
      console.log(`[ProxyCurl Backup] Company match failed - confidence: ${companyMatch.confidence}, evidence: ${companyMatch.evidence}`);
      return {
        success: false,
        jobTimeline: [],
        educationTimeline: [],
        creditsUsed,
        reason: `Profile found but company verification failed: ${companyMatch.evidence}`,
        companyEvidence: [companyMatch.evidence]
      };
    }

    console.log(`[ProxyCurl Backup] Company match confirmed - confidence: ${companyMatch.confidence}`);

    // Step 3: Build job timeline
    const jobTimeline: string[] = [];
    if (lookupResult.profile.experiences && Array.isArray(lookupResult.profile.experiences)) {
      lookupResult.profile.experiences.slice(0, 7).forEach((exp) => {
        const company = exp.company || 'Unknown Company';
        const title = exp.title || 'Unknown Role';
        const timespan = formatJobSpan(exp.starts_at, exp.ends_at);
        jobTimeline.push(`${title} — ${company} (${timespan})`);
      });
    }

    // Step 4: Build education timeline
    const educationTimeline: string[] = [];
    if (lookupResult.profile.education && Array.isArray(lookupResult.profile.education)) {
      lookupResult.profile.education.slice(0, 5).forEach((edu) => {
        const school = edu.school || 'Unknown School';
        const degree = edu.degree_name || '';
        const field = edu.field_of_study || '';
        const timespan = formatJobSpan(edu.starts_at, edu.ends_at);
        const degreeText = `${degree}${field ? ` in ${field}` : ''}`;
        educationTimeline.push(`${degreeText} — ${school} (${timespan})`);
      });
    }

    console.log(`[ProxyCurl Backup] Successfully processed profile with ${jobTimeline.length} jobs and ${educationTimeline.length} education entries`);

    return {
      success: true,
      profile: lookupResult.profile,
      linkedinUrl: lookupResult.url,
      jobTimeline,
      educationTimeline,
      creditsUsed,
      companyEvidence: [companyMatch.evidence]
    };

  } catch (error) {
    console.error('[ProxyCurl Backup] Pipeline failed:', error);
    return {
      success: false,
      jobTimeline: [],
      educationTimeline: [],
      creditsUsed,
      reason: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/* ── Credit Check Function ─────────────────────────────────────────────── */
export const checkProxyCurlCredits = async (): Promise<number | null> => {
  if (!PROXYCURL_API_KEY) return null;

  try {
    const response = await fetch(`${PROXYCURL_BASE}/meta`, {
      headers: {
        'Authorization': `Bearer ${PROXYCURL_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) return null;

    const data = await response.json() as { credit_balance?: number };
    return data.credit_balance || 0;
  } catch (error) {
    console.warn('[ProxyCurl] Credit check failed:', error);
    return null;
  }
}; 