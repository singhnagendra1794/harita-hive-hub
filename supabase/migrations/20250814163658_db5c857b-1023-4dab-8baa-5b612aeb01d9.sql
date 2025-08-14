-- CRITICAL SECURITY FIX: Remove the dangerous "subscriptions_all_access" policy
-- This policy allows public access to all subscription data which is a major security vulnerability

DROP POLICY IF EXISTS "subscriptions_all_access" ON public.user_subscriptions;

-- Verify that proper security policies are in place
-- The existing policies should be sufficient:
-- 1. "Users can view their own subscription" - allows users to see only their data
-- 2. "Users can insert their own subscription" - allows users to create their subscription 
-- 3. "Admins can manage all subscriptions" - allows admins full access

-- Note: Security definer functions like get_user_subscription_safe, user_has_premium_access, 
-- and create_user_subscription will continue to work because they run with elevated privileges