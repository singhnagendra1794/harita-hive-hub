-- Create remaining GEOVA tables that don't exist yet
CREATE TABLE IF NOT EXISTS public.geova_live_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type TEXT NOT NULL DEFAULT 'private',
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT DEFAULT 'GEOVA AI',
  status TEXT NOT NULL DEFAULT 'scheduled',
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
CREATE TABLE IF NOT EXISTS public.geova_session_participants (
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

-- Create AI avatar settings table
CREATE TABLE IF NOT EXISTS public.geova_avatar_settings (
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

-- Add RLS policies
CREATE POLICY "Anyone can view active sessions" ON public.geova_live_sessions
  FOR SELECT USING (status IN ('live', 'scheduled'));

CREATE POLICY "Admins can manage all sessions" ON public.geova_live_sessions
  FOR ALL USING (is_admin_secure() OR is_super_admin_secure());

CREATE POLICY "Users can view their own participation" ON public.geova_session_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join sessions" ON public.geova_session_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active avatar settings" ON public.geova_avatar_settings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage avatar settings" ON public.geova_avatar_settings
  FOR ALL USING (is_admin_secure() OR is_super_admin_secure());