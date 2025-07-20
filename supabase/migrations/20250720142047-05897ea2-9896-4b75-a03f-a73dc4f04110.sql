-- Fix the handle_new_user function for proper signup flow
-- Drop and recreate the trigger function to ensure it works correctly

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the corrected handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Create profile with metadata from signup
  INSERT INTO public.profiles (
    id, 
    full_name, 
    first_name, 
    last_name,
    plan,
    course_count,
    projects_completed,
    community_posts,
    avatar_url
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE WHEN public.is_professional_email(NEW.email) THEN 'professional' ELSE 'free' END,
    0,  -- Start with 0 courses
    0,  -- Start with 0 projects
    0,  -- Start with 0 posts
    NEW.raw_user_meta_data->>'avatar_url' -- For social auth avatars
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    plan = CASE WHEN public.is_professional_email(NEW.email) THEN 'professional' ELSE profiles.plan END,
    updated_at = now();

  -- Create user subscription with appropriate tier
  INSERT INTO public.user_subscriptions (
    user_id, 
    subscription_tier, 
    status,
    started_at
  )
  VALUES (
    NEW.id, 
    CASE WHEN public.is_professional_email(NEW.email) THEN 'pro' ELSE 'free' END,
    'active',
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_tier = CASE WHEN public.is_professional_email(NEW.email) THEN 'pro' ELSE user_subscriptions.subscription_tier END,
    status = 'active',
    updated_at = now();

  -- Auto-enroll professional users in the main course
  IF public.is_professional_email(NEW.email) THEN
    INSERT INTO public.enrollments (
      user_id,
      course_id,
      full_name,
      email,
      mobile_number,
      location,
      how_did_you_hear,
      payment_status,
      payment_amount,
      payment_currency,
      is_emi
    )
    VALUES (
      NEW.id,
      'geospatial-technology-unlocked',
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.email,
      '+91 0000000000',
      'India',
      'Professional Access',
      'completed',
      0,
      'INR',
      false
    )
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;

  -- Create notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block signup
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Update the professional email list to include the latest user
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
    'tharun.ravichandran@gmail.com'
  ];
BEGIN
  RETURN LOWER(email_to_check) = ANY(pro_emails);
END;
$$;

-- Fix existing users without profiles by running the function manually
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT u.* FROM auth.users u 
    LEFT JOIN public.profiles p ON u.id = p.id 
    WHERE p.id IS NULL
  LOOP
    -- Insert profile for users who don't have one
    INSERT INTO public.profiles (
      id, 
      full_name, 
      first_name, 
      last_name,
      plan,
      course_count,
      projects_completed,
      community_posts,
      avatar_url
    )
    VALUES (
      user_record.id, 
      COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', ''),
      COALESCE(user_record.raw_user_meta_data->>'first_name', ''),
      COALESCE(user_record.raw_user_meta_data->>'last_name', ''),
      CASE WHEN public.is_professional_email(user_record.email) THEN 'professional' ELSE 'free' END,
      0,  -- Start with 0 courses
      0,  -- Start with 0 projects
      0,  -- Start with 0 posts
      user_record.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Create subscription if missing
    INSERT INTO public.user_subscriptions (
      user_id, 
      subscription_tier, 
      status,
      started_at
    )
    VALUES (
      user_record.id, 
      CASE WHEN public.is_professional_email(user_record.email) THEN 'pro' ELSE 'free' END,
      'active',
      now()
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Create notification preferences if missing
    INSERT INTO public.notification_preferences (user_id)
    VALUES (user_record.id)
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END $$;