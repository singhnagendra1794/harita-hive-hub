-- Bulk create professional users and enroll them in Geospatial Technology Unlocked course
DO $$
DECLARE
  pro_emails TEXT[] := ARRAY[
    'bhumip107@gmail.com',
    'kondojukushi10@gmail.com', 
    'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com',
    'tanishkatyagi7500@gmail.com',
    'kamakshiiit@gmail.com',
    'nareshkumar.tamada@gmail.com',
    'geospatialshekhar@gmail.com',
    'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com',
    'munmund66@gmail.com',
    'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com',
    'ajays301298@gmail.com',
    'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com',
    'rashidmsdian@gmail.com',
    'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com',
    'sg17122004@gmail.com',
    'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com',
    'moumitadas19996@gmail.com',
    'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com',
    'udaypbrn@gmail.com',
    'anshumanavasthi1411@gmail.com',
    'sruthythulasi2017@gmail.com',
    'nagendrasingh1794@gmail.com',
    'maneetsethi954@gmail.com',
    'tharun.ravichandran@gmail.com',
    'ankushrathod96@gmail.com',
    'dhiman.kashyap24@gmail.com',
    'vanditaujwal8@gmail.com',
    'nkbhilbt650@gmail.com',
    'maneetsethi954@gmail.com',
    'singhnagendrageoltech@gmail.com'
  ];
  user_record RECORD;
  course_title TEXT := 'Geospatial Technology Unlocked';
BEGIN
  -- Loop through each email and find corresponding user
  FOR user_record IN 
    SELECT au.id, au.email 
    FROM auth.users au 
    WHERE au.email = ANY(pro_emails)
  LOOP
    -- Update user subscription to professional
    INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
    VALUES (user_record.id, 'pro', 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      subscription_tier = 'pro',
      status = 'active',
      updated_at = now();

    -- Update profile plan to professional
    UPDATE public.profiles 
    SET 
      plan = 'professional',
      updated_at = now()
    WHERE id = user_record.id;

    -- Update enrolled courses
    UPDATE public.profiles
    SET 
      enrolled_courses_count = 1,
      enrolled_courses = CASE 
        WHEN course_title = ANY(enrolled_courses) THEN enrolled_courses
        ELSE array_append(COALESCE(enrolled_courses, '{}'), course_title)
      END,
      updated_at = now()
    WHERE id = user_record.id;

    RAISE NOTICE 'Updated user: %', user_record.email;
  END LOOP;
END $$;