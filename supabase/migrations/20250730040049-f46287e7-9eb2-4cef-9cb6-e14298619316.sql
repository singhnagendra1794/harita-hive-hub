-- Fix database constraints and add automation features
-- Remove foreign key constraint on created_by to allow automated entries
ALTER TABLE live_classes DROP CONSTRAINT IF EXISTS live_classes_created_by_fkey;

-- Make created_by nullable and add default
ALTER TABLE live_classes ALTER COLUMN created_by DROP NOT NULL;

-- Fix status enum issues for live_stream_detection
ALTER TABLE live_stream_detection ALTER COLUMN status TYPE text;

-- Create enum for stream_status if it doesn't exist
DO $$ BEGIN
    CREATE TYPE stream_status AS ENUM ('scheduled', 'live', 'ended', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Now alter the column to use the enum
ALTER TABLE live_classes ALTER COLUMN status TYPE stream_status USING status::stream_status;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status);
CREATE INDEX IF NOT EXISTS idx_live_classes_stream_key ON live_classes(stream_key);
CREATE INDEX IF NOT EXISTS idx_youtube_oauth_tokens_expires ON youtube_oauth_tokens(expires_at);

-- Create a function to automatically refresh OAuth tokens
CREATE OR REPLACE FUNCTION refresh_youtube_oauth_token()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    token_record RECORD;
    client_id TEXT;
    client_secret TEXT;
    new_token_response JSONB;
BEGIN
    -- Get the most recent token that's about to expire
    SELECT * INTO token_record 
    FROM youtube_oauth_tokens 
    WHERE expires_at < (now() + interval '1 hour')
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF token_record.refresh_token IS NOT NULL THEN
        -- This would trigger an edge function to refresh the token
        -- For now, we'll log that a refresh is needed
        RAISE LOG 'YouTube OAuth token needs refresh for user: %', token_record.user_id;
    END IF;
END;
$$;

-- Create cron job for token refresh (runs every hour)
SELECT cron.schedule(
    'refresh-youtube-tokens',
    '0 * * * *', -- Every hour
    'SELECT refresh_youtube_oauth_token();'
);

-- Create cron job for YouTube stream detection (every 30 seconds)
SELECT cron.schedule(
    'youtube-stream-detection',
    '*/30 * * * * *', -- Every 30 seconds
    $$
    SELECT net.http_post(
        url := 'https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/youtube-auto-sync',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGdkd3J3YWl6b21ueXV3ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjQyNjAsImV4cCI6MjA2NjAwMDI2MH0.I5i-3wP4E6Q3355oY2ctXQM9MhYXKbj6wGVhiRUsqxI"}'::jsonb,
        body := '{"automated": true}'::jsonb
    );
    $$
);

-- Enable realtime for live_classes table
ALTER TABLE live_classes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE live_classes;