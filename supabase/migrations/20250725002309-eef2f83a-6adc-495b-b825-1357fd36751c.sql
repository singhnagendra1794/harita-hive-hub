-- CRITICAL SECURITY FIX: Update functions without proper search_path configuration
-- This addresses the security warnings from the linter

-- 1. Fix log_security_event_secure function
CREATE OR REPLACE FUNCTION public.log_security_event_secure(p_event_type text, p_details jsonb DEFAULT '{}'::jsonb, p_user_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.security_events (event_type, user_id, details)
  VALUES (p_event_type, COALESCE(p_user_id, auth.uid()), p_details);
END;
$function$;

-- 2. Fix get_user_roles_bypass_rls function
CREATE OR REPLACE FUNCTION public.get_user_roles_bypass_rls(p_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, role app_role, granted_at timestamp with time zone, granted_by uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT ur.id, ur.user_id, ur.role, ur.granted_at, ur.granted_by
  FROM user_roles ur
  WHERE ur.user_id = p_user_id;
$function$;

-- 3. Fix is_super_admin function 
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  );
$function$;

-- 4. Fix is_professional_email function
CREATE OR REPLACE FUNCTION public.is_professional_email(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  pro_emails TEXT[] := ARRAY[
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'nareshkumar.tamada@gmail.com', 'geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'anshumanavasthi1411@gmail.com',
    'sruthythulasi2017@gmail.com', 'nagendrasingh1794@gmail.com', 'maneetsethi954@gmail.com',
    'tharun.ravichandran@gmail.com', 'nikhilbt650@gmail.com', 'vanditaujwal8@gmail.com',
    'dhiman.kashyap24@gmail.com', 'ankushrathod96@gmail.com', 'singhnagendrageotech@gmail.com'
  ];
BEGIN
  RETURN LOWER(email_to_check) = ANY(pro_emails);
END;
$function$;

-- 5. Strengthen super admin role assignment security
CREATE OR REPLACE FUNCTION public.ensure_super_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_email TEXT;
BEGIN
  -- Get current user's email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Only allow super admin assignment for authorized domains
  IF user_email IS NULL OR NOT (user_email ~ '@haritahive\.com$' OR user_email = 'contact@haritahive.com') THEN
    RAISE EXCEPTION 'Unauthorized: Super admin role can only be assigned to authorized domain emails.';
  END IF;
  
  -- Check if user already has super admin role
  IF NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only existing super admins can perform this action.';
  END IF;
END;
$function$;

-- 6. Create enhanced security event logging for admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action_secure(
  p_target_user_id uuid, 
  p_action text, 
  p_old_value jsonb DEFAULT NULL::jsonb, 
  p_new_value jsonb DEFAULT NULL::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Verify admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can perform this action.';
  END IF;
  
  -- Log the action
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    target_user_id,
    action,
    old_value,
    new_value
  ) VALUES (
    auth.uid(),
    p_target_user_id,
    p_action,
    p_old_value,
    p_new_value
  );
  
  -- Also log as security event
  PERFORM public.log_security_event_secure(
    'admin_action',
    jsonb_build_object(
      'action', p_action,
      'target_user_id', p_target_user_id,
      'admin_user_id', auth.uid(),
      'timestamp', now()
    )
  );
END;
$function$;

-- 7. Create security events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only super admins can view security events
CREATE POLICY "Super admins can view security events" ON public.security_events
  FOR SELECT USING (public.is_super_admin());

-- 8. Add rate limiting for critical functions
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(p_action text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  recent_actions INTEGER;
BEGIN
  -- Count recent admin actions (last 5 minutes)
  SELECT COUNT(*) INTO recent_actions
  FROM public.admin_audit_log
  WHERE admin_user_id = auth.uid()
    AND action = p_action
    AND created_at > (now() - interval '5 minutes');
    
  -- Allow max 10 admin actions per 5 minutes
  RETURN recent_actions < 10;
END;
$function$;