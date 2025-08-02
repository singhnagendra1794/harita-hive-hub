-- Add QGIS Interface - Part 1 video to recording sessions
INSERT INTO public.youtube_sessions (
  title,
  description,
  youtube_embed_url,
  session_type,
  status,
  access_tier,
  is_active,
  order_index,
  created_at,
  updated_at
) VALUES (
  'QGIS Interface - Part 1',
  'This video covers the Vector tools & Processing',
  'https://www.youtube.com/embed/hDX5CYnURZE?modestbranding=1&rel=0&controls=1&showinfo=0&iv_load_policy=3&disablekb=1',
  'recording',
  'completed',
  'free',
  true,
  (SELECT COALESCE(MAX(order_index), 0) + 1 FROM public.youtube_sessions WHERE session_type = 'recording'),
  now(),
  now()
);