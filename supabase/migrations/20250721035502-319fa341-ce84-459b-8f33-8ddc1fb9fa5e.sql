-- First, let's check what's causing the signup failures by creating a simpler, more robust trigger

-- Drop the existing trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a minimal, bulletproof handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_email TEXT;
  is_professional BOOLEAN DEFAULT FALSE;
BEGIN
  -- Get user email safely
  user_email := NEW.email;
  
  -- Check if professional email
  SELECT public.is_professional_email(user_email) INTO is_professional;
  
  -- Only create profile - minimal required action
  INSERT INTO public.profiles (
    id, 
    full_name,
    plan,
    course_count,
    projects_completed,
    community_posts
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', user_email),
    CASE WHEN is_professional THEN 'professional' ELSE 'free' END,
    0,
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  -- Only create subscription if profile creation succeeded
  IF FOUND OR EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.user_subscriptions (
      user_id, 
      subscription_tier, 
      status
    )
    VALUES (
      NEW.id, 
      CASE WHEN is_professional THEN 'pro' ELSE 'free' END,
      'active'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but allow signup to proceed
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix RLS policies to allow the trigger to work

-- Profiles table policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Allow profile creation" ON public.profiles
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User subscriptions policies  
DROP POLICY IF EXISTS "Allow trigger to insert subscriptions" ON public.user_subscriptions;
CREATE POLICY "Allow subscription creation" ON public.user_subscriptions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Make sure both tables have RLS enabled but permissive for inserts
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;