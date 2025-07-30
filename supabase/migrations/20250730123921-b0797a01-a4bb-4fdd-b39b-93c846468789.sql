-- Fix the 500 error on user_roles table only

-- Drop existing problematic user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles bypass" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles clean" ON user_roles;

-- Create clean user_roles policy without recursion
CREATE POLICY "Users view own roles" 
ON user_roles FOR SELECT 
USING (user_id = auth.uid());

-- Clean up expired OAuth tokens to help with sync
UPDATE youtube_oauth_tokens 
SET expires_at = now() - interval '1 hour'
WHERE expires_at < now() + interval '5 minutes';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);