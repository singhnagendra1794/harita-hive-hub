-- Add course_title column to live_classes table
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS course_title TEXT DEFAULT 'General';

-- Update existing live classes to be part of "Geospatial Technology Unlocked" course
UPDATE public.live_classes 
SET course_title = 'Geospatial Technology Unlocked'
WHERE course_title IS NULL OR course_title = 'General';

-- Create index for better performance when filtering by course
CREATE INDEX IF NOT EXISTS idx_live_classes_course_title ON public.live_classes(course_title);
CREATE INDEX IF NOT EXISTS idx_live_classes_status_course ON public.live_classes(status, course_title);

-- Insert a sample upcoming session if none exists
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
  created_by
) VALUES (
  'Advanced GIS Analytics with Python',
  'Learn advanced geospatial analysis techniques using Python libraries like GeoPandas, Folium, and Rasterio. We''ll cover spatial joins, buffer analysis, and creating interactive maps.',
  'https://stream.haritahive.com/hls/sample_stream.m3u8',
  'sample_video_id',
  now() + INTERVAL '3 days',
  now() + INTERVAL '3 days' + INTERVAL '2 hours',
  false,
  'free',
  'Nagendra Singh',
  'Geospatial Technology Unlocked',
  (SELECT id FROM auth.users WHERE email = 'contact@haritahive.com' LIMIT 1)
) ON CONFLICT DO NOTHING;