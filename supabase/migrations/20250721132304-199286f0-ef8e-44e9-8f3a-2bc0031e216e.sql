-- Ensure all professional users have correct access - simplified version
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
    'singhnagendrageoltech@gmail.com'
  ];
  user_record RECORD;
  course_title TEXT := 'Geospatial Technology Unlocked';
  updated_count INTEGER := 0;
  i INTEGER;
BEGIN
  -- Process each professional user
  FOR user_record IN 
    SELECT au.id, au.email 
    FROM auth.users au 
    WHERE EXISTS (
      SELECT 1 FROM unnest(pro_emails) AS pe(email) 
      WHERE LOWER(pe.email) = LOWER(au.email)
    )
  LOOP
    -- Ensure user has professional subscription
    INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
    VALUES (user_record.id, 'pro', 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      subscription_tier = 'pro',
      status = 'active',
      updated_at = now();

    -- Ensure user profile has professional plan and course enrollment
    UPDATE public.profiles 
    SET 
      plan = 'professional',
      enrolled_courses_count = CASE 
        WHEN enrolled_courses_count = 0 OR enrolled_courses_count IS NULL THEN 1
        WHEN NOT (course_title = ANY(COALESCE(enrolled_courses, '{}'))) THEN enrolled_courses_count + 1
        ELSE enrolled_courses_count
      END,
      enrolled_courses = CASE 
        WHEN NOT (course_title = ANY(COALESCE(enrolled_courses, '{}'))) 
        THEN array_append(COALESCE(enrolled_courses, '{}'), course_title)
        ELSE enrolled_courses 
      END,
      updated_at = now()
    WHERE id = user_record.id;

    updated_count := updated_count + 1;
    RAISE NOTICE 'Updated professional user: % (ID: %)', user_record.email, user_record.id;
  END LOOP;
  
  RAISE NOTICE 'Total users updated: %', updated_count;
END $$;