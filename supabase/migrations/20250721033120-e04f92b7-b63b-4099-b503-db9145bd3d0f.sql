-- Update existing live_classes table to match the specification
-- Add missing columns and update structure

-- First, let's see what we have and add missing columns
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS viewer_count INTEGER DEFAULT 0;

-- Update the status column to use enum if it's not already
DO $$ 
BEGIN
  -- Create enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'live_class_status') THEN
    CREATE TYPE live_class_status AS ENUM ('scheduled', 'live', 'ended');
  END IF;
  
  -- Update column type if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'live_classes' 
             AND column_name = 'status' 
             AND data_type != 'USER-DEFINED') THEN
    ALTER TABLE public.live_classes ALTER COLUMN status TYPE live_class_status USING status::live_class_status;
  END IF;
END $$;

-- Ensure proper constraints and defaults
ALTER TABLE public.live_classes 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN stream_key SET NOT NULL,
ALTER COLUMN start_time SET NOT NULL,
ALTER COLUMN start_time SET DEFAULT now(),
ALTER COLUMN created_by SET NOT NULL,
ALTER COLUMN status SET DEFAULT 'scheduled',
ALTER COLUMN viewer_count SET DEFAULT 0;

-- Add unique constraint on stream_key if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'live_classes_stream_key_key') THEN
    ALTER TABLE public.live_classes ADD CONSTRAINT live_classes_stream_key_key UNIQUE (stream_key);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON public.live_classes(status);
CREATE INDEX IF NOT EXISTS idx_live_classes_created_by ON public.live_classes(created_by);
CREATE INDEX IF NOT EXISTS idx_live_classes_start_time ON public.live_classes(start_time DESC);

-- Update RLS policies (drop and recreate to ensure they're correct)
DROP POLICY IF EXISTS "Public can view live and ended classes" ON public.live_classes;
DROP POLICY IF EXISTS "Users can create their own live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Users can update their own live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Users can delete their own live classes" ON public.live_classes;

-- Create correct RLS policies
CREATE POLICY "Public can view live and ended classes"
ON public.live_classes
FOR SELECT
USING (status IN ('live', 'ended'));

CREATE POLICY "Users can create their own live classes"
ON public.live_classes
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own live classes"
ON public.live_classes
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own live classes"
ON public.live_classes
FOR DELETE
USING (auth.uid() = created_by);