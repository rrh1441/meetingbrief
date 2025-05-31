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

    // Note: Removed rate limiting for usage endpoint since it's just reading user's own data

    const client = await pool.connect();
    
    try {
      // Get user's subscription info directly from database
      let planName: keyof typeof PLAN_LIMITS = "free";
      let monthlyLimit: number = PLAN_LIMITS.free;

      try {
        const subscriptionResult = await client.query(
          `SELECT plan, status, "periodStart", "periodEnd" 
           FROM subscription 
           WHERE referenceId = $1 
           ORDER BY "createdAt" DESC
           LIMIT 1`,
          [session.user.id]
        );

        console.log(`[DEBUG] User ID: ${session.user.id}`);
        console.log(`[DEBUG] Subscription query result:`, subscriptionResult.rows);

        if (subscriptionResult.rows.length > 0) {
          const subscription = subscriptionResult.rows[0];
          const plan = subscription.plan || "free";
          console.log(`[DEBUG] Found subscription plan: ${plan}`);
          if (plan in PLAN_LIMITS) {
            planName = plan as keyof typeof PLAN_LIMITS;
            monthlyLimit = PLAN_LIMITS[planName];
            console.log(`[DEBUG] Set monthly limit to: ${monthlyLimit}`);
          }
        } else {
          console.log(`[DEBUG] No subscription found for user ${session.user.id}`);
        }
      } catch (error) {
        console.error("Subscription query error:", error);
        // Continue with free plan defaults for security
      }

      // Get current usage from database
      const usageResult = await client.query(
        `SELECT 
           current_month_count,
           current_month_start,
           total_count
         FROM user_brief_counts 
         WHERE user_id = $1`,
        [session.user.id]
      );

      let currentMonthCount = 0;
      
      if (usageResult.rows.length > 0) {
        const usage = usageResult.rows[0];
        const currentMonthStart = new Date(usage.current_month_start);
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // If the stored month is the current month, use the count
        if (currentMonthStart.getTime() === thisMonthStart.getTime()) {
          currentMonthCount = usage.current_month_count;
        }
        // Otherwise the count resets to 0 (handled by trigger on next insert)
      }

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