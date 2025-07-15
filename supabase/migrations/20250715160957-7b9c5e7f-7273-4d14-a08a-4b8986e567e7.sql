-- Grant super admin role to contact@haritahive.com
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT 
    au.id,
    'super_admin'::app_role,
    au.id
FROM auth.users au
WHERE au.email = 'contact@haritahive.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = au.id AND ur.role = 'super_admin'
);

-- Also ensure user has a subscription record
INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
SELECT 
    au.id,
    'enterprise'::text,
    'active'::text
FROM auth.users au
WHERE au.email = 'contact@haritahive.com'
ON CONFLICT (user_id) DO UPDATE SET
    subscription_tier = 'enterprise',
    status = 'active',
    updated_at = now();