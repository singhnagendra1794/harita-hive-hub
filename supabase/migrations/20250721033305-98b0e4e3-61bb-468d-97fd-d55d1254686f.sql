-- Fix the enum issue and update the live_classes table properly
-- Add missing columns first
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS viewer_count INTEGER DEFAULT 0;

-- Update status to use the existing enum values ('live', 'ended') compatible approach
-- Set default status to 'ended' which is compatible with existing enum
ALTER TABLE public.live_classes 
ALTER COLUMN status SET DEFAULT 'ended';

-- Set proper constraints
ALTER TABLE public.live_classes 
ALTER COLUMN start_time SET DEFAULT now(),
ALTER COLUMN viewer_count SET DEFAULT 0;

-- Update RLS policies (drop existing ones first)
DROP POLICY IF EXISTS "Anyone can view public live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Users can manage their own live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Users can view their own live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Users can create live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Users can update their own live classes" ON public.live_classes;

-- Create new comprehensive RLS policies
CREATE POLICY "Public can view live and ended classes"
ON public.live_classes
FOR SELECT
USING (status IN ('live', 'ended'));

CREATE POLICY "Users can create their own live classes"
ON public.live_classes
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can manage their own live classes"
ON public.live_classes
FOR ALL
USING (auth.uid() = created_by);

-- Ensure the unique stream key function exists
CREATE OR REPLACE FUNCTION public.generate_unique_stream_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_key TEXT;
  key_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 16-character stream key
    new_key := encode(gen_random_bytes(8), 'hex');
    
    -- Check if key already exists
    SELECT EXISTS(SELECT 1 FROM public.live_classes WHERE stream_key = new_key) INTO key_exists;
    
    -- Exit loop if key is unique
    IF NOT key_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_key;
END;
$$;