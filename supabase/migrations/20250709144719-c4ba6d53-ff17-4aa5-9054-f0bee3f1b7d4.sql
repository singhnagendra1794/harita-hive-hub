
-- Create tables for GIS talent/resume bank
CREATE TABLE public.gis_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  bio TEXT,
  skills TEXT[],
  tools TEXT[],
  location TEXT,
  experience_level TEXT DEFAULT 'entry',
  available_for_hire BOOLEAN DEFAULT false,
  hourly_rate NUMERIC,
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job postings table
CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  remote_allowed BOOLEAN DEFAULT false,
  salary_min NUMERIC,
  salary_max NUMERIC,
  required_skills TEXT[],
  experience_level TEXT,
  employment_type TEXT DEFAULT 'full-time',
  is_premium BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create corporate training modules table
CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_hours INTEGER,
  price NUMERIC,
  is_custom BOOLEAN DEFAULT false,
  syllabus JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create GIS tools/marketplace table
CREATE TABLE public.gis_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC DEFAULT 0,
  download_url TEXT,
  tool_type TEXT, -- 'script', 'plugin', 'template', 'dataset'
  programming_language TEXT,
  compatible_software TEXT[],
  downloads_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create freelance projects table
CREATE TABLE public.freelance_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min NUMERIC,
  budget_max NUMERIC,
  deadline DATE,
  required_skills TEXT[],
  difficulty_level TEXT DEFAULT 'intermediate',
  status TEXT DEFAULT 'open',
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project applications table
CREATE TABLE public.project_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.freelance_projects(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proposal TEXT NOT NULL,
  quoted_price NUMERIC,
  estimated_days INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create certifications table
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  badge_url TEXT,
  requirements JSONB,
  price NUMERIC DEFAULT 0,
  is_blockchain_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user certifications table
CREATE TABLE public.user_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  certification_id UUID REFERENCES public.certifications(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  certificate_url TEXT,
  blockchain_hash TEXT,
  UNIQUE(user_id, certification_id)
);

-- Create company subscriptions table
CREATE TABLE public.company_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_type TEXT NOT NULL, -- 'talent_access', 'premium_listings', 'training'
  status TEXT DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  monthly_fee NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.gis_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelance_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for GIS Profiles
CREATE POLICY "Anyone can view public profiles" ON public.gis_profiles
  FOR SELECT USING (available_for_hire = true);

CREATE POLICY "Users can manage their own profile" ON public.gis_profiles
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Job Postings
CREATE POLICY "Anyone can view active job postings" ON public.job_postings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Companies can manage their own postings" ON public.job_postings
  FOR ALL USING (auth.uid() = company_id);

-- RLS Policies for Training Modules
CREATE POLICY "Anyone can view training modules" ON public.training_modules
  FOR SELECT USING (true);

-- RLS Policies for GIS Tools
CREATE POLICY "Anyone can view tools" ON public.gis_tools
  FOR SELECT USING (true);

CREATE POLICY "Creators can manage their tools" ON public.gis_tools
  FOR ALL USING (auth.uid() = creator_id);

-- RLS Policies for Freelance Projects
CREATE POLICY "Anyone can view open projects" ON public.freelance_projects
  FOR SELECT USING (status = 'open');

CREATE POLICY "Clients can manage their projects" ON public.freelance_projects
  FOR ALL USING (auth.uid() = client_id);

-- RLS Policies for Project Applications
CREATE POLICY "Freelancers can manage their applications" ON public.project_applications
  FOR ALL USING (auth.uid() = freelancer_id);

CREATE POLICY "Clients can view applications to their projects" ON public.project_applications
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.freelance_projects 
    WHERE id = project_id AND client_id = auth.uid()
  ));

-- RLS Policies for Certifications
CREATE POLICY "Anyone can view certifications" ON public.certifications
  FOR SELECT USING (true);

-- RLS Policies for User Certifications
CREATE POLICY "Users can view their own certifications" ON public.user_certifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can earn certifications" ON public.user_certifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Company Subscriptions
CREATE POLICY "Companies can manage their subscriptions" ON public.company_subscriptions
  FOR ALL USING (auth.uid() = company_id);

-- Create indexes for performance
CREATE INDEX idx_gis_profiles_skills ON public.gis_profiles USING GIN(skills);
CREATE INDEX idx_gis_profiles_location ON public.gis_profiles(location);
CREATE INDEX idx_job_postings_skills ON public.job_postings USING GIN(required_skills);
CREATE INDEX idx_job_postings_location ON public.job_postings(location);
CREATE INDEX idx_gis_tools_category ON public.gis_tools(category);
CREATE INDEX idx_freelance_projects_skills ON public.freelance_projects USING GIN(required_skills);
