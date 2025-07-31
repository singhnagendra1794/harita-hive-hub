-- Grant professional access and course enrollment for vivekmalik0357@gmail.com (case insensitive)

-- Get the user ID for the email (case insensitive)
DO $$
DECLARE
  target_user_id UUID;
  course_id UUID := 'e7d5f6a1-2b3c-4d5e-6f7a-8b9c0d1e2f3a'; -- Geospatial Technology Unlocked course ID
BEGIN
  -- Find user by email (case insensitive)
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE LOWER(email) = LOWER('vivekmalik0357@gmail.com');
  
  IF target_user_id IS NOT NULL THEN
    -- Update or insert professional subscription
    INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, started_at, updated_at)
    VALUES (target_user_id, 'pro', 'active', now(), now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      subscription_tier = 'pro',
      status = 'active',
      updated_at = now();
    
    -- Grant professional role
    INSERT INTO public.user_roles (user_id, role, granted_at, granted_by)
    VALUES (target_user_id, 'beta_tester', now(), get_super_admin_user_id())
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Enroll in Geospatial Technology Unlocked course
    INSERT INTO public.course_enrollments (user_id, course_id, enrolled_at, progress_percentage)
    VALUES (target_user_id, course_id, now(), 0)
    ON CONFLICT (user_id, course_id) DO NOTHING;
    
    -- Update profile enrolled courses count
    UPDATE public.profiles 
    SET enrolled_courses_count = 1, updated_at = now()
    WHERE id = target_user_id;
    
    RAISE NOTICE 'Successfully granted professional access and course enrollment to user %', target_user_id;
  ELSE
    RAISE NOTICE 'User with email vivekmalik0357@gmail.com not found';
  END IF;
END $$;