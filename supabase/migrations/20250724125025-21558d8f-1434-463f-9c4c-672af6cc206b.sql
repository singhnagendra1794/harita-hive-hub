-- Comprehensive security fixes for remaining database functions

-- 1. Fix any remaining functions without proper search_path
-- Note: Most functions have been fixed in previous migrations, but let's ensure all are covered

-- 2. Add missing search_path to any plpgsql functions without SECURITY DEFINER and SET search_path
-- Let's check for commonly missed trigger functions

-- Fix update_updated_at_column trigger function if it exists without proper search_path
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

-- Fix any remaining notification functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
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

-- Fix any utility functions that might be missing search_path
CREATE OR REPLACE FUNCTION public.generate_unsubscribe_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$function$;

-- Add search_path to any email template functions
CREATE OR REPLACE FUNCTION public.get_email_template(template_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  template_data JSONB;
BEGIN
  SELECT to_jsonb(et.*) INTO template_data
  FROM email_templates et
  WHERE et.name = template_name AND et.is_active = true;
  
  RETURN COALESCE(template_data, '{}'::jsonb);
END;
$function$;

-- Enhanced input validation function with XSS protection
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_input(
  input_text TEXT,
  max_length INTEGER DEFAULT 1000,
  allow_html BOOLEAN DEFAULT false
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cleaned_text TEXT;
BEGIN
  -- Return empty string for null input
  IF input_text IS NULL THEN
    RETURN '';
  END IF;
  
  -- Limit length
  cleaned_text := LEFT(input_text, max_length);
  
  -- Remove dangerous content if HTML is not allowed
  IF NOT allow_html THEN
    -- Remove script tags and javascript
    cleaned_text := regexp_replace(cleaned_text, '<script[^>]*>.*?</script>', '', 'gi');
    cleaned_text := regexp_replace(cleaned_text, 'javascript:', '', 'gi');
    cleaned_text := regexp_replace(cleaned_text, 'on\w+\s*=', '', 'gi');
    -- Remove potential XSS vectors
    cleaned_text := regexp_replace(cleaned_text, '<[^>]*>', '', 'g');
  END IF;
  
  RETURN trim(cleaned_text);
END;
$function$;

-- Rate limiting function with improved security
CREATE OR REPLACE FUNCTION public.check_rate_limit_secure(
  identifier TEXT,
  action_type TEXT,
  max_attempts INTEGER DEFAULT 10,
  window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  attempt_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM security_events
  WHERE event_type = 'rate_limit_check'
    AND details->>'identifier' = identifier
    AND details->>'action' = action_type
    AND created_at > window_start;
  
  -- Log this check
  INSERT INTO security_events (event_type, user_id, details)
  VALUES (
    'rate_limit_check',
    auth.uid(),
    jsonb_build_object(
      'identifier', identifier,
      'action', action_type,
      'current_count', attempt_count,
      'max_attempts', max_attempts,
      'window_minutes', window_minutes
    )
  );
  
  RETURN attempt_count < max_attempts;
END;
$function$;

-- Secure audit logging function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  event_type TEXT,
  table_name TEXT,
  record_id UUID,
  old_values JSONB DEFAULT NULL,
  new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO security_events (event_type, user_id, details)
  VALUES (
    event_type,
    auth.uid(),
    jsonb_build_object(
      'table_name', table_name,
      'record_id', record_id,
      'old_values', old_values,
      'new_values', new_values,
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  );
END;
$function$;