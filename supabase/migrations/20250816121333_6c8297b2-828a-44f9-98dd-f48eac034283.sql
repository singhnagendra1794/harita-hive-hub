-- Grant professional subscription access to kaverinayar2005@gmail.com
INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, started_at, updated_at)
SELECT 
    au.id,
    'pro',
    'active',
    now(),
    now()
FROM auth.users au
WHERE au.email = 'kaverinayar2005@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET
    subscription_tier = 'pro',
    status = 'active',
    updated_at = now();