import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { Pool } from "pg";
import { 
  createSecureErrorResponse,
  validateUserId,
  SECURITY_LIMITS
} from "@/lib/api-security";

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

    // Validate user ID
    if (!validateUserId(session.user.id)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Note: Removed rate limiting for history endpoint since it's just reading user's own data

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT id, name, organization, brief_content, created_at
         FROM user_briefs 
         WHERE user_id = $1 
         ORDER BY created_at DESC
         LIMIT $2`,
        [session.user.id, SECURITY_LIMITS.MAX_QUERY_RESULTS]
      );

      // Sanitize the output data (basic HTML stripping for extra safety)
      const sanitizedBriefs = result.rows.map(brief => ({
        ...brief,
        // Basic sanitization - remove any script tags that might have somehow gotten in
        brief_content: brief.brief_content?.replace(/<script[^>]*>.*?<\/script>/gi, ''),
      }));

      return NextResponse.json({
        briefs: sanitizedBriefs,
      });

    } finally {
      client.release();
    }
  } catch (error) {
    return createSecureErrorResponse(error, "Failed to fetch brief history");
  }
}