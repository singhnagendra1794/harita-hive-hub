-- Fix the signup error by properly handling the email preferences trigger
-- The issue is that when create_user_email_preferences inserts a record,
-- the update_email_preferences_token trigger fires but expects unsubscribe_token

-- First, let's update the create_user_email_preferences function to include the unsubscribe_token
CREATE OR REPLACE FUNCTION public.create_user_email_preferences()
RETURNS trigger AS $$
BEGIN
  -- Insert with unsubscribe_token to prevent trigger error
  INSERT INTO public.user_email_preferences (user_id, unsubscribe_token)
  VALUES (NEW.id, public.generate_secure_token())
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_onboarding (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Also update the handle_new_user function to include email preferences creation
-- but make sure there are no conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert user profile with metadata from signup
  INSERT INTO public.profiles (id, full_name, avatar_url, first_name, last_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 
             CONCAT(NEW.raw_user_meta_data->>'first_name', ' ', NEW.raw_user_meta_data->>'last_name')),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    updated_at = now();

  -- Ensure user subscription is created
  INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  -- Create notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;