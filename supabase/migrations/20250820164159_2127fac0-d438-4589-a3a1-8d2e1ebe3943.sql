-- Add new recorded video to youtube_sessions table with correct status value
INSERT INTO public.youtube_sessions (
  title,
  description,
  youtube_embed_url,
  session_type,
  status,
  access_tier,
  is_active,
  created_at,
  updated_at
) VALUES (
  'Day 9, Intro to QGIS Plugins & Basics of Python Programming',
  'Learn the fundamentals of QGIS plugins and get introduced to Python programming for GIS applications. This session covers plugin installation, management, and basic Python scripting concepts.',
  'https://www.youtube.com/embed/KGRbd3VeJ4I',
  'recording',
  'ended',
  'free',
  true,
  now(),
  now()
);