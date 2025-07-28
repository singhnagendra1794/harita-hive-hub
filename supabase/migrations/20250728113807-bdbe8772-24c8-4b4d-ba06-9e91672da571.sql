-- Fix subscription for kamakshiiit@gmail.com
UPDATE public.user_subscriptions 
SET subscription_tier = 'pro', 
    updated_at = now()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'kamakshiiit@gmail.com'
);