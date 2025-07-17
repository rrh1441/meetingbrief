/* ------------------------------------------------------------------
 *  API route:  POST /api/meetingbrief
 *  Body JSON:  { "name": "<person>", "organization": "<company>" }
 * -----------------------------------------------------------------*/

import { NextRequest, NextResponse } from "next/server";
import { buildMeetingBriefGemini } from "@/lib/MeetingBriefGeminiPipeline";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { Pool } from "pg";
import { CreditSystem } from "@/lib/credit-system";
import { 
  checkRateLimit, 
  validateStringInput, 
  createRateLimitResponse,
  createSecureErrorResponse,
  validateUserId,
  validateRequest,
  detectHoneypot,
  generateFingerprint
} from "@/lib/api-security";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/*──────────────────────────  superscript helper  */

function normalizeCitations(
  brief: string,
  citations: { marker: string; url: string }[]
): string {
  if (!Array.isArray(citations) || citations.length === 0) return brief;
  if (typeof brief !== "string") return brief;

  const sup: Record<string, string> = {};
  citations.forEach((c, i) => {
    const n = (i + 1).toString();
    sup[n] =
      `<sup><a class="text-blue-600 underline hover:no-underline" href="${c.url}" target="_blank" rel="noopener noreferrer">${n}</a></sup>`;
  });

  brief = brief.replace(
    /(\[\s*\^|\^)\s*([\d\s,]+)(?=\]|\s|,|$)/g,
    (_m: string, _pre: string, nums: string) => {
      const unique = Array.from(
        new Set(
          nums
            .split(/[\s,]+/)
            .filter((num: string) => num && sup[num])
        )
      );
      return unique.map((num: string) => sup[num]).join("");
    }
  );

  return brief
    .replace(/[\[\]\^,]/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/*──────────────────────────  main handler  */

export async function POST(request: NextRequest) {
  try {
    // Enhanced request validation with anti-abuse checks
    const requestValidation = validateRequest(request);
    if (!requestValidation.valid) {
      // Log potential abuse attempt
      console.warn("Blocked request:", {
        reason: requestValidation.error,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        shouldBlock: requestValidation.shouldBlock
      });
      
      return NextResponse.json(
        { error: requestValidation.error },
        { status: requestValidation.shouldBlock ? 403 : 400 }
      );
    }

    // Check authentication - allow anonymous users for limited briefs
    const headersList = await headers();
    
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: headersList,
    });

    // Parse and validate request body first
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // Check for honeypot fields (bot trap)
    if (detectHoneypot(body)) {
      console.warn("Honeypot triggered:", {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent')
      });
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Validate and sanitize inputs
    const nameValidation = validateStringInput(body.name, "Name");
    if (!nameValidation.isValid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    const orgValidation = validateStringInput(body.organization, "Organization");
    if (!orgValidation.isValid) {
      return NextResponse.json(
        { error: orgValidation.error },
        { status: 400 }
      );
    }

    const sanitizedName = nameValidation.sanitized!;
    const sanitizedOrganization = orgValidation.sanitized!;

    const client = await pool.connect();
    
    try {
      let userId: string;

      if (session?.user?.id) {
        // Authenticated user - check their plan
        userId = session.user.id;
        
        // Validate user ID
        if (!validateUserId(userId)) {
          return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        // Rate limiting for authenticated users
        const rateLimitCheck = checkRateLimit(userId, 5);
        if (!rateLimitCheck.allowed) {
          return createRateLimitResponse(
            rateLimitCheck.resetTime!, 
            rateLimitCheck.remaining, 
            rateLimitCheck.reason
          );
        }

        // Authenticated user - subscription info handled by credit system
      } else {
        // Anonymous user - use enhanced fingerprinting and stricter limits
        const fingerprint = requestValidation.fingerprint || generateFingerprint(request);
        userId = fingerprint;
        
        // Create anonymous user record if it doesn't exist
        try {
          await client.query(
            `INSERT INTO "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
             VALUES ($1, 'Anonymous', $2, false, null, NOW(), NOW())
             ON CONFLICT (id) DO NOTHING`,
            [userId, `anonymous+${userId}@meetingbrief.app`]
          );
        } catch (error) {
          console.error("Error creating anonymous user:", error);
        }
        
        // Enhanced rate limiting for anonymous users
        const rateLimitCheck = checkRateLimit(userId, 2);
        if (!rateLimitCheck.allowed) {
          if (rateLimitCheck.blocked) {
            console.warn("Blocked user attempted request:", {
              fingerprint: userId,
              reason: rateLimitCheck.reason,
              ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
            });
            return NextResponse.json(
              { error: "Access temporarily restricted. Please try again later." },
              { status: 403 }
            );
          }
          
          return createRateLimitResponse(
            rateLimitCheck.resetTime!, 
            rateLimitCheck.remaining, 
            rateLimitCheck.reason
          );
        }
      }

      // Check if user can generate using new credit system
      const canGenerate = await CreditSystem.canUserGenerate(userId);
      if (!canGenerate) {
        const errorMessage = session?.user?.id 
          ? "No credits remaining. Please purchase more credits or wait for your monthly reset."
          : "You've used your 2 free briefs this month. Please sign in for more or wait until next month.";
        return NextResponse.json(
          { error: errorMessage },
          { status: 429 }
        );
      }

      // Generate the brief with sanitized inputs
      const result = await buildMeetingBriefGemini(sanitizedName, sanitizedOrganization);
      const normalizedBrief = normalizeCitations(result.brief, result.citations);

      // Save to database with sanitized inputs
      const insertResult = await client.query(
        `INSERT INTO user_briefs (user_id, name, organization, brief_content)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, sanitizedName, sanitizedOrganization, normalizedBrief]
      );

      const briefId = insertResult.rows[0].id;

      // Deduct credit with new system
      const creditUsage = await CreditSystem.deductCredit(userId, briefId);
      if (!creditUsage.success) {
        throw new Error('Failed to deduct credit');
      }

      // Log successful request for monitoring
      console.log("Brief generated:", {
        userId: userId.startsWith('fp_') ? 'anonymous' : userId,
        subscriptionUsed: creditUsage.subscriptionUsed,
        addonUsed: creditUsage.addonUsed,
        remainingSubscription: creditUsage.remainingSubscription,
        remainingAddon: creditUsage.remainingAddon,
        isAnonymous: !session?.user?.id
      });

      return NextResponse.json({ 
        brief: normalizedBrief,
        briefId,
        subscriptionCredits: creditUsage.remainingSubscription,
        addonCredits: creditUsage.remainingAddon,
        totalCredits: creditUsage.remainingSubscription + creditUsage.remainingAddon,
        creditUsed: {
          subscription: creditUsage.subscriptionUsed,
          addon: creditUsage.addonUsed
        },
        // Legacy format for compatibility
        remainingBriefs: creditUsage.remainingSubscription + creditUsage.remainingAddon,
        isAnonymous: !session?.user?.id
      });

    } finally {
      client.release();
    }
  } catch (error: unknown) {
    return createSecureErrorResponse(error);
  }
}