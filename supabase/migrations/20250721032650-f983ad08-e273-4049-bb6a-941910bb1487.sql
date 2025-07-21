-- Complete live streaming setup for HaritaHive
-- Drop old tables and create new live_classes table

-- Drop old tables if they exist
DROP TABLE IF EXISTS public.live_sessions CASCADE;
DROP TABLE IF EXISTS public.live_streams CASCADE;

-- Create status enum for live classes
CREATE TYPE live_class_status AS ENUM ('scheduled', 'live', 'ended');

-- Create the main live_classes table
CREATE TABLE public.live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  stream_key TEXT UNIQUE NOT NULL,
  status live_class_status NOT NULL DEFAULT 'scheduled',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thumbnail_url TEXT,
  recording_url TEXT,
  viewer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_live_classes_status ON public.live_classes(status);
CREATE INDEX idx_live_classes_created_by ON public.live_classes(created_by);
CREATE INDEX idx_live_classes_start_time ON public.live_classes(start_time DESC);

-- Enable RLS
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can view live and ended classes
CREATE POLICY "Public can view live and ended classes"
ON public.live_classes
FOR SELECT
USING (status IN ('live', 'ended'));

-- Authenticated users can create their own classes
CREATE POLICY "Users can create their own live classes"
ON public.live_classes
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Users can update their own classes
CREATE POLICY "Users can update their own live classes"
ON public.live_classes
FOR UPDATE
USING (auth.uid() = created_by);

-- Users can delete their own classes
CREATE POLICY "Users can delete their own live classes"
ON public.live_classes
FOR DELETE
USING (auth.uid() = created_by);

-- Function to generate unique stream keys
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_live_classes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for updating timestamps
CREATE TRIGGER update_live_classes_updated_at
BEFORE UPDATE ON public.live_classes
FOR EACH ROW
EXECUTE FUNCTION public.update_live_classes_updated_at();