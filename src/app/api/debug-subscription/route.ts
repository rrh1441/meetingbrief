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
      // First, let's see what columns actually exist in the subscription table
      const schemaResult = await client.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'subscription' 
         ORDER BY ordinal_position`
      );

      // Get all subscriptions to see the actual data structure
      const allSubscriptionsResult = await client.query(
        `SELECT * FROM subscription LIMIT 5`
      );

      // Check user table to see user details
      const userResult = await client.query(
        `SELECT id, email, name FROM "user" WHERE id = $1`,
        [session.user.id]
      );

      return NextResponse.json({
        userId: session.user.id,
        userRecord: userResult.rows[0],
        subscriptionTableColumns: schemaResult.rows.map(r => r.column_name),
        allSubscriptionsSample: allSubscriptionsResult.rows,
        message: "Check the subscriptionTableColumns to see what column to use for user ID"
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