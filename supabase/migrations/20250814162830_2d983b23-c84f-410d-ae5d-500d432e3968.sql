-- Add Cartography video to youtube_sessions table
INSERT INTO public.youtube_sessions (
  id,
  title,
  video_id,
  recording_url,
  course_title,
  duration,
  viewer_count,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Cartography',
  'SsIWMLKUi_I',
  'https://www.youtube.com/watch?v=SsIWMLKUi_I',
  'GIS & Cartography',
  '00:00:00', -- Will be updated by sync function
  0,
  now(),
  now()
) ON CONFLICT (video_id) DO NOTHING;