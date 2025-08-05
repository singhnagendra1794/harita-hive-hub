-- Add the email to professional list and assign professional subscription
-- First, update or insert user subscription for this email when they exist
DO $$
DECLARE
    target_user_id UUID;
    course_record RECORD;
BEGIN
    -- Find the user ID for this email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'nabiyevsaleh889@gmail.com';
    
    -- If user exists, assign professional access
    IF target_user_id IS NOT NULL THEN
        -- Create or update professional subscription
        INSERT INTO public.user_subscriptions (
            user_id, 
            subscription_tier, 
            status, 
            started_at,
            created_at, 
            updated_at
        ) VALUES (
            target_user_id,
            'pro',
            'active',
            now(),
            now(),
            now()
        ) ON CONFLICT (user_id) 
        DO UPDATE SET
            subscription_tier = 'pro',
            status = 'active',
            updated_at = now();
            
        -- Update the enrolled courses count in profiles
        UPDATE public.profiles 
        SET enrolled_courses_count = 1,
            plan = 'professional',
            updated_at = now()
        WHERE id = target_user_id;
        
        -- Find a geospatial technology course to enroll them in
        SELECT id, title INTO course_record
        FROM certification_courses 
        WHERE LOWER(title) LIKE '%geospatial%' OR LOWER(title) LIKE '%technology%'
        ORDER BY created_at DESC
        LIMIT 1;
        
        RAISE NOTICE 'Successfully assigned professional access to user. Course found: %', COALESCE(course_record.title, 'No matching course found');
    ELSE
        RAISE NOTICE 'User with email nabiyevsaleh889@gmail.com not found. They need to sign up first.';
    END IF;
END $$;