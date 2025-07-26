-- Update the user_has_premium_access function to handle the case more gracefully
CREATE OR REPLACE FUNCTION public.user_has_premium_access(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  subscription_tier TEXT;
  subscription_status TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
  user_email TEXT;
BEGIN
  -- Get user subscription details
  SELECT us.subscription_tier, us.status, us.expires_at
  INTO subscription_tier, subscription_status, expires_at
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id;
  
  -- If no subscription found, check if it's a professional email and create subscription
  IF subscription_tier IS NULL THEN
    -- Get user email to check if it's professional
    SELECT email INTO user_email FROM auth.users WHERE id = p_user_id;
    
    IF user_email IS NOT NULL AND public.is_professional_email(user_email) THEN
      -- Create professional subscription with conflict handling
      INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
      VALUES (p_user_id, 'pro', 'active')
      ON CONFLICT (user_id) DO UPDATE SET
        subscription_tier = CASE 
          WHEN EXCLUDED.subscription_tier != 'free' THEN EXCLUDED.subscription_tier
          ELSE user_subscriptions.subscription_tier
        END,
        status = 'active',
        updated_at = now();
      RETURN true;
    ELSE
      -- Create free subscription with conflict handling
      INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
      VALUES (p_user_id, 'free', 'active')
      ON CONFLICT (user_id) DO NOTHING;
      RETURN false;
    END IF;
  END IF;
  
  -- Check if user has active pro or enterprise subscription
  IF subscription_tier IN ('pro', 'enterprise') 
     AND subscription_status = 'active' 
     AND (expires_at IS NULL OR expires_at > now()) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;