import { NextRequest, NextResponse } from "next/server";

// Security constants
export const SECURITY_LIMITS = {
  MAX_INPUT_LENGTH: 100,
  MAX_REQUEST_SIZE: 1024, // 1KB
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 20, // per minute per user
  MAX_QUERY_RESULTS: 100, // Maximum database query results
  
  // Anti-abuse limits
  ANONYMOUS_DAILY_LIMIT: 2, // Max briefs per IP per day
  ANONYMOUS_HOURLY_LIMIT: 2, // Max briefs per IP per hour
  ANONYMOUS_MONTHLY_LIMIT: 2, // Max briefs per IP per month
  SUSPICIOUS_REQUEST_THRESHOLD: 10, // Requests that trigger enhanced checks
  MIN_REQUEST_INTERVAL: 60000, // 1 minute between requests
  BLOCKED_USER_AGENTS: [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
    'postman', 'insomnia', 'httpie', 'automated', 'headless'
  ],
  BLOCKED_COUNTRIES: ['CN', 'RU', 'KP'], // Block high-abuse countries
} as const;

// Enhanced rate limiting store
interface UserLimitData {
  count: number;
  resetTime: number;
  hourlyCount: number;
  hourlyResetTime: number;
  dailyCount: number;
  dailyResetTime: number;
  lastRequestTime: number;
  suspiciousScore: number;
  blocked: boolean;
  blockReason?: string;
}

const rateLimitStore = new Map<string, UserLimitData>();

// Honeypot field detector
export function detectHoneypot(body: Record<string, unknown>): boolean {
  const honeypotFields = ['website', 'url', 'phone', 'email_confirm', 'address'];
  return honeypotFields.some(field => 
    body[field] && 
    typeof body[field] === 'string' && 
    (body[field] as string).trim() !== ''
  );
}

// Bot detection
export function detectBot(request: NextRequest): { isBot: boolean; reason?: string } {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const acceptHeader = request.headers.get('accept') || '';

  // Check for obvious bot user agents
  const isBotUA = SECURITY_LIMITS.BLOCKED_USER_AGENTS.some(bot => 
    userAgent.includes(bot.toLowerCase())
  );
  if (isBotUA) {
    return { isBot: true, reason: 'Bot user agent detected' };
  }

  // Check for missing typical browser headers (be more lenient)
  if (!userAgent || !acceptHeader) {
    return { isBot: true, reason: 'Missing critical headers' };
  }

  // More lenient accept header check for AJAX requests
  // Accept various legitimate browser request types
  const hasValidAccept = acceptHeader.includes('application/json') || 
                        acceptHeader.includes('text/html') || 
                        acceptHeader.includes('*/*') ||
                        acceptHeader.includes('text/plain');
  
  if (!hasValidAccept) {
    return { isBot: true, reason: 'Invalid accept header' };
  }

  // Check for very short user agent (typically bots) - be more lenient
  if (userAgent.length < 20) {
    return { isBot: true, reason: 'Suspiciously short user agent' };
  }

  // Additional check: if user agent looks like a real browser
  const browserIndicators = ['mozilla', 'webkit', 'chrome', 'safari', 'firefox', 'edge'];
  const hasBrowserIndicator = browserIndicators.some(indicator => 
    userAgent.includes(indicator)
  );
  
  if (!hasBrowserIndicator) {
    return { isBot: true, reason: 'Non-browser user agent' };
  }

  return { isBot: false };
}

// Geographic blocking (simplified - in production use a proper GeoIP service)
export function checkGeographicRestrictions(request: NextRequest): { blocked: boolean; reason?: string } {
  const country = request.headers.get('cf-ipcountry') || // Cloudflare
                  request.headers.get('x-country-code') || // Other CDNs
                  request.headers.get('x-forwarded-country');

  if (country && SECURITY_LIMITS.BLOCKED_COUNTRIES.includes(country.toUpperCase() as typeof SECURITY_LIMITS.BLOCKED_COUNTRIES[number])) {
    return { blocked: true, reason: `Geographic restriction: ${country}` };
  }

  return { blocked: false };
}

// Enhanced fingerprinting
export function generateFingerprint(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  // Create a more robust fingerprint
  const fingerprint = [ip, userAgent, acceptLanguage, acceptEncoding].join('|');
  return `fp_${Buffer.from(fingerprint).toString('base64').slice(0, 16)}`;
}

export interface RateLimitResult {
  allowed: boolean;
  resetTime?: number;
  remaining?: number;
  blocked?: boolean;
  reason?: string;
}

