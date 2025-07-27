-- COMPREHENSIVE SIGNUP FIX
-- Step 1: Drop all existing problematic triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Add email column to the main profiles table (this is the one being used)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 3: Create the correct trigger function that inserts into profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert into the main profiles table
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    first_name,
    last_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block signup
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Ensure RLS is properly configured on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create proper RLS policies for profiles table
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Step 6: Test the function manually (this should work without errors)
-- We'll create a test to ensure it works