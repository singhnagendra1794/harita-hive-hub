-- Grant professional access to specified users
-- Update user subscriptions to 'pro' tier for the specified email addresses

WITH target_users AS (
  SELECT id 
  FROM auth.users 
  WHERE email IN (
    'bhumip107@gmail.com',
    'kondojukushi10@gmail.com',
    'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com',
    'Tanishkatyagi7500@gmail.com',
    'kamakshiiit@gmail.com',
    'Nareshkumar.tamada@gmail.com',
    'Geospatialshekhar@gmail.com',
    'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com',
    'munmund66@gmail.com',
    'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com',
    'ajays301298@gmail.com',
    'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com',
    'rashidmsdian@gmail.com',
    'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com',
    'sg17122004@gmail.com',
    'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com',
    'moumitadas19996@gmail.com',
    'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com',
    'udaypbrn@gmail.com'
  )
)
INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, starts_at, expires_at)
SELECT 
  tu.id,
  'pro',
  'active',
  now(),
  now() + interval '1 year'
FROM target_users tu
ON CONFLICT (user_id) 
DO UPDATE SET 
  subscription_tier = 'pro',
  status = 'active',
  starts_at = now(),
  expires_at = now() + interval '1 year',
  updated_at = now();