export function checkRateLimit(userId: string, maxRequests: number = SECURITY_LIMITS.RATE_LIMIT_MAX_REQUESTS): RateLimitResult {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId) || {
    count: 0,
    resetTime: now + SECURITY_LIMITS.RATE_LIMIT_WINDOW,
    hourlyCount: 0,
    hourlyResetTime: now + (60 * 60 * 1000), // 1 hour
    dailyCount: 0,
    dailyResetTime: now + (24 * 60 * 60 * 1000), // 24 hours
    lastRequestTime: 0,
    suspiciousScore: 0,
    blocked: false
  };

  // Check if user is blocked
  if (userLimit.blocked) {
    return { 
      allowed: false, 
      blocked: true, 
      reason: userLimit.blockReason || 'Account blocked for suspicious activity' 
    };
  }

  // Check minimum interval between requests (only for anonymous users)
  const isAnonymousUser = userId.startsWith('anon_') || userId.startsWith('fp_');
  if (isAnonymousUser && userLimit.lastRequestTime > 0 && 
      (now - userLimit.lastRequestTime) < SECURITY_LIMITS.MIN_REQUEST_INTERVAL) {
    userLimit.suspiciousScore += 2;
    return { 
      allowed: false, 
      reason: 'Requests too frequent' 
    };
  }

  // Reset counters if windows have expired
  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + SECURITY_LIMITS.RATE_LIMIT_WINDOW;
  }
  
  if (now > userLimit.hourlyResetTime) {
    userLimit.hourlyCount = 0;
    userLimit.hourlyResetTime = now + (60 * 60 * 1000);
  }
  
  if (now > userLimit.dailyResetTime) {
    userLimit.dailyCount = 0;
    userLimit.dailyResetTime = now + (24 * 60 * 60 * 1000);
    userLimit.suspiciousScore = Math.max(0, userLimit.suspiciousScore - 5); // Decay suspicious score daily
  }

  // Enhanced checks for anonymous users
  if (userId.startsWith('anon_') || userId.startsWith('fp_')) {
    // Check monthly limit for anonymous users
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const userMonthStart = new Date(userLimit.dailyResetTime - (24 * 60 * 60 * 1000));
    
    // If we're in a new month, reset the counter
    if (userMonthStart.getTime() !== thisMonthStart.getTime()) {
      userLimit.dailyCount = 0;
      userLimit.dailyResetTime = thisMonthStart.getTime() + (30 * 24 * 60 * 60 * 1000); // ~30 days
    }
    
    if (userLimit.dailyCount >= SECURITY_LIMITS.ANONYMOUS_MONTHLY_LIMIT) {
      return { 
        allowed: false, 
        resetTime: userLimit.dailyResetTime,
        reason: 'Monthly limit exceeded for anonymous users'
      };
    }
  }

  // Check regular rate limits
  if (userLimit.count >= maxRequests) {
    userLimit.suspiciousScore += 1;
    return { 
      allowed: false, 
      resetTime: userLimit.resetTime,
      remaining: 0,
      reason: 'Rate limit exceeded'
    };
  }

  // Check for suspicious behavior and auto-block
  if (userLimit.suspiciousScore >= SECURITY_LIMITS.SUSPICIOUS_REQUEST_THRESHOLD) {
    userLimit.blocked = true;
    userLimit.blockReason = 'Automated blocking due to suspicious activity';
    rateLimitStore.set(userId, userLimit);
    return { 
      allowed: false, 
      blocked: true, 
      reason: userLimit.blockReason 
    };
  }

  // Increment counts
  userLimit.count++;
  userLimit.hourlyCount++;
  userLimit.dailyCount++;
  userLimit.lastRequestTime = now;
  
  rateLimitStore.set(userId, userLimit);
  
  return { 
    allowed: true, 
    remaining: maxRequests - userLimit.count 
  };
}

// Comprehensive request validation
export function validateRequest(request: NextRequest): { 
  valid: boolean; 
  error?: string; 
  fingerprint?: string;
  shouldBlock?: boolean;
} {
  // Check request size first
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > SECURITY_LIMITS.MAX_REQUEST_SIZE) {
    return { valid: false, error: "Request too large" };
  }

  // Check for bot
  const botCheck = detectBot(request);
  if (botCheck.isBot) {
    return { 
      valid: false, 
      error: "Automated requests not allowed", 
      shouldBlock: true 
    };
  }

  // Check geographic restrictions
  const geoCheck = checkGeographicRestrictions(request);
  if (geoCheck.blocked) {
    return { 
      valid: false, 
      error: "Service not available in your region", 
      shouldBlock: true 
    };
  }

  // Generate fingerprint for enhanced tracking
  const fingerprint = generateFingerprint(request);

  return { valid: true, fingerprint };
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // Remove potentially dangerous characters and trim
  return input
    .trim()
    .replace(/[<>{}|\\^`\[\]"']/g, '') // Remove potentially dangerous chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s\-\.&,]/g, '') // Only allow word chars, spaces, hyphens, dots, ampersands, commas
    .substring(0, SECURITY_LIMITS.MAX_INPUT_LENGTH); // Enforce length limit
}

export function validateStringInput(input: unknown, fieldName: string, minLength = 2): { isValid: boolean; error?: string; sanitized?: string } {
  if (!input) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (typeof input !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string` };
  }

  if (input.length > SECURITY_LIMITS.MAX_INPUT_LENGTH) {
    return { isValid: false, error: `${fieldName} too long` };
  }

  const sanitized = sanitizeInput(input);
  
  if (sanitized.length < minLength) {
    return { isValid: false, error: `${fieldName} too short` };
  }

  // Basic pattern validation for names and organizations
  const validPattern = /^[a-zA-Z0-9\s\-'\.&,]+$/;
  if (!validPattern.test(sanitized)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }

  return { isValid: true, sanitized };
}

export function checkRequestSize(request: NextRequest): NextResponse | null {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > SECURITY_LIMITS.MAX_REQUEST_SIZE) {
    return NextResponse.json(
      { error: "Request too large" },
      { status: 413 }
    );
  }
  return null;
}

export function createRateLimitResponse(resetTime: number, remaining = 0, reason?: string): NextResponse {
  const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000);
  return NextResponse.json(
    { 
      error: reason || "Rate limit exceeded", 
      retryAfter: resetInSeconds 
    },
    { 
      status: 429,
      headers: {
        'Retry-After': resetInSeconds.toString(),
        'X-RateLimit-Limit': SECURITY_LIMITS.RATE_LIMIT_MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
      }
    }
  );
}

export function createSecureErrorResponse(error: unknown, defaultMessage = "Internal server error"): NextResponse {
  // Log the actual error for debugging (server-side only)
  console.error("API Error:", error);
  
  // Never expose internal error details to client
  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  );
}

export function validateUserId(userId: unknown): boolean {
  return typeof userId === 'string' && userId.length > 0 && userId.length < 255;
} 