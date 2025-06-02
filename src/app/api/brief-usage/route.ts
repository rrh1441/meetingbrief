import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { Pool } from "pg";
import { 
  createSecureErrorResponse,
  validateUserId
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

export async function GET() {
  try {
    const headersList = await headers();
    
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate user ID
    if (!validateUserId(session.user.id)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      // Get user's subscription info directly from database
      let planName: keyof typeof PLAN_LIMITS = "free";
      let monthlyLimit: number = PLAN_LIMITS.free;
      let subscriptionPeriodStart: Date | null = null;
      let subscriptionPeriodEnd: Date | null = null;
      let userCreatedAt: Date | null = null;

      try {
        const subscriptionResult = await client.query(
          `SELECT plan, status, "periodStart", "periodEnd" 
           FROM subscription 
           WHERE "referenceId" = $1 
           ORDER BY "createdAt" DESC
           LIMIT 1`,
          [session.user.id]
        );

        // Also get user's registration date
        const userResult = await client.query(
          `SELECT "createdAt" FROM "user" WHERE id = $1`,
          [session.user.id]
        );

        if (userResult.rows.length > 0) {
          userCreatedAt = new Date(userResult.rows[0].createdAt);
        }

        console.log(`[DEBUG] User ID: ${session.user.id}`);
        console.log(`[DEBUG] User created at: ${userCreatedAt?.toISOString()}`);
        console.log(`[DEBUG] Subscription query result:`, subscriptionResult.rows);

        if (subscriptionResult.rows.length > 0) {
          const subscription = subscriptionResult.rows[0];
          const plan = subscription.plan || "free";
          console.log(`[DEBUG] Found subscription plan: ${plan}`);
          if (plan in PLAN_LIMITS) {
            planName = plan as keyof typeof PLAN_LIMITS;
            monthlyLimit = PLAN_LIMITS[planName];
            subscriptionPeriodStart = subscription.periodStart ? new Date(subscription.periodStart) : null;
            subscriptionPeriodEnd = subscription.periodEnd ? new Date(subscription.periodEnd) : null;
            console.log(`[DEBUG] Set monthly limit to: ${monthlyLimit} for plan: ${planName}`);
            console.log(`[DEBUG] Subscription period: ${subscriptionPeriodStart?.toISOString()} to ${subscriptionPeriodEnd?.toISOString()}`);
          }
        } else {
          console.log(`[DEBUG] No subscription found for user ${session.user.id}`);
        }
      } catch (error) {
        console.error("Subscription query error:", error);
        // Continue with free plan defaults for security
      }

      // Get current usage by counting briefs in the current period
      let currentMonthCount = 0;
      
      // Calculate current period start
      let currentPeriodStart: Date;
      const now = new Date();
      
      // Use subscription billing period if available, otherwise use registration-based period
      if (subscriptionPeriodStart && subscriptionPeriodEnd) {
        // For subscription users, determine the current billing period
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
        // Fallback to calendar month for users without registration date
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      console.log(`[DEBUG] Current period start: ${currentPeriodStart.toISOString()}`);
      
      // Count briefs created since the current period start
      const briefCountResult = await client.query(
        `SELECT COUNT(*) as count
         FROM user_briefs 
         WHERE user_id = $1 
         AND created_at >= $2`,
        [session.user.id, currentPeriodStart]
      );
      
      currentMonthCount = parseInt(briefCountResult.rows[0]?.count || '0');
      console.log(`[DEBUG] Calculated current month count: ${currentMonthCount}`);

      return NextResponse.json({
        currentMonthCount,
        monthlyLimit,
        planName,
      });

    } finally {
      client.release();
    }
  } catch (error) {
    return createSecureErrorResponse(error, "Failed to fetch usage data");
  }
} 