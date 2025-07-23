-- Add missing tables for GIS marketplace subscription system

-- Table for GIS marketplace subscriptions (3-month access)
CREATE TABLE IF NOT EXISTS public.gis_marketplace_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- 90 days from start
  amount_paid DECIMAL(10,2),
  currency TEXT DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for user info collected before checkout
CREATE TABLE IF NOT EXISTS public.gis_marketplace_user_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  occupation TEXT,
  intended_use TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for tool downloads tracking
CREATE TABLE IF NOT EXISTS public.gis_tool_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES public.gis_tools(id) ON DELETE CASCADE NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  download_type TEXT DEFAULT 'subscription' -- 'subscription', 'individual_purchase'
);

-- Table for creator profiles
CREATE TABLE IF NOT EXISTS public.gis_tool_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  portfolio_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  total_tools INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for tool ratings and reviews
CREATE TABLE IF NOT EXISTS public.gis_tool_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES public.gis_tools(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Enable RLS on all tables
ALTER TABLE public.gis_marketplace_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_marketplace_user_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_tool_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_tool_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_tool_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gis_marketplace_subscriptions
CREATE POLICY "Users can view their own subscription" ON public.gis_marketplace_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON public.gis_marketplace_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.gis_marketplace_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for gis_marketplace_user_info
CREATE POLICY "Users can manage their own info" ON public.gis_marketplace_user_info
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for gis_tool_downloads
CREATE POLICY "Users can view their own downloads" ON public.gis_tool_downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads" ON public.gis_tool_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for gis_tool_creators
CREATE POLICY "Anyone can view verified creators" ON public.gis_tool_creators
  FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Users can manage their own creator profile" ON public.gis_tool_creators
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for gis_tool_ratings
CREATE POLICY "Anyone can view ratings" ON public.gis_tool_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own ratings" ON public.gis_tool_ratings
  FOR ALL USING (auth.uid() = user_id);

-- Functions for subscription management
CREATE OR REPLACE FUNCTION public.check_gis_marketplace_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_status TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT status, expires_at
  INTO subscription_status, expires_at
  FROM public.gis_marketplace_subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription found, user has no access
  IF subscription_status IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if subscription is active and not expired
  IF subscription_status = 'active' AND (expires_at IS NULL OR expires_at > now()) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;