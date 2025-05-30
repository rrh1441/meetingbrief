-- User brief generation tracking
CREATE TABLE IF NOT EXISTS user_briefs (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  brief_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_briefs_user_id ON user_briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_briefs_created_at ON user_briefs(created_at);

-- User brief count tracking (separate table for performance)
CREATE TABLE IF NOT EXISTS user_brief_counts (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  current_month_count INTEGER NOT NULL DEFAULT 0,
  current_month_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  total_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update brief counts
CREATE OR REPLACE FUNCTION update_brief_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if we need to reset monthly count (new month)
  INSERT INTO user_brief_counts (user_id, current_month_count, current_month_start, total_count)
  VALUES (NEW.user_id, 1, date_trunc('month', CURRENT_DATE)::date, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    current_month_count = CASE 
      WHEN user_brief_counts.current_month_start < date_trunc('month', CURRENT_DATE)::date
      THEN 1  -- Reset for new month
      ELSE user_brief_counts.current_month_count + 1
    END,
    current_month_start = date_trunc('month', CURRENT_DATE)::date,
    total_count = user_brief_counts.total_count + 1,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update counts when brief is created
CREATE OR REPLACE TRIGGER trigger_update_brief_counts
  AFTER INSERT ON user_briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_brief_counts(); 