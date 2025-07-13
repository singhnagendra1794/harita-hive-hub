-- Create tables for all 5 high-impact features

-- 1. AI-Powered Skill Assessment & Roadmap Generator
CREATE TABLE public.user_learning_roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  field_of_interest TEXT NOT NULL,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  career_goal TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}',
  roadmap_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Geospatial Project Templates Gallery
CREATE TABLE public.project_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  preview_url TEXT,
  resource_url TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'intermediate',
  created_by UUID,
  is_featured BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Student Leaderboard + Challenge of the Week
CREATE TABLE public.weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  submission_link TEXT NOT NULL,
  description TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE public.challenge_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  submission_id UUID NOT NULL REFERENCES public.challenge_submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, submission_id)
);

-- 4. Geospatial Internship & Job Board
CREATE TABLE public.job_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT DEFAULT 'full-time',
  experience_level TEXT,
  salary_range TEXT,
  tags TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  requirements TEXT,
  apply_url TEXT NOT NULL,
  posted_by UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Company Dashboards for Skill Scouting
CREATE TABLE public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  account_status TEXT DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.student_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  skills TEXT[] DEFAULT '{}',
  projects JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  resume_url TEXT,
  portfolio_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  bio TEXT,
  availability TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.interview_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  job_id UUID REFERENCES public.job_listings(id) ON DELETE SET NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  interview_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_learning_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_learning_roadmaps
CREATE POLICY "Users can view their own roadmaps" ON public.user_learning_roadmaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roadmaps" ON public.user_learning_roadmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps" ON public.user_learning_roadmaps
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for project_templates
CREATE POLICY "Anyone can view active project templates" ON public.project_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage project templates" ON public.project_templates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

-- RLS Policies for weekly_challenges
CREATE POLICY "Anyone can view active challenges" ON public.weekly_challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage challenges" ON public.weekly_challenges
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

-- RLS Policies for challenge_submissions
CREATE POLICY "Anyone can view submissions" ON public.challenge_submissions
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own submissions" ON public.challenge_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" ON public.challenge_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for challenge_votes
CREATE POLICY "Users can view all votes" ON public.challenge_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" ON public.challenge_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for job_listings
CREATE POLICY "Anyone can view active job listings" ON public.job_listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Companies can manage their job listings" ON public.job_listings
  FOR ALL USING (auth.uid() = posted_by);

CREATE POLICY "Admins can manage all job listings" ON public.job_listings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

-- RLS Policies for company_profiles
CREATE POLICY "Companies can view their own profile" ON public.company_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Companies can update their own profile" ON public.company_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Students can view active company profiles" ON public.company_profiles
  FOR SELECT USING (account_status = 'active');

-- RLS Policies for student_portfolios
CREATE POLICY "Students can view their own portfolio" ON public.student_portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can manage their own portfolio" ON public.student_portfolios
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Companies can view student portfolios" ON public.student_portfolios
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM company_profiles 
    WHERE user_id = auth.uid() AND account_status = 'active'
  ));

-- RLS Policies for interview_invitations
CREATE POLICY "Companies can view their own invitations" ON public.interview_invitations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM company_profiles 
    WHERE id = company_id AND user_id = auth.uid()
  ));

CREATE POLICY "Students can view invitations sent to them" ON public.interview_invitations
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Companies can create invitations" ON public.interview_invitations
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM company_profiles 
    WHERE id = company_id AND user_id = auth.uid()
  ));

CREATE POLICY "Students can update invitation responses" ON public.interview_invitations
  FOR UPDATE USING (auth.uid() = student_id);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_learning_roadmaps_updated_at
  BEFORE UPDATE ON public.user_learning_roadmaps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_templates_updated_at
  BEFORE UPDATE ON public.project_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_challenges_updated_at
  BEFORE UPDATE ON public.weekly_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenge_submissions_updated_at
  BEFORE UPDATE ON public.challenge_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON public.job_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_portfolios_updated_at
  BEFORE UPDATE ON public.student_portfolios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interview_invitations_updated_at
  BEFORE UPDATE ON public.interview_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update vote counts
CREATE OR REPLACE FUNCTION public.update_submission_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenge_submissions 
    SET votes = votes + 1 
    WHERE id = NEW.submission_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenge_submissions 
    SET votes = GREATEST(votes - 1, 0) 
    WHERE id = OLD.submission_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_votes_count
  AFTER INSERT OR DELETE ON public.challenge_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_submission_votes();