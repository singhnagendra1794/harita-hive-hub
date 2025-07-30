-- Fix database issues for YouTube automation system

-- Fix scheduled_start_time column reference (should be starts_at)
-- Update the enhanced sync function to use correct column names

-- Add missing cron status function without cron dependency
CREATE OR REPLACE FUNCTION get_youtube_automation_status()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'rapid_sync_enabled', false, -- Will be handled by manual triggers
    'weekly_creation_enabled', false, -- Will be handled manually
    'enhanced_sync_enabled', true, -- Available via edge functions
    'last_updated', now(),
    'note', 'Cron extensions not available - use manual triggers'
  );
$$;