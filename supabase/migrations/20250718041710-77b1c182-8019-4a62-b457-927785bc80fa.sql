-- Comprehensive fix for professional users
-- Update profiles table for all professional users
UPDATE profiles 
SET 
  plan = 'professional',
  course_count = 1,
  projects_completed = 0,
  community_posts = 0
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email IN (
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'Tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'Nareshkumar.tamada@gmail.com', 'Geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com'
  )
);

-- Update user_subscriptions for all professional users
INSERT INTO user_subscriptions (user_id, subscription_tier, status)
SELECT au.id, 'pro', 'active'
FROM auth.users au 
WHERE au.email IN (
  'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
  'mukherjeejayita14@gmail.com', 'Tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
  'Nareshkumar.tamada@gmail.com', 'Geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
  'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
  'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
  'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
  'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
  'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
  'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com'
)
ON CONFLICT (user_id) DO UPDATE SET
  subscription_tier = 'pro',
  status = 'active';

-- Ensure all professional users are enrolled in the course
INSERT INTO course_enrollments (user_id, course_id, enrolled_at, progress_percentage)
SELECT au.id, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW(), 0
FROM auth.users au 
WHERE au.email IN (
  'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
  'mukherjeejayita14@gmail.com', 'Tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
  'Nareshkumar.tamada@gmail.com', 'Geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
  'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
  'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
  'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
  'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
  'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
  'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com'
)
ON CONFLICT (user_id, course_id) DO NOTHING;