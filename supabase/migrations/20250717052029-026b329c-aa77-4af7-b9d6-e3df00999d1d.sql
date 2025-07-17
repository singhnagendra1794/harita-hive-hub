-- Create RPC function to get auth users data for super admin
CREATE OR REPLACE FUNCTION public.get_auth_users_data()
RETURNS TABLE(
  id UUID,
  email TEXT,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    au.id,
    au.email,
    au.last_sign_in_at,
    au.created_at
  FROM auth.users au
  WHERE public.is_super_admin();
$$;