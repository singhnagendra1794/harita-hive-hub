-- Set up automated cron jobs for enhanced YouTube Live automation

-- First, enable pg_cron and pg_net extensions (these need to be enabled manually in Supabase dashboard)
-- This migration will create the cron jobs assuming the extensions are enabled

-- Create cron job for rapid sync (every 15 seconds for live detection)
SELECT cron.schedule(
  'rapid-youtube-sync',
  '*/15 * * * * *', -- Every 15 seconds
  $$
  SELECT
    net.http_post(
        url:='https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/rapid-sync-poller',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGdkd3J3YWl6b21ueXV3ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjQyNjAsImV4cCI6MjA2NjAwMDI2MH0.I5i-3wP4E6Q3355oY2ctXQM9MhYXKbj6wGVhiRUsqxI"}'::jsonb,
        body:=concat('{"trigger": "cron", "timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Create cron job for weekly stream creation (every Saturday at 6 PM IST = 12:30 PM UTC)
SELECT cron.schedule(
  'weekly-stream-creation',
  '30 12 * * 6', -- Every Saturday at 12:30 PM UTC (6 PM IST)
  $$
  SELECT
    net.http_post(
        url:='https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/youtube-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGdkd3J3YWl6b21ueXV3ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjQyNjAsImV4cCI6MjA2NjAwMDI2MH0.I5i-3wP4E6Q3355oY2ctXQM9MhYXKbj6wGVhiRUsqxI"}'::jsonb,
        body:='{"action": "create_weekly_streams"}'::jsonb
    ) as request_id;
  $$
);

-- Create cron job for comprehensive sync (every 2 minutes for broader YouTube data sync)
SELECT cron.schedule(
  'enhanced-youtube-sync',
  '*/2 * * * *', -- Every 2 minutes
  $$
  SELECT
    net.http_post(
        url:='https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/enhanced-youtube-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGdkd3J3YWl6b21ueXV3ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjQyNjAsImV4cCI6MjA2NjAwMDI2MH0.I5i-3wP4E6Q3355oY2ctXQM9MhYXKbj6wGVhiRUsqxI"}'::jsonb,
        body:=concat('{"source": "cron", "timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Create function to check cron job status
CREATE OR REPLACE FUNCTION get_youtube_automation_status()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'rapid_sync_enabled', EXISTS(SELECT 1 FROM cron.job WHERE jobname = 'rapid-youtube-sync'),
    'weekly_creation_enabled', EXISTS(SELECT 1 FROM cron.job WHERE jobname = 'weekly-stream-creation'),
    'enhanced_sync_enabled', EXISTS(SELECT 1 FROM cron.job WHERE jobname = 'enhanced-youtube-sync'),
    'last_updated', now()
  );
$$;