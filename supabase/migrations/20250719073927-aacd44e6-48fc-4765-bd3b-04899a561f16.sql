-- Update the user_has_premium_access function to handle professional emails correctly
CREATE OR REPLACE FUNCTION public.user_has_premium_access(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
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
      -- Create professional subscription
      INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
      VALUES (p_user_id, 'pro', 'active')
      ON CONFLICT (user_id) DO UPDATE SET
        subscription_tier = 'pro',
        status = 'active',
        updated_at = now();
      RETURN true;
    ELSE
      -- Create free subscription
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
$$;

-- Create a safe function to get user stats without accessing auth.users directly
CREATE OR REPLACE FUNCTION public.get_user_stats_safe(p_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  subscription_tier text,
  course_count integer,
  projects_completed integer,
  community_posts integer,
  spatial_analyses integer,
  plan text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Ensure user has a subscription
  IF NOT EXISTS (SELECT 1 FROM user_subscriptions WHERE user_subscriptions.user_id = p_user_id) THEN
    -- Check if professional email and create appropriate subscription
    PERFORM public.user_has_premium_access(p_user_id);
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    COALESCE(us.subscription_tier, 'free') as subscription_tier,
    COALESCE(p.course_count, 0) as course_count,
    COALESCE(p.projects_completed, 0) as projects_completed,
    COALESCE(p.community_posts, 0) as community_posts,
    0 as spatial_analyses, -- Add this field if needed in profiles table
    COALESCE(p.plan, 'free') as plan
  FROM public.profiles p
  LEFT JOIN public.user_subscriptions us ON p.id = us.user_id
  WHERE p.id = p_user_id;
END;
$$;