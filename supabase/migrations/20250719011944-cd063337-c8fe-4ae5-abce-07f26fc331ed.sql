-- Add is_certification field to upcoming_course_schedule table
ALTER TABLE upcoming_course_schedule 
ADD COLUMN is_certification boolean DEFAULT false;

-- Update specific courses to be marked as certifications
UPDATE upcoming_course_schedule 
SET is_certification = true
WHERE topic IN (
  'GIS Fundamentals & Spatial Thinking',
  'QGIS Mastery & Data Visualization', 
  'Python for GIS Automation'
);

-- Add is_certification field to course_cohorts table for future certification cohorts
ALTER TABLE course_cohorts 
ADD COLUMN is_certification boolean DEFAULT false;

-- Create a new table for certification courses that are separate from the schedule
CREATE TABLE IF NOT EXISTS certification_courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  duration text,
  difficulty text DEFAULT 'beginner',
  requirements text[],
  price numeric DEFAULT 0,
  is_blockchain_verified boolean DEFAULT false,
  rating numeric DEFAULT 0,
  students_enrolled integer DEFAULT 0,
  estimated_launch text,
  features text[],
  course_schedule_id uuid REFERENCES upcoming_course_schedule(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE certification_courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active certification courses"
ON certification_courses FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage certification courses"
ON certification_courses FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_certification_courses_updated_at
  BEFORE UPDATE ON certification_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample certification courses
INSERT INTO certification_courses (title, description, duration, difficulty, requirements, features, estimated_launch, is_blockchain_verified) VALUES 
(
  'GIS Fundamentals Professional',
  'Master the core concepts of Geographic Information Systems with hands-on projects and real-world applications.',
  '4-6 weeks',
  'beginner',
  ARRAY['Basic computer skills', 'Interest in geography and mapping', 'Complete 5 hands-on projects', 'Pass final assessment (80%)'],
  ARRAY['GIS Fundamentals', 'Spatial Thinking', 'QGIS Software', 'Real-world Projects'],
  'February 2025',
  true
),
(
  'Python GIS Automation Specialist',
  'Learn to automate GIS workflows using Python programming with ArcPy, GDAL, and custom tool development.',
  '6-8 weeks',
  'intermediate',
  ARRAY['Basic programming knowledge', 'GIS fundamentals', 'Complete 8 automation projects', 'Build custom tools'],
  ARRAY['Python Programming', 'ArcPy Mastery', 'GDAL/OGR', 'Workflow Automation'],
  'March 2025',
  true
),
(
  'Web GIS Developer',
  'Build modern web mapping applications using JavaScript, APIs, and cloud platforms.',
  '8-10 weeks',
  'intermediate',
  ARRAY['HTML/CSS knowledge', 'Basic JavaScript', 'Build 4 web applications', 'Deploy to cloud'],
  ARRAY['Web Development', 'JavaScript APIs', 'Cloud Deployment', 'Modern Frameworks'],
  'April 2025',
  true
),
(
  'Remote Sensing & AI Specialist',
  'Master satellite imagery analysis, machine learning classification, and AI-powered geospatial analysis.',
  '10-12 weeks',
  'advanced',
  ARRAY['GIS experience required', 'Python knowledge', 'Complete 6 RS projects', 'AI model development'],
  ARRAY['Satellite Analysis', 'Machine Learning', 'Computer Vision', 'AI Applications'],
  'May 2025',
  true
);