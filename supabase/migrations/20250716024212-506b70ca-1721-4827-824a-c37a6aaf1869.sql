-- Skill Intelligence Engine tables
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5) DEFAULT 1,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.skill_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'course', 'tool', 'job', 'project'
  content_id TEXT NOT NULL,
  score NUMERIC(3,2) DEFAULT 0.5,
  reason TEXT,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Toolkits Hub tables
CREATE TABLE public.toolkit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.toolkits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.toolkit_categories(id),
  download_url TEXT,
  demo_video_url TEXT,
  sample_project_url TEXT,
  tags TEXT[] DEFAULT '{}',
  license_type TEXT DEFAULT 'MIT',
  rating NUMERIC(2,1) DEFAULT 0.0,
  download_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job Discovery Portal tables
CREATE TABLE public.job_postings_ai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  remote_allowed BOOLEAN DEFAULT false,
  description TEXT,
  requirements TEXT,
  skills_required TEXT[] DEFAULT '{}',
  salary_min INTEGER,
  salary_max INTEGER,
  employment_type TEXT DEFAULT 'full-time',
  experience_level TEXT,
  source_url TEXT,
  source_platform TEXT, -- 'linkedin', 'indeed', 'government'
  posted_date DATE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_data JSONB NOT NULL,
  file_url TEXT,
  match_scores JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Project Launcher Studio tables
CREATE TABLE public.project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tools_used TEXT[] DEFAULT '{}',
  github_url TEXT,
  colab_url TEXT,
  demo_url TEXT,
  is_team_project BOOLEAN DEFAULT false,
  team_members JSONB DEFAULT '[]',
  upvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'featured'
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.project_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.project_submissions(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, project_id)
);

CREATE TABLE public.project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.project_submissions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.project_comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Live Sandbox Labs tables
CREATE TABLE public.sandbox_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL, -- 'python', 'earthengine', 'postgis'
  code_content TEXT,
  output_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- GeoAI Experiment Zone tables
CREATE TABLE public.geoai_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experiment_name TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'yolo', 'unet', 'random_forest', 'kmeans'
  input_files JSONB NOT NULL,
  parameters JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  results JSONB,
  confusion_matrix JSONB,
  output_files JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Company Talent Portals tables (extending existing company_profiles)
CREATE TABLE public.talent_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE NOT NULL,
  search_criteria JSONB NOT NULL,
  candidates_shortlisted UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- GeoTalks & Office Hours tables
CREATE TABLE public.geo_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'talk', -- 'talk', 'office_hours', 'workshop'
  host_id UUID REFERENCES auth.users(id),
  youtube_url TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 60,
  max_participants INTEGER,
  registration_required BOOLEAN DEFAULT true,
  is_recorded BOOLEAN DEFAULT true,
  recording_url TEXT,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.geo_events(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  UNIQUE(user_id, event_id)
);

-- Global Dashboard Analytics tables
CREATE TABLE public.platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  dimensions JSONB DEFAULT '{}', -- country, domain, etc.
  recorded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toolkit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toolkits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sandbox_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geoai_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user-specific data
CREATE POLICY "Users can manage their own skills" ON public.user_skills
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own recommendations" ON public.skill_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON public.skill_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view toolkit categories" ON public.toolkit_categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view published toolkits" ON public.toolkits
  FOR SELECT USING (true);

CREATE POLICY "Creators can manage their toolkits" ON public.toolkits
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view job postings" ON public.job_postings_ai
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their resumes" ON public.user_resumes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their projects" ON public.project_submissions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published projects" ON public.project_submissions
  FOR SELECT USING (status = 'published' OR status = 'featured');

CREATE POLICY "Users can manage their votes" ON public.project_votes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view project comments" ON public.project_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their comments" ON public.project_comments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their sandbox sessions" ON public.sandbox_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their experiments" ON public.geoai_experiments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Companies can manage their searches" ON public.talent_searches
  FOR ALL USING (auth.uid() = (SELECT user_id FROM public.company_profiles WHERE id = company_id));

CREATE POLICY "Anyone can view events" ON public.geo_events
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage their events" ON public.geo_events
  FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "Users can manage their registrations" ON public.event_registrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view platform analytics" ON public.platform_analytics
  FOR SELECT USING (true);

-- Insert some initial data
INSERT INTO public.toolkit_categories (name, description, icon) VALUES
  ('Agriculture', 'Precision farming, crop monitoring, and yield prediction tools', '🌾'),
  ('Urban Planning', 'Smart city development and urban analysis tools', '🏙️'),
  ('Forestry', 'Forest monitoring, deforestation tracking, and conservation', '🌲'),
  ('Risk Mapping', 'Disaster risk assessment and emergency response tools', '⚠️'),
  ('Climate', 'Climate change analysis and environmental monitoring', '🌡️'),
  ('Water Resources', 'Hydrology, water quality, and management tools', '💧');

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON public.user_skills FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_toolkits_updated_at BEFORE UPDATE ON public.toolkits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_resumes_updated_at BEFORE UPDATE ON public.user_resumes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_project_submissions_updated_at BEFORE UPDATE ON public.project_submissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_project_comments_updated_at BEFORE UPDATE ON public.project_comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sandbox_sessions_updated_at BEFORE UPDATE ON public.sandbox_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_talent_searches_updated_at BEFORE UPDATE ON public.talent_searches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();