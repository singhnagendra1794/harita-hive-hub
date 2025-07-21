-- Add course_title column to live_classes table for course association
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS course_title TEXT DEFAULT 'General';

-- Update existing live classes to be part of "Geospatial Technology Unlocked" course
UPDATE public.live_classes 
SET course_title = 'Geospatial Technology Unlocked'
WHERE course_title IS NULL OR course_title = 'General';

-- Create index for better performance when filtering by course
CREATE INDEX IF NOT EXISTS idx_live_classes_course_title ON public.live_classes(course_title);

-- Add status column if it doesn't exist (using text type for now)
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';

-- Update existing records to have proper status
UPDATE public.live_classes 
SET status = CASE 
  WHEN starts_at > now() THEN 'scheduled'
  WHEN starts_at <= now() AND (ends_at IS NULL OR ends_at > now()) AND is_live = true THEN 'live'
  ELSE 'ended'
END
WHERE status IS NULL OR status = 'scheduled';

-- Create index for status and course filtering
CREATE INDEX IF NOT EXISTS idx_live_classes_status_course ON public.live_classes(status, course_title);

-- Insert a sample upcoming session for the course
INSERT INTO public.live_classes (
  title,
  description,
  video_url,
  youtube_video_id,
  starts_at,
  ends_at,
  is_live,
  access_tier,
  instructor,
  course_title,
  status,
  created_by
) VALUES (
  'Advanced GIS Analytics with Python',
  'Learn advanced geospatial analysis techniques using Python libraries like GeoPandas, Folium, and Rasterio. We will cover spatial joins, buffer analysis, and creating interactive maps.',
  'https://stream.haritahive.com/hls/sample_stream.m3u8',
  'sample_video_id',
  now() + INTERVAL '3 days',
  now() + INTERVAL '3 days' + INTERVAL '2 hours',
  false,
  'free',
  'Nagendra Singh',
  'Geospatial Technology Unlocked',
  'scheduled',
  (SELECT id FROM auth.users WHERE email = 'contact@haritahive.com' LIMIT 1)
) ON CONFLICT DO NOTHING;