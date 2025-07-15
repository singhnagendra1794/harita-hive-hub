-- Update existing admin role to super_admin for contact@haritahive.com
UPDATE public.user_roles 
SET role = 'super_admin', granted_at = now()
WHERE user_id = '0ac6f334-d50f-4a21-b76e-6e2d7f949549' 
AND role = 'admin';