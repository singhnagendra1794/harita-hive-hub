-- Create function to bulk assign professional access and enroll users in Geospatial Technology Unlocked course
CREATE OR REPLACE FUNCTION public.bulk_assign_professional_and_enroll()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  professional_emails TEXT[] := ARRAY[
    'bhumip107@gmail.com',
    'kondojukushi10@gmail.com', 
    'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com',
    'Tanishkatyagi7500@gmail.com',
    'kamakshiiit@gmail.com',
    'Nareshkumar.tamada@gmail.com',
    'Geospatialshekhar@gmail.com',
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
    'udaypbrn@gmail.com'
  ];
  user_record RECORD;
  users_processed INTEGER := 0;
  users_subscriptions_updated INTEGER := 0;
  users_enrolled INTEGER := 0;
  course_title TEXT := 'Geospatial Technology Unlocked';
BEGIN
  -- Loop through each email
  FOR user_record IN 
    SELECT au.id, au.email
    FROM auth.users au
    WHERE LOWER(au.email) = ANY(
      SELECT LOWER(unnest(professional_emails))
    )
  LOOP
    -- Update or create professional subscription
    INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
    VALUES (user_record.id, 'pro', 'active')
    ON CONFLICT (user_id) DO UPDATE SET
      subscription_tier = 'pro',
      status = 'active',
      updated_at = now();
    
    users_subscriptions_updated := users_subscriptions_updated + 1;
    
    -- Update profile with course enrollment
    UPDATE public.profiles
    SET 
      enrolled_courses_count = CASE 
        WHEN course_title = ANY(enrolled_courses) THEN enrolled_courses_count
        ELSE enrolled_courses_count + 1
      END,
      enrolled_courses = CASE 
        WHEN course_title = ANY(enrolled_courses) THEN enrolled_courses
        ELSE array_append(enrolled_courses, course_title)
      END,
      plan = 'pro',
      updated_at = now()
    WHERE id = user_record.id;
    
    -- Check if course was actually added
    IF FOUND THEN
      users_enrolled := users_enrolled + 1;
    END IF;
    
    users_processed := users_processed + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'users_processed', users_processed,
    'subscriptions_updated', users_subscriptions_updated,
    'users_enrolled', users_enrolled,
    'course_title', course_title
  );
END;
$function$;