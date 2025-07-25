-- Fix the duplicate key constraint issue and optimize auth functions
-- The user_subscriptions_user_id_key constraint is causing signup failures

-- First, let's handle the duplicate constraint issue by making the insert idempotent
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create user subscription entry (handle duplicates gracefully)
  INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, created_at, updated_at)
  VALUES (
    NEW.id,
    CASE 
      WHEN public.is_professional_email(NEW.email) THEN 'pro'
      ELSE 'free'
    END,
    'active',
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also fix the create_user_subscription function to handle duplicates
CREATE OR REPLACE FUNCTION public.create_user_subscription(p_user_id uuid, p_tier text DEFAULT 'free')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, created_at, updated_at)
  VALUES (p_user_id, p_tier, 'active', now(), now())
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_tier = EXCLUDED.subscription_tier,
    updated_at = now();
END;
$$;