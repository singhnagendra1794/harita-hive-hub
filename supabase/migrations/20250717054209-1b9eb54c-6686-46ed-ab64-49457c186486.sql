-- Update subscription tier for the specified professional users
UPDATE public.user_subscriptions 
SET 
  subscription_tier = 'pro',
  status = 'active',
  expires_at = NULL,
  updated_at = now()
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email IN (
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
);

-- Insert subscription records for users who don't have them yet
INSERT INTO public.user_subscriptions (user_id, email, subscription_tier, status, expires_at, updated_at)
SELECT 
  au.id,
  au.email,
  'pro',
  'active',
  NULL,
  now()
FROM auth.users au
WHERE au.email IN (
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
AND NOT EXISTS (
  SELECT 1 FROM public.user_subscriptions us 
  WHERE us.user_id = au.id
)
ON CONFLICT (user_id) DO UPDATE SET
  subscription_tier = 'pro',
  status = 'active',
  expires_at = NULL,
  updated_at = now();