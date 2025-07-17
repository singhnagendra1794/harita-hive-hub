-- Fix auth system by removing all conflicting triggers and functions
-- Drop all auth-related triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_email_prefs ON auth.users;
DROP TRIGGER IF EXISTS update_email_preferences_token_trigger ON public.user_email_preferences;
DROP TRIGGER IF EXISTS update_email_preferences_token ON public.notification_preferences;

-- Now drop the functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_email_preferences() CASCADE;
DROP FUNCTION IF EXISTS public.update_email_preferences_token() CASCADE;
DROP FUNCTION IF EXISTS public.generate_secure_token() CASCADE;

-- Ensure pgcrypto is enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a simple, bulletproof handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Minimal profile creation - just the essentials
  INSERT INTO public.profiles (id, full_name, first_name, last_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block signup - always return NEW
    RETURN NEW;
END;
$$;

-- Create the single trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();