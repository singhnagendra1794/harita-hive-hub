-- Add course_title column to live_classes table for course association
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS course_title TEXT DEFAULT 'General';

-- Update existing live classes to be part of "Geospatial Technology Unlocked" course
UPDATE public.live_classes 
SET course_title = 'Geospatial Technology Unlocked'
WHERE course_title IS NULL OR course_title = 'General';

-- Create index for better performance when filtering by course
CREATE INDEX IF NOT EXISTS idx_live_classes_course_title ON public.live_classes(course_title);

-- Add 'scheduled' to the existing stream_status enum
ALTER TYPE stream_status ADD VALUE IF NOT EXISTS 'scheduled';

-- Create index for status and course filtering
CREATE INDEX IF NOT EXISTS idx_live_classes_status_course ON public.live_classes(status, course_title);

-- Insert a sample upcoming session for the course (using start_time column instead of starts_at)
INSERT INTO public.live_classes (
  title,
  description,
  stream_key,
  status,
  start_time,
  end_time,
  created_by,
  thumbnail_url,
  course_title
) VALUES (
  'Advanced GIS Analytics with Python',
  'Learn advanced geospatial analysis techniques using Python libraries like GeoPandas, Folium, and Rasterio. We will cover spatial joins, buffer analysis, and creating interactive maps.',
  'geotech_python_' || encode(gen_random_bytes(8), 'hex'),
  'scheduled',
  now() + INTERVAL '3 days',
  now() + INTERVAL '3 days' + INTERVAL '2 hours',
  (SELECT id FROM auth.users WHERE email = 'contact@haritahive.com' LIMIT 1),
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
  'Geospatial Technology Unlocked'
) ON CONFLICT DO NOTHING;