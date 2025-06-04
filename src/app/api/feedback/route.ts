import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { Pool } from "pg";
import { 
  createSecureErrorResponse,
  validateUserId,
  validateStringInput,
  checkRateLimit,
  createRateLimitResponse
} from "@/lib/api-security";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
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

    // Rate limiting - 10 feedback submissions per user (using default window)
    const rateLimitCheck = checkRateLimit(session.user.id, 10);
    if (!rateLimitCheck.allowed) {
      return createRateLimitResponse(
        rateLimitCheck.resetTime!, 
        rateLimitCheck.remaining, 
        "Too many feedback submissions"
      );
    }

    const body = await request.json();
    const {
      briefId,
      thumbsUp,
      falsePositivesFound,
      falsePositivesExplanation,
      missingInfoFound,
      missingInfoExplanation,
      otherFeedback
    } = body;

    // Validate required fields
    if (typeof briefId !== 'number' || typeof thumbsUp !== 'boolean') {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    // Validate optional string inputs
    const validatedFalsePositivesExplanation = falsePositivesExplanation 
      ? validateStringInput(falsePositivesExplanation, 1000) 
      : null;
    const validatedMissingInfoExplanation = missingInfoExplanation 
      ? validateStringInput(missingInfoExplanation, 1000) 
      : null;
    const validatedOtherFeedback = otherFeedback 
      ? validateStringInput(otherFeedback, 1000) 
      : null;

    const client = await pool.connect();
    
    try {
      // Verify the brief belongs to the user
      const briefResult = await client.query(
        `SELECT id FROM user_briefs WHERE id = $1 AND user_id = $2`,
        [briefId, session.user.id]
      );

      if (briefResult.rows.length === 0) {
        return NextResponse.json({ error: "Brief not found" }, { status: 404 });
      }

      // Check if feedback already exists for this brief
      const existingFeedback = await client.query(
        `SELECT id FROM brief_feedback WHERE brief_id = $1 AND user_id = $2`,
        [briefId, session.user.id]
      );

      if (existingFeedback.rows.length > 0) {
        return NextResponse.json({ error: "Feedback already submitted for this brief" }, { status: 400 });
      }

      // Insert feedback
      await client.query(
        `INSERT INTO brief_feedback (
          brief_id, user_id, thumbs_up, 
          false_positives_found, false_positives_explanation,
          missing_info_found, missing_info_explanation,
          other_feedback
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          briefId,
          session.user.id,
          thumbsUp,
          falsePositivesFound,
          validatedFalsePositivesExplanation,
          missingInfoFound,
          validatedMissingInfoExplanation,
          validatedOtherFeedback
        ]
      );

      return NextResponse.json({ success: true });

    } finally {
      client.release();
    }
  } catch (error) {
    return createSecureErrorResponse(error, "Failed to submit feedback");
  }
} 