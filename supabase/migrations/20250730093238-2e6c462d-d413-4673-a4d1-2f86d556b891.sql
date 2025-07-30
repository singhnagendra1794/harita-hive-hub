-- Fix stream status type issues for live stream detection

-- First, let's check if stream_status enum exists and create it if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stream_status') THEN
    CREATE TYPE public.stream_status AS ENUM ('live', 'upcoming', 'ended', 'scheduled');
  END IF;
END $$;

-- Update any existing tables that might have status as text to use the enum
-- Check if live_stream_detections table exists and fix it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_stream_detections') THEN
    -- Drop existing constraint if any
    ALTER TABLE public.live_stream_detections 
    DROP CONSTRAINT IF EXISTS live_stream_detections_status_check;
    
    -- Change column type to use enum
    ALTER TABLE public.live_stream_detections 
    ALTER COLUMN status TYPE stream_status USING status::stream_status;
  END IF;
END $$;

-- Check if youtube_live_detections table exists and fix it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'youtube_live_detections') THEN
    -- Drop existing constraint if any
    ALTER TABLE public.youtube_live_detections 
    DROP CONSTRAINT IF EXISTS youtube_live_detections_status_check;
    
    -- Change column type to use enum
    ALTER TABLE public.youtube_live_detections 
    ALTER COLUMN status TYPE stream_status USING status::stream_status;
  END IF;
END $$;

-- Check if live_classes table exists and ensure it uses the correct enum
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_classes') THEN
    -- Ensure status column uses the correct enum type
    BEGIN
      ALTER TABLE public.live_classes 
      ALTER COLUMN status TYPE stream_status USING status::stream_status;
    EXCEPTION
      WHEN others THEN
        -- Column might already be correct type or not exist
        NULL;
    END;
  END IF;
END $$;