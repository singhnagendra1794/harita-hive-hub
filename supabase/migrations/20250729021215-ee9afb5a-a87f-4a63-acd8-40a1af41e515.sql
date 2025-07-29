-- Fix the missing profile data for the super admin user
UPDATE profiles 
SET 
  email = 'contact@haritahive.com',
  full_name = 'Harita Hive Admin',
  first_name = 'Harita',
  last_name = 'Admin',
  updated_at = now()
WHERE id = '0ac6f334-d50f-4a21-b76e-6e2d7f949549';

-- Update course_enrollments table structure (remove foreign key constraint)
ALTER TABLE course_enrollments DROP CONSTRAINT IF EXISTS course_enrollments_course_id_fkey;

-- Add some sample course enrollments for the super admin to test
INSERT INTO course_enrollments (user_id, course_id, enrolled_at) 
VALUES 
  ('0ac6f334-d50f-4a21-b76e-6e2d7f949549', gen_random_uuid(), now() - interval '7 days'),
  ('0ac6f334-d50f-4a21-b76e-6e2d7f949549', gen_random_uuid(), now() - interval '3 days')
ON CONFLICT DO NOTHING;