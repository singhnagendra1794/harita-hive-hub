-- Grant Professional Plan access and enroll users in Geospatial Technology Unlocked course
-- Step 1: Create the course if it doesn't exist
INSERT INTO public.courses (
  id,
  title,
  description,
  status,
  is_free,
  price,
  difficulty_level,
  category,
  created_at,
  updated_at,
  published_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Geospatial Technology Unlocked',
  'Comprehensive course covering fundamental geospatial technologies, GIS concepts, and practical applications.',
  'published',
  false,
  99.00,
  'beginner',
  'GIS Fundamentals',
  now(),
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  updated_at = now();

-- Step 2: Update subscription tiers for specified users to 'pro'
UPDATE public.user_subscriptions 
SET 
  subscription_tier = 'pro',
  status = 'active',
  updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'bhumip107@gmail.com',
    'kondojukushi10@gmail.com', 
    'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com',
    'tanishkatyagi7500@gmail.com',
    'kamakshiiit@gmail.com',
    'nareshkumar.tamada@gmail.com',
    'geospatialshekhar@gmail.com',
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
    'anshumanavasthi1411@gmail.com',
    'sruthythulasi2017@gmail.com',
    'nagendrasingh1794@gmail.com'
  )
);

-- Step 3: Enroll users in the Geospatial Technology Unlocked course
INSERT INTO public.course_enrollments (user_id, course_id, enrolled_at, progress_percentage)
SELECT 
  au.id,
  '550e8400-e29b-41d4-a716-446655440001',
  now(),
  0
FROM auth.users au
WHERE au.email IN (
  'bhumip107@gmail.com',
  'kondojukushi10@gmail.com', 
  'adityapipil35@gmail.com',
  'mukherjeejayita14@gmail.com',
  'tanishkatyagi7500@gmail.com',
  'kamakshiiit@gmail.com',
  'nareshkumar.tamada@gmail.com',
  'geospatialshekhar@gmail.com',
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
  'anshumanavasthi1411@gmail.com',
  'sruthythulasi2017@gmail.com',
  'nagendrasingh1794@gmail.com'
)
ON CONFLICT (user_id, course_id) DO NOTHING;