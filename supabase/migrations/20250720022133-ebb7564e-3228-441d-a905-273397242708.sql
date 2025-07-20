-- Create streaming infrastructure for OBS integration

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.stream_sessions CASCADE;
DROP TABLE IF EXISTS public.stream_keys CASCADE;

-- Create stream_keys table
CREATE TABLE public.stream_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stream_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Create stream_sessions table
CREATE TABLE public.stream_sessions (
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
CREATE POLICY "Users can view their own stream keys"
  ON public.stream_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stream keys"
  ON public.stream_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stream keys"
  ON public.stream_keys FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for stream_sessions
CREATE POLICY "Users can view their own stream sessions"
  ON public.stream_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stream sessions"
  ON public.stream_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stream sessions"
  ON public.stream_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone can view live public streams
CREATE POLICY "Anyone can view live public streams"
  ON public.stream_sessions FOR SELECT
  USING (status = 'live');

-- Create or replace the generate_stream_key function
CREATE OR REPLACE FUNCTION public.generate_stream_key(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_key TEXT;
BEGIN
  -- Generate a secure random stream key
  new_key := 'sk_' || encode(gen_random_bytes(16), 'hex');
  
  -- Insert or update the stream key for the user
  INSERT INTO public.stream_keys (user_id, stream_key)
  VALUES (p_user_id, new_key)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    stream_key = EXCLUDED.stream_key,
    updated_at = now(),
    is_active = true;
  
  RETURN new_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to start a stream session
CREATE OR REPLACE FUNCTION public.start_stream_session(
  p_user_id UUID,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  session_id UUID;
  user_stream_key TEXT;
BEGIN
  -- Get or generate stream key for user
  SELECT stream_key INTO user_stream_key
  FROM public.stream_keys 
  WHERE user_id = p_user_id AND is_active = true;
  
  IF user_stream_key IS NULL THEN
    user_stream_key := public.generate_stream_key(p_user_id);
  END IF;
  
  -- Create new session
  INSERT INTO public.stream_sessions (
    user_id, 
    title, 
    description, 
    status,
    rtmp_endpoint,
    started_at
  )
  VALUES (
    p_user_id, 
    COALESCE(p_title, 'Live Stream'), 
    p_description,
    'preparing',
    'rtmp://stream.haritahive.com/live/' || user_stream_key,
    now()
  )
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update stream status
CREATE OR REPLACE FUNCTION public.update_stream_status(
  p_session_id UUID,
  p_status TEXT,
  p_viewer_count INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.stream_sessions 
  SET 
    status = p_status,
    viewer_count = COALESCE(p_viewer_count, viewer_count),
    updated_at = now(),
    ended_at = CASE WHEN p_status = 'ended' THEN now() ELSE ended_at END
  WHERE id = p_session_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;