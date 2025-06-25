
-- Create user interactions table for tracking engagement
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content_type TEXT NOT NULL, -- 'note', 'code_snippet', 'newsletter', 'class', 'tutorial'
  content_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'bookmark', 'like', 'share', 'download'
  metadata JSONB DEFAULT '{}', -- Store additional context like duration, rating, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user preferences table for personalization
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  preferred_topics TEXT[] DEFAULT '{}', -- Array of preferred topics/tags
  difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  learning_style TEXT DEFAULT 'mixed', -- 'visual', 'hands-on', 'theoretical', 'mixed'
  notification_frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  language_preference TEXT DEFAULT 'en',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create premium content table for content gating
CREATE TABLE public.premium_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  premium_tier TEXT DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(content_type, content_id)
);

-- Create user subscriptions table (enhanced from existing)
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  subscription_tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'premium', 'pro', 'enterprise'
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT, -- 'stripe', 'razorpay', 'manual'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recommendations table for caching AI/algorithm suggestions
CREATE TABLE public.content_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  score DECIMAL(3,2) DEFAULT 0.5, -- Recommendation confidence score 0.0-1.0
  reason TEXT, -- Why this was recommended
  recommended_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  clicked BOOLEAN DEFAULT false,
  dismissed BOOLEAN DEFAULT false
);

-- Enable RLS on all new tables
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_interactions
CREATE POLICY "Users can view their own interactions" 
  ON public.user_interactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions" 
  ON public.user_interactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" 
  ON public.user_interactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for premium_content (public read, creator write)
CREATE POLICY "Anyone can view premium content settings" 
  ON public.premium_content 
  FOR SELECT 
  USING (true);

CREATE POLICY "Creators can manage their premium content" 
  ON public.premium_content 
  FOR ALL 
  USING (auth.uid() = created_by);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" 
  ON public.user_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for content_recommendations
CREATE POLICY "Users can view their own recommendations" 
  ON public.content_recommendations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" 
  ON public.content_recommendations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_interactions_user_content ON public.user_interactions(user_id, content_type, content_id);
CREATE INDEX idx_user_interactions_created_at ON public.user_interactions(created_at DESC);
CREATE INDEX idx_premium_content_lookup ON public.premium_content(content_type, content_id);
CREATE INDEX idx_content_recommendations_user ON public.content_recommendations(user_id, recommended_at DESC);

-- Create function to automatically create user preferences for new users
CREATE OR REPLACE FUNCTION create_user_personalization_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  -- Create user subscription (free tier)
  INSERT INTO public.user_subscriptions (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user personalization setup
CREATE TRIGGER on_auth_user_created_personalization
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_personalization_data();

-- Create function to track user interactions
CREATE OR REPLACE FUNCTION track_user_interaction(
  p_user_id UUID,
  p_content_type TEXT,
  p_content_id TEXT,
  p_interaction_type TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_interactions (user_id, content_type, content_id, interaction_type, metadata)
  VALUES (p_user_id, p_content_type, p_content_id, p_interaction_type, p_metadata)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has premium access
CREATE OR REPLACE FUNCTION user_has_premium_access(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_tier TEXT;
  subscription_status TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT us.subscription_tier, us.status, us.expires_at
  INTO subscription_tier, subscription_status, expires_at
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id;
  
  -- Check if user has active premium subscription
  IF subscription_tier IN ('premium', 'pro', 'enterprise') 
     AND subscription_status = 'active' 
     AND (expires_at IS NULL OR expires_at > now()) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user recommendations
CREATE OR REPLACE FUNCTION get_user_recommendations(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE (
  content_type TEXT,
  content_id TEXT,
  score DECIMAL,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT cr.content_type, cr.content_id, cr.score, cr.reason
  FROM public.content_recommendations cr
  WHERE cr.user_id = p_user_id 
    AND cr.dismissed = false
  ORDER BY cr.score DESC, cr.recommended_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
