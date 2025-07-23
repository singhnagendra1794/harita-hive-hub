-- Enhanced live streaming infrastructure for AWS integration

-- Create AWS streaming configuration table
CREATE TABLE public.aws_streaming_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medialive_channel_id TEXT NOT NULL,
  medialive_input_id TEXT NOT NULL,
  s3_bucket_name TEXT NOT NULL,
  cloudfront_distribution_id TEXT NOT NULL,
  rtmp_endpoint TEXT NOT NULL,
  hls_playback_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced live classes for AWS integration
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS aws_stream_id UUID REFERENCES public.aws_streaming_config(id);
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS recording_s3_key TEXT;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS hls_manifest_url TEXT;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS viewer_count INTEGER DEFAULT 0;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS geova_session_data JSONB DEFAULT '{}';

-- GEOVA class schedule table
CREATE TABLE public.geova_class_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_title TEXT NOT NULL,
  class_description TEXT,
  scheduled_time TIME NOT NULL DEFAULT '05:00:00', -- 5:00 AM IST
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  curriculum_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stream monitoring and analytics
CREATE TABLE public.stream_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.live_classes(id),
  event_type TEXT NOT NULL, -- 'stream_start', 'stream_end', 'viewer_join', 'viewer_leave'
  event_data JSONB DEFAULT '{}',
  viewer_count INTEGER DEFAULT 0,
  bitrate INTEGER,
  quality_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin stream controls
CREATE TABLE public.stream_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.live_classes(id),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'start', 'stop', 'restart', 'emergency_stop'
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aws_streaming_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geova_class_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_controls ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage AWS streaming config" 
ON public.aws_streaming_config 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));

CREATE POLICY "Admins can manage GEOVA schedule" 
ON public.geova_class_schedule 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));

CREATE POLICY "Anyone can view active GEOVA schedule" 
ON public.geova_class_schedule 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can view all stream analytics" 
ON public.stream_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));

CREATE POLICY "Admins can manage stream controls" 
ON public.stream_controls 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));

-- Functions for stream management
CREATE OR REPLACE FUNCTION public.start_aws_stream(
  p_class_id UUID,
  p_admin_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  stream_config RECORD;
  result JSONB;
BEGIN
  -- Get AWS config
  SELECT * INTO stream_config 
  FROM aws_streaming_config 
  WHERE is_active = true 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'No active AWS streaming configuration found');
  END IF;
  
  -- Update class status
  UPDATE live_classes 
  SET 
    status = 'live',
    start_time = now(),
    aws_stream_id = stream_config.id,
    hls_manifest_url = stream_config.hls_playback_url
  WHERE id = p_class_id;
  
  -- Log control action
  INSERT INTO stream_controls (class_id, admin_user_id, action)
  VALUES (p_class_id, p_admin_user_id, 'start');
  
  -- Log analytics
  INSERT INTO stream_analytics (class_id, event_type, event_data)
  VALUES (p_class_id, 'stream_start', jsonb_build_object('timestamp', now()));
  
  result := jsonb_build_object(
    'success', true,
    'rtmp_endpoint', stream_config.rtmp_endpoint,
    'hls_url', stream_config.hls_playback_url,
    'stream_key', 'class_' || p_class_id::text
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.stop_aws_stream(
  p_class_id UUID,
  p_admin_user_id UUID,
  p_recording_s3_key TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update class status
  UPDATE live_classes 
  SET 
    status = 'ended',
    end_time = now(),
    recording_s3_key = p_recording_s3_key
  WHERE id = p_class_id;
  
  -- Log control action
  INSERT INTO stream_controls (class_id, admin_user_id, action)
  VALUES (p_class_id, p_admin_user_id, 'stop');
  
  -- Log analytics
  INSERT INTO stream_analytics (class_id, event_type, event_data)
  VALUES (p_class_id, 'stream_end', jsonb_build_object('timestamp', now()));
  
  RETURN jsonb_build_object('success', true, 'message', 'Stream ended successfully');
END;
$$;

-- Function to schedule GEOVA classes
CREATE OR REPLACE FUNCTION public.create_geova_daily_class() RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  class_id UUID;
  today_schedule RECORD;
BEGIN
  -- Get today's schedule
  SELECT * INTO today_schedule 
  FROM geova_class_schedule 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active GEOVA schedule found';
  END IF;
  
  -- Create live class
  INSERT INTO live_classes (
    title,
    description,
    starts_at,
    status,
    access_tier,
    instructor,
    is_ai_generated,
    geova_session_data
  ) VALUES (
    today_schedule.class_title,
    today_schedule.class_description,
    (CURRENT_DATE + today_schedule.scheduled_time)::timestamp with time zone,
    'scheduled',
    'free',
    'GEOVA AI',
    true,
    today_schedule.curriculum_data
  ) RETURNING id INTO class_id;
  
  RETURN class_id;
END;
$$;

-- Triggers for analytics
CREATE OR REPLACE FUNCTION public.update_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE live_classes 
  SET viewer_count = (
    SELECT COALESCE(MAX(viewer_count), 0)
    FROM stream_analytics 
    WHERE class_id = NEW.class_id
    AND event_type IN ('viewer_join', 'viewer_count_update')
  )
  WHERE id = NEW.class_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_class_viewer_count
  AFTER INSERT ON stream_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_viewer_count();

-- Insert default GEOVA schedule
INSERT INTO public.geova_class_schedule (
  class_title,
  class_description,
  curriculum_data
) VALUES (
  'Daily GEOVA AI Class',
  'AI-powered geospatial technology learning session with interactive Q&A',
  jsonb_build_object(
    'topics', ARRAY['GIS Fundamentals', 'Remote Sensing', 'Spatial Analysis', 'Python for GIS'],
    'duration_minutes', 120,
    'interaction_enabled', true,
    'voice_model', 'alloy',
    'language', 'en'
  )
);