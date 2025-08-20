-- Secure user_roles table: enable RLS and add strict policies
-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Public can read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow read to all" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Create secure policies - users can only see their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins manage user roles"
ON public.user_roles
FOR ALL
USING (
  public.has_role_bypass_rls(auth.uid(), 'admin'::app_role)
  OR public.has_role_bypass_rls(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  public.has_role_bypass_rls(auth.uid(), 'admin'::app_role)
  OR public.has_role_bypass_rls(auth.uid(), 'super_admin'::app_role)
);

-- Revoke any direct grants to prevent bypassing RLS
REVOKE ALL ON TABLE public.user_roles FROM anon;
REVOKE ALL ON TABLE public.user_roles FROM authenticated;