-- Drop all existing live tables
DROP TABLE IF EXISTS public.live_classes CASCADE;
DROP TABLE IF EXISTS public.live_streams CASCADE; 
DROP TABLE IF EXISTS public.live_sessions CASCADE;

-- Drop any related enums
DROP TYPE IF EXISTS live_class_status CASCADE;

-- Create enum for stream status
CREATE TYPE public.stream_status AS ENUM ('live', 'ended');

-- Create clean live_classes table
CREATE TABLE public.live_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  stream_key TEXT UNIQUE NOT NULL,
  status stream_status NOT NULL DEFAULT 'ended',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Users can create/manage their own live classes
CREATE POLICY "Users can manage their own live classes"
ON public.live_classes
FOR ALL
USING (auth.uid() = created_by);

-- RLS Policy 2: Public can read live or ended classes
CREATE POLICY "Public can view live classes"
ON public.live_classes
FOR SELECT
USING (status IN ('live', 'ended'));

-- Create trigger for updated_at
CREATE TRIGGER update_live_classes_updated_at
BEFORE UPDATE ON public.live_classes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique stream key
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