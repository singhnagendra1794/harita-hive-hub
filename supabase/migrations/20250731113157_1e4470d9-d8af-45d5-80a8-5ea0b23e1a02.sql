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

-- Create course_enrollments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid NOT NULL,
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  last_accessed timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS on course_enrollments
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_enrollments
CREATE POLICY "Users can view their own enrollments" 
ON public.course_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enrollments" 
ON public.course_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" 
ON public.course_enrollments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create courses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  difficulty text DEFAULT 'beginner',
  is_published boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for courses
CREATE POLICY "Anyone can view published courses" 
ON public.courses 
FOR SELECT 
USING (is_published = true);

-- Insert the Geospatial Technology Unlocked course if it doesn't exist
INSERT INTO public.courses (title, description, difficulty, is_published)
VALUES (
  'Geospatial Technology Unlocked',
  'Comprehensive course covering geospatial technology, QGIS, and GIS fundamentals',
  'beginner',
  true
)
ON CONFLICT (title) DO NOTHING;

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