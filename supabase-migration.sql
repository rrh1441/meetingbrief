-- Run this in Supabase SQL Editor to implement the new credit system
-- This handles subscription credits (reset monthly) + addon credits (roll over)

-- Step 0: Clean up incomplete subscriptions before migration
DELETE FROM subscription 
WHERE status = 'incomplete' 
  AND "createdAt" < NOW() - INTERVAL '24 hours';

-- Clean up duplicate incomplete subscriptions (keep only the most recent)
DELETE FROM subscription s1
WHERE status = 'incomplete'
  AND EXISTS (
    SELECT 1 FROM subscription s2 
    WHERE s2."referenceId" = s1."referenceId"
      AND s2.status = 'incomplete'
      AND s2."createdAt" > s1."createdAt"
  );

-- Create unique index to prevent multiple active subscriptions per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_active_user 
ON subscription ("referenceId") 
WHERE status = 'active';

-- Step 1: Create the new tables
CREATE TABLE IF NOT EXISTS credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription_grant', 'addon_purchase', 'usage', 'refund')),
  credit_type TEXT NOT NULL CHECK (credit_type IN ('subscription', 'addon')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  period_start DATE,
  period_end DATE,
  stripe_session_id TEXT,
  brief_id INTEGER REFERENCES user_briefs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS user_credit_balances (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  subscription_credits INTEGER NOT NULL DEFAULT 0,
  subscription_period_start DATE,
  subscription_period_end DATE,
  addon_credits INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);

-- Step 3: Migrate existing users to new credit system
INSERT INTO user_credit_balances (user_id, subscription_credits, addon_credits, subscription_period_start, subscription_period_end)
SELECT 
  u.id,
  CASE 
    WHEN s.plan = 'starter' THEN 50
    WHEN s.plan = 'scale' THEN 50  -- Migrate scale users to starter equivalent
    ELSE 5
  END as subscription_credits,
  0 as addon_credits,
  s."periodStart"::DATE as subscription_period_start,
  s."periodEnd"::DATE as subscription_period_end
FROM "user" u
LEFT JOIN (
  SELECT DISTINCT ON ("referenceId") 
    "referenceId", plan, "periodStart", "periodEnd"
  FROM subscription 
  ORDER BY "referenceId", "createdAt" DESC
) s ON s."referenceId" = u.id
WHERE u.email NOT LIKE 'anonymous+%'
ON CONFLICT (user_id) DO UPDATE SET
  subscription_credits = EXCLUDED.subscription_credits,
  subscription_period_start = EXCLUDED.subscription_period_start,
  subscription_period_end = EXCLUDED.subscription_period_end;

-- Step 4: Adjust for current usage (subtract what they've already used this month)
UPDATE user_credit_balances ucb
SET subscription_credits = GREATEST(0, ucb.subscription_credits - COALESCE(ubc.current_month_count, 0))
FROM user_brief_counts ubc
WHERE ubc.user_id = ucb.user_id
  AND ubc.current_month_count > 0;

-- Step 5: Create record of initial credit grants
INSERT INTO credit_transactions (user_id, transaction_type, credit_type, amount, balance_after, period_start, period_end, metadata)
SELECT 
  ucb.user_id,
  'subscription_grant',
  'subscription',
  CASE 
    WHEN s.plan = 'starter' THEN 50
    WHEN s.plan = 'scale' THEN 50  -- Migrate scale users to starter equivalent
    ELSE 5
  END as original_amount,
  ucb.subscription_credits + ucb.addon_credits as balance_after,
  ucb.subscription_period_start,
  ucb.subscription_period_end,
  jsonb_build_object('plan', COALESCE(s.plan, 'free'), 'migration', true)
FROM user_credit_balances ucb
LEFT JOIN (
  SELECT DISTINCT ON ("referenceId") 
    "referenceId", plan
  FROM subscription 
  ORDER BY "referenceId", "createdAt" DESC
) s ON s."referenceId" = ucb.user_id;

-- Step 6: Verify the migration
SELECT 
  'Migration Results' as summary,
  COUNT(*) as total_users,
  SUM(subscription_credits) as total_sub_credits,
  SUM(addon_credits) as total_addon_credits,
  SUM(subscription_credits + addon_credits) as total_credits
FROM user_credit_balances;

-- Step 7: Show current balances by plan
SELECT 
  COALESCE(s.plan, 'free') as plan,
  COUNT(*) as users,
  AVG(ucb.subscription_credits) as avg_sub_credits,
  AVG(ucb.addon_credits) as avg_addon_credits,
  AVG(ucb.subscription_credits + ucb.addon_credits) as avg_total_credits
FROM user_credit_balances ucb
LEFT JOIN (
  SELECT DISTINCT ON ("referenceId") 
    "referenceId", plan
  FROM subscription 
  ORDER BY "referenceId", "createdAt" DESC
) s ON s."referenceId" = ucb.user_id
JOIN "user" u ON u.id = ucb.user_id
WHERE u.email NOT LIKE 'anonymous+%'
GROUP BY s.plan
ORDER BY plan;