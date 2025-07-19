-- Create job listings table for geospatial jobs (simplified)
CREATE TABLE job_listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  job_type text NOT NULL,
  experience_level text,
  salary_min integer,
  salary_max integer,
  currency text DEFAULT 'INR',
  description text NOT NULL,
  requirements text[],
  skills text[],
  apply_url text NOT NULL,
  external_job_id text UNIQUE,
  source_platform text NOT NULL,
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

-- Create saved jobs table
CREATE TABLE saved_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES job_listings(id) ON DELETE CASCADE,
  saved_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Create job applications table
CREATE TABLE job_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES job_listings(id) ON DELETE CASCADE,
  applied_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'applied',
  notes text,
  UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view job listings"
ON job_listings FOR SELECT
USING (true);

CREATE POLICY "Users can manage their saved jobs"
ON saved_jobs FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their job applications"
ON job_applications FOR ALL
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_job_listings_location ON job_listings(location);
CREATE INDEX idx_job_listings_is_india_focused ON job_listings(is_india_focused);
CREATE INDEX idx_job_listings_posted_date ON job_listings(posted_date DESC);

-- Insert sample data
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
  ARRAY['Bachelor degree in Geography/GIS', '3+ years GIS experience', 'Government sector experience preferred'],
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
  'Remote Sensing Specialist - ISRO',
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
  'GeoAI Developer',
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
  'Junior GIS Analyst - Environmental',
  'Environmental Resources Management (ERM)',
  'Mumbai, India',
  'full-time',
  'entry',
  600000,
  900000,
  'Entry-level position for fresh graduates in environmental impact assessment projects. Learn GIS applications in environmental consulting.',
  ARRAY['Bachelor in Environmental Science/Geography', 'Basic GIS knowledge', 'Fresh graduates welcome'],
  ARRAY['ArcGIS', 'Environmental Analysis', 'Field Work', 'Data Collection'],
  'https://www.linkedin.com/jobs/view/junior-gis-analyst-erm',
  'erm_junior_gis_001',
  'linkedin',
  false,
  true,
  true,
  now() - interval '6 hours',
  88
),
(
  'Spatial Data Engineer - Remote',
  'Swiggy',
  'Remote (India)',
  'full-time',
  'mid',
  1800000,
  2500000,
  'Build and maintain spatial data infrastructure for food delivery optimization. Work with location intelligence and routing algorithms.',
  ARRAY['Software engineering experience', 'PostGIS/Spatial databases', 'Python/Java proficiency'],
  ARRAY['PostGIS', 'Python', 'Spatial Databases', 'Microservices', 'Location Intelligence'],
  'https://careers.swiggy.com/spatial-data-engineer',
  'swiggy_spatial_eng_001',
  'careers_page',
  true,
  true,
  true,
  now() - interval '4 hours',
  94
);