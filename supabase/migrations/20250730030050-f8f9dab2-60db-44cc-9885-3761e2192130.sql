-- Fix database issues found in edge function logs

-- 1. Create live_stream_detection table if it doesn't exist with proper unique constraint
CREATE TABLE IF NOT EXISTS public.live_stream_detection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  embed_url TEXT,
  thumbnail_url TEXT,
  viewer_count INTEGER DEFAULT 0,
  is_live BOOLEAN DEFAULT false,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  detection_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add unique constraint for youtube_id if not exists
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.live_stream_detection ADD CONSTRAINT live_stream_detection_youtube_id_key UNIQUE (youtube_id);
  EXCEPTION
    WHEN duplicate_table THEN NULL;
  END;
END $$;

-- 2. Ensure live_classes table has stream_key as unique constraint
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.live_classes ADD CONSTRAINT live_classes_stream_key_key UNIQUE (stream_key);
  EXCEPTION
    WHEN duplicate_table THEN NULL;
  END;
END $$;

-- 3. Create system user if it doesn't exist for automated entries
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'system@haritahive.com',
  '$2a$10$placeholder',
  now(),
  now(),
  now(),
  '{"provider":"system","providers":["system"]}',
  '{"full_name":"System User"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 4. Create profiles entry for system user
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system@haritahive.com',
  'System User',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 5. Enable RLS on live_stream_detection table
ALTER TABLE public.live_stream_detection ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for live_stream_detection
CREATE POLICY "Anyone can view live stream detection" 
ON public.live_stream_detection 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage live stream detection" 
ON public.live_stream_detection 
FOR ALL 
USING (true);

-- 7. Update live_classes to allow system user and fix foreign key issues
ALTER TABLE public.live_classes ALTER COLUMN created_by SET DEFAULT '00000000-0000-0000-0000-000000000000';

-- 8. Add trigger to sync live_stream_detection with live_classes if not exists
CREATE OR REPLACE FUNCTION public.sync_live_detection_to_classes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update or insert live class when detection is updated
  INSERT INTO live_classes (
    title,
    description,
    youtube_url,
    embed_url,
    thumbnail_url,
    status,
    starts_at,
    access_tier,
    viewer_count,
    stream_key,
    instructor,
    created_by,
    updated_at
  ) VALUES (
    NEW.title,
    NEW.description,
    'https://www.youtube.com/watch?v=' || NEW.youtube_id,
    NEW.embed_url,
    NEW.thumbnail_url,
    CASE WHEN NEW.is_live THEN 'live' ELSE 'ended' END,
    NEW.detected_at,
    'professional',
    NEW.viewer_count,
    NEW.youtube_id,
    'HaritaHive Team',
    '00000000-0000-0000-0000-000000000000',
    NOW()
  )
  ON CONFLICT (stream_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    viewer_count = EXCLUDED.viewer_count,
    thumbnail_url = EXCLUDED.thumbnail_url,
    embed_url = EXCLUDED.embed_url,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS sync_live_detection_trigger ON public.live_stream_detection;
CREATE TRIGGER sync_live_detection_trigger
  AFTER INSERT OR UPDATE ON public.live_stream_detection
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_live_detection_to_classes();

-- 9. Fix any existing live_classes entries with NULL created_by
UPDATE public.live_classes 
SET created_by = '00000000-0000-0000-0000-000000000000' 
WHERE created_by IS NULL;

-- 10. Create optimized indexes for better performance
CREATE INDEX IF NOT EXISTS idx_live_classes_status_starts_at ON public.live_classes (status, starts_at);
CREATE INDEX IF NOT EXISTS idx_live_classes_stream_key ON public.live_classes (stream_key);
CREATE INDEX IF NOT EXISTS idx_live_stream_detection_youtube_id ON public.live_stream_detection (youtube_id);
CREATE INDEX IF NOT EXISTS idx_live_stream_detection_is_live ON public.live_stream_detection (is_live, last_checked);