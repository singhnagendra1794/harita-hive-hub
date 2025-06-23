
-- Enable the vector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create user analytics and behavior tracking
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'video_watch', 'note_create', 'search', etc.
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user progress tracking
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL, -- 'course', 'video', 'tutorial'
  content_id TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0, -- in seconds
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Create saved content/bookmarks
CREATE TABLE public.saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL, -- 'note', 'code_snippet', 'video', 'tutorial'
  content_id UUID NOT NULL,
  collection_name TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Create notification preferences and delivery
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  class_reminders BOOLEAN DEFAULT true,
  content_updates BOOLEAN DEFAULT true,
  newsletter BOOLEAN DEFAULT true,
  marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'class_reminder', 'new_content', 'achievement', etc.
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create premium subscription tracking
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL, -- 'free', 'professional', 'enterprise'
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT, -- 'upi', 'paypal'
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create learning paths and recommendations
CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  estimated_hours INTEGER DEFAULT 0,
  content_order JSONB DEFAULT '[]', -- Array of content IDs in order
  tags TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, learning_path_id)
);

-- Create AI search index for notes and code (now with vector extension enabled)
CREATE TABLE public.search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'note', 'code_snippet', 'video', 'tutorial'
  content_id UUID NOT NULL,
  title TEXT,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  embedding VECTOR(1536), -- OpenAI embedding dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create automated tasks tracking
CREATE TABLE public.automated_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL, -- 'newsletter', 'class_reminder', 'content_sync'
  task_name TEXT NOT NULL,
  schedule_expression TEXT, -- cron expression
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'failed'
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user engagement scores
CREATE TABLE public.user_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  engagement_score INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_time_spent INTEGER DEFAULT 0, -- in seconds
  content_created INTEGER DEFAULT 0,
  content_consumed INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific data
CREATE POLICY "Users can view their own analytics" ON public.user_analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own saved content" ON public.saved_content FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view learning paths" ON public.learning_paths FOR SELECT USING (true);
CREATE POLICY "Users can manage their own learning paths" ON public.user_learning_paths FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can search all indexed content" ON public.search_index FOR SELECT USING (true);
CREATE POLICY "Users can view their own engagement" ON public.user_engagement FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX idx_user_analytics_event_type ON public.user_analytics(event_type);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_saved_content_user_id ON public.saved_content(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_search_content_type ON public.search_index(content_type);

-- Create function to update user engagement automatically
CREATE OR REPLACE FUNCTION public.update_user_engagement()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_engagement (user_id, last_activity)
  VALUES (NEW.user_id, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    last_activity = now(),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update engagement
CREATE TRIGGER update_engagement_on_analytics
  AFTER INSERT ON public.user_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_user_engagement();

CREATE TRIGGER update_engagement_on_progress
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_user_engagement();
