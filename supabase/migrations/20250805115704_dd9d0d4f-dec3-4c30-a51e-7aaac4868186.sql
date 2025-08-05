-- Assign professional access to the specified email
-- First, we need to find or create the user, then assign professional subscription
-- This will be handled by the bulk_assign_professional_access function

-- Call the existing RPC function to assign professional access to this email
SELECT bulk_assign_professional_access(ARRAY['nabiyevsaleh889@gmail.com']) as result;

-- Update enrolled courses count and create enrollment record
-- First, let's see if there's a user with this email and update their stats
DO $$
DECLARE
    target_user_id UUID;
    course_record RECORD;
BEGIN
    -- Find the user ID for this email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'nabiyevsaleh889@gmail.com';
    
    IF target_user_id IS NOT NULL THEN
        -- Update the enrolled courses count in profiles
        UPDATE public.profiles 
        SET enrolled_courses_count = 1,
            updated_at = now()
        WHERE id = target_user_id;
        
        -- Find a geospatial technology course to enroll them in
        SELECT id, title INTO course_record
        FROM certification_courses 
        WHERE LOWER(title) LIKE '%geospatial%' OR LOWER(title) LIKE '%technology%'
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF course_record.id IS NOT NULL THEN
            -- Create an enrollment record (if table exists)
            INSERT INTO enrollments (
                user_id,
                course_id,
                course_title,
                status,
                enrolled_at
            ) VALUES (
                target_user_id,
                course_record.id,
                course_record.title,
                'enrolled',
                now()
            ) ON CONFLICT DO NOTHING;
        END IF;
        
        RAISE NOTICE 'Successfully assigned professional access and enrolled user in course: %', COALESCE(course_record.title, 'No matching course found');
    ELSE
        RAISE NOTICE 'User with email nabiyevsaleh889@gmail.com not found. They need to sign up first.';
    END IF;
END $$;