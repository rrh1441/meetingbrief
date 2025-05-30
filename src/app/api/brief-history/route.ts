import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
      const result = await client.query(
        `SELECT id, name, organization, brief_content, created_at
         FROM user_briefs 
         WHERE user_id = $1 
         ORDER BY created_at DESC
         LIMIT 50`,
        [session.user.id]
      );

      return NextResponse.json({
        briefs: result.rows,
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Brief history fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch brief history" },
      { status: 500 }
    );
  }
}