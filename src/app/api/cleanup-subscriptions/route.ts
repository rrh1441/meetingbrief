import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Manual cleanup endpoint for incomplete subscriptions
export async function POST() {
  try {
    const client = await pool.connect();
    
    try {
      // Clean up incomplete subscriptions older than 24 hours
      const result = await client.query(`
        DELETE FROM subscription 
        WHERE status = 'incomplete' 
          AND "createdAt" < NOW() - INTERVAL '24 hours'
      `);
      
      // Clean up duplicate incomplete subscriptions
      const duplicateResult = await client.query(`
        DELETE FROM subscription s1
        WHERE status = 'incomplete'
          AND EXISTS (
            SELECT 1 FROM subscription s2 
            WHERE s2."referenceId" = s1."referenceId"
              AND s2.status = 'incomplete'
              AND s2."createdAt" > s1."createdAt"
          )
      `);
      
      console.log(`Cleaned up ${result.rowCount} old incomplete subscriptions`);
      console.log(`Cleaned up ${duplicateResult.rowCount} duplicate incomplete subscriptions`);
      
      return NextResponse.json({
        success: true,
        oldIncompleteRemoved: result.rowCount,
        duplicatesRemoved: duplicateResult.rowCount
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}

// Also allow GET for easier testing
export async function GET() {
  return POST();
}