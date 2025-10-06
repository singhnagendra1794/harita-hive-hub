-- Create function to check if email should get auto pro access
CREATE OR REPLACE FUNCTION public.should_get_auto_pro_access(email_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- List of emails that should automatically get pro access
  RETURN email_input IN (
    'medollykris@gmail.com'
  );
END;
$$;

-- Update handle_new_user to automatically assign pro plan for specific emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  subscription_tier TEXT;
BEGIN
  -- Determine subscription tier based on email
  IF public.should_get_auto_pro_access(NEW.email) THEN
    subscription_tier := 'pro';
  ELSIF public.is_professional_email(NEW.email) THEN
    subscription_tier := 'pro';
  ELSE
    subscription_tier := 'free';
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    first_name,
    last_name,
    plan,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    subscription_tier,
    NOW(),
    NOW()
  );

  -- Create user subscription
  INSERT INTO public.user_subscriptions (
    user_id,
    subscription_tier,
    status,
    started_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    subscription_tier,
    'active',
    NOW(),
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;