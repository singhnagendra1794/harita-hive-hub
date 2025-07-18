-- Fix professional users with correct course ID
INSERT INTO course_enrollments (user_id, course_id, enrolled_at, progress_percentage)
SELECT au.id, 'dcda6a6f-224e-4794-8c18-94218d397ed3', NOW(), 0
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