-- Create brief_feedback table
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

-- Create indexes for brief_feedback table
CREATE INDEX IF NOT EXISTS idx_brief_feedback_brief_id ON brief_feedback(brief_id);
CREATE INDEX IF NOT EXISTS idx_brief_feedback_user_id ON brief_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_brief_feedback_created_at ON brief_feedback(created_at);

-- Create unique constraint to prevent duplicate feedback per brief per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_brief_feedback_unique_user_brief 
ON brief_feedback(brief_id, user_id);