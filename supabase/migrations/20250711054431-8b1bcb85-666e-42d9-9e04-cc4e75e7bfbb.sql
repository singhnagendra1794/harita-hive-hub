-- Update user_has_premium_access function to only allow pro and enterprise tiers
CREATE OR REPLACE FUNCTION public.user_has_premium_access(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_tier TEXT;
  subscription_status TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT us.subscription_tier, us.status, us.expires_at
  INTO subscription_tier, subscription_status, expires_at
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id;
  
  -- If no subscription found, create a free one
  IF subscription_tier IS NULL THEN
    INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
    VALUES (p_user_id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN false;
  END IF;
  
  -- Check if user has active pro or enterprise subscription only
  IF subscription_tier IN ('pro', 'enterprise') 
     AND subscription_status = 'active' 
     AND (expires_at IS NULL OR expires_at > now()) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;