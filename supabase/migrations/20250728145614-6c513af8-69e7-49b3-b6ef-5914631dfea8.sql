-- Ensure live_classes table has all required columns
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS youtube_broadcast_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS embed_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS access_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS viewer_count INTEGER DEFAULT 0;

-- Create live_recordings table for completed streams
CREATE TABLE IF NOT EXISTS public.live_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_broadcast_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT,
  embed_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE,
  access_tier TEXT DEFAULT 'professional',
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for live_recordings
ALTER TABLE public.live_recordings ENABLE ROW LEVEL SECURITY;

-- Create policies for live_recordings (Professional Plan only)
CREATE POLICY "professional_users_can_view_recordings" ON public.live_recordings
  FOR SELECT
  USING (
    is_public = true OR 
    EXISTS (
      SELECT 1 FROM public.user_subscriptions 
      WHERE user_id = auth.uid() 
      AND subscription_tier IN ('professional', 'pro', 'enterprise')
      AND status = 'active'
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'contact@haritahive.com'
    )
  );

-- Admins can manage recordings
CREATE POLICY "admins_can_manage_recordings" ON public.live_recordings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'contact@haritahive.com'
    )
  );

-- Update live_classes RLS for professional access
CREATE POLICY "professional_users_can_view_live_classes" ON public.live_classes
  FOR SELECT
  USING (
    access_tier = 'free' OR
    access_tier IS NULL OR
    EXISTS (
      SELECT 1 FROM public.user_subscriptions 
      WHERE user_id = auth.uid() 
      AND subscription_tier IN ('professional', 'pro', 'enterprise')
      AND status = 'active'
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'contact@haritahive.com'
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_live_classes_youtube_broadcast ON public.live_classes(youtube_broadcast_id);
CREATE INDEX IF NOT EXISTS idx_live_recordings_youtube_broadcast ON public.live_recordings(youtube_broadcast_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_access_tier ON public.live_classes(access_tier);
CREATE INDEX IF NOT EXISTS idx_live_recordings_access_tier ON public.live_recordings(access_tier);