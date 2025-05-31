import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

    const client = await pool.connect();
    
    try {
      // Check all subscription records for this user
      const subscriptionResult = await client.query(
        `SELECT * FROM subscription WHERE user_id = $1 ORDER BY "createdAt" DESC`,
        [session.user.id]
      );

      // Also check if there are any subscriptions with different user ID format
      const subscriptionResult2 = await client.query(
        `SELECT * FROM subscription WHERE "user_id" = $1 ORDER BY "createdAt" DESC`,
        [session.user.id]
      );

      // Check user table to see user details
      const userResult = await client.query(
        `SELECT id, email, name FROM "user" WHERE id = $1`,
        [session.user.id]
      );

      // Check all subscriptions in the table (to see the schema)
      const allSubscriptionsResult = await client.query(
        `SELECT user_id, plan, status, "stripeSubscriptionId" FROM subscription LIMIT 10`
      );

      return NextResponse.json({
        userId: session.user.id,
        userRecord: userResult.rows[0],
        subscriptionsWithUserId: subscriptionResult.rows,
        subscriptionsWithUserIdSnake: subscriptionResult2.rows,
        allSubscriptionsSample: allSubscriptionsResult.rows,
        columnNames: subscriptionResult.fields?.map(f => f.name) || []
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Debug subscription error:", error);
    return NextResponse.json({ 
      error: "Debug failed", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
} 