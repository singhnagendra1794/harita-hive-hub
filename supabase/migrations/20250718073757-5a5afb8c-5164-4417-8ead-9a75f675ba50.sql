-- Final QA fixes for missing database entries and improved access control

-- Update existing users with proper subscription tiers for pro emails
UPDATE public.user_subscriptions 
SET subscription_tier = 'pro', 
    status = 'active', 
    expires_at = null,
    updated_at = now()
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = ANY(ARRAY[
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'Tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'Nareshkumar.tamada@gmail.com', 'Geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'nagendrasingh1794@gmail.com'
  ])
);

-- Update existing profiles with professional plan for pro emails
UPDATE public.profiles 
SET plan = 'professional',
    updated_at = now()
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = ANY(ARRAY[
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'Tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'Nareshkumar.tamada@gmail.com', 'Geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'nagendrasingh1794@gmail.com'
  ])
);

-- Ensure super admin role for contact@haritahive.com
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT au.id, 'super_admin'::app_role, au.id
FROM auth.users au 
WHERE au.email = 'contact@haritahive.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Reset all user stats to 0 for new users (clean slate)
UPDATE public.profiles 
SET course_count = 0,
    projects_completed = 0,
    community_posts = 0,
    updated_at = now()
WHERE course_count IS NULL 
   OR projects_completed IS NULL 
   OR community_posts IS NULL
   OR course_count > 0 
   OR projects_completed > 0 
   OR community_posts > 0;