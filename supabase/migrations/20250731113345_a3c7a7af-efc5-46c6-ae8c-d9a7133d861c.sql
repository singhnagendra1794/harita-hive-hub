-- Create function to handle course enrollment for premium users
CREATE OR REPLACE FUNCTION public.update_user_enrolled_courses(p_user_id uuid, p_course_title text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  course_record RECORD;
BEGIN
  -- Get the course by title
  SELECT id, title INTO course_record
  FROM courses 
  WHERE title = p_course_title 
  AND is_published = true
  LIMIT 1;
  
  -- If course found, enroll the user
  IF course_record.id IS NOT NULL THEN
    -- Insert enrollment record (avoid duplicates)
    INSERT INTO course_enrollments (user_id, course_id, enrolled_at, progress_percentage, completed)
    VALUES (p_user_id, course_record.id, now(), 0, false)
    ON CONFLICT (user_id, course_id) DO NOTHING;
    
    -- Update user's enrolled courses count in profiles
    UPDATE profiles 
    SET enrolled_courses_count = (
      SELECT COUNT(DISTINCT course_id) 
      FROM course_enrollments 
      WHERE user_id = p_user_id
    ),
    updated_at = now()
    WHERE id = p_user_id;
    
    -- Log the enrollment
    INSERT INTO user_activities (user_id, activity_type, points_earned, metadata)
    VALUES (
      p_user_id, 
      'course_enroll', 
      5,
      jsonb_build_object(
        'course_id', course_record.id,
        'course_title', course_record.title,
        'enrollment_type', 'premium_auto'
      )
    );
  END IF;
END;
$function$;

-- Add enrolled_courses_count to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'enrolled_courses_count'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN enrolled_courses_count integer DEFAULT 0;
  END IF;
END $$;

-- Update existing users' enrolled courses count
UPDATE public.profiles 
SET enrolled_courses_count = (
  SELECT COUNT(DISTINCT course_id) 
  FROM course_enrollments 
  WHERE user_id = profiles.id
)
WHERE enrolled_courses_count IS NULL OR enrolled_courses_count = 0;