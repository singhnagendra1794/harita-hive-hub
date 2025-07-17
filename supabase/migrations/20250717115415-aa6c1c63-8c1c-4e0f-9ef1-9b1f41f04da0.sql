-- Create the "Geospatial Technology Unlocked" course
INSERT INTO public.courses (
  id,
  title,
  description,
  category,
  difficulty_level,
  status,
  is_free,
  price,
  thumbnail_url,
  tags,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Geospatial Technology Unlocked',
  '90-Day Advanced Practical Program – GIS, Remote Sensing, Python, SQL, GeoAI. Master cutting-edge geospatial technologies with hands-on projects and real-world applications.',
  'advanced',
  'advanced',
  'published',
  false,
  0,
  '/lovable-uploads/8518d6cf-fcf9-411c-8949-5bc139aa26d5.png', -- Using existing course thumbnail
  ARRAY['GIS', 'Remote Sensing', 'Python', 'SQL', 'GeoAI', 'Advanced', 'Practical'],
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Get the course ID for enrollment
DO $$
DECLARE
  course_uuid UUID;
  user_emails TEXT[] := ARRAY[
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
  ];
  user_record RECORD;
BEGIN
  -- Get the course ID
  SELECT id INTO course_uuid 
  FROM public.courses 
  WHERE title = 'Geospatial Technology Unlocked';
  
  -- Enroll users in the course
  FOR user_record IN
    SELECT au.id
    FROM auth.users au
    WHERE au.email = ANY(user_emails)
  LOOP
    INSERT INTO public.course_enrollments (
      user_id,
      course_id,
      enrolled_at,
      progress_percentage
    ) VALUES (
      user_record.id,
      course_uuid,
      now(),
      0
    )
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Course created and users enrolled successfully';
END $$;