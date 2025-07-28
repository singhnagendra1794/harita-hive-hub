-- Add missing columns to live_classes table
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS embed_url TEXT,
ADD COLUMN IF NOT EXISTS access_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS instructor TEXT,
ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP WITH TIME ZONE;

-- Create live_recordings table for completed streams (simplified first)
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
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for live_recordings
ALTER TABLE public.live_recordings ENABLE ROW LEVEL SECURITY;