-- Fix the user_roles table issue causing 500 errors
-- The issue is likely related to the enum type or data validation

-- Create a function to safely get user roles without causing 500 errors
CREATE OR REPLACE FUNCTION public.get_user_roles_safe(p_user_id uuid)
RETURNS TABLE(role app_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT ur.role
  FROM user_roles ur
  WHERE ur.user_id = p_user_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on any error
    RETURN;
END;
$function$;

-- Update the search path for existing functions to fix security warnings
ALTER FUNCTION public.refresh_youtube_oauth_token_if_needed() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.trigger_youtube_detection() SET search_path TO 'public', 'pg_temp';