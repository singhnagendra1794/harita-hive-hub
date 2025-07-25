-- CRITICAL FIX: The auth trigger was not properly created
-- This is causing the signup failures

-- First, check what's in our current setup
SELECT 
  trigger_name, 
  trigger_schema,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Drop any existing trigger to start clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile entry
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    updated_at = now();
  
  -- Create user subscription entry
  INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, created_at, updated_at)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.email ~* '\.(edu|ac\.uk|edu\.au|edu\.in|ac\.in|gov|org)$' THEN 'pro'
      ELSE 'free'
    END,
    'active',
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_tier = CASE 
      WHEN NEW.email ~* '\.(edu|ac\.uk|edu\.au|edu\.in|ac\.in|gov|org)$' THEN 'pro'
      ELSE 'free'
    END,
    status = 'active',
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger was created
SELECT 
  trigger_name, 
  trigger_schema,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';