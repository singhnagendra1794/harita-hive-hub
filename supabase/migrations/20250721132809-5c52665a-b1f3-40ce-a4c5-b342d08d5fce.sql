-- Fix email typo and update professional email function
CREATE OR REPLACE FUNCTION public.is_professional_email(email_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  pro_emails TEXT[] := ARRAY[
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'nareshkumar.tamada@gmail.com', 'geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'anshumanavasthi1411@gmail.com',
    'sruthythulasi2017@gmail.com', 'nagendrasingh1794@gmail.com', 'maneetsethi954@gmail.com',
    'tharun.ravichandran@gmail.com', 'ankushrathod96@gmail.com', 'dhiman.kashyap24@gmail.com',
    'vanditaujwal8@gmail.com', 'nkbhilbt650@gmail.com', 'singhnagendrageotech@gmail.com'
  ];
BEGIN
  RETURN LOWER(email_to_check) = ANY(pro_emails);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the user with the correct email if they exist
DO $$
DECLARE
  user_id_found UUID;
  course_title TEXT := 'Geospatial Technology Unlocked';
BEGIN
  -- Find user with correct email
  SELECT id INTO user_id_found 
  FROM auth.users 
  WHERE LOWER(email) = 'singhnagendrageotech@gmail.com';
  
  IF user_id_found IS NOT NULL THEN
    -- Update subscription
    INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
    VALUES (user_id_found, 'pro', 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      subscription_tier = 'pro',
      status = 'active',
      updated_at = now();

    -- Update profile
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
    WHERE id = user_id_found;
    
    RAISE NOTICE 'Updated user with correct email: singhnagendrageotech@gmail.com';
  ELSE
    RAISE NOTICE 'User with email singhnagendrageotech@gmail.com not found';
  END IF;
END $$;