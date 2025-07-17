-- Create super admin policies for user management

-- Function to check if current user is super admin (contact@haritahive.com)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  );
$$;

-- Super admin policies for profiles table
CREATE POLICY "Super admin can manage all profiles"
ON public.profiles FOR ALL
USING (public.is_super_admin());

-- Super admin policies for user_subscriptions table  
CREATE POLICY "Super admin can manage all subscriptions"
ON public.user_subscriptions FOR ALL
USING (public.is_super_admin());

-- Create audit table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Super admin can view and insert audit logs
CREATE POLICY "Super admin can manage audit logs"
ON public.admin_audit_log FOR ALL
USING (public.is_super_admin());

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_target_user_id UUID,
  p_action TEXT,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    target_user_id,
    action,
    old_value,
    new_value
  ) VALUES (
    auth.uid(),
    p_target_user_id,
    p_action,
    p_old_value,
    p_new_value
  );
END;
$$;