-- Fix Issue 1: Update the missing professional users
-- First, let's ensure all 26 emails have pro subscriptions
WITH pro_emails AS (
  SELECT unnest(ARRAY[
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'Tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'Nareshkumar.tamada@gmail.com', 'Geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com'
  ]) AS email
)
INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
SELECT au.id, 'pro', 'active'
FROM auth.users au
JOIN pro_emails pe ON au.email = pe.email
WHERE au.id NOT IN (
  SELECT user_id FROM public.user_subscriptions WHERE subscription_tier = 'pro'
)
ON CONFLICT (user_id) DO UPDATE SET
  subscription_tier = 'pro',
  status = 'active',
  updated_at = now();

-- Update profiles to also show professional plan for these users
WITH pro_emails AS (
  SELECT unnest(ARRAY[
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'Tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'Nareshkumar.tamada@gmail.com', 'Geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com'
  ]) AS email
)
UPDATE public.profiles 
SET plan = 'professional'
FROM auth.users au
JOIN pro_emails pe ON au.email = pe.email
WHERE profiles.id = au.id;