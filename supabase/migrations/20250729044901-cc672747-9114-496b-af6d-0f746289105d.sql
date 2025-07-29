-- Add real-time triggers and enable realtime for live_classes
ALTER TABLE live_classes REPLICA IDENTITY FULL;

-- Add YouTube OAuth tokens table for automatic authentication
CREATE TABLE IF NOT EXISTS youtube_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL DEFAULT 'https://www.googleapis.com/auth/youtube',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add live stream detection table for failover
CREATE TABLE IF NOT EXISTS live_stream_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_live BOOLEAN DEFAULT true,
  viewer_count INTEGER DEFAULT 0,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE youtube_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_detection ENABLE ROW LEVEL SECURITY;

-- RLS policies for OAuth tokens
CREATE POLICY "Users can manage their own OAuth tokens" ON youtube_oauth_tokens
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for live stream detection
CREATE POLICY "Anyone can view live stream detection" ON live_stream_detection
  FOR SELECT USING (true);

CREATE POLICY "System can manage live stream detection" ON live_stream_detection
  FOR ALL USING (true);

-- Add live_classes to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE live_classes;
ALTER PUBLICATION supabase_realtime ADD TABLE live_stream_detection;

-- Function to auto-refresh OAuth tokens
CREATE OR REPLACE FUNCTION refresh_youtube_oauth_token(token_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record RECORD;
BEGIN
  SELECT * INTO token_record FROM youtube_oauth_tokens WHERE id = token_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Token refresh logic would be handled by edge function
  -- This function just validates the token exists
  RETURN TRUE;
END;
$$;

-- Trigger to auto-update live_classes when detection changes
CREATE OR REPLACE FUNCTION sync_live_detection_to_classes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update or insert live class when detection is updated
  INSERT INTO live_classes (
    title,
    description,
    youtube_url,
    embed_url,
    thumbnail_url,
    status,
    starts_at,
    access_tier,
    viewer_count,
    stream_key
  ) VALUES (
    NEW.title,
    NEW.description,
    'https://www.youtube.com/watch?v=' || NEW.youtube_id,
    NEW.embed_url,
    NEW.thumbnail_url,
    CASE WHEN NEW.is_live THEN 'live' ELSE 'ended' END,
    NEW.detected_at,
    'professional',
    NEW.viewer_count,
    NEW.youtube_id
  )
  ON CONFLICT (stream_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    viewer_count = EXCLUDED.viewer_count,
    thumbnail_url = EXCLUDED.thumbnail_url,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_sync_live_detection
  AFTER INSERT OR UPDATE ON live_stream_detection
  FOR EACH ROW
  EXECUTE FUNCTION sync_live_detection_to_classes();