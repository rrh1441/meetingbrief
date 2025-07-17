-- Create the missing PostgreSQL functions for the credit system
-- Run this in Supabase SQL Editor immediately to fix the search functionality

-- Function to get current credit balance for a user
CREATE OR REPLACE FUNCTION get_user_credit_balance(target_user_id TEXT)
RETURNS TABLE(
  subscription_credits INTEGER,
  addon_credits INTEGER,
  total_credits INTEGER,
  period_start DATE,
  period_end DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ucb.subscription_credits, 0) as subscription_credits,
    COALESCE(ucb.addon_credits, 0) as addon_credits,
    COALESCE(ucb.subscription_credits, 0) + COALESCE(ucb.addon_credits, 0) as total_credits,
    ucb.subscription_period_start as period_start,
    ucb.subscription_period_end as period_end
  FROM user_credit_balances ucb
  WHERE ucb.user_id = target_user_id;
  
  -- If no record found, return zeros
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 0, 0, 0, NULL::DATE, NULL::DATE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to use credits (deducts from subscription first, then addon)
CREATE OR REPLACE FUNCTION use_credit(target_user_id TEXT, brief_id INTEGER)
RETURNS TABLE(
  success BOOLEAN,
  subscription_used INTEGER,
  addon_used INTEGER,
  remaining_subscription INTEGER,
  remaining_addon INTEGER
) AS $$
DECLARE
  current_subscription INTEGER := 0;
  current_addon INTEGER := 0;
  sub_used INTEGER := 0;
  addon_used INTEGER := 0;
BEGIN
  -- Get current balances
  SELECT 
    COALESCE(subscription_credits, 0),
    COALESCE(addon_credits, 0)
  INTO current_subscription, current_addon
  FROM user_credit_balances
  WHERE user_id = target_user_id;
  
  -- If no record found, create one with 0 credits
  IF NOT FOUND THEN
    INSERT INTO user_credit_balances (user_id, subscription_credits, addon_credits, last_updated)
    VALUES (target_user_id, 0, 0, NOW());
    current_subscription := 0;
    current_addon := 0;
  END IF;
  
  -- Check if user has any credits
  IF current_subscription + current_addon < 1 THEN
    RETURN QUERY SELECT FALSE, 0, 0, current_subscription, current_addon;
    RETURN;
  END IF;
  
  -- Use subscription credits first
  IF current_subscription > 0 THEN
    sub_used := 1;
    current_subscription := current_subscription - 1;
  ELSE
    -- Use addon credits
    addon_used := 1;
    current_addon := current_addon - 1;
  END IF;
  
  -- Update balances
  UPDATE user_credit_balances 
  SET subscription_credits = current_subscription,
      addon_credits = current_addon,
      last_updated = NOW()
  WHERE user_id = target_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id, transaction_type, credit_type, amount, balance_after, brief_id
  ) VALUES (
    target_user_id, 
    'usage', 
    CASE WHEN sub_used > 0 THEN 'subscription' ELSE 'addon' END,
    -1,
    current_subscription + current_addon,
    brief_id
  );
  
  RETURN QUERY SELECT TRUE, sub_used, addon_used, current_subscription, current_addon;
END;
$$ LANGUAGE plpgsql;

-- Function to grant subscription credits (resets monthly)
CREATE OR REPLACE FUNCTION grant_subscription_credits(
  target_user_id TEXT, 
  credit_amount INTEGER,
  period_start DATE,
  period_end DATE,
  plan_name TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update or insert credit balance
  INSERT INTO user_credit_balances (
    user_id, subscription_credits, subscription_period_start, subscription_period_end, last_updated
  ) VALUES (
    target_user_id, credit_amount, period_start, period_end, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_credits = EXCLUDED.subscription_credits,
    subscription_period_start = EXCLUDED.subscription_period_start,
    subscription_period_end = EXCLUDED.subscription_period_end,
    last_updated = EXCLUDED.last_updated;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id, transaction_type, credit_type, amount, balance_after, 
    period_start, period_end, metadata
  ) VALUES (
    target_user_id, 'subscription_grant', 'subscription', credit_amount,
    credit_amount + COALESCE((SELECT addon_credits FROM user_credit_balances WHERE user_id = target_user_id), 0),
    period_start, period_end, jsonb_build_object('plan', plan_name)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to add addon credits
CREATE OR REPLACE FUNCTION add_addon_credits(
  target_user_id TEXT,
  credit_amount INTEGER,
  stripe_session_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_addon INTEGER := 0;
BEGIN
  -- Get current addon credits
  SELECT COALESCE(addon_credits, 0) INTO current_addon
  FROM user_credit_balances
  WHERE user_id = target_user_id;
  
  -- Add to addon credits
  INSERT INTO user_credit_balances (user_id, addon_credits, last_updated)
  VALUES (target_user_id, current_addon + credit_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    addon_credits = user_credit_balances.addon_credits + credit_amount,
    last_updated = EXCLUDED.last_updated;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id, transaction_type, credit_type, amount, balance_after, stripe_session_id
  ) VALUES (
    target_user_id, 'addon_purchase', 'addon', credit_amount,
    (SELECT subscription_credits + addon_credits FROM user_credit_balances WHERE user_id = target_user_id),
    stripe_session_id
  );
END;
$$ LANGUAGE plpgsql;

-- Test the functions
SELECT 'Functions created successfully!' as status;