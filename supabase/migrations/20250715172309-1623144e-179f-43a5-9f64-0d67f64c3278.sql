-- Create user profiles table for public profiles (only if not exists)
CREATE TABLE IF NOT EXISTS public.user_profiles (
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

-- Create user achievements/badges table (only if not exists)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  icon_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create tool showcases table (only if not exists)
CREATE TABLE IF NOT EXISTS public.tool_showcases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
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

-- Create showcase likes table (only if not exists)
CREATE TABLE IF NOT EXISTS public.showcase_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  showcase_id UUID NOT NULL REFERENCES public.tool_showcases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(showcase_id, user_id)
);

-- Create user followers table (only if not exists)
CREATE TABLE IF NOT EXISTS public.user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create sharing analytics table (only if not exists)
CREATE TABLE IF NOT EXISTS public.sharing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on new tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_showcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sharing_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.user_profiles FOR SELECT 
  USING (public_profile = true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own profile" 
  ON public.user_profiles FOR ALL 
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create RLS policies for user_achievements
DO $$ BEGIN
  CREATE POLICY "Achievements are viewable by everyone" 
  ON public.user_achievements FOR SELECT 
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own achievements" 
  ON public.user_achievements FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create RLS policies for tool_showcases
DO $$ BEGIN
  CREATE POLICY "Showcases are viewable by everyone" 
  ON public.tool_showcases FOR SELECT 
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own showcases" 
  ON public.tool_showcases FOR ALL 
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create RLS policies for showcase_likes
DO $$ BEGIN
  CREATE POLICY "Likes are viewable by everyone" 
  ON public.showcase_likes FOR SELECT 
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own likes" 
  ON public.showcase_likes FOR ALL 
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create RLS policies for user_followers
DO $$ BEGIN
  CREATE POLICY "Followers are viewable by everyone" 
  ON public.user_followers FOR SELECT 
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own follows" 
  ON public.user_followers FOR ALL 
  USING (auth.uid() = follower_id OR auth.uid() = following_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create RLS policies for sharing_analytics
DO $$ BEGIN
  CREATE POLICY "Users can view all sharing analytics" 
  ON public.sharing_analytics FOR SELECT 
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert sharing analytics" 
  ON public.sharing_analytics FOR INSERT 
  WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;