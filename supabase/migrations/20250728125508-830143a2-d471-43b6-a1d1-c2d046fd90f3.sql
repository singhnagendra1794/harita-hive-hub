-- Create missing tables for YouTube Live Scheduling system
-- youtube_oauth_tokens table
CREATE TABLE IF NOT EXISTS public.youtube_oauth_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamp with time zone NOT NULL,
  token_type text DEFAULT 'Bearer',
  scope text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on youtube_oauth_tokens
ALTER TABLE public.youtube_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for youtube_oauth_tokens
CREATE POLICY "Super admin can manage OAuth tokens" ON public.youtube_oauth_tokens
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Users can manage their own OAuth tokens" ON public.youtube_oauth_tokens
FOR ALL USING (auth.uid() = user_id);

-- Create admin_actions table for logging
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_table text,
  target_id text,
  action_data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_actions
CREATE POLICY "Super admin can view all admin actions" ON public.admin_actions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Admins can insert their own actions" ON public.admin_actions
FOR INSERT WITH CHECK (auth.uid() = admin_user_id);

-- Create storage bucket for YouTube thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('youtube-thumbnails', 'youtube-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for YouTube thumbnails
CREATE POLICY "Super admin can upload thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'youtube-thumbnails' AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Anyone can view thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'youtube-thumbnails');

CREATE POLICY "Super admin can update thumbnails" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'youtube-thumbnails' AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Super admin can delete thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'youtube-thumbnails' AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

-- Update youtube_live_schedule table structure if needed
ALTER TABLE public.youtube_live_schedule 
ADD COLUMN IF NOT EXISTS obs_configured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS obs_auto_start boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS obs_scene_name text,
ADD COLUMN IF NOT EXISTS privacy_status text DEFAULT 'unlisted',
ADD COLUMN IF NOT EXISTS recording_url text,
ADD COLUMN IF NOT EXISTS recording_available boolean DEFAULT false;

-- Create function to auto-sync YouTube live to live_classes
CREATE OR REPLACE FUNCTION public.sync_youtube_to_live_classes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert or update live_classes when youtube_live_schedule changes
  INSERT INTO public.live_classes (
    title,
    description,
    starts_at,
    status,
    access_tier,
    instructor,
    is_ai_generated,
    hls_manifest_url,
    youtube_stream_id
  ) VALUES (
    NEW.title,
    NEW.description,
    NEW.scheduled_time,
    CASE NEW.status 
      WHEN 'live' THEN 'live'
      WHEN 'ended' THEN 'ended' 
      ELSE 'scheduled'
    END,
    'pro', -- Professional plan required
    'HaritaHive Studio',
    false,
    CASE WHEN NEW.status = 'live' THEN 
      'https://www.youtube.com/embed/' || NEW.youtube_broadcast_id || '?modestbranding=1&rel=0&disablekb=1'
    ELSE NULL END,
    NEW.youtube_stream_id
  )
  ON CONFLICT (youtube_stream_id) 
  DO UPDATE SET
    title = NEW.title,
    description = NEW.description,
    starts_at = NEW.scheduled_time,
    status = CASE NEW.status 
      WHEN 'live' THEN 'live'
      WHEN 'ended' THEN 'ended' 
      ELSE 'scheduled'
    END,
    hls_manifest_url = CASE WHEN NEW.status = 'live' THEN 
      'https://www.youtube.com/embed/' || NEW.youtube_broadcast_id || '?modestbranding=1&rel=0&disablekb=1'
    ELSE live_classes.hls_manifest_url END;
    
  RETURN NEW;
END;
$function$;

-- Create trigger for auto-sync
DROP TRIGGER IF EXISTS sync_youtube_live_trigger ON public.youtube_live_schedule;
CREATE TRIGGER sync_youtube_live_trigger
  AFTER INSERT OR UPDATE ON public.youtube_live_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_youtube_to_live_classes();

-- Add column to live_classes for YouTube integration
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS youtube_stream_id text,
ADD COLUMN IF NOT EXISTS youtube_broadcast_id text;

-- Create unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS live_classes_youtube_stream_id_idx 
ON public.live_classes (youtube_stream_id) WHERE youtube_stream_id IS NOT NULL;