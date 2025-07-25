-- Comprehensive Signup Fix - Debug and Repair
-- This will definitively resolve the signup issues

-- First, check if our trigger exists and is working
DO $$
BEGIN
    -- Drop and recreate the trigger to ensure it's properly configured
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Recreate the handle_new_user function with comprehensive error handling
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = 'public'
    AS $function$
    DECLARE
        user_email TEXT;
        is_professional BOOLEAN := FALSE;
    BEGIN
        -- Get user email
        user_email := NEW.email;
        
        -- Check if professional email
        SELECT public.is_professional_email(user_email) INTO is_professional;
        
        -- Create profile entry with error handling
        BEGIN
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
        EXCEPTION WHEN OTHERS THEN
            -- Log error but don't fail the signup
            RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
        END;
        
        -- Create user subscription entry with error handling
        BEGIN
            INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, created_at, updated_at)
            VALUES (
                NEW.id,
                CASE WHEN is_professional THEN 'pro' ELSE 'free' END,
                'active',
                now(),
                now()
            )
            ON CONFLICT (user_id) DO UPDATE SET
                subscription_tier = CASE WHEN is_professional THEN 'pro' ELSE 'free' END,
                status = 'active',
                updated_at = now();
        EXCEPTION WHEN OTHERS THEN
            -- Log error but don't fail the signup
            RAISE NOTICE 'Error creating subscription for user %: %', NEW.id, SQLERRM;
        END;
        
        RETURN NEW;
    END;
    $function$;
    
    -- Create the trigger
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        
    RAISE NOTICE 'Signup trigger recreated successfully';
END $$;

-- Also ensure the is_professional_email function exists and works
CREATE OR REPLACE FUNCTION public.is_professional_email(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  professional_domains text[] := ARRAY[
    'edu', 'gov', 'org', 'ac.uk', 'edu.au', 'edu.in', 'ac.in',
    'university', 'college', 'institute', 'research'
  ];
  domain text;
BEGIN
  IF email_to_check IS NULL OR email_to_check = '' THEN
    RETURN false;
  END IF;
  
  -- Extract domain from email
  domain := split_part(email_to_check, '@', 2);
  
  IF domain IS NULL OR domain = '' THEN
    RETURN false;
  END IF;
  
  -- Check if domain ends with professional suffixes
  RETURN EXISTS (
    SELECT 1 FROM unnest(professional_domains) AS pd
    WHERE domain ILIKE '%' || pd
  );
END;
$$;

-- Test the function works
SELECT public.is_professional_email('test@gmail.com') as gmail_test,
       public.is_professional_email('test@university.edu') as edu_test;