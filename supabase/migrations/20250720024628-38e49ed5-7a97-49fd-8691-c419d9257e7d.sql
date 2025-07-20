-- Create a permanent stream key for admin user
INSERT INTO public.stream_keys (user_id, stream_key, is_active) 
SELECT id, 'sk_haritahive_admin_2025_permanent', true 
FROM auth.users 
WHERE email = 'contact@haritahive.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  stream_key = 'sk_haritahive_admin_2025_permanent',
  is_active = true,
  updated_at = now();