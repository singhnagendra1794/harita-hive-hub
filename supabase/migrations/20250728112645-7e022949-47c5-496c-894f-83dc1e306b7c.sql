-- Add the YouTube session to live now
INSERT INTO public.youtube_sessions (
  title,
  description,
  youtube_embed_url,
  session_type,
  status,
  scheduled_date,
  access_tier,
  order_index,
  is_active
) VALUES (
  'Live GEOVA Session',
  'Interactive AI-powered learning session covering geospatial concepts and tools',
  'https://www.youtube.com/embed/-DSjsre7Tgc?modestbranding=1&rel=0&controls=1&showinfo=0&iv_load_policy=3&disablekb=1',
  'live',
  'live',
  now(),
  'professional',
  0,
  true
);