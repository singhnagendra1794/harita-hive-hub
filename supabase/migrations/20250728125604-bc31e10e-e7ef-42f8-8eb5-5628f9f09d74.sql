-- Create missing tables for YouTube Live Scheduling system (avoiding conflicts)

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

-- Create policies for youtube_oauth_tokens (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'youtube_oauth_tokens' AND policyname = 'Super admin can manage OAuth tokens') THEN
    CREATE POLICY "Super admin can manage OAuth tokens" ON public.youtube_oauth_tokens
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'contact@haritahive.com'
      )
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'youtube_oauth_tokens' AND policyname = 'Users can manage their own OAuth tokens') THEN
    CREATE POLICY "Users can manage their own OAuth tokens" ON public.youtube_oauth_tokens
    FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

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

-- Create policies for admin_actions (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_actions' AND policyname = 'Super admin can view all admin actions') THEN
    CREATE POLICY "Super admin can view all admin actions" ON public.admin_actions
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'contact@haritahive.com'
      )
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_actions' AND policyname = 'Admins can insert their own actions') THEN
    CREATE POLICY "Admins can insert their own actions" ON public.admin_actions
    FOR INSERT WITH CHECK (auth.uid() = admin_user_id);
  END IF;
END $$;

-- Create storage bucket for YouTube thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('youtube-thumbnails', 'youtube-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Update youtube_live_schedule table structure if needed
ALTER TABLE public.youtube_live_schedule 
ADD COLUMN IF NOT EXISTS obs_configured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS obs_auto_start boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS obs_scene_name text,
ADD COLUMN IF NOT EXISTS privacy_status text DEFAULT 'unlisted',
ADD COLUMN IF NOT EXISTS recording_url text,
ADD COLUMN IF NOT EXISTS recording_available boolean DEFAULT false;

-- Add column to live_classes for YouTube integration
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS youtube_stream_id text,
ADD COLUMN IF NOT EXISTS youtube_broadcast_id text;