-- Fix all functions that use gen_random_bytes to ensure they work with enabled pgcrypto
-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop and recreate the generate_secure_token function
DROP FUNCTION IF EXISTS public.generate_secure_token();
CREATE OR REPLACE FUNCTION public.generate_secure_token()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(24), 'hex');
END;
$$;

-- Drop and recreate the generate_stream_key function
DROP FUNCTION IF EXISTS public.generate_stream_key(uuid);
CREATE OR REPLACE FUNCTION public.generate_stream_key(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_key TEXT;
BEGIN
  new_key := encode(gen_random_bytes(16), 'hex');
  INSERT INTO stream_keys (user_id, key)
  VALUES (user_id, new_key)
  ON CONFLICT (user_id) DO UPDATE SET key = EXCLUDED.key;
  RETURN new_key;
END;
$$;

-- Ensure all auth-related functions work properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert user profile with metadata from signup
  INSERT INTO public.profiles (id, full_name, avatar_url, first_name, last_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 
             CONCAT(COALESCE(NEW.raw_user_meta_data->>'first_name', ''), ' ', COALESCE(NEW.raw_user_meta_data->>'last_name', ''))),
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block the signup
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();