-- Create job listings table for geospatial jobs
CREATE TABLE IF NOT EXISTS job_listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  job_type text NOT NULL, -- 'full-time', 'part-time', 'contract', 'internship'
  experience_level text, -- 'entry', 'mid', 'senior', 'expert'
  salary_min integer,
  salary_max integer,
  currency text DEFAULT 'INR',
  description text NOT NULL,
  requirements text[],
  skills text[],
  apply_url text NOT NULL,
  external_job_id text UNIQUE, -- To prevent duplicates
  source_platform text NOT NULL, -- 'linkedin', 'naukri', 'indeed', etc.
  is_remote boolean DEFAULT false,
  is_india_focused boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  posted_date timestamp with time zone,
  expires_date timestamp with time zone,
  ai_relevance_score numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create saved jobs table for users
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES job_listings(id) ON DELETE CASCADE,
  saved_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Create job applications table for tracking
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES job_listings(id) ON DELETE CASCADE,
  applied_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'applied', -- 'applied', 'interviewing', 'rejected', 'accepted'
  notes text,
  UNIQUE(user_id, job_id)
);

-- Create job fetch logs table for tracking updates
CREATE TABLE IF NOT EXISTS job_fetch_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fetch_type text NOT NULL, -- 'manual', 'scheduled', 'ai'
  jobs_fetched integer DEFAULT 0,
  jobs_added integer DEFAULT 0,
  jobs_updated integer DEFAULT 0,
  status text DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  error_message text,
  fetch_duration_ms integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_fetch_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_listings
CREATE POLICY "Anyone can view active job listings"
ON job_listings FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage job listings"
ON job_listings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- RLS Policies for saved_jobs
CREATE POLICY "Users can manage their own saved jobs"
ON saved_jobs FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for job_applications
CREATE POLICY "Users can manage their own job applications"
ON job_applications FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for job_fetch_logs
CREATE POLICY "Admins can view job fetch logs"
ON job_fetch_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_job_listings_location ON job_listings(location);
CREATE INDEX idx_job_listings_job_type ON job_listings(job_type);
CREATE INDEX idx_job_listings_is_india_focused ON job_listings(is_india_focused);
CREATE INDEX idx_job_listings_is_remote ON job_listings(is_remote);
CREATE INDEX idx_job_listings_skills ON job_listings USING GIN(skills);
CREATE INDEX idx_job_listings_posted_date ON job_listings(posted_date DESC);
CREATE INDEX idx_job_listings_ai_relevance_score ON job_listings(ai_relevance_score DESC);

-- Insert some sample job data for India-focused geospatial positions
INSERT INTO job_listings (
  title, company, location, job_type, experience_level, 
  salary_min, salary_max, description, requirements, skills,
  apply_url, external_job_id, source_platform, is_remote, 
  is_india_focused, is_verified, posted_date, ai_relevance_score
) VALUES 
(
  'GIS Analyst - Smart Cities Project',
  'Ministry of Housing and Urban Affairs',
  'New Delhi, India',
  'full-time',
  'mid',
  800000,
  1200000,
  'Work on Smart Cities Mission projects using GIS technology for urban planning and development. Analyze spatial data and create maps for government decision-making.',
  ARRAY['Bachelor''s degree in Geography/GIS', '3+ years GIS experience', 'Government sector experience preferred'],
  ARRAY['ArcGIS', 'QGIS', 'Urban Planning', 'Spatial Analysis', 'Government Projects'],
  'https://www.sarkariresult.com/gis-analyst-smart-cities',
  'gov_smart_cities_gis_001',
  'government',
  false,
  true,
  true,
  now() - interval '2 days',
  95
),
(
  'Remote Sensing Specialist - ISRO Project',
  'Indian Space Research Organisation (ISRO)',
  'Bangalore, India',
  'full-time',
  'senior',
  1500000,
  2200000,
  'Lead satellite data analysis projects for agricultural monitoring and disaster management. Work with cutting-edge Earth observation technologies.',
  ARRAY['M.Tech/PhD in Remote Sensing', '5+ years satellite data experience', 'Research publications preferred'],
  ARRAY['Remote Sensing', 'Satellite Data', 'Python', 'ENVI', 'Google Earth Engine'],
  'https://www.isro.gov.in/careers/remote-sensing-specialist',
  'isro_rs_specialist_001',
  'government',
  false,
  true,
  true,
  now() - interval '1 day',
  98
),
(
  'GeoAI Developer - Startup',
  'MapMyIndia (CE Info Systems)',
  'Gurgaon, India',
  'full-time',
  'mid',
  1200000,
  1800000,
  'Develop AI-powered geospatial solutions for navigation and location-based services. Work on machine learning models for spatial data.',
  ARRAY['Computer Science/GIS background', 'Python/JavaScript proficiency', 'ML experience with spatial data'],
  ARRAY['Python', 'Machine Learning', 'GeoAI', 'TensorFlow', 'PostGIS', 'JavaScript'],
  'https://www.naukri.com/job-listings/geoai-developer-mapmyindia',
  'mmi_geoai_dev_001',
  'naukri',
  true,
  true,
  true,
  now() - interval '3 hours',
  92
),
(
  'Junior GIS Analyst - Environmental Consulting',
  'Environmental Resources Management (ERM)',
  'Mumbai, India',
  'full-time',
  'entry',
  600000,
  900000,
  'Entry-level position for fresh graduates in environmental impact assessment projects. Learn GIS applications in environmental consulting.',
  ARRAY['Bachelor''s in Environmental Science/Geography', 'Basic GIS knowledge', 'Fresh graduates welcome'],
  ARRAY['ArcGIS', 'Environmental Analysis', 'Field Work', 'Data Collection'],
  'https://www.linkedin.com/jobs/view/junior-gis-analyst-erm',
  'erm_junior_gis_001',
  'linkedin',
  false,
  true,
  true,
  now() - interval '6 hours',
  88
);