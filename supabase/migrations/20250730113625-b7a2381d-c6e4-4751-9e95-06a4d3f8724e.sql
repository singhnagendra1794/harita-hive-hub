-- Fix database schema issues for YouTube automation

-- First, let's check the current live_classes table structure
DO $$ 
BEGIN
  -- Check if scheduled_start_time column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'live_classes' 
    AND column_name = 'scheduled_start_time'
  ) THEN
    ALTER TABLE public.live_classes 
    ADD COLUMN scheduled_start_time timestamp with time zone;
  END IF;
  
  -- Update any text status values to use the correct enum type
  -- First, let's see what status values we have
  RAISE NOTICE 'Updating status column to use proper enum casting';
END $$;

-- Update all status values to use proper enum casting
UPDATE public.live_classes 
SET status = status::stream_status 
WHERE status IS NOT NULL;

-- Ensure all functions properly handle the enum type
-- This helps prevent future text/enum conflicts