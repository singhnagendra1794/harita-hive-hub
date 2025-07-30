-- Add professional access and course enrollment for Vivekmalik0357@gmail.com

-- First, get the user ID for the email
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = 'Vivekmalik0357@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    -- Update or insert user subscription to professional
    INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, started_at, updated_at)
    VALUES (target_user_id, 'pro', 'active', now(), now())
    ON CONFLICT (user_id) 
    DO UPDATE SET
      subscription_tier = 'pro',
      status = 'active',
      started_at = COALESCE(user_subscriptions.started_at, now()),
      updated_at = now();
    
    -- Update profile plan and course enrollment
    INSERT INTO public.profiles (id, email, plan, enrolled_courses_count, enrolled_courses, updated_at)
    VALUES (
      target_user_id, 
      'Vivekmalik0357@gmail.com', 
      'professional', 
      1, 
      ARRAY['Geospatial Technology Unlocked'], 
      now()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
      plan = 'professional',
      enrolled_courses_count = CASE 
        WHEN 'Geospatial Technology Unlocked' = ANY(profiles.enrolled_courses) THEN profiles.enrolled_courses_count
        ELSE profiles.enrolled_courses_count + 1
      END,
      enrolled_courses = CASE 
        WHEN 'Geospatial Technology Unlocked' = ANY(profiles.enrolled_courses) THEN profiles.enrolled_courses
        ELSE array_append(profiles.enrolled_courses, 'Geospatial Technology Unlocked')
      END,
      updated_at = now();
      
    -- Add course enrollment record if it doesn't exist
    INSERT INTO public.course_enrollments (user_id, course_title, enrollment_date, course_type)
    VALUES (target_user_id, 'Geospatial Technology Unlocked', now(), 'professional')
    ON CONFLICT (user_id, course_title) DO NOTHING;
    
    RAISE NOTICE 'Successfully updated professional access for Vivekmalik0357@gmail.com';
  ELSE
    RAISE NOTICE 'User Vivekmalik0357@gmail.com not found in auth.users';
  END IF;
END $$;