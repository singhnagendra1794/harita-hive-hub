-- Clean up duplicate policies and ensure the simplest working configuration
-- Remove conflicting profile insert policies
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;

-- Remove conflicting subscription insert policies  
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;

-- Ensure we have the right policies for signup to work
-- The "Allow profile creation" and "Allow subscription creation" policies should handle inserts

-- Test that our function can run without issues
DO $$
DECLARE
  test_result BOOLEAN;
BEGIN
  -- Test the professional email function
  SELECT public.is_professional_email('test@gmail.com') INTO test_result;
  RAISE NOTICE 'Professional email test completed: %', test_result;
  
  -- Test basic profile structure
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'id') THEN
    RAISE EXCEPTION 'Profiles table missing required id column';
  END IF;
  
  RAISE NOTICE 'Database setup verification completed successfully';
END $$;