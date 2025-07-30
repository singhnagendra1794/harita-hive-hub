-- Fix critical issues preventing YouTube sync

-- 1. Fix user_roles RLS policy recursion causing 500 errors
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can manage their own roles" ON user_roles;

-- Create non-recursive policies for user_roles
CREATE POLICY "Users can view their own roles bypass" 
ON user_roles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admin can manage all roles" 
ON user_roles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

-- 2. Fix stream_status type issue in live_stream_detection
ALTER TABLE live_stream_detection 
ALTER COLUMN status TYPE text;

-- 3. Ensure live_classes has proper status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'live_class_status') THEN
    CREATE TYPE live_class_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled');
  END IF;
END $$;

-- Update live_classes status column to use proper enum if needed
ALTER TABLE live_classes 
ALTER COLUMN status TYPE live_class_status 
USING status::live_class_status;

-- 4. Clean up any OAuth token issues
UPDATE youtube_oauth_tokens 
SET expires_at = now() - interval '1 hour'
WHERE expires_at < now() + interval '5 minutes';

-- 5. Ensure automation status table exists for dashboard
CREATE TABLE IF NOT EXISTS youtube_automation_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enhanced_sync_enabled boolean DEFAULT true,
  rapid_sync_enabled boolean DEFAULT true,
  weekly_creation_enabled boolean DEFAULT true,
  last_updated timestamp with time zone DEFAULT now()
);

-- Insert default automation status if not exists
INSERT INTO youtube_automation_status (enhanced_sync_enabled, rapid_sync_enabled, weekly_creation_enabled)
SELECT true, true, true
WHERE NOT EXISTS (SELECT 1 FROM youtube_automation_status);

-- 6. Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status);
CREATE INDEX IF NOT EXISTS idx_live_classes_starts_at ON live_classes(starts_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_oauth_expires ON youtube_oauth_tokens(expires_at);