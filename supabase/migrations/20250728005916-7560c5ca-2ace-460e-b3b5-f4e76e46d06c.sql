-- Add YouTube Live URL field to live_classes table
ALTER TABLE public.live_classes 
ADD COLUMN youtube_url TEXT,
ADD COLUMN duration_minutes INTEGER DEFAULT 90;