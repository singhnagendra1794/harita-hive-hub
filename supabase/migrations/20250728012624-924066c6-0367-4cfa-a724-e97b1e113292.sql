-- Create live_streams table for better stream management
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  embed_url TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 90,
  is_free BOOLEAN DEFAULT false,
  is_home_featured BOOLEAN DEFAULT false,
  platform TEXT CHECK (platform IN ('youtube', 'aws', 'obs')) DEFAULT 'youtube',
  stream_server_url TEXT,
  stream_key TEXT,
  status TEXT CHECK (status IN ('scheduled', 'live', 'ended')) DEFAULT 'scheduled',
  viewer_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_recordings table for storing recordings
CREATE TABLE IF NOT EXISTS public.class_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT,
  aws_url TEXT,
  s3_key TEXT,
  cloudfront_url TEXT,
  thumbnail_url TEXT,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_video_source CHECK (
    (youtube_url IS NOT NULL AND aws_url IS NULL) OR 
    (youtube_url IS NULL AND aws_url IS NOT NULL)
  )
);

-- Create youtube_stream_config table for OBS/YouTube streaming
CREATE TABLE IF NOT EXISTS public.youtube_stream_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_name TEXT NOT NULL,
  youtube_stream_url TEXT NOT NULL,
  youtube_stream_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_stream_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for live_streams
CREATE POLICY "Admins can manage all live streams" 
ON public.live_streams FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Anyone can view public live streams" 
ON public.live_streams FOR SELECT 
USING (status IN ('live', 'scheduled'));

-- Create RLS policies for class_recordings
CREATE POLICY "Admins can manage all recordings" 
ON public.class_recordings FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Anyone can view public recordings" 
ON public.class_recordings FOR SELECT 
USING (is_public = true);

-- Create RLS policies for youtube_stream_config
CREATE POLICY "Admins can manage YouTube stream config" 
ON public.youtube_stream_config FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create indexes for better performance
CREATE INDEX idx_live_streams_start_time ON public.live_streams(start_time);
CREATE INDEX idx_live_streams_status ON public.live_streams(status);
CREATE INDEX idx_class_recordings_created_at ON public.class_recordings(created_at);
CREATE INDEX idx_class_recordings_view_count ON public.class_recordings(view_count);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_live_streams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_recordings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER trigger_live_streams_updated_at
  BEFORE UPDATE ON public.live_streams
  FOR EACH ROW
  EXECUTE FUNCTION update_live_streams_updated_at();

CREATE TRIGGER trigger_recordings_updated_at
  BEFORE UPDATE ON public.class_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_recordings_updated_at();