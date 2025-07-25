-- Fix handle_new_user function to prevent duplicate key errors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
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
    'tharun.ravichandran@gmail.com', 'nikhilbt650@gmail.com', 'vanditaujwal8@gmail.com',
    'dhiman.kashyap24@gmail.com', 'ankushrathod96@gmail.com', 'singhnagendrageotech@gmail.com'
  ];
  is_pro_user BOOLEAN := FALSE;
BEGIN
  -- Check if user has professional email
  is_pro_user := (NEW.email = ANY (pro_emails));

  -- Create profile with proper conflict handling
  INSERT INTO public.profiles (
    id, 
    full_name, 
    first_name, 
    last_name,
    plan,
    course_count,
    projects_completed,
    community_posts,
    enrolled_courses,
    enrolled_courses_count
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE WHEN is_pro_user THEN 'professional' ELSE 'free' END,
    0,
    0,
    0,
    CASE WHEN is_pro_user THEN ARRAY['Geospatial Technology Unlocked'] ELSE ARRAY[]::text[] END,
    CASE WHEN is_pro_user THEN 1 ELSE 0 END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    plan = EXCLUDED.plan,
    enrolled_courses = EXCLUDED.enrolled_courses,
    enrolled_courses_count = EXCLUDED.enrolled_courses_count,
    updated_at = now();

  -- Create user subscription with proper conflict handling
  INSERT INTO public.user_subscriptions (
    user_id, 
    subscription_tier, 
    status
  )
  VALUES (
    NEW.id, 
    CASE WHEN is_pro_user THEN 'pro' ELSE 'free' END,
    'active'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_tier = CASE WHEN is_pro_user THEN 'pro' ELSE public.user_subscriptions.subscription_tier END,
    updated_at = now();

  -- Create notification preferences with conflict handling
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but never block signup
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;