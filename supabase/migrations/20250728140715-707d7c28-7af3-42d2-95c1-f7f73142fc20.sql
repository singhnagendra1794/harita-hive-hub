-- Create YouTube OAuth tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.youtube_oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create YouTube live schedule table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.youtube_live_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_broadcast_id TEXT UNIQUE NOT NULL,
  youtube_stream_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'overridden')),
  rtmp_url TEXT,
  stream_key TEXT,
  thumbnail_url TEXT,
  recording_available BOOLEAN DEFAULT false,
  recording_url TEXT,
  created_by TEXT DEFAULT 'admin',
  is_override BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.youtube_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_live_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies for YouTube OAuth tokens (Super admin only)
CREATE POLICY "Super admin can manage YouTube OAuth tokens" 
ON public.youtube_oauth_tokens 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

-- Create policies for YouTube live schedule
CREATE POLICY "Anyone can view YouTube live schedule" 
ON public.youtube_live_schedule 
FOR SELECT 
USING (true);

CREATE POLICY "Super admin can manage YouTube live schedule" 
ON public.youtube_live_schedule 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

-- Insert placeholder YouTube OAuth token for admin (will be replaced with real tokens)
INSERT INTO public.youtube_oauth_tokens (user_id, access_token, refresh_token)
VALUES ('admin', 'placeholder_access_token', 'placeholder_refresh_token')
ON CONFLICT (user_id) DO NOTHING;