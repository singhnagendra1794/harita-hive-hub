-- Fix user_profiles table and signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create or update user_profiles table with correct schema
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Create RLS policies
CREATE POLICY "Allow insert for authenticated"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create handle_new_user function with correct security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update AWS streaming config for live streaming
UPDATE public.aws_streaming_config 
SET 
  rtmp_endpoint = 'rtmp://live-stream.haritahive.com/live',
  hls_playback_url = 'https://d3k8h9k5j2l1m9.cloudfront.net/live/index.m3u8',
  cloudfront_distribution_id = 'd3k8h9k5j2l1m9',
  s3_bucket_name = 'haritahive-recordings',
  is_active = true
WHERE id IS NOT NULL;

-- If no config exists, insert one
INSERT INTO public.aws_streaming_config (
  rtmp_endpoint,
  hls_playback_url,
  cloudfront_distribution_id,
  s3_bucket_name,
  medialive_input_id,
  medialive_channel_id,
  is_active
)
SELECT 
  'rtmp://live-stream.haritahive.com/live',
  'https://d3k8h9k5j2l1m9.cloudfront.net/live/index.m3u8',
  'd3k8h9k5j2l1m9',
  'haritahive-recordings',
  'ml-input-123',
  'ml-channel-123',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.aws_streaming_config);