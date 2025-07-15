-- Create user profiles table for public profiles
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  website TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  public_profile BOOLEAN DEFAULT true,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  badge_count INTEGER DEFAULT 0,
  tools_contributed INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user achievements/badges table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- 'course_completed', 'tool_downloaded', 'project_uploaded', etc.
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  icon_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create user referrals table
CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referred_email TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'rewarded'
  reward_type TEXT, -- 'free_plugin', 'wallet_credit', 'premium_month'
  reward_amount NUMERIC DEFAULT 0,
  reward_status TEXT DEFAULT 'pending', -- 'pending', 'granted', 'used'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create tool showcases table
CREATE TABLE public.tool_showcases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL, -- matches plugin id
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  screenshot_url TEXT,
  project_url TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create showcase likes table
CREATE TABLE public.showcase_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  showcase_id UUID NOT NULL REFERENCES public.tool_showcases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(showcase_id, user_id)
);

-- Create user followers table
CREATE TABLE public.user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create sharing analytics table
CREATE TABLE public.sharing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'tool', 'profile', 'course', 'showcase'
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'facebook', 'copy_link'
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_showcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sharing_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.user_profiles FOR SELECT 
USING (public_profile = true);

CREATE POLICY "Users can manage their own profile" 
ON public.user_profiles FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for user_achievements
CREATE POLICY "Achievements are viewable by everyone" 
ON public.user_achievements FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_referrals
CREATE POLICY "Users can view their own referrals" 
ON public.user_referrals FOR SELECT 
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals" 
ON public.user_referrals FOR INSERT 
WITH CHECK (auth.uid() = referrer_id);

-- Create RLS policies for tool_showcases
CREATE POLICY "Showcases are viewable by everyone" 
ON public.tool_showcases FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own showcases" 
ON public.tool_showcases FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for showcase_likes
CREATE POLICY "Likes are viewable by everyone" 
ON public.showcase_likes FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own likes" 
ON public.showcase_likes FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for user_followers
CREATE POLICY "Followers are viewable by everyone" 
ON public.user_followers FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own follows" 
ON public.user_followers FOR ALL 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Create RLS policies for sharing_analytics
CREATE POLICY "Users can view all sharing analytics" 
ON public.sharing_analytics FOR SELECT 
USING (true);

CREATE POLICY "Users can insert sharing analytics" 
ON public.sharing_analytics FOR INSERT 
WITH CHECK (true);

-- Create functions for updating counters
CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update following count for follower
    UPDATE public.user_profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
    -- Update follower count for followed user
    UPDATE public.user_profiles 
    SET follower_count = follower_count + 1 
    WHERE user_id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update following count for follower
    UPDATE public.user_profiles 
    SET following_count = GREATEST(following_count - 1, 0) 
    WHERE user_id = OLD.follower_id;
    
    -- Update follower count for followed user
    UPDATE public.user_profiles 
    SET follower_count = GREATEST(follower_count - 1, 0) 
    WHERE user_id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follower counts
CREATE TRIGGER update_follower_counts_trigger
  AFTER INSERT OR DELETE ON public.user_followers
  FOR EACH ROW EXECUTE FUNCTION public.update_follower_counts();

-- Create function for updating showcase likes
CREATE OR REPLACE FUNCTION public.update_showcase_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tool_showcases 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.showcase_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tool_showcases 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.showcase_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for showcase likes
CREATE TRIGGER update_showcase_likes_count_trigger
  AFTER INSERT OR DELETE ON public.showcase_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_showcase_likes_count();

-- Generate referral code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'HH' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tool_showcases_updated_at
  BEFORE UPDATE ON public.tool_showcases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();