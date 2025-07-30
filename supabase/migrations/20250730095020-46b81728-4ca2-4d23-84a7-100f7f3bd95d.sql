-- Fix the stream_status enum issue in live_stream_detection table
-- The error shows column "status" is of type stream_status but expression is of type text

-- First, let's check if the enum exists and create/update it
DO $$ 
BEGIN
    -- Create stream_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stream_status') THEN
        CREATE TYPE stream_status AS ENUM ('live', 'ended', 'scheduled', 'error');
    END IF;
    
    -- Add any missing enum values
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'live' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'stream_status')) THEN
        ALTER TYPE stream_status ADD VALUE 'live';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ended' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'stream_status')) THEN
        ALTER TYPE stream_status ADD VALUE 'ended';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'scheduled' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'stream_status')) THEN
        ALTER TYPE stream_status ADD VALUE 'scheduled';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'error' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'stream_status')) THEN
        ALTER TYPE stream_status ADD VALUE 'error';
    END IF;
END $$;

-- Update the upsertLiveStream function in real-time-stream-detector to properly cast text to enum
-- The error occurs because we're passing text values but the column expects enum type