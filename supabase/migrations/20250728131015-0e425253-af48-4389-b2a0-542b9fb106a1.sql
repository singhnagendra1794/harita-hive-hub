-- Fix Professional Plan auto-enrollment for Geospatial Technology Unlocked course
-- Create function to auto-enroll professional users
CREATE OR REPLACE FUNCTION public.auto_enroll_professional_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-enroll all current Professional Plan users in Geospatial Technology Unlocked
  INSERT INTO public.class_enrollments (user_id, class_id, class_title, class_date, instructor)
  SELECT 
    us.user_id,
    'geospatial_technology_unlocked' as class_id,
    'Geospatial Technology Unlocked' as class_title,
    CURRENT_DATE as class_date,
    'GEOVA AI' as instructor
  FROM public.user_subscriptions us
  WHERE us.subscription_tier IN ('pro', 'enterprise') 
    AND us.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM public.class_enrollments ce 
      WHERE ce.user_id = us.user_id 
      AND ce.class_id = 'geospatial_technology_unlocked'
    );
END;
$function$;

-- Run the function to enroll existing users
SELECT public.auto_enroll_professional_users();

-- Create trigger function for new professional subscriptions
CREATE OR REPLACE FUNCTION public.handle_professional_enrollment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-enroll when user gets professional subscription
  IF NEW.subscription_tier IN ('pro', 'enterprise') AND NEW.status = 'active' THEN
    INSERT INTO public.class_enrollments (user_id, class_id, class_title, class_date, instructor)
    VALUES (
      NEW.user_id,
      'geospatial_technology_unlocked',
      'Geospatial Technology Unlocked',
      CURRENT_DATE,
      'GEOVA AI'
    )
    ON CONFLICT (user_id, class_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for new professional subscriptions
DROP TRIGGER IF EXISTS auto_enroll_professional_trigger ON public.user_subscriptions;
CREATE TRIGGER auto_enroll_professional_trigger
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_professional_enrollment();

-- Update live_classes table for better YouTube integration
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS youtube_stream_key TEXT,
ADD COLUMN IF NOT EXISTS youtube_broadcast_id TEXT,
ADD COLUMN IF NOT EXISTS youtube_stream_id TEXT,
ADD COLUMN IF NOT EXISTS auto_start_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP WITH TIME ZONE;

-- Create function to get live class enrollment count
CREATE OR REPLACE FUNCTION public.get_user_enrollment_count(p_user_id uuid)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  enrollment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO enrollment_count
  FROM public.class_enrollments
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(enrollment_count, 0);
END;
$function$;

-- Create function to check if user has access to live classes
CREATE OR REPLACE FUNCTION public.user_has_live_class_access(p_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  has_subscription BOOLEAN;
  is_enrolled BOOLEAN;
BEGIN
  -- Check if user has professional subscription
  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    WHERE us.user_id = p_user_id 
    AND us.subscription_tier IN ('pro', 'enterprise') 
    AND us.status = 'active'
  ) INTO has_subscription;
  
  -- Check if user is enrolled in geospatial course
  SELECT EXISTS (
    SELECT 1 FROM public.class_enrollments ce
    WHERE ce.user_id = p_user_id 
    AND ce.class_id = 'geospatial_technology_unlocked'
  ) INTO is_enrolled;
  
  RETURN has_subscription OR is_enrolled;
END;
$function$;