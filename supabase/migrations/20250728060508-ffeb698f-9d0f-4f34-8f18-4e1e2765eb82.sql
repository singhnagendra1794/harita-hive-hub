-- Final security migration: Replace hardcoded email checks with role-based access
-- Update RLS policies to use secure role functions

-- Update admin_uploads policy to use role-based check
DROP POLICY IF EXISTS "Admins can manage all uploads" ON public.admin_uploads;
CREATE POLICY "Admins can manage all uploads" 
ON public.admin_uploads 
FOR ALL 
USING (public.is_admin_secure() OR public.is_super_admin_secure());

-- Update class_recordings policy
DROP POLICY IF EXISTS "Admins can manage all recordings" ON public.class_recordings;
CREATE POLICY "Admins can manage all recordings" 
ON public.class_recordings 
FOR ALL 
USING (public.is_admin_secure() OR public.is_super_admin_secure());

-- Update community_posts super admin delete policy
DROP POLICY IF EXISTS "Super admin can delete posts" ON public.community_posts;
CREATE POLICY "Super admin can delete posts" 
ON public.community_posts 
FOR DELETE 
USING (public.is_super_admin_secure());

-- Enable leaked password protection in auth settings
-- Note: This setting needs to be enabled in Supabase dashboard under Auth > Password Protection

-- Update get_auth_users_data function to use secure check
CREATE OR REPLACE FUNCTION public.get_auth_users_data()
 RETURNS TABLE(id uuid, email text, last_sign_in_at timestamp with time zone, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    au.id,
    au.email,
    au.last_sign_in_at,
    au.created_at
  FROM auth.users au
  WHERE public.is_super_admin_secure();
$function$;

-- Create a more secure professional email check function
CREATE OR REPLACE FUNCTION public.is_professional_email(email_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  domain TEXT;
  professional_domains TEXT[] := ARRAY[
    'gov.in', 'nic.in', 'ac.in', 'edu.in', 'res.in', 'org.in',
    'govt.in', 'mil.in', 'co.in', 'net.in', 'firm.in',
    'edu', 'ac.uk', 'gov.uk', 'mil.gov', 'nasa.gov',
    'nist.gov', 'nsf.gov', 'nih.gov', 'noaa.gov'
  ];
BEGIN
  -- Extract domain from email
  domain := lower(split_part(email_input, '@', 2));
  
  -- Check if domain is in professional list or follows academic/government patterns
  IF domain = ANY(professional_domains) THEN
    RETURN true;
  END IF;
  
  -- Check for academic institutions (.edu, .ac.*)
  IF domain ~ '\.(edu|ac\.)'::text THEN
    RETURN true;
  END IF;
  
  -- Check for government domains (.gov, .mil)
  IF domain ~ '\.(gov|mil)$'::text THEN
    RETURN true;
  END IF;
  
  -- Check for research institutions
  IF domain ~ '\.(research|institute|university|college)$'::text THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- Create rate limiting function for enhanced security
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_max_requests integer DEFAULT 10, p_window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  request_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Count requests in the current window
  SELECT COUNT(*)
  INTO request_count
  FROM public.security_events
  WHERE event_type = p_action
    AND details->>'identifier' = p_identifier
    AND created_at > window_start;
  
  -- Log this request attempt
  INSERT INTO public.security_events (event_type, details)
  VALUES (p_action, jsonb_build_object(
    'identifier', p_identifier,
    'timestamp', now(),
    'count', request_count + 1
  ));
  
  -- Return true if within limits
  RETURN request_count < p_max_requests;
END;
$function$;