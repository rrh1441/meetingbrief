import { NextRequest, NextResponse } from "next/server";

// Security constants
export const SECURITY_LIMITS = {
  MAX_INPUT_LENGTH: 100,
  MAX_REQUEST_SIZE: 1024, // 1KB
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 20, // per minute per user
  MAX_QUERY_RESULTS: 100, // Maximum database query results
} as const;

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitResult {
  allowed: boolean;
  resetTime?: number;
  remaining?: number;
}

export function checkRateLimit(userId: string, maxRequests: number = SECURITY_LIMITS.RATE_LIMIT_MAX_REQUESTS): RateLimitResult {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit window
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + SECURITY_LIMITS.RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (userLimit.count >= maxRequests) {
    return { 
      allowed: false, 
      resetTime: userLimit.resetTime,
      remaining: 0
    };
  }

  // Increment count
  userLimit.count++;
  rateLimitStore.set(userId, userLimit);
  return { 
    allowed: true, 
    remaining: maxRequests - userLimit.count 
  };
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

export function createRateLimitResponse(resetTime: number, remaining = 0): NextResponse {
  const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Rate limit exceeded", retryAfter: resetInSeconds },
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