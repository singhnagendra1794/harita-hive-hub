-- Fix the handle_new_user function to prevent duplicate key errors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert profile with conflict handling
  INSERT INTO public.profiles (
    id, 
    full_name, 
    plan,
    course_count,
    projects_completed,
    community_posts,
    enrolled_courses_count,
    enrolled_courses,
    location_country,
    location_city
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    CASE 
      WHEN public.is_professional_email(NEW.email) THEN 'professional'
      ELSE 'free'
    END,
    0,
    0,
    0,
    0,
    '{}',
    NEW.raw_user_meta_data ->> 'location_country',
    NEW.raw_user_meta_data ->> 'location_city'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    location_country = EXCLUDED.location_country,
    location_city = EXCLUDED.location_city,
    updated_at = now();

  -- Insert subscription with conflict handling
  INSERT INTO public.user_subscriptions (
    user_id,
    subscription_tier,
    status,
    started_at,
    expires_at
  ) VALUES (
    NEW.id,
    CASE 
      WHEN public.is_professional_email(NEW.email) THEN 'pro'
      ELSE 'free'
    END,
    'active',
    now(),
    CASE 
      WHEN public.is_professional_email(NEW.email) THEN now() + INTERVAL '3 months'
      ELSE NULL
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_tier = EXCLUDED.subscription_tier,
    status = EXCLUDED.status,
    started_at = EXCLUDED.started_at,
    expires_at = EXCLUDED.expires_at,
    updated_at = now();

  -- Insert notification preferences with conflict handling
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Store user location if provided
  IF NEW.raw_user_meta_data ->> 'location_country' IS NOT NULL THEN
    INSERT INTO public.user_location (
      user_id,
      country,
      city,
      detected_at
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'location_country',
      NEW.raw_user_meta_data ->> 'location_city',
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      country = EXCLUDED.country,
      city = EXCLUDED.city,
      detected_at = EXCLUDED.detected_at;
  END IF;

  RETURN NEW;
END;
$$;

-- Also create the is_professional_email function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_professional_email(email_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  professional_emails text[] := ARRAY[
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'nareshkumar.tamada@gmail.com', 'geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'anshumanavasthi1411@gmail.com',
    'sruthythulasi2017@gmail.com', 'tharun.ravichandran@gmail.com', 'ankushrathod96@gmail.com',
    'dhiman.kashyap24@gmail.com', 'vanditaujwal8@gmail.com', 'nikhilbt650@gmail.com',
    'maneetsethi954@gmail.com', 'nagendrasingh1794@gmail.com', 'natalia-mejia@live.com',
    'vishwajrathod@gmail.com'
  ];
BEGIN
  RETURN email_input = ANY(professional_emails);
END;
$$;