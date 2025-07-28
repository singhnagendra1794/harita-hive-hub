-- Drop existing function and recreate with updated email list
DROP FUNCTION IF EXISTS public.is_professional_email(text);

-- Update function to handle new email list and specific access requirements
CREATE OR REPLACE FUNCTION public.bulk_assign_professional_and_enroll_updated()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  all_emails TEXT[] := ARRAY[
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
    'udaypbrn@gmail.com',
    'anshumanavasthi1411@gmail.com',
    'sruthythulasi2017@gmail.com',
    'tharun.ravichandran@gmail.com',
    'ankushrathod96@gmail.com',
    'dhiman.kashyap24@gmail.com',
    'vanditaujwal8@gmail.com',
    'nikhilbt650@gmail.com',
    'maneetsethi954@gmail.com',
    'nagendrasingh1794@gmail.com',
    'singhnagendrageotech@gmail.com',
    'contact@haritahive.com',
    'natalia-mejia@live.com',
    'vishwajrathod@gmail.com',
    'alisha110bpl@gmail.com'
  ];
  excluded_from_pro TEXT[] := ARRAY[
    'contact@haritahive.com',
    'singhnagendrageotech@gmail.com'
  ];
  user_record RECORD;
  users_processed INTEGER := 0;
  users_subscriptions_updated INTEGER := 0;
  users_enrolled INTEGER := 0;
  course_title TEXT := 'Geospatial Technology Unlocked';
  should_get_pro BOOLEAN;
BEGIN
  -- Loop through each email
  FOR user_record IN 
    SELECT au.id, au.email
    FROM auth.users au
    WHERE LOWER(au.email) = ANY(
      SELECT LOWER(unnest(all_emails))
    )
  LOOP
    -- Check if user should get professional access
    should_get_pro := NOT (LOWER(user_record.email) = ANY(
      SELECT LOWER(unnest(excluded_from_pro))
    ));
    
    -- Update subscription only if user should get professional access
    IF should_get_pro THEN
      INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
      VALUES (user_record.id, 'pro', 'active')
      ON CONFLICT (user_id) DO UPDATE SET
        subscription_tier = 'pro',
        status = 'active',
        updated_at = now();
      
      users_subscriptions_updated := users_subscriptions_updated + 1;
    END IF;
    
    -- Enroll ALL users in the course (including super admin and admin)
    UPDATE public.profiles
    SET 
      enrolled_courses_count = CASE 
        WHEN course_title = ANY(enrolled_courses) THEN enrolled_courses_count
        ELSE GREATEST(enrolled_courses_count, 0) + 1
      END,
      enrolled_courses = CASE 
        WHEN course_title = ANY(enrolled_courses) THEN enrolled_courses
        ELSE array_append(COALESCE(enrolled_courses, '{}'), course_title)
      END,
      plan = CASE 
        WHEN should_get_pro THEN 'pro'
        ELSE COALESCE(plan, 'free')
      END,
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
    'course_title', course_title,
    'excluded_from_pro', excluded_from_pro
  );
END;
$function$;

-- Recreate is_professional_email function with updated email list
CREATE OR REPLACE FUNCTION public.is_professional_email(p_email text)
RETURNS boolean
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
    'udaypbrn@gmail.com',
    'anshumanavasthi1411@gmail.com',
    'sruthythulasi2017@gmail.com',
    'tharun.ravichandran@gmail.com',
    'ankushrathod96@gmail.com',
    'dhiman.kashyap24@gmail.com',
    'vanditaujwal8@gmail.com',
    'nikhilbt650@gmail.com',
    'maneetsethi954@gmail.com',
    'nagendrasingh1794@gmail.com',
    'natalia-mejia@live.com',
    'vishwajrathod@gmail.com',
    'alisha110bpl@gmail.com'
  ];
  excluded_from_pro TEXT[] := ARRAY[
    'contact@haritahive.com',
    'singhnagendrageotech@gmail.com'
  ];
BEGIN
  -- Return true if email is in professional list but not in excluded list
  RETURN (LOWER(p_email) = ANY(SELECT LOWER(unnest(professional_emails))))
    AND NOT (LOWER(p_email) = ANY(SELECT LOWER(unnest(excluded_from_pro))));
END;
$function$;