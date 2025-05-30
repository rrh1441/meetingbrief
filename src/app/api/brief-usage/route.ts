import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Pool } from "pg";

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

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      // Get user's subscription info from Better Auth
      const subscription = await auth.api.getSubscription({
        headers: await headers(),
      });

      // Determine plan and limits
      let planName = "free";
      let monthlyLimit = PLAN_LIMITS.free;

      if (subscription?.data?.subscription) {
        planName = subscription.data.subscription.plan || "free";
        monthlyLimit = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
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
    console.error("Brief usage fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
} 