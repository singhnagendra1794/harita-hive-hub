-- Add super_admin to the app_role enum
ALTER TYPE public.app_role ADD VALUE 'super_admin';

-- Function to get or create super admin user
CREATE OR REPLACE FUNCTION public.ensure_super_admin()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get user ID from auth.users by email
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'contact@haritahive.com'
  LIMIT 1;
  
  -- If user exists, ensure they have super_admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (admin_user_id, 'super_admin', admin_user_id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN admin_user_id;
END;
$$;

-- Update RLS policies to allow super admin access
-- For profiles table
DROP POLICY IF EXISTS "Super admin can access all profiles" ON public.profiles;
CREATE POLICY "Super admin can access all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users au 
    JOIN public.user_roles ur ON au.id = ur.user_id 
    WHERE au.id = auth.uid() 
    AND au.email = 'contact@haritahive.com' 
    AND ur.role = 'super_admin'
  )
);

-- For user_roles table  
DROP POLICY IF EXISTS "Super admin can manage all roles" ON public.user_roles;
CREATE POLICY "Super admin can manage all roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND au.email = 'contact@haritahive.com'
  )
);

-- For payment_proofs table
DROP POLICY IF EXISTS "Super admin can manage all payments" ON public.payment_proofs;
CREATE POLICY "Super admin can manage all payments"
ON public.payment_proofs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND au.email = 'contact@haritahive.com'
  )
);

-- For payment_transactions table
DROP POLICY IF EXISTS "Super admin can manage all transactions" ON public.payment_transactions;
CREATE POLICY "Super admin can manage all transactions"
ON public.payment_transactions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND au.email = 'contact@haritahive.com'
  )
);

-- For subscriptions table
DROP POLICY IF EXISTS "Super admin can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Super admin can manage all subscriptions"
ON public.subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND au.email = 'contact@haritahive.com'
  )
);

-- For user_subscriptions table
DROP POLICY IF EXISTS "Super admin can manage all user subscriptions" ON public.user_subscriptions;
CREATE POLICY "Super admin can manage all user subscriptions"
ON public.user_subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND au.email = 'contact@haritahive.com'
  )
);

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    JOIN public.user_roles ur ON au.id = ur.user_id
    WHERE au.id = auth.uid() 
    AND au.email = 'contact@haritahive.com'
    AND ur.role = 'super_admin'
  )
$$;