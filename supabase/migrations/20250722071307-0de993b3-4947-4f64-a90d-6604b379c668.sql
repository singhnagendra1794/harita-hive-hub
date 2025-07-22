-- Add new professional emails to the system and update their access
-- Update these users to professional plan and proper course enrollment
UPDATE public.profiles 
SET 
  plan = 'professional',
  enrolled_courses = CASE 
    WHEN NOT ('Geospatial Technology Unlocked' = ANY(enrolled_courses)) 
    THEN array_append(enrolled_courses, 'Geospatial Technology Unlocked')
    ELSE enrolled_courses
  END,
  enrolled_courses_count = CASE 
    WHEN enrolled_courses_count < 1 THEN 1
    ELSE enrolled_courses_count
  END,
  updated_at = now()
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email IN (
    'nikhilbt650@gmail.com',
    'vanditaujwal8@gmail.com', 
    'dhiman.kashyap24@gmail.com',
    'ankushrathod96@gmail.com'
  )
);

-- Also ensure their subscriptions are set to pro tier
UPDATE public.user_subscriptions 
SET 
  subscription_tier = 'pro',
  status = 'active',
  updated_at = now()
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email IN (
    'nikhilbt650@gmail.com',
    'vanditaujwal8@gmail.com',
    'dhiman.kashyap24@gmail.com', 
    'ankushrathod96@gmail.com'
  )
) AND subscription_tier != 'pro';

-- Update the is_professional_email function to include these new emails
CREATE OR REPLACE FUNCTION public.is_professional_email(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
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
BEGIN
  RETURN LOWER(email_to_check) = ANY(pro_emails);
END;
$$;

-- Update the handle_new_user function to include these new emails  
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
BEGIN
  -- Minimal profile creation with clean stats initialization
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
    CASE WHEN NEW.email = ANY (pro_emails) THEN 'professional' ELSE 'free' END,
    0,
    0,
    0,
    CASE WHEN NEW.email = ANY (pro_emails) THEN ARRAY['Geospatial Technology Unlocked'] ELSE ARRAY[]::text[] END,
    CASE WHEN NEW.email = ANY (pro_emails) THEN 1 ELSE 0 END
  )
  ON CONFLICT (id) DO NOTHING;

  -- Ensure user subscription is created with appropriate tier
  INSERT INTO public.user_subscriptions (
    user_id, 
    subscription_tier, 
    status
  )
  VALUES (
    NEW.id, 
    CASE WHEN NEW.email = ANY (pro_emails) THEN 'pro' ELSE 'free' END,
    'active'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block signup - always return NEW
    RETURN NEW;
END;
$$;