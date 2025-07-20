-- Generate a stream key for the user if they don't have one
INSERT INTO public.stream_keys (user_id, stream_key, is_active)
SELECT 
  id,
  'sk_' || encode(gen_random_bytes(16), 'hex'),
  true
FROM auth.users 
WHERE email = 'nagendrasingh1794@gmail.com'
AND id NOT IN (SELECT user_id FROM public.stream_keys WHERE is_active = true);