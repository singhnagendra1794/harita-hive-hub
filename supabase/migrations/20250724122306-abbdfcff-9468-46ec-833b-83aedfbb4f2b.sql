-- Fix database function search_path security issues
-- Add SECURITY DEFINER and SET search_path to all public functions

-- Fix generate_referral_code function
DROP FUNCTION IF EXISTS public.generate_referral_code(uuid);
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

-- Fix is_professional_email function  
DROP FUNCTION IF EXISTS public.is_professional_email(text);
CREATE OR REPLACE FUNCTION public.is_professional_email(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
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

-- Fix get_regional_price function
DROP FUNCTION IF EXISTS public.get_regional_price(numeric, text);
CREATE OR REPLACE FUNCTION public.get_regional_price(p_base_price_usd numeric, p_country_code text DEFAULT 'US'::text)
RETURNS TABLE(local_price numeric, currency_code text, tax_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(p_base_price_usd * rp.exchange_rate, 2) as local_price,
    rp.currency_code,
    rp.tax_rate
  FROM regional_pricing rp
  WHERE rp.country_code = p_country_code
    AND rp.is_active = true
  LIMIT 1;
END;
$function$;

-- Create security events logging table for proper security monitoring
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events" ON public.security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create secure logging function
CREATE OR REPLACE FUNCTION public.log_security_event_secure(
  p_event_type text,
  p_details jsonb DEFAULT '{}',
  p_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.security_events (event_type, user_id, details)
  VALUES (p_event_type, COALESCE(p_user_id, auth.uid()), p_details);
END;
$function$;