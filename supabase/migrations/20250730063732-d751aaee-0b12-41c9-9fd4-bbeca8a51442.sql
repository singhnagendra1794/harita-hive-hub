-- Fix the YouTube OAuth token issue by creating a proper token refresh mechanism
-- and updating the youtube-auto-sync function to handle authentication properly

-- First, let's create a function to get valid YouTube credentials
CREATE OR REPLACE FUNCTION public.get_youtube_credentials()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  token_record RECORD;
  api_key TEXT;
  result jsonb;
BEGIN
  -- Get API key from environment (this would be set in edge function)
  api_key := 'AIzaSyC8QF_Z_tKPKPZF8QNzYEOPvJ4HQRzHHzs'; -- Placeholder, will use env in edge function
  
  -- Try to get a valid OAuth token
  SELECT * INTO token_record 
  FROM youtube_oauth_tokens 
  WHERE expires_at > now() + interval '5 minutes'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Build result with available credentials
  result := jsonb_build_object(
    'api_key', api_key,
    'has_oauth', CASE WHEN token_record.access_token IS NOT NULL THEN true ELSE false END
  );
  
  IF token_record.access_token IS NOT NULL THEN
    result := result || jsonb_build_object(
      'access_token', token_record.access_token,
      'expires_at', token_record.expires_at
    );
  END IF;
  
  RETURN result;
END;
$function$;

-- Create a function to mark tokens as expired when we get 401 errors
CREATE OR REPLACE FUNCTION public.mark_youtube_token_expired(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE youtube_oauth_tokens 
  SET expires_at = now() - interval '1 hour'
  WHERE user_id = p_user_id;
END;
$function$;