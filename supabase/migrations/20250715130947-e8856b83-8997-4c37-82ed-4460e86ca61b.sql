-- Add OBS stream support to live classes
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS stream_key TEXT;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS stream_url TEXT;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS stream_type TEXT DEFAULT 'youtube';
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS rtmp_endpoint TEXT;

-- Create stream sessions table to track active streams
CREATE TABLE IF NOT EXISTS stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
  stream_key TEXT NOT NULL,
  rtmp_endpoint TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  viewer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for stream sessions
ALTER TABLE stream_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for stream sessions
CREATE POLICY "Admins can manage stream sessions" ON stream_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Create function to generate secure stream keys
CREATE OR REPLACE FUNCTION generate_stream_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'sk_' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to start a stream session
CREATE OR REPLACE FUNCTION start_stream_session(p_live_class_id UUID)
RETURNS jsonb AS $$
DECLARE
  stream_key TEXT;
  rtmp_endpoint TEXT;
  session_id UUID;
BEGIN
  -- Generate stream key and RTMP endpoint
  stream_key := generate_stream_key();
  rtmp_endpoint := 'rtmp://uphgdwrwaizomnyuwfwr.supabase.co/live/' || stream_key;
  
  -- Update live class with stream info
  UPDATE live_classes 
  SET 
    stream_key = stream_key,
    stream_url = 'wss://uphgdwrwaizomnyuwfwr.supabase.co/stream/' || stream_key,
    stream_type = 'obs',
    rtmp_endpoint = rtmp_endpoint,
    is_live = true
  WHERE id = p_live_class_id;
  
  -- Create stream session
  INSERT INTO stream_sessions (live_class_id, stream_key, rtmp_endpoint, is_active, started_at)
  VALUES (p_live_class_id, stream_key, rtmp_endpoint, true, now())
  RETURNING id INTO session_id;
  
  RETURN jsonb_build_object(
    'session_id', session_id,
    'stream_key', stream_key,
    'rtmp_endpoint', rtmp_endpoint,
    'status', 'ready'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to stop a stream session
CREATE OR REPLACE FUNCTION stop_stream_session(p_live_class_id UUID)
RETURNS jsonb AS $$
BEGIN
  -- Update stream session
  UPDATE stream_sessions 
  SET is_active = false, ended_at = now()
  WHERE live_class_id = p_live_class_id AND is_active = true;
  
  -- Update live class
  UPDATE live_classes 
  SET is_live = false
  WHERE id = p_live_class_id;
  
  RETURN jsonb_build_object('status', 'stopped');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update stream sessions timestamp
CREATE TRIGGER update_stream_sessions_updated_at
  BEFORE UPDATE ON stream_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();