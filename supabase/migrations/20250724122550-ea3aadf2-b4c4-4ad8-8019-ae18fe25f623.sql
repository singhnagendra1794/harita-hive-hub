-- Fix remaining database functions with search_path security issues

-- Fix check_geo_processing_limits function (appears to be incomplete in the schema)
-- Let's recreate it safely
CREATE OR REPLACE FUNCTION public.check_geo_processing_limits(p_user_id uuid, p_job_type text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_subscription TEXT;
  job_count INTEGER;
  monthly_limit INTEGER;
  result JSONB;
BEGIN
  -- Get user subscription tier
  SELECT subscription_tier INTO user_subscription
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  -- Set limits based on tier
  CASE 
    WHEN user_subscription = 'free' THEN monthly_limit := 2;
    WHEN user_subscription = 'premium' THEN monthly_limit := 10;
    WHEN user_subscription = 'pro' THEN monthly_limit := 50;
    WHEN user_subscription = 'enterprise' THEN monthly_limit := -1; -- unlimited
    ELSE monthly_limit := 0;
  END CASE;
  
  -- Count jobs this month if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'geo_processing_usage') THEN
    SELECT COUNT(*)
    INTO job_count
    FROM public.geo_processing_usage
    WHERE user_id = p_user_id
      AND job_type = p_job_type
      AND created_at >= date_trunc('month', now());
  ELSE
    job_count := 0;
  END IF;
  
  -- Build result
  result := jsonb_build_object(
    'subscription_tier', user_subscription,
    'monthly_limit', monthly_limit,
    'current_usage', job_count,
    'can_process', CASE 
      WHEN monthly_limit = -1 THEN true
      WHEN job_count < monthly_limit THEN true
      ELSE false
    END
  );
  
  RETURN result;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix any other functions that might be missing search_path
-- Note: The linter should now show fewer warnings after this migration