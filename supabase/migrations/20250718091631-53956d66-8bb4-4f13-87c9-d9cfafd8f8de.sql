-- Fix case-sensitive email matching and update subscription for Tanishka Tyagi
UPDATE public.user_subscriptions
SET 
  subscription_tier = 'pro',
  status = 'active',
  started_at = COALESCE(started_at, now()),
  expires_at = null,
  updated_at = now()
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE LOWER(au.email) = LOWER('Tanishkatyagi7500@gmail.com')
);

-- Also update the profile plan
UPDATE public.profiles
SET 
  plan = 'professional',
  updated_at = now()
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE LOWER(au.email) = LOWER('Tanishkatyagi7500@gmail.com')
);

-- Update the handle_new_user function to use case-insensitive email matching
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
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
    'sruthythulasi2017@gmail.com'
  ];
BEGIN
  -- Create profile with clean initial stats (all zeros)
  INSERT INTO public.profiles (
    id, 
    full_name, 
    first_name, 
    last_name,
    plan,
    course_count,
    projects_completed,
    community_posts
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE WHEN LOWER(NEW.email) = ANY (pro_emails) THEN 'professional' ELSE 'free' END,
    0,  -- Start with 0 courses
    0,  -- Start with 0 projects
    0   -- Start with 0 posts
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create user subscription with appropriate tier for pro emails
  INSERT INTO public.user_subscriptions (
    user_id, 
    subscription_tier, 
    status,
    started_at,
    expires_at
  )
  VALUES (
    NEW.id, 
    CASE WHEN LOWER(NEW.email) = ANY (pro_emails) THEN 'pro' ELSE 'free' END,
    'active',
    now(),
    null  -- No expiry for pro users
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
$function$;