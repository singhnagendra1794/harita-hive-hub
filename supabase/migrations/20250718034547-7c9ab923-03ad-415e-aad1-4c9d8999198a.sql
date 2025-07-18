-- Ensure all professional users are enrolled in Geospatial Technology Unlocked course
-- First get the course ID
DO $$
DECLARE
    course_uuid UUID;
    user_record RECORD;
    pro_emails TEXT[] := ARRAY[
        'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
        'mukherjeejayita14@gmail.com', 'Tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
        'Nareshkumar.tamada@gmail.com', 'Geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
        'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
        'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
        'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
        'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
        'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
        'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'nagendrasingh1794@gmail.com'
    ];
BEGIN
    -- Get the Geospatial Technology Unlocked course ID
    SELECT id INTO course_uuid FROM courses WHERE title = 'Geospatial Technology Unlocked';
    
    IF course_uuid IS NULL THEN
        RAISE NOTICE 'Course "Geospatial Technology Unlocked" not found';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found course ID: %', course_uuid;
    
    -- For each professional user, ensure they are enrolled
    FOR user_record IN 
        SELECT au.id, au.email 
        FROM auth.users au 
        WHERE au.email = ANY(pro_emails)
    LOOP
        -- Insert course enrollment if not exists
        INSERT INTO public.course_enrollments (user_id, course_id, enrolled_at, progress_percentage)
        VALUES (user_record.id, course_uuid, now(), 0)
        ON CONFLICT (user_id, course_id) DO NOTHING;
        
        -- Ensure user has professional plan in profiles
        UPDATE public.profiles 
        SET plan = 'professional', course_count = 1
        WHERE id = user_record.id;
        
        -- Ensure user has pro subscription
        INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
        VALUES (user_record.id, 'pro', 'active')
        ON CONFLICT (user_id) DO UPDATE SET
            subscription_tier = 'pro',
            status = 'active';
            
        RAISE NOTICE 'Updated user: %', user_record.email;
    END LOOP;
    
    RAISE NOTICE 'Professional user setup completed';
END $$;