-- Create labs table with pre-configured environments
CREATE TABLE IF NOT EXISTS public.labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  lab_type TEXT NOT NULL CHECK (lab_type IN ('qgis', 'jupyter', 'sentinelhub', 'custom')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  tools TEXT[] NOT NULL DEFAULT '{}',
  topics TEXT[] NOT NULL DEFAULT '{}',
  runtime_host TEXT NOT NULL,
  default_data JSONB DEFAULT '{}',
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lab_sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS public.lab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id UUID NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  runtime_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'expired', 'failed')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lab_usage table for quota tracking
CREATE TABLE IF NOT EXISTS public.lab_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id UUID NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.lab_sessions(id) ON DELETE SET NULL,
  duration_seconds INTEGER,
  credits_consumed DECIMAL(10,2) DEFAULT 0,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for labs
CREATE POLICY "Anyone can view active labs"
  ON public.labs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage labs"
  ON public.labs FOR ALL
  USING (is_admin_secure());

-- RLS Policies for lab_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.lab_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.lab_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.lab_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.lab_sessions FOR SELECT
  USING (is_admin_secure());

-- RLS Policies for lab_usage
CREATE POLICY "Users can view their own usage"
  ON public.lab_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.lab_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
  ON public.lab_usage FOR SELECT
  USING (is_admin_secure());

-- Create indexes for performance
CREATE INDEX idx_lab_sessions_user_id ON public.lab_sessions(user_id);
CREATE INDEX idx_lab_sessions_status ON public.lab_sessions(status);
CREATE INDEX idx_lab_sessions_expires_at ON public.lab_sessions(expires_at);
CREATE INDEX idx_lab_usage_user_id ON public.lab_usage(user_id);
CREATE INDEX idx_lab_usage_date ON public.lab_usage(usage_date);

-- Insert initial lab environments
INSERT INTO public.labs (name, description, lab_type, difficulty, duration_minutes, tools, topics, runtime_host, thumbnail_url, default_data) VALUES
(
  'QGIS + PostGIS Sandbox',
  'Professional desktop GIS with spatial database integration. Perfect for advanced vector/raster analysis, cartography, and spatial queries.',
  'qgis',
  'intermediate',
  90,
  ARRAY['QGIS', 'PostGIS', 'pgAdmin'],
  ARRAY['GIS', 'Spatial Database', 'Cartography'],
  'https://qgis-sandbox.haritahive.internal',
  '/images/qgis-lab.png',
  '{"preloaded_datasets": ["world_cities", "admin_boundaries", "satellite_basemap"], "plugins": ["QuickMapServices", "SRTM Downloader"]}'
),
(
  'Python Geo Lab (Jupyter)',
  'Cloud-based Jupyter environment with GeoPandas, Rasterio, and Folium. Write Python code for geospatial analysis and visualization.',
  'jupyter',
  'beginner',
  60,
  ARRAY['Jupyter', 'Python', 'GeoPandas', 'Folium'],
  ARRAY['Python', 'Data Analysis', 'Visualization'],
  'https://jupyter-geo.haritahive.internal',
  '/images/jupyter-lab.png',
  '{"notebooks": ["intro_to_geopandas.ipynb", "raster_analysis.ipynb"], "sample_data": ["india_states.geojson", "landsat_sample.tif"]}'
),
(
  'Satellite Analysis (SentinelHub)',
  'Access live Sentinel-2 and Landsat imagery. Calculate NDVI, NDWI, and other spectral indices with real-time satellite data.',
  'sentinelhub',
  'advanced',
  45,
  ARRAY['SentinelHub API', 'NDVI Calculator', 'Cloud Masking'],
  ARRAY['Remote Sensing', 'Satellite Imagery', 'NDVI'],
  'https://sentinel-lab.haritahive.internal',
  '/images/sentinel-lab.png',
  '{"coverage": "global", "satellites": ["Sentinel-2", "Landsat-8"], "max_cloud_cover": 20}'
);

-- Function to check lab session quota
CREATE OR REPLACE FUNCTION public.check_lab_quota(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tier TEXT;
  monthly_limit INTEGER;
  current_usage INTEGER;
  result JSONB;
BEGIN
  -- Get user subscription tier
  SELECT subscription_tier INTO user_tier
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  -- Set limits based on tier
  CASE 
    WHEN user_tier = 'free' THEN monthly_limit := 3;
    WHEN user_tier = 'premium' THEN monthly_limit := 10;
    WHEN user_tier = 'pro' THEN monthly_limit := 50;
    WHEN user_tier = 'enterprise' THEN monthly_limit := -1; -- unlimited
    ELSE monthly_limit := 0;
  END CASE;
  
  -- Count sessions this month
  SELECT COUNT(*)
  INTO current_usage
  FROM public.lab_sessions
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', now());
  
  -- Build result
  result := jsonb_build_object(
    'subscription_tier', user_tier,
    'monthly_limit', monthly_limit,
    'current_usage', current_usage,
    'can_launch', CASE 
      WHEN monthly_limit = -1 THEN true
      WHEN current_usage < monthly_limit THEN true
      ELSE false
    END,
    'remaining', CASE
      WHEN monthly_limit = -1 THEN -1
      ELSE GREATEST(0, monthly_limit - current_usage)
    END
  );
  
  RETURN result;
END;
$$;

-- Function to update session timestamps
CREATE OR REPLACE FUNCTION public.update_lab_session_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_lab_sessions_updated_at
  BEFORE UPDATE ON public.lab_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lab_session_timestamp();