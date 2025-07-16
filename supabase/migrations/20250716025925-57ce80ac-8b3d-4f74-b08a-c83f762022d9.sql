-- Ensure super admin role exists and is assigned to contact@haritahive.com
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT id, 'super_admin'::app_role, id
FROM auth.users 
WHERE email = 'contact@haritahive.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.users.id AND role = 'super_admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure super admin has enterprise subscription
INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, started_at)
SELECT id, 'enterprise', 'active', now()
FROM auth.users 
WHERE email = 'contact@haritahive.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_subscriptions 
  WHERE user_id = auth.users.id
)
ON CONFLICT (user_id) DO UPDATE SET
  subscription_tier = 'enterprise',
  status = 'active',
  updated_at = now();