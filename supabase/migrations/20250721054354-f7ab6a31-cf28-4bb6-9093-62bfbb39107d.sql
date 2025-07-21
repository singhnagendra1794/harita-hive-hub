-- Add enrolled courses tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS enrolled_courses_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enrolled_courses TEXT[] DEFAULT '{}';

-- Create index for better performance on enrolled courses queries
CREATE INDEX IF NOT EXISTS idx_profiles_enrolled_courses ON public.profiles USING GIN(enrolled_courses);

-- Create function to update enrolled courses
CREATE OR REPLACE FUNCTION public.update_user_enrolled_courses(
  p_user_id UUID,
  p_course_title TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;