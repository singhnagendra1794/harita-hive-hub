-- Create upcoming course schedule table
CREATE TABLE public.upcoming_course_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day INTEGER NOT NULL,
  week INTEGER NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  learning_goal TEXT,
  phase TEXT NOT NULL, -- 'fundamentals', 'ml', 'geoai', 'webgis'
  estimated_duration TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.upcoming_course_schedule ENABLE ROW LEVEL SECURITY;

-- Public can view active schedule
CREATE POLICY "Anyone can view active course schedule" 
ON public.upcoming_course_schedule 
FOR SELECT 
USING (is_active = true);

-- Admins can manage schedule
CREATE POLICY "Admins can manage course schedule" 
ON public.upcoming_course_schedule 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create waitlist table for upcoming course
CREATE TABLE public.upcoming_course_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  experience_level TEXT DEFAULT 'beginner',
  motivation TEXT,
  referral_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified BOOLEAN DEFAULT false
);

-- Enable RLS for waitlist
ALTER TABLE public.upcoming_course_waitlist ENABLE ROW LEVEL SECURITY;

-- Public can join waitlist
CREATE POLICY "Anyone can join waitlist" 
ON public.upcoming_course_waitlist 
FOR INSERT 
WITH CHECK (true);

-- Admins can view waitlist
CREATE POLICY "Admins can view waitlist" 
ON public.upcoming_course_waitlist 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Insert sample course schedule data
INSERT INTO public.upcoming_course_schedule (day, week, topic, description, learning_goal, phase, estimated_duration) VALUES
-- Week 1-2: Fundamentals
(1, 1, 'GIS Fundamentals & Spatial Thinking', 'Introduction to Geographic Information Systems, coordinate systems, and spatial data concepts', 'Master core GIS concepts and spatial reasoning', 'fundamentals', '2-3 hours'),
(3, 1, 'QGIS Mastery & Data Visualization', 'Hands-on training with QGIS software for data analysis and map creation', 'Become proficient in QGIS for professional GIS workflows', 'fundamentals', '3-4 hours'),
(5, 1, 'Python for GIS Automation', 'Learn Python programming specifically for geospatial data processing', 'Automate GIS tasks using Python scripting', 'fundamentals', '4-5 hours'),
(8, 2, 'Spatial Data Management', 'Working with databases, file formats, and data quality assessment', 'Efficiently manage and organize spatial datasets', 'fundamentals', '3-4 hours'),
(10, 2, 'Web GIS Foundations', 'Introduction to web mapping technologies and online GIS platforms', 'Understand web-based GIS architecture and tools', 'fundamentals', '2-3 hours'),
(12, 2, 'Remote Sensing Basics', 'Satellite imagery analysis and interpretation techniques', 'Process and analyze satellite data for insights', 'fundamentals', '3-4 hours'),

-- Week 3-6: Machine Learning for GIS
(15, 3, 'ML Fundamentals for Spatial Data', 'Introduction to machine learning concepts applied to geographic data', 'Understand how ML applies to spatial problems', 'ml', '4-5 hours'),
(17, 3, 'Supervised Learning with Geospatial Data', 'Classification and regression using spatial features', 'Build predictive models with location data', 'ml', '5-6 hours'),
(19, 3, 'Unsupervised Learning & Clustering', 'Spatial clustering and pattern recognition techniques', 'Discover hidden patterns in geographic data', 'ml', '4-5 hours'),
(22, 4, 'Feature Engineering for Spatial ML', 'Creating meaningful features from geographic data', 'Extract valuable insights from spatial attributes', 'ml', '3-4 hours'),
(24, 4, 'Time Series Analysis for GIS', 'Analyzing temporal patterns in spatial data', 'Handle time-dependent geographic phenomena', 'ml', '4-5 hours'),
(26, 4, 'Model Validation & Performance', 'Evaluating ML models with spatial considerations', 'Ensure robust and reliable spatial models', 'ml', '3-4 hours'),

-- Week 7-10: Advanced GeoAI
(29, 5, 'Deep Learning for Remote Sensing', 'CNN and neural networks for satellite image analysis', 'Apply deep learning to satellite imagery', 'geoai', '6-7 hours'),
(31, 5, 'Computer Vision for Geospatial', 'Object detection and image segmentation in geographic context', 'Automatically extract features from imagery', 'geoai', '5-6 hours'),
(33, 5, 'Natural Language Processing for GIS', 'Extract location information from text and social media', 'Mine geographic insights from text data', 'geoai', '4-5 hours'),
(36, 6, 'AI-Powered Spatial Analysis', 'Advanced algorithms for complex spatial problems', 'Solve sophisticated geospatial challenges', 'geoai', '5-6 hours'),
(38, 6, 'Predictive Modeling at Scale', 'Large-scale spatial prediction and forecasting', 'Build enterprise-level predictive systems', 'geoai', '6-7 hours'),
(40, 6, 'Edge AI for Field Applications', 'Deploying AI models for real-time field use', 'Create mobile-ready AI solutions', 'geoai', '4-5 hours'),

-- Week 11-12: Web GIS & Deployment
(43, 7, 'Modern Web GIS Architecture', 'Building scalable web mapping applications', 'Design robust web GIS systems', 'webgis', '5-6 hours'),
(45, 7, 'Interactive Map Development', 'Creating dynamic, user-friendly mapping interfaces', 'Build engaging web mapping experiences', 'webgis', '4-5 hours'),
(47, 7, 'API Integration & Services', 'Connecting to external data sources and services', 'Integrate diverse geospatial APIs', 'webgis', '3-4 hours'),
(50, 8, 'Cloud Deployment & Scaling', 'Deploying GeoAI solutions to cloud platforms', 'Launch production-ready applications', 'webgis', '4-5 hours'),
(52, 8, 'Performance Optimization', 'Optimizing web GIS applications for speed and efficiency', 'Ensure optimal user experience', 'webgis', '3-4 hours'),
(54, 8, 'Portfolio Project Presentation', 'Showcase your complete GeoAI project to industry experts', 'Demonstrate mastery through real-world projects', 'webgis', '2-3 hours');

-- Create course cohorts table for countdown timer
CREATE TABLE public.course_cohorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  enrollment_deadline DATE,
  max_students INTEGER DEFAULT 50,
  current_enrollments INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming', -- upcoming, active, completed, cancelled
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for cohorts
ALTER TABLE public.course_cohorts ENABLE ROW LEVEL SECURITY;

-- Public can view active cohorts
CREATE POLICY "Anyone can view active cohorts" 
ON public.course_cohorts 
FOR SELECT 
USING (status IN ('upcoming', 'active'));

-- Admins can manage cohorts
CREATE POLICY "Admins can manage cohorts" 
ON public.course_cohorts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Insert sample cohort
INSERT INTO public.course_cohorts (name, start_date, end_date, enrollment_deadline, price, status) VALUES
('GeoAI Mastery Program - Q3 2025', '2025-08-15', '2025-11-15', '2025-08-01', 2999.00, 'upcoming');