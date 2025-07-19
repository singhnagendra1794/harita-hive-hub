-- Create saved_jobs table for users to save projects
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id TEXT NOT NULL,
  project_data JSONB NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_jobs
CREATE POLICY "Users can manage their own saved jobs" 
ON public.saved_jobs 
FOR ALL 
USING (auth.uid() = user_id);

-- Create external_projects table to store scraped/fetched projects
CREATE TABLE IF NOT EXISTS public.external_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min NUMERIC,
  budget_max NUMERIC,
  budget_type TEXT DEFAULT 'fixed',
  currency TEXT DEFAULT 'USD',
  deadline DATE,
  duration TEXT,
  skills TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'intermediate',
  location TEXT,
  is_remote BOOLEAN DEFAULT true,
  client_name TEXT,
  client_rating NUMERIC,
  applicants_count INTEGER DEFAULT 0,
  apply_url TEXT,
  posted_date TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(external_id, platform)
);

-- Enable RLS
ALTER TABLE public.external_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for external_projects
CREATE POLICY "Anyone can view active external projects" 
ON public.external_projects 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage external projects" 
ON public.external_projects 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create application_tracking table
CREATE TABLE IF NOT EXISTS public.application_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT 'external', -- 'external' or 'internal'
  platform TEXT,
  application_method TEXT, -- 'direct', 'redirect', 'internal'
  status TEXT DEFAULT 'applied', -- 'applied', 'in_review', 'accepted', 'rejected'
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.application_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for application_tracking
CREATE POLICY "Users can manage their own applications" 
ON public.application_tracking 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_external_projects_platform ON public.external_projects(platform);
CREATE INDEX IF NOT EXISTS idx_external_projects_active ON public.external_projects(is_active);
CREATE INDEX IF NOT EXISTS idx_external_projects_posted_date ON public.external_projects(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_application_tracking_user_id ON public.application_tracking(user_id);