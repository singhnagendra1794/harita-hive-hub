-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Ensure is_super_admin_bypass_rls function exists and works correctly
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

-- Also create a simple bypass function for fetching roles
CREATE OR REPLACE FUNCTION public.get_user_roles_bypass_rls(p_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, role app_role, granted_at timestamptz, granted_by uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.id, ur.user_id, ur.role, ur.granted_at, ur.granted_by
  FROM user_roles ur
  WHERE ur.user_id = p_user_id;
$$;