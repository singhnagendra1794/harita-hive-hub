-- Fix critical search path vulnerabilities in database functions
-- This prevents potential SQL injection attacks through search path manipulation

-- Fix search paths for all functions that don't already have them set correctly
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  code TEXT;
BEGIN
  code := UPPER(SUBSTRING(user_id::TEXT FROM 1 FOR 8));
  RETURN code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_enrolled_courses(p_user_id uuid, p_course_title text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET 
    enrolled_courses_count = enrolled_courses_count + 1,
    enrolled_courses = CASE 
      WHEN p_course_title = ANY(enrolled_courses) THEN enrolled_courses
      ELSE array_append(enrolled_courses, p_course_title)
    END,
    updated_at = now()
  WHERE id = p_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_stream_status(p_session_id uuid, p_status text, p_viewer_count integer DEFAULT NULL::integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.stream_sessions 
  SET 
    status = p_status,
    viewer_count = COALESCE(p_viewer_count, viewer_count),
    updated_at = now(),
    ended_at = CASE WHEN p_status = 'ended' THEN now() ELSE ended_at END
  WHERE id = p_session_id;
  
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_project_activity(p_project_id uuid, p_user_id uuid, p_activity_type text, p_description text, p_activity_data jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO project_activities (project_id, user_id, activity_type, description, activity_data)
  VALUES (p_project_id, p_user_id, p_activity_type, p_description, p_activity_data);
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_user_activity(p_user_id uuid, p_activity_type text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  points INTEGER;
BEGIN
  -- Define points for each activity type
  points := CASE p_activity_type
    WHEN 'tool_upload' THEN 10
    WHEN 'code_share' THEN 5
    WHEN 'note_share' THEN 7
    WHEN 'challenge_join' THEN 8
    WHEN 'post_create' THEN 3
    WHEN 'comment_create' THEN 2
    WHEN 'like_give' THEN 1
    WHEN 'course_complete' THEN 15
    ELSE 0
  END;
  
  -- Insert the activity
  INSERT INTO public.user_activities (user_id, activity_type, points_earned, metadata)
  VALUES (p_user_id, p_activity_type, points, p_metadata);
END;
$function$;

CREATE OR REPLACE FUNCTION public.debug_storage_path(file_path text, user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN jsonb_build_object(
    'file_path', file_path,
    'user_id', user_id,
    'user_id_text', user_id::text,
    'foldername_array', storage.foldername(file_path),
    'first_folder', (storage.foldername(file_path))[1],
    'path_matches', (user_id::text = (storage.foldername(file_path))[1])
  );
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.is_valid_email_domain(email_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow all major international domains
  RETURN email_input ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    AND email_input !~* '@(tempmail|guerrillamail|10minutemail|throwaway)';
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_password(password_input text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB := '{"valid": true, "errors": []}'::jsonb;
  errors TEXT[] := '{}';
BEGIN
  -- Check minimum length (increased from 8 to 12)
  IF LENGTH(password_input) < 12 THEN
    errors := array_append(errors, 'Password must be at least 12 characters long');
  END IF;
  
  -- Check for at least one uppercase letter
  IF password_input !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for at least one lowercase letter
  IF password_input !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for at least one number
  IF password_input !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for at least one special character
  IF password_input !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  -- Check for common patterns
  IF password_input ~* '(password|123456|qwerty|admin|letmein)' THEN
    errors := array_append(errors, 'Password contains common vulnerable patterns');
  END IF;
  
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object(
      'valid', false,
      'errors', to_jsonb(errors)
    );
  END IF;
  
  RETURN result;
END;
$function$;

-- Create secure role-based access functions to replace hardcoded email checks
CREATE OR REPLACE FUNCTION public.is_super_admin_secure()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_secure()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
$function$;

-- Update existing super admin function to use role-based check
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.is_super_admin_secure();
$function$;

-- Enhanced security event logging with better validation
CREATE OR REPLACE FUNCTION public.log_security_event_secure(p_event_type text, p_details jsonb DEFAULT '{}'::jsonb, p_user_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate event type
  IF p_event_type NOT IN ('login_attempt', 'failed_login', 'admin_action', 'permission_denied', 'rate_limit_exceeded', 'suspicious_activity') THEN
    RAISE EXCEPTION 'Invalid security event type';
  END IF;
  
  -- Sanitize details to prevent information leakage
  INSERT INTO public.security_events (event_type, user_id, details)
  VALUES (
    p_event_type, 
    COALESCE(p_user_id, auth.uid()), 
    jsonb_strip_nulls(p_details)
  );
END;
$function$;

-- Function to validate and sanitize input with enhanced security
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_input(input_text text, max_length integer DEFAULT 1000, allow_html boolean DEFAULT false)
 RETURNS text
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
    -- Remove other potentially dangerous tags
    cleaned_text := regexp_replace(cleaned_text, '<(iframe|object|embed|link|meta)[^>]*>', '', 'gi');
  END IF;
  
  -- Basic XSS protection
  cleaned_text := replace(cleaned_text, '<script', '&lt;script');
  cleaned_text := replace(cleaned_text, '</script>', '&lt;/script&gt;');
  
  RETURN cleaned_text;
END;
$function$;