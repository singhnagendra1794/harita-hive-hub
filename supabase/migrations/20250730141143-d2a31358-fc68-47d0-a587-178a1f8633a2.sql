-- Fix course enrollment for professional users
-- First, check if enrolled_courses column exists, if not add it
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS enrolled_courses TEXT[] DEFAULT '{}';

-- Ensure enrolled_courses_count column exists with proper default
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS enrolled_courses_count INTEGER DEFAULT 0;

-- Update all professional users who don't have the course enrolled
UPDATE public.profiles 
SET 
  enrolled_courses = CASE 
    WHEN 'Geospatial Technology Unlocked' = ANY(COALESCE(enrolled_courses, '{}')) THEN enrolled_courses
    ELSE array_append(COALESCE(enrolled_courses, '{}'), 'Geospatial Technology Unlocked')
  END,
  enrolled_courses_count = CASE 
    WHEN 'Geospatial Technology Unlocked' = ANY(COALESCE(enrolled_courses, '{}')) THEN enrolled_courses_count
    ELSE enrolled_courses_count + 1
  END,
  updated_at = now()
WHERE id IN (
  SELECT us.user_id 
  FROM user_subscriptions us 
  WHERE us.subscription_tier IN ('pro', 'professional', 'enterprise') 
  AND us.status = 'active'
)
AND ('Geospatial Technology Unlocked' != ANY(COALESCE(enrolled_courses, '{}')) OR enrolled_courses IS NULL);

-- Recreate the function to handle edge cases better
CREATE OR REPLACE FUNCTION public.update_user_enrolled_courses(p_user_id uuid, p_course_title text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET 
    enrolled_courses_count = CASE 
      WHEN p_course_title = ANY(COALESCE(enrolled_courses, '{}')) THEN enrolled_courses_count
      ELSE enrolled_courses_count + 1
    END,
    enrolled_courses = CASE 
      WHEN p_course_title = ANY(COALESCE(enrolled_courses, '{}')) THEN enrolled_courses
      ELSE array_append(COALESCE(enrolled_courses, '{}'), p_course_title)
    END,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the operation
  RAISE LOG 'Course enrollment updated for user % with course %', p_user_id, p_course_title;
END;
$function$;