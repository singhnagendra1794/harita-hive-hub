-- Fix the user subscription creation function to handle duplicates gracefully
CREATE OR REPLACE FUNCTION public.create_user_subscription(p_user_id uuid, p_tier text DEFAULT 'free'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, created_at, updated_at)
  VALUES (p_user_id, p_tier, 'active', now(), now())
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_tier = CASE 
      WHEN EXCLUDED.subscription_tier != 'free' THEN EXCLUDED.subscription_tier 
      ELSE user_subscriptions.subscription_tier 
    END,
    updated_at = now();
END;
$function$;