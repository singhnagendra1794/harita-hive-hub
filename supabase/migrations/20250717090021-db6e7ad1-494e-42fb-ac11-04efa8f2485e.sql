-- Update all specified users to professional plan and reset their stats to zero
UPDATE public.profiles 
SET 
  plan = 'professional',
  course_count = 0,
  projects_completed = 0,
  community_posts = 0,
  spatial_analyses = 0
WHERE id IN (
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
    'udaypbrn@gmail.com',
    'nagendrasingh1794@gmail.com'
  )
);

-- Update user subscriptions table to reflect pro tier for these users
UPDATE public.user_subscriptions 
SET 
  subscription_tier = 'pro',
  status = 'active'
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
    'udaypbrn@gmail.com',
    'nagendrasingh1794@gmail.com'
  )
);