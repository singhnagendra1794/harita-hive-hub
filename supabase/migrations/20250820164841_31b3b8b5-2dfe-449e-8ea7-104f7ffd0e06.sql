-- 1) Create a safe super-admin checker that avoids user_roles entirely
CREATE OR REPLACE FUNCTION public.is_platform_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
      AND au.email = 'contact@haritahive.com'
  );
$$;

-- 2) Harden user_roles RLS to eliminate recursion and public exposure
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts / recursion
DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admin manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public can read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow read to all" ON public.user_roles;

-- Allow users to see their own roles; super admin can see all
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (
  auth.uid() = user_id OR public.is_platform_super_admin()
);

-- Only super admin can modify any roles (prevents recursion by not checking user_roles)
CREATE POLICY "Super admin manage user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_platform_super_admin());

CREATE POLICY "Super admin update user roles"
ON public.user_roles
FOR UPDATE
USING (public.is_platform_super_admin())
WITH CHECK (public.is_platform_super_admin());

CREATE POLICY "Super admin delete user roles"
ON public.user_roles
FOR DELETE
USING (public.is_platform_super_admin());

-- Ensure no direct grants that bypass RLS
REVOKE ALL ON TABLE public.user_roles FROM anon;
REVOKE ALL ON TABLE public.user_roles FROM authenticated;