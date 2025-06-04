const { Pool } = require('pg');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    console.log('Running feedback table migration...');

    // Create feedback table
    await client.query(`
      CREATE TABLE IF NOT EXISTS brief_feedback (
        id SERIAL PRIMARY KEY,
        brief_id INTEGER NOT NULL REFERENCES user_briefs(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        thumbs_up BOOLEAN NOT NULL,
        false_positives_found BOOLEAN,
        false_positives_explanation TEXT,
        missing_info_found BOOLEAN,
        missing_info_explanation TEXT,
        other_feedback TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_brief_feedback_brief_id ON brief_feedback(brief_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_brief_feedback_user_id ON brief_feedback(user_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_brief_feedback_created_at ON brief_feedback(created_at);
    `);

    console.log('Feedback table migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration(); 