
-- Grant Pro plan access to specified users
UPDATE user_subscriptions
SET 
  subscription_tier = 'pro',
  status = 'active',
  started_at = now(),
  updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'mandadi.jyothi123@gmail.com',
    'nabiyevsaleh889@gmail.com',
    'nagendrasingh1794@gmail.com'
  )
);

-- Also update the profiles table
UPDATE profiles
SET 
  plan = 'pro',
  updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'mandadi.jyothi123@gmail.com',
    'nabiyevsaleh889@gmail.com',
    'nagendrasingh1794@gmail.com'
  )
);
