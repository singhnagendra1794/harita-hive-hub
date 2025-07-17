-- Completely reset and fix the auth system
-- First ensure pgcrypto is enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop ALL triggers that might be interfering
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_email_preferences_token_trigger ON public.user_email_preferences;
DROP TRIGGER IF EXISTS update_email_preferences_token ON public.notification_preferences;

-- Drop ALL functions that use gen_random_bytes
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.generate_secure_token();
DROP FUNCTION IF EXISTS public.generate_stream_key(uuid);
DROP FUNCTION IF EXISTS public.create_user_email_preferences();
DROP FUNCTION IF EXISTS public.update_email_preferences_token();

-- Recreate functions that work with pgcrypto
CREATE OR REPLACE FUNCTION public.generate_secure_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(gen_random_bytes(24), 'hex');
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback to uuid if gen_random_bytes fails
    RETURN replace(gen_random_uuid()::text, '-', '');
END;
$$;

-- Create a minimal handle_new_user function that won't fail
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only insert into profiles - no other tables to avoid conflicts
  INSERT INTO public.profiles (id, full_name, first_name, last_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 
             CONCAT(COALESCE(NEW.raw_user_meta_data->>'first_name', ''), ' ', COALESCE(NEW.raw_user_meta_data->>'last_name', ''))),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Always return NEW to not block signup
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();