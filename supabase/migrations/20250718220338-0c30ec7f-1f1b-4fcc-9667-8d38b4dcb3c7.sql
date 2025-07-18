-- Create community posts table for discussions
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for community posts
CREATE POLICY "Anyone can view community posts" 
ON public.community_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.community_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create creator applications table
CREATE TABLE IF NOT EXISTS public.creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  areas_of_interest TEXT[] DEFAULT '{}',
  portfolio_url TEXT,
  github_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for creator applications
CREATE POLICY "Anyone can apply to become creator" 
ON public.creator_applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all applications" 
ON public.creator_applications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create creator stats table for featured creators
CREATE TABLE IF NOT EXISTS public.creator_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  posts_count INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  featured_week DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for creator stats
CREATE POLICY "Anyone can view creator stats" 
ON public.creator_stats 
FOR SELECT 
USING (true);

-- Create referral usage table
CREATE TABLE IF NOT EXISTS public.referral_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referee_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  reward_granted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for referral usage
CREATE POLICY "Users can view their own referral usage" 
ON public.referral_usage 
FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "System can insert referral usage" 
ON public.referral_usage 
FOR INSERT 
WITH CHECK (true);

-- Create trending topics table
CREATE TABLE IF NOT EXISTS public.trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('skill', 'technology', 'keyword')),
  count INTEGER DEFAULT 1,
  trend_direction TEXT DEFAULT 'stable' CHECK (trend_direction IN ('up', 'down', 'stable')),
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;

-- Create policy for trending topics
CREATE POLICY "Anyone can view trending topics" 
ON public.trending_topics 
FOR SELECT 
USING (true);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_stats_updated_at
    BEFORE UPDATE ON public.creator_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();