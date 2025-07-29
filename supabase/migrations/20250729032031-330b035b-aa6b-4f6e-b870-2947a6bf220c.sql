-- Create GEOVA live sessions table
CREATE TABLE public.geova_live_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type TEXT NOT NULL DEFAULT 'private', -- 'private' or 'group'
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT DEFAULT 'GEOVA AI',
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended', 'recording'
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 0,
  max_participants INTEGER DEFAULT 1,
  current_participants INTEGER DEFAULT 0,
  youtube_stream_key TEXT,
  youtube_url TEXT,
  hls_endpoint TEXT,
  rtmp_endpoint TEXT,
  avatar_config JSONB DEFAULT '{"enabled": true, "gender": "male", "accent": "indian_english"}',
  whiteboard_data JSONB DEFAULT '{}',
  chat_messages JSONB DEFAULT '[]',
  recording_url TEXT,
  recording_duration INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.geova_live_sessions ENABLE ROW LEVEL SECURITY;

-- Create session participants table
CREATE TABLE public.geova_session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.geova_live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  participation_duration INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  questions_asked INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.geova_session_participants ENABLE ROW LEVEL SECURITY;

-- Create GEOVA recordings table
CREATE TABLE public.geova_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.geova_live_sessions(id),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  file_size_bytes BIGINT DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  topics_covered TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'beginner',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.geova_recordings ENABLE ROW LEVEL SECURITY;

-- Create AI avatar settings table
CREATE TABLE public.geova_avatar_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  avatar_name TEXT NOT NULL DEFAULT 'GEOVA',
  gender TEXT NOT NULL DEFAULT 'male',
  accent TEXT NOT NULL DEFAULT 'indian_english',
  voice_provider TEXT NOT NULL DEFAULT 'eleven_labs',
  voice_id TEXT,
  avatar_provider TEXT NOT NULL DEFAULT 'did',
  avatar_id TEXT,
  avatar_video_url TEXT,
  personality_traits JSONB DEFAULT '{"teaching_style": "adaptive", "expertise_level": "expert", "communication": "friendly"}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.geova_avatar_settings ENABLE ROW LEVEL SECURITY;

-- Create recording analytics table
CREATE TABLE public.recording_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.geova_recordings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- 'view_start', 'view_end', 'pause', 'resume', 'seek'
  timestamp_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recording_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for geova_live_sessions
CREATE POLICY "Anyone can view active sessions" ON public.geova_live_sessions
  FOR SELECT USING (status IN ('live', 'scheduled'));

CREATE POLICY "Admins can manage all sessions" ON public.geova_live_sessions
  FOR ALL USING (is_admin_secure() OR is_super_admin_secure());

CREATE POLICY "Users can join sessions" ON public.geova_live_sessions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for geova_session_participants
CREATE POLICY "Users can view their own participation" ON public.geova_session_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join sessions" ON public.geova_session_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all participants" ON public.geova_session_participants
  FOR SELECT USING (is_admin_secure() OR is_super_admin_secure());

-- RLS Policies for geova_recordings
CREATE POLICY "Anyone can view public recordings" ON public.geova_recordings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Premium users can view all recordings" ON public.geova_recordings
  FOR SELECT USING (user_has_premium_access(auth.uid()));

CREATE POLICY "Admins can manage recordings" ON public.geova_recordings
  FOR ALL USING (is_admin_secure() OR is_super_admin_secure());

-- RLS Policies for geova_avatar_settings
CREATE POLICY "Anyone can view active avatar settings" ON public.geova_avatar_settings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage avatar settings" ON public.geova_avatar_settings
  FOR ALL USING (is_admin_secure() OR is_super_admin_secure());

-- RLS Policies for recording_analytics
CREATE POLICY "Users can create their own analytics" ON public.recording_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON public.recording_analytics
  FOR SELECT USING (is_admin_secure() OR is_super_admin_secure());

-- Create function to track recording views
CREATE OR REPLACE FUNCTION public.track_recording_view(
  p_recording_id UUID,
  p_user_id UUID,
  p_event_type TEXT,
  p_timestamp_seconds INTEGER DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Insert analytics event
  INSERT INTO public.recording_analytics (recording_id, user_id, event_type, timestamp_seconds)
  VALUES (p_recording_id, p_user_id, p_event_type, p_timestamp_seconds);
  
  -- Update view count if it's a view start event
  IF p_event_type = 'view_start' THEN
    UPDATE public.geova_recordings 
    SET views_count = views_count + 1 
    WHERE id = p_recording_id;
  END IF;
END;
$$;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_geova_recordings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_geova_recordings_updated_at
  BEFORE UPDATE ON public.geova_recordings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_geova_recordings_updated_at();