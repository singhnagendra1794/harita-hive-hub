-- Fixed by Lovable 2025-01-16T14:00:00Z
-- Fix Function Search Path Mutable warnings for security
-- All functions need SET search_path = public, pg_temp to prevent role-based exploits

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
  RETURN NEW;
END;
$$;

-- Update create_user_subscription function
CREATE OR REPLACE FUNCTION public.create_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update user_has_premium_access function
CREATE OR REPLACE FUNCTION public.user_has_premium_access(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  subscription_tier TEXT;
  subscription_status TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT us.subscription_tier, us.status, us.expires_at
  INTO subscription_tier, subscription_status, expires_at
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id;
  
  -- If no subscription found, create a free one
  IF subscription_tier IS NULL THEN
    INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
    VALUES (p_user_id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN false;
  END IF;
  
  -- Check if user has active pro or enterprise subscription only
  IF subscription_tier IN ('pro', 'enterprise') 
     AND subscription_status = 'active' 
     AND (expires_at IS NULL OR expires_at > now()) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Update is_super_admin_bypass_rls function
CREATE OR REPLACE FUNCTION public.is_super_admin_bypass_rls(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    INNER JOIN auth.users au ON ur.user_id = au.id
    WHERE ur.user_id = p_user_id 
    AND ur.role = 'super_admin'
    AND au.email = 'contact@haritahive.com'
  );
$$;

-- Update has_role_bypass_rls function
CREATE OR REPLACE FUNCTION public.has_role_bypass_rls(p_user_id uuid, p_role app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id AND role = p_role
  );
$$;

-- Update get_user_roles_bypass_rls function
CREATE OR REPLACE FUNCTION public.get_user_roles_bypass_rls(p_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, role app_role, granted_at timestamptz, granted_by uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT ur.id, ur.user_id, ur.role, ur.granted_at, ur.granted_by
  FROM user_roles ur
  WHERE ur.user_id = p_user_id;
$$;