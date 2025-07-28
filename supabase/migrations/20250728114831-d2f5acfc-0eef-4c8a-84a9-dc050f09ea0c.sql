-- Create YouTube Live Schedule table
CREATE TABLE public.youtube_live_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end_time TIMESTAMP WITH TIME ZONE,
  privacy_status TEXT NOT NULL DEFAULT 'unlisted',
  thumbnail_url TEXT,
  
  -- YouTube API data
  youtube_broadcast_id TEXT,
  youtube_stream_id TEXT,
  stream_url TEXT,
  stream_key TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, live, ended, cancelled
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  
  -- OBS integration
  obs_scene_name TEXT DEFAULT 'GEOVA_Live',
  obs_configured BOOLEAN DEFAULT false,
  obs_auto_start BOOLEAN DEFAULT true,
  
  -- Recording data
  recording_url TEXT,
  recording_youtube_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.youtube_live_schedule ENABLE ROW LEVEL SECURITY;

-- Super admin can manage all schedules
CREATE POLICY "Super admin can manage YouTube live schedules"
ON public.youtube_live_schedule
FOR ALL
USING (is_super_admin());

-- Professional users can view live schedules
CREATE POLICY "Professional users can view YouTube live schedules"
ON public.youtube_live_schedule
FOR SELECT
USING (user_has_premium_access(auth.uid()));

-- Create OBS configuration table
CREATE TABLE public.obs_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  websocket_url TEXT NOT NULL DEFAULT 'ws://localhost:4455',
  websocket_password TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Scene templates
  default_scene TEXT DEFAULT 'GEOVA_Live',
  recording_settings JSONB DEFAULT '{"format": "mp4", "quality": "high"}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for OBS config
ALTER TABLE public.obs_configurations ENABLE ROW LEVEL SECURITY;

-- Only super admin can manage OBS configurations
CREATE POLICY "Super admin can manage OBS configurations"
ON public.obs_configurations
FOR ALL
USING (is_super_admin());

-- Create YouTube API integration tracking
CREATE TABLE public.youtube_api_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.youtube_live_schedule(id),
  operation_type TEXT NOT NULL, -- create_broadcast, create_stream, start_stream, stop_stream
  youtube_response JSONB,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for API operations
ALTER TABLE public.youtube_api_operations ENABLE ROW LEVEL SECURITY;

-- Super admin can view API operations
CREATE POLICY "Super admin can view YouTube API operations"
ON public.youtube_api_operations
FOR SELECT
USING (is_super_admin());

-- Add triggers for updated_at
CREATE TRIGGER update_youtube_live_schedule_updated_at
BEFORE UPDATE ON public.youtube_live_schedule
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_obs_configurations_updated_at
BEFORE UPDATE ON public.obs_configurations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default OBS configuration
INSERT INTO public.obs_configurations (name, websocket_url, default_scene)
VALUES ('Default OBS Setup', 'ws://localhost:4455', 'GEOVA_Live');