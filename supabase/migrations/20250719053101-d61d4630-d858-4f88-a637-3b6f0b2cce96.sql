-- Auto-enroll professional users into "Geospatial Technology Unlocked" course
INSERT INTO public.enrollments (
  user_id,
  course_name,
  full_name,
  email,
  mobile_number,
  location,
  how_did_you_hear,
  enrollment_status,
  payment_status
)
SELECT 
  au.id,
  'Geospatial Technology Unlocked',
  COALESCE(p.full_name, au.email),
  au.email,
  '+91 0000000000', -- Default mobile for auto-enrolled users
  'India',
  'Professional Access',
  'enrolled',
  'completed'
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE public.is_professional_email(au.email)
  AND au.id NOT IN (
    SELECT user_id FROM public.enrollments 
    WHERE course_name = 'Geospatial Technology Unlocked'
  );