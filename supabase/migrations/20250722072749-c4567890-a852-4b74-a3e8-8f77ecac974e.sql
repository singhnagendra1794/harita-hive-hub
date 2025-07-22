-- Fix streaming infrastructure for OBS integration

-- First, ensure we have the right relationship between stream_sessions and profiles
-- The stream_sessions table should reference auth.users via user_id, not profiles directly

-- Update get-live-streams function to work with proper relationships
-- Also fix the stream workflow

-- Add missing foreign key relationships if needed
ALTER TABLE stream_sessions 
ADD CONSTRAINT fk_stream_sessions_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update stream_keys table to have proper relationship
ALTER TABLE stream_keys 
ADD CONSTRAINT fk_stream_keys_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create function to get user profile info for streams
CREATE OR REPLACE FUNCTION get_user_profile_for_stream(p_user_id UUID)
RETURNS TABLE(full_name TEXT, email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.full_name, au.email) as full_name,
    au.email
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  WHERE au.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;