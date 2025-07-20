-- Ensure veenapoovukal@gmail.com gets professional access when they sign up
-- This will be handled by the handle_new_user function automatically, but let's make sure
-- the database function is set up to handle social auth properly

-- Update the handle_new_user function to better handle social auth and professional emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  -- Create profile with clean initial stats
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
    plan = CASE WHEN public.is_professional_email(NEW.email) THEN 'professional' ELSE profiles.plan END;

  -- Create user subscription with appropriate tier
  INSERT INTO public.user_subscriptions (
    user_id, 
    subscription_tier, 
    status,
    started_at,
    expires_at
  )
  VALUES (
    NEW.id, 
    CASE WHEN public.is_professional_email(NEW.email) THEN 'pro' ELSE 'free' END,
    'active',
    now(),
    null  -- No expiry for any tier
  )
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_tier = CASE WHEN public.is_professional_email(NEW.email) THEN 'pro' ELSE user_subscriptions.subscription_tier END,
    status = 'active';

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
    -- Never block signup - always return NEW
    RETURN NEW;
END;
$function$;