-- Fix the missing profile data for the super admin user
UPDATE profiles 
SET 
  email = 'contact@haritahive.com',
  full_name = 'Harita Hive Admin',
  first_name = 'Harita',
  last_name = 'Admin',
  updated_at = now()
WHERE id = '0ac6f334-d50f-4a21-b76e-6e2d7f949549';

-- Ensure the course_enrollments table exists and is properly structured
-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid NOT NULL,
  enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_enrollments if they don't exist
DO $$
BEGIN
  -- Policy for users to view their own enrollments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'course_enrollments' 
    AND policyname = 'Users can view their own enrollments'
  ) THEN
    CREATE POLICY "Users can view their own enrollments"
    ON course_enrollments FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- Policy for users to insert their own enrollments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'course_enrollments' 
    AND policyname = 'Users can insert their own enrollments'
  ) THEN
    CREATE POLICY "Users can insert their own enrollments"
    ON course_enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for super admin to manage all enrollments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'course_enrollments' 
    AND policyname = 'Super admin can manage all enrollments'
  ) THEN
    CREATE POLICY "Super admin can manage all enrollments"
    ON course_enrollments FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'super_admin'
      )
    );
  END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);

-- Add some sample course enrollments for the super admin to test
INSERT INTO course_enrollments (user_id, course_id, enrolled_at) 
VALUES 
  ('0ac6f334-d50f-4a21-b76e-6e2d7f949549', gen_random_uuid(), now() - interval '7 days'),
  ('0ac6f334-d50f-4a21-b76e-6e2d7f949549', gen_random_uuid(), now() - interval '3 days')
ON CONFLICT DO NOTHING;