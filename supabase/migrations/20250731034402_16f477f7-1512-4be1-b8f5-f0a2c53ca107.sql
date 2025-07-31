-- Add Intro day recording to class recordings
INSERT INTO public.class_recordings (
  title,
  description,
  youtube_url,
  thumbnail_url,
  is_public,
  created_by,
  duration_seconds,
  view_count,
  download_count
) VALUES (
  'Geospatial Technology - Intro Day Recording',
  'Introduction to Geospatial Technology course - covering fundamentals and getting started with GIS concepts',
  'https://www.youtube.com/watch?v=DLOhjEEDvuM',
  'https://img.youtube.com/vi/DLOhjEEDvuM/maxresdefault.jpg',
  true,
  (SELECT id FROM auth.users WHERE email = 'contact@haritahive.com' LIMIT 1),
  0, -- Duration will be updated later
  0,
  0
);