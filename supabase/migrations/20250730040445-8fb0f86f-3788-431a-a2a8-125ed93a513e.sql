-- Fix database constraints step by step
-- First, remove the foreign key constraint on created_by
ALTER TABLE live_classes DROP CONSTRAINT IF EXISTS live_classes_created_by_fkey;

-- Make created_by nullable 
ALTER TABLE live_classes ALTER COLUMN created_by DROP NOT NULL;

-- Create enum for stream_status if it doesn't exist
DO $$ BEGIN
    CREATE TYPE stream_status AS ENUM ('scheduled', 'live', 'ended', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Fix the live_classes status column to use the enum properly
ALTER TABLE live_classes ALTER COLUMN status TYPE stream_status USING status::stream_status;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status);
CREATE INDEX IF NOT EXISTS idx_live_classes_stream_key ON live_classes(stream_key);
CREATE INDEX IF NOT EXISTS idx_youtube_oauth_tokens_expires ON youtube_oauth_tokens(expires_at);