-- Fix the foreign key constraint issues in live_classes table
-- Allow NULL created_by for auto-generated streams
ALTER TABLE live_classes 
ALTER COLUMN created_by DROP NOT NULL;

-- Fix the live_stream_detection table conflict specification
-- Add unique constraint for ON CONFLICT to work
ALTER TABLE live_stream_detection 
ADD CONSTRAINT live_stream_detection_youtube_id_unique UNIQUE (youtube_id);

-- Create a function to get super admin user ID for auto-created streams
CREATE OR REPLACE FUNCTION get_super_admin_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM auth.users WHERE email = 'contact@haritahive.com' LIMIT 1;
$$;