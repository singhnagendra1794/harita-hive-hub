-- Create user_activities table to track all platform activities
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('tool_upload', 'code_share', 'note_share', 'challenge_join', 'post_create', 'comment_create', 'like_give', 'course_complete')),
  points_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_leaderboard_stats table for aggregated points
CREATE TABLE IF NOT EXISTS public.user_leaderboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  tool_uploads INTEGER DEFAULT 0,
  code_shares INTEGER DEFAULT 0,
  note_shares INTEGER DEFAULT 0,
  challenge_participations INTEGER DEFAULT 0,
  post_creations INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  likes_given INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  featured_week DATE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_badges table for achievement system
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('featured_contributor', 'creator_week', 'most_insightful', 'toolsmith', 'challenger', 'community_star')),
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_leaderboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_activities
CREATE POLICY "Users can view all activities" ON public.user_activities
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own activities" ON public.user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_leaderboard_stats
CREATE POLICY "Users can view all leaderboard stats" ON public.user_leaderboard_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own stats" ON public.user_leaderboard_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON public.user_leaderboard_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_badges
CREATE POLICY "Users can view all badges" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage badges" ON public.user_badges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_user_leaderboard_stats_total_points ON public.user_leaderboard_stats(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_leaderboard_stats_weekly_points ON public.user_leaderboard_stats(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);

-- Function to update leaderboard stats when activity is recorded
CREATE OR REPLACE FUNCTION public.update_leaderboard_stats()
RETURNS TRIGGER AS $$
DECLARE
  week_start DATE;
  month_start DATE;
BEGIN
  -- Calculate week and month start dates
  week_start := date_trunc('week', NEW.created_at)::date;
  month_start := date_trunc('month', NEW.created_at)::date;
  
  -- Insert or update user leaderboard stats
  INSERT INTO public.user_leaderboard_stats (
    user_id, 
    total_points,
    weekly_points,
    monthly_points,
    tool_uploads,
    code_shares,
    note_shares,
    challenge_participations,
    post_creations,
    comments,
    likes_given,
    courses_completed
  ) VALUES (
    NEW.user_id,
    NEW.points_earned,
    CASE WHEN NEW.created_at >= week_start THEN NEW.points_earned ELSE 0 END,
    CASE WHEN NEW.created_at >= month_start THEN NEW.points_earned ELSE 0 END,
    CASE WHEN NEW.activity_type = 'tool_upload' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'code_share' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'note_share' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'challenge_join' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'post_create' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'comment_create' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'like_give' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'course_complete' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = user_leaderboard_stats.total_points + NEW.points_earned,
    weekly_points = CASE 
      WHEN NEW.created_at >= week_start 
      THEN user_leaderboard_stats.weekly_points + NEW.points_earned 
      ELSE user_leaderboard_stats.weekly_points 
    END,
    monthly_points = CASE 
      WHEN NEW.created_at >= month_start 
      THEN user_leaderboard_stats.monthly_points + NEW.points_earned 
      ELSE user_leaderboard_stats.monthly_points 
    END,
    tool_uploads = user_leaderboard_stats.tool_uploads + CASE WHEN NEW.activity_type = 'tool_upload' THEN 1 ELSE 0 END,
    code_shares = user_leaderboard_stats.code_shares + CASE WHEN NEW.activity_type = 'code_share' THEN 1 ELSE 0 END,
    note_shares = user_leaderboard_stats.note_shares + CASE WHEN NEW.activity_type = 'note_share' THEN 1 ELSE 0 END,
    challenge_participations = user_leaderboard_stats.challenge_participations + CASE WHEN NEW.activity_type = 'challenge_join' THEN 1 ELSE 0 END,
    post_creations = user_leaderboard_stats.post_creations + CASE WHEN NEW.activity_type = 'post_create' THEN 1 ELSE 0 END,
    comments = user_leaderboard_stats.comments + CASE WHEN NEW.activity_type = 'comment_create' THEN 1 ELSE 0 END,
    likes_given = user_leaderboard_stats.likes_given + CASE WHEN NEW.activity_type = 'like_give' THEN 1 ELSE 0 END,
    courses_completed = user_leaderboard_stats.courses_completed + CASE WHEN NEW.activity_type = 'course_complete' THEN 1 ELSE 0 END,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update leaderboard stats
CREATE TRIGGER update_leaderboard_stats_trigger
  AFTER INSERT ON public.user_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leaderboard_stats();

-- Function to track user activity with points
CREATE OR REPLACE FUNCTION public.track_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
DECLARE
  points INTEGER;
BEGIN
  -- Define points for each activity type
  points := CASE p_activity_type
    WHEN 'tool_upload' THEN 10
    WHEN 'code_share' THEN 5
    WHEN 'note_share' THEN 7
    WHEN 'challenge_join' THEN 8
    WHEN 'post_create' THEN 3
    WHEN 'comment_create' THEN 2
    WHEN 'like_give' THEN 1
    WHEN 'course_complete' THEN 15
    ELSE 0
  END;
  
  -- Insert the activity
  INSERT INTO public.user_activities (user_id, activity_type, points_earned, metadata)
  VALUES (p_user_id, p_activity_type, points, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset weekly points (to be called by cron job)
CREATE OR REPLACE FUNCTION public.reset_weekly_points()
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_leaderboard_stats 
  SET weekly_points = 0, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly points (to be called by cron job)
CREATE OR REPLACE FUNCTION public.reset_monthly_points()
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_leaderboard_stats 
  SET monthly_points = 0, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;