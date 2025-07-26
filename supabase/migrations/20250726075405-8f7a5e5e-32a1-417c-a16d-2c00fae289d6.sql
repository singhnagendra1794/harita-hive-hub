-- COMPREHENSIVE AUTH SYSTEM FIX + WORLDWIDE SUPPORT + STREAMING SETUP

-- 1. FIX AUTH TRIGGER (CRITICAL)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. WORLDWIDE SUPPORT - USER LOCATION TRACKING
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location_country TEXT,
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_detected_at TIMESTAMP WITH TIME ZONE;

-- 3. LIVE STREAMING INFRASTRUCTURE SETUP

-- Ensure live_classes table has all needed fields
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS aws_stream_id UUID REFERENCES public.aws_streaming_config(id),
ADD COLUMN IF NOT EXISTS hls_manifest_url TEXT,
ADD COLUMN IF NOT EXISTS rtmp_endpoint TEXT DEFAULT 'rtmp://live-stream.haritahive.com/live';

-- Create live_recordings table for recording storage
CREATE TABLE IF NOT EXISTS public.live_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.live_classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  speaker TEXT DEFAULT 'GEOVA AI',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  stream_url TEXT,
  s3_url TEXT,
  cloudfront_url TEXT,
  recording_status TEXT DEFAULT 'processing' CHECK (recording_status IN ('processing', 'ready', 'failed')),
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on live_recordings
ALTER TABLE public.live_recordings ENABLE ROW LEVEL SECURITY;

-- RLS policies for live_recordings (authenticated users can view)
CREATE POLICY "Authenticated users can view recordings" 
ON public.live_recordings 
FOR SELECT 
TO authenticated
USING (true);

-- Admins can manage recordings
CREATE POLICY "Admins can manage recordings" 
ON public.live_recordings 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- 4. AWS STREAMING CONFIG SETUP
INSERT INTO public.aws_streaming_config (
  rtmp_endpoint,
  hls_playback_url,
  s3_bucket_name,
  cloudfront_distribution_id,
  medialive_channel_id,
  medialive_input_id,
  is_active
) VALUES (
  'rtmp://live-stream.haritahive.com/live',
  'https://d3k8h9k5j2l1m9.cloudfront.net',
  'haritahive-live-recordings',
  'E1A2B3C4D5F6G7',
  'ml-channel-001',
  'ml-input-001',
  true
) ON CONFLICT DO NOTHING;

-- 5. STREAM SESSIONS TABLE ENHANCEMENT
ALTER TABLE public.stream_sessions 
ADD COLUMN IF NOT EXISTS recording_s3_key TEXT,
ADD COLUMN IF NOT EXISTS recording_cloudfront_url TEXT,
ADD COLUMN IF NOT EXISTS viewer_analytics JSONB DEFAULT '{}';

-- 6. AUTOMATED CLASS SCHEDULING FUNCTION
CREATE OR REPLACE FUNCTION public.create_daily_live_class()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  class_id UUID;
  today_date DATE := CURRENT_DATE;
  class_time TIME := '05:00:00'; -- 5 AM daily
BEGIN
  -- Check if class already exists for today
  SELECT id INTO class_id 
  FROM live_classes 
  WHERE DATE(starts_at) = today_date 
  AND status IN ('scheduled', 'live')
  LIMIT 1;
  
  -- Create new class if none exists
  IF class_id IS NULL THEN
    INSERT INTO live_classes (
      title,
      description,
      starts_at,
      status,
      access_tier,
      instructor,
      is_ai_generated
    ) VALUES (
      'Daily GIS Mastery Session with GEOVA',
      'Interactive AI-powered learning session covering geospatial concepts, tools, and practical applications',
      (today_date + class_time)::timestamp with time zone,
      'scheduled',
      'free',
      'GEOVA AI',
      true
    ) RETURNING id INTO class_id;
  END IF;
  
  RETURN class_id;
END;
$$;

-- 7. PASSWORD VALIDATION FUNCTION
CREATE OR REPLACE FUNCTION public.validate_password(password_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{"valid": true, "errors": []}'::jsonb;
  errors TEXT[] := '{}';
BEGIN
  -- Check minimum length
  IF LENGTH(password_input) < 8 THEN
    errors := array_append(errors, 'Password must be at least 8 characters long');
  END IF;
  
  -- Check for at least one uppercase letter
  IF password_input !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for at least one lowercase letter
  IF password_input !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for at least one number
  IF password_input !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for at least one special character
  IF password_input !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object(
      'valid', false,
      'errors', to_jsonb(errors)
    );
  END IF;
  
  RETURN result;
END;
$$;

-- 8. EMAIL DOMAIN VALIDATION FOR INTERNATIONAL USERS
CREATE OR REPLACE FUNCTION public.is_valid_email_domain(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow all major international domains
  RETURN email_input ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    AND email_input !~* '@(tempmail|guerrillamail|10minutemail|throwaway)';
END;
$$;

-- 9. TRIGGERS FOR AUTOMATIC UPDATES
CREATE OR REPLACE FUNCTION update_live_recordings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_live_recordings_updated_at ON public.live_recordings;
CREATE TRIGGER update_live_recordings_updated_at
  BEFORE UPDATE ON public.live_recordings
  FOR EACH ROW EXECUTE FUNCTION update_live_recordings_timestamp();

-- Verify trigger creation
SELECT 
  trigger_name, 
  trigger_schema,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';