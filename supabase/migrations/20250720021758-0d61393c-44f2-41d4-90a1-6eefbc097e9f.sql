-- Create streaming infrastructure for OBS integration

-- Drop existing constraints if they exist
ALTER TABLE IF EXISTS public.stream_keys DROP CONSTRAINT IF EXISTS unique_user_stream_key;

-- Create stream_keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stream_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stream_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create unique constraint on user_id (one stream key per user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_stream_keys_user_id ON public.stream_keys(user_id);

-- Create stream_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stream_key_id UUID REFERENCES public.stream_keys(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'live', 'ended', 'error')),
  viewer_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  rtmp_endpoint TEXT,
  hls_endpoint TEXT,
  recording_url TEXT
);

-- Enable RLS
ALTER TABLE public.stream_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stream_keys
DROP POLICY IF EXISTS "Users can view their own stream keys" ON public.stream_keys;
CREATE POLICY "Users can view their own stream keys"
  ON public.stream_keys FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own stream keys" ON public.stream_keys;
CREATE POLICY "Users can create their own stream keys"
  ON public.stream_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stream keys" ON public.stream_keys;
CREATE POLICY "Users can update their own stream keys"
  ON public.stream_keys FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for stream_sessions
DROP POLICY IF EXISTS "Users can view their own stream sessions" ON public.stream_sessions;
CREATE POLICY "Users can view their own stream sessions"
  ON public.stream_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own stream sessions" ON public.stream_sessions;
CREATE POLICY "Users can create their own stream sessions"
  ON public.stream_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stream sessions" ON public.stream_sessions;
CREATE POLICY "Users can update their own stream sessions"
  ON public.stream_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone can view live public streams
DROP POLICY IF EXISTS "Anyone can view live public streams" ON public.stream_sessions;
CREATE POLICY "Anyone can view live public streams"
  ON public.stream_sessions FOR SELECT
  USING (status = 'live');