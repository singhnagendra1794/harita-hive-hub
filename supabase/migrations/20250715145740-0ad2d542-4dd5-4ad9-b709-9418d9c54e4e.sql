-- Fix infinite recursion in user_roles RLS policies
-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Create a security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role_bypass_rls(p_user_id uuid, p_role app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id AND role = p_role
  );
$$;

-- Create a function to check if user is super admin specifically
CREATE OR REPLACE FUNCTION public.is_super_admin_bypass_rls(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER  
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    INNER JOIN auth.users au ON ur.user_id = au.id
    WHERE ur.user_id = p_user_id 
    AND ur.role = 'super_admin'
    AND au.email = 'contact@haritahive.com'
  );
$$;

-- Create simple RLS policies using the security definer functions
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_super_admin_bypass_rls(auth.uid()));

CREATE POLICY "Super admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.is_super_admin_bypass_rls(auth.uid()));

CREATE POLICY "Super admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.is_super_admin_bypass_rls(auth.uid()));

CREATE POLICY "Super admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.is_super_admin_bypass_rls(auth.uid()));