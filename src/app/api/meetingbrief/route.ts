/* ------------------------------------------------------------------
 *  API route:  POST /api/meetingbrief
 *  Body JSON:  { "name": "<person>", "organization": "<company>" }
 * -----------------------------------------------------------------*/

import { NextRequest, NextResponse } from "next/server";
import { buildMeetingBriefGemini } from "@/lib/MeetingBriefGeminiPipeline";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { Pool } from "pg";
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

// Plan limits mapping
const PLAN_LIMITS = {
  free: 5,
  starter: 50,
  growth: 150,
  scale: 500,
} as const;

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
      let planName: keyof typeof PLAN_LIMITS;
      let monthlyLimit: number;
      let subscriptionPeriodStart: Date | null = null;
      let subscriptionPeriodEnd: Date | null = null;
      let userCreatedAt: Date | null = null;

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

        // Check subscription plan
        planName = "free";
        monthlyLimit = PLAN_LIMITS.free;

        try {
          const subscriptionResult = await client.query(
            `SELECT plan, status, "periodStart", "periodEnd" 
             FROM subscription 
             WHERE "referenceId" = $1 
             ORDER BY "createdAt" DESC
             LIMIT 1`,
            [userId]
          );

          // Also get user's registration date
          const userResult = await client.query(
            `SELECT "createdAt" FROM "user" WHERE id = $1`,
            [userId]
          );

          if (userResult.rows.length > 0) {
            userCreatedAt = new Date(userResult.rows[0].createdAt);
          }

          if (subscriptionResult.rows.length > 0) {
            const subscription = subscriptionResult.rows[0];
            const plan = subscription.plan || "free";
            if (plan in PLAN_LIMITS) {
              planName = plan as keyof typeof PLAN_LIMITS;
              monthlyLimit = PLAN_LIMITS[planName];
              subscriptionPeriodStart = subscription.periodStart ? new Date(subscription.periodStart) : null;
              subscriptionPeriodEnd = subscription.periodEnd ? new Date(subscription.periodEnd) : null;
            }
          }
        } catch (error) {
          console.error("Subscription query error:", error);
        }
      } else {
        // Anonymous user - use enhanced fingerprinting and stricter limits
        const fingerprint = requestValidation.fingerprint || generateFingerprint(request);
        userId = fingerprint;
        planName = "free";
        monthlyLimit = 2; // Only 2 briefs per month for anonymous users
        
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

      // Get current usage
      const usageResult = await client.query(
        `SELECT current_month_count, current_month_start
         FROM user_brief_counts 
         WHERE user_id = $1`,
        [userId]
      );

      let currentMonthCount = 0;
      let currentPeriodStart: Date;
      
      if (usageResult.rows.length > 0) {
        const usage = usageResult.rows[0];
        const currentMonthStart = new Date(usage.current_month_start);
        const now = new Date();
        
        // Use subscription billing period if available, otherwise use registration-based period
        if (subscriptionPeriodStart && subscriptionPeriodEnd) {
          // For subscription users, determine the current billing period
          // If we're within the current subscription period, use that
          if (now >= subscriptionPeriodStart && now <= subscriptionPeriodEnd) {
            currentPeriodStart = subscriptionPeriodStart;
          } else {
            // Calculate the current billing period based on subscription cycle
            const subscriptionDurationMs = subscriptionPeriodEnd.getTime() - subscriptionPeriodStart.getTime();
            const timeSinceOriginalStart = now.getTime() - subscriptionPeriodStart.getTime();
            const periodsSinceStart = Math.floor(timeSinceOriginalStart / subscriptionDurationMs);
            currentPeriodStart = new Date(subscriptionPeriodStart.getTime() + (periodsSinceStart * subscriptionDurationMs));
          }
        } else if (userCreatedAt) {
          // For free users: use registration date to determine monthly reset
          const registrationDay = userCreatedAt.getDate();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();
          
          // Calculate the reset day for this month
          const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
          const resetDay = Math.min(registrationDay, daysInCurrentMonth);
          
          // Determine current period start
          const thisMonthReset = new Date(currentYear, currentMonth, resetDay);
          
          if (now >= thisMonthReset) {
            // We're past this month's reset date
            currentPeriodStart = thisMonthReset;
          } else {
            // We're before this month's reset date, so current period started last month
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const daysInLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate();
            const lastMonthResetDay = Math.min(registrationDay, daysInLastMonth);
            currentPeriodStart = new Date(lastMonthYear, lastMonth, lastMonthResetDay);
          }
        } else {
          // Free users and anonymous: use calendar month
          currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        if (currentMonthStart.getTime() === currentPeriodStart.getTime()) {
          currentMonthCount = usage.current_month_count;
        }
      } else {
        const now = new Date();
        // Calculate current period start for new users
        if (subscriptionPeriodStart && subscriptionPeriodEnd) {
          if (now >= subscriptionPeriodStart && now <= subscriptionPeriodEnd) {
            currentPeriodStart = subscriptionPeriodStart;
          } else {
            const subscriptionDurationMs = subscriptionPeriodEnd.getTime() - subscriptionPeriodStart.getTime();
            const timeSinceOriginalStart = now.getTime() - subscriptionPeriodStart.getTime();
            const periodsSinceStart = Math.floor(timeSinceOriginalStart / subscriptionDurationMs);
            currentPeriodStart = new Date(subscriptionPeriodStart.getTime() + (periodsSinceStart * subscriptionDurationMs));
          }
        } else if (userCreatedAt) {
          // For free users: use registration date to determine monthly reset
          const registrationDay = userCreatedAt.getDate();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();
          
          // Calculate the reset day for this month
          const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
          const resetDay = Math.min(registrationDay, daysInCurrentMonth);
          
          // Determine current period start
          const thisMonthReset = new Date(currentYear, currentMonth, resetDay);
          
          if (now >= thisMonthReset) {
            // We're past this month's reset date
            currentPeriodStart = thisMonthReset;
          } else {
            // We're before this month's reset date, so current period started last month
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const daysInLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate();
            const lastMonthResetDay = Math.min(registrationDay, daysInLastMonth);
            currentPeriodStart = new Date(lastMonthYear, lastMonth, lastMonthResetDay);
          }
        } else {
          currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        }
      }

      // Check if user has exceeded their limit
      if (currentMonthCount >= monthlyLimit) {
        const errorMessage = session?.user?.id 
          ? "Monthly brief limit exceeded. Please upgrade your plan."
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
      await client.query(
        `INSERT INTO user_briefs (user_id, name, organization, brief_content)
         VALUES ($1, $2, $3, $4)`,
        [userId, sanitizedName, sanitizedOrganization, normalizedBrief]
      );

      // Update usage count using the calculated current period start
      await client.query(
        `INSERT INTO user_brief_counts (user_id, current_month_count, current_month_start)
         VALUES ($1, 1, $2)
         ON CONFLICT (user_id)
         DO UPDATE SET 
           current_month_count = CASE 
             WHEN user_brief_counts.current_month_start = $2 THEN user_brief_counts.current_month_count + 1
             ELSE 1
           END,
           current_month_start = $2`,
        [userId, currentPeriodStart]
      );

      // Log successful request for monitoring
      console.log("Brief generated:", {
        userId: userId.startsWith('fp_') ? 'anonymous' : userId,
        remainingBriefs: monthlyLimit - currentMonthCount - 1,
        isAnonymous: !session?.user?.id
      });

      return NextResponse.json({ 
        brief: normalizedBrief,
        remainingBriefs: monthlyLimit - currentMonthCount - 1,
        isAnonymous: !session?.user?.id
      });

    } finally {
      client.release();
    }
  } catch (error: unknown) {
    return createSecureErrorResponse(error);
  }
}