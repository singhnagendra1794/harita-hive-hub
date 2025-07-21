-- Create live_sessions table
CREATE TABLE public.live_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  stream_key TEXT NOT NULL UNIQUE,
  is_live BOOLEAN NOT NULL DEFAULT false,
  hls_url TEXT,
  recorded_url TEXT,
  instructor_name TEXT,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  thumbnail_url TEXT,
  viewer_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view live sessions" 
ON public.live_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create sessions" 
ON public.live_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update their own sessions" 
ON public.live_sessions 
FOR UPDATE 
USING (auth.uid() = instructor_id);

-- Create function to generate unique stream key
CREATE OR REPLACE FUNCTION public.generate_session_stream_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'session_' || encode(gen_random_bytes(12), 'hex');
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_live_sessions_updated_at
BEFORE UPDATE ON public.live_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();