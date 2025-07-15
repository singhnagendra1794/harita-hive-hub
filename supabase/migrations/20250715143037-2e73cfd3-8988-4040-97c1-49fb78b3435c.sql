-- Grant super admin role to contact@haritahive.com
INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES (
  '0ac6f334-d50f-4a21-b76e-6e2d7f949549',
  'super_admin',
  '0ac6f334-d50f-4a21-b76e-6e2d7f949549'
)
ON CONFLICT (user_id, role) DO NOTHING;