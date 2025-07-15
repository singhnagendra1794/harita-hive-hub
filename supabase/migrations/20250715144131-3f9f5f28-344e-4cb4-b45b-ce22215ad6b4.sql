-- Add super_admin role to existing user (contact@haritahive.com)
-- First, check if super_admin role exists, if not insert it
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT '0ac6f334-d50f-4a21-b76e-6e2d7f949549', 'super_admin', '0ac6f334-d50f-4a21-b76e-6e2d7f949549'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '0ac6f334-d50f-4a21-b76e-6e2d7f949549' 
  AND role = 'super_admin'
);