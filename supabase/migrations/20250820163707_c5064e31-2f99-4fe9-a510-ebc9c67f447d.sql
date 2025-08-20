-- Add new recorded video to youtube_sessions table
INSERT INTO public.youtube_sessions (
  title,
  description,
  video_url,
  youtube_video_id,
  duration_seconds,
  session_type,
  status,
  course_title,
  instructor,
  created_at,
  updated_at
) VALUES (
  'Day 9, Intro to QGIS Plugins & Basics of Python Programming',
  'Learn the fundamentals of QGIS plugins and get introduced to Python programming for GIS applications. This session covers plugin installation, management, and basic Python scripting concepts.',
  'https://www.youtube.com/watch?v=KGRbd3VeJ4I',
  'KGRbd3VeJ4I',
  3600, -- Estimated 1 hour duration
  'recording',
  'completed',
  'GEOVA GIS Mastery Course',
  'GEOVA AI',
  now(),
  now()
);