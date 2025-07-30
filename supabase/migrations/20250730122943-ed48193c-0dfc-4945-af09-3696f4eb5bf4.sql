-- Fix critical sync issues step by step

-- 1. Drop existing problematic policies and recreate properly
DROP POLICY IF EXISTS "Users can view their own roles bypass" ON user_roles;

-- Create clean user_roles policy without recursion
CREATE POLICY "Users can view their own roles clean" 
ON user_roles FOR SELECT 
USING (user_id = auth.uid());

-- 2. Fix stream_status type issue in live_stream_detection
ALTER TABLE live_stream_detection 
ALTER COLUMN status TYPE text;

-- 3. Clean up expired OAuth tokens
UPDATE youtube_oauth_tokens 
SET expires_at = now() - interval '1 hour'
WHERE expires_at < now() + interval '5 minutes';

-- 4. Ensure automation status table exists
CREATE TABLE IF NOT EXISTS youtube_automation_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enhanced_sync_enabled boolean DEFAULT true,
  rapid_sync_enabled boolean DEFAULT true, 
  weekly_creation_enabled boolean DEFAULT true,
  last_updated timestamp with time zone DEFAULT now()
);

-- Insert default automation status
INSERT INTO youtube_automation_status (enhanced_sync_enabled, rapid_sync_enabled, weekly_creation_enabled)
SELECT true, true, true
WHERE NOT EXISTS (SELECT 1 FROM youtube_automation_status);

-- 5. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);