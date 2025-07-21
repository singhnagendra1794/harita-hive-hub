-- Fix the generate_unique_stream_key function to use a method that works in Supabase
CREATE OR REPLACE FUNCTION public.generate_unique_stream_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_key TEXT;
  key_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 16-character stream key using random() and extract functions
    new_key := substr(md5(random()::text), 1, 16);
    
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