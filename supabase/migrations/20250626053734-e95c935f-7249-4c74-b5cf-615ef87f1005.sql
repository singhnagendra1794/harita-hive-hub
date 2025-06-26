
-- Create app roles enum including beta tester (if not exists)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'beta_tester', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user roles table for role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles (with IF NOT EXISTS equivalent)
DO $$ BEGIN
    CREATE POLICY "Users can view their own roles" ON public.user_roles
      FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage all roles" ON public.user_roles
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
      );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create beta waitlist table
CREATE TABLE IF NOT EXISTS public.beta_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  referral_source TEXT,
  signup_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'converted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invited_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on beta_waitlist
ALTER TABLE public.beta_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies for beta_waitlist
DO $$ BEGIN
    CREATE POLICY "Allow public beta waitlist signup" ON public.beta_waitlist
      FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can view all waitlist" ON public.beta_waitlist
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
      );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update existing user_referrals table if needed
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- Create content shares tracking
CREATE TABLE IF NOT EXISTS public.content_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  share_platform TEXT NOT NULL, -- 'linkedin', 'twitter', 'email', 'copy_link'
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  share_data JSONB DEFAULT '{}'
);

-- Enable RLS on content_shares
ALTER TABLE public.content_shares ENABLE ROW LEVEL SECURITY;

-- Create policy for content_shares
DO $$ BEGIN
    CREATE POLICY "Users can manage their own shares" ON public.content_shares
      FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create beta analytics table
CREATE TABLE IF NOT EXISTS public.beta_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  metric_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  date_bucket DATE DEFAULT CURRENT_DATE
);

-- Enable RLS on beta_analytics
ALTER TABLE public.beta_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for beta_analytics
DO $$ BEGIN
    CREATE POLICY "Admins can view analytics" ON public.beta_analytics
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
      );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_email ON public.beta_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_status ON public.beta_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.user_referrals(status);
CREATE INDEX IF NOT EXISTS idx_content_shares_user_content ON public.content_shares(user_id, content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_beta_analytics_metric_date ON public.beta_analytics(metric_name, date_bucket);
