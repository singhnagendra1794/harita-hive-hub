-- Fix the infinite recursion in user_roles policies
-- First, drop the problematic policies that are causing infinite recursion
DROP POLICY IF EXISTS "Super admin can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Super admin can manage user roles" ON user_roles;

-- Create a security definer function to check user roles without recursion
CREATE OR REPLACE FUNCTION public.is_super_admin_secure()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  );
$$;

-- Create a security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ) OR EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  );
$$;

-- Create new non-recursive policies for user_roles
CREATE POLICY "Super admin can view all user roles"
ON user_roles FOR SELECT
USING (public.is_super_admin_secure());

CREATE POLICY "Users can view their own roles" 
ON user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage user roles"
ON user_roles FOR ALL
USING (public.is_super_admin_secure());