-- Create a cron job to poll YouTube Live status every 30 seconds
-- This requires pg_cron extension to be enabled
SELECT cron.schedule(
  'youtube-live-poller',
  '*/30 * * * * *', -- Every 30 seconds
  $$
  SELECT
    net.http_post(
        url:='https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/live-stream-poller',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGdkd3J3YWl6b21ueXV3ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjQyNjAsImV4cCI6MjA2NjAwMDI2MH0.I5i-3wP4E6Q3355oY2ctXQM9MhYXKbj6wGVhiRUsqxI"}'::jsonb,
        body:='{"trigger": "cron", "interval": 30}'::jsonb
    ) as request_id;
  $$
);

-- Create a function to manually trigger sync for super admins
CREATE OR REPLACE FUNCTION trigger_youtube_sync()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check if user is super admin
  IF NOT is_super_admin_secure() THEN
    RETURN jsonb_build_object('error', 'Unauthorized access');
  END IF;
  
  -- Trigger the sync
  SELECT net.http_post(
    url:='https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/live-stream-poller',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGdkd3J3YWl6b21ueXV3ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjQyNjAsImV4cCI6MjA2NjAwMDI2MH0.I5i-3wP4E6Q3355oY2ctXQM9MhYXKbj6wGVhiRUsqxI"}'::jsonb,
    body:='{"trigger": "manual", "timestamp": "' || now() || '"}'::jsonb
  ) INTO result;
  
  RETURN jsonb_build_object('success', true, 'result', result);
END;
$$;

-- Add indexes for better performance on live_classes table
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status);
CREATE INDEX IF NOT EXISTS idx_live_classes_stream_key ON live_classes(stream_key);
CREATE INDEX IF NOT EXISTS idx_live_classes_starts_at ON live_classes(starts_at);
CREATE INDEX IF NOT EXISTS idx_live_classes_updated_at ON live_classes(updated_at);