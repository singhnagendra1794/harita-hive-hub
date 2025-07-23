-- Create GIS marketplace subscription system tables

-- Table for storing GIS marketplace tool details  
CREATE TABLE IF NOT EXISTS public.gis_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price_usd DECIMAL(10,2) DEFAULT 14.99,
  price_inr DECIMAL(10,2) DEFAULT 1249,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT,
  file_path TEXT, -- Path to tool files in storage
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  programming_language TEXT,
  compatible_software TEXT[], -- Array of compatible software
  is_qgis_compatible BOOLEAN DEFAULT false,
  is_offline_capable BOOLEAN DEFAULT false,
  includes_sample_data BOOLEAN DEFAULT false,
  includes_documentation BOOLEAN DEFAULT false,
  file_size_mb DECIMAL(8,2),
  version TEXT DEFAULT '1.0',
  requirements TEXT,
  license_type TEXT DEFAULT 'Commercial',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

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
ALTER TABLE public.gis_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_marketplace_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_marketplace_user_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_tool_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_tool_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_tool_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gis_tools
CREATE POLICY "Anyone can view active tools" ON public.gis_tools
  FOR SELECT USING (is_active = true);

CREATE POLICY "Creators can manage their own tools" ON public.gis_tools
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all tools" ON public.gis_tools
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

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

-- Function to auto-expire subscriptions
CREATE OR REPLACE FUNCTION public.expire_gis_marketplace_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.gis_marketplace_subscriptions
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' 
    AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- Trigger to update rating statistics
CREATE OR REPLACE FUNCTION public.update_gis_tool_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.gis_tools
  SET 
    rating = (
      SELECT ROUND(AVG(rating::DECIMAL), 2)
      FROM public.gis_tool_ratings
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.gis_tool_ratings
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
    )
  WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_gis_tool_ratings
  AFTER INSERT OR UPDATE OR DELETE ON public.gis_tool_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_gis_tool_rating_stats();

-- Trigger to update download count
CREATE OR REPLACE FUNCTION public.update_gis_tool_download_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.gis_tools
  SET download_count = download_count + 1
  WHERE id = NEW.tool_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_gis_tool_downloads
  AFTER INSERT ON public.gis_tool_downloads
  FOR EACH ROW EXECUTE FUNCTION public.update_gis_tool_download_count();

-- Insert sample tools
INSERT INTO public.gis_tools (
  title, description, category, author_name, programming_language, 
  compatible_software, is_qgis_compatible, is_offline_capable, 
  includes_sample_data, includes_documentation, file_size_mb, 
  requirements, is_featured
) VALUES
(
  'Advanced Spatial Analysis Toolkit',
  'Complete toolkit for advanced spatial analysis including clustering, hotspot analysis, and network analysis tools. Includes Python scripts, QGIS plugins, and sample datasets.',
  'Analysis',
  'GeoSpatial Pro',
  'Python',
  ARRAY['QGIS', 'ArcGIS', 'PostGIS'],
  true,
  true,
  true,
  true,
  45.2,
  'QGIS 3.0+, Python 3.7+',
  true
),
(
  'Land Use Classification Scripts',
  'Machine learning scripts for automated land use classification from satellite imagery. Works offline with any GIS software and includes pre-trained models.',
  'Machine Learning',
  'Dr. Sarah Chen',
  'Python',
  ARRAY['QGIS', 'R Studio', 'Google Earth Engine'],
  true,
  true,
  true,
  true,
  67.8,
  'Python 3.8+, scikit-learn, GDAL',
  false
),
(
  'Web Mapping Dashboard Template',
  'Complete responsive web mapping dashboard template with admin panel and user management. QGIS-compatible data processing scripts included.',
  'Web Development',
  'WebGIS Solutions',
  'JavaScript',
  ARRAY['QGIS', 'Leaflet', 'Mapbox', 'OpenLayers'],
  true,
  false,
  true,
  true,
  23.4,
  'Node.js 16+, QGIS 3.0+',
  true
);