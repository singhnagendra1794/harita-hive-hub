-- Create cron jobs for automated YouTube detection
-- First, create job for token refresh (every hour)
SELECT cron.schedule(
    'refresh-youtube-oauth-tokens',
    '0 * * * *', -- Every hour at minute 0
    $$
    SELECT net.http_post(
        url := 'https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/youtube-token-refresh',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGdkd3J3YWl6b21ueXV3ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjQyNjAsImV4cCI6MjA2NjAwMDI2MH0.I5i-3wP4E6Q3355oY2ctXQM9MhYXKbj6wGVhiRUsqxI"}'::jsonb,
        body := '{"source": "cron"}'::jsonb
    );
    $$
);

-- Create job for YouTube stream detection (every 30 seconds)
SELECT cron.schedule(
    'auto-youtube-stream-detection',
    '*/30 * * * * *', -- Every 30 seconds
    $$
    SELECT net.http_post(
        url := 'https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/youtube-auto-sync',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGdkd3J3YWl6b21ueXV3ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjQyNjAsImV4cCI6MjA2NjAwMDI2MH0.I5i-3wP4E6Q3355oY2ctXQM9MhYXKbj6wGVhiRUsqxI"}'::jsonb,
        body := '{"automated": true, "source": "cron"}'::jsonb
    );
    $$
);

-- Create job for real-time stream detection (every 15 seconds for quicker detection)
SELECT cron.schedule(
    'realtime-youtube-detection',
    '*/15 * * * * *', -- Every 15 seconds
    $$
    SELECT net.http_post(
        url := 'https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/real-time-stream-detector',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGdkd3J3YWl6b21ueXV3ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjQyNjAsImV4cCI6MjA2NjAwMDI2MH0.I5i-3wP4E6Q3355oY2ctXQM9MhYXKbj6wGVhiRUsqxI"}'::jsonb,
        body := '{"automated": true, "source": "cron"}'::jsonb
    );
    $$
);