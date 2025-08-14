-- Add Cartography video to youtube_sessions table
INSERT INTO public.youtube_sessions (
  id,
  title,
  description,
  youtube_embed_url,
  session_type,
  status,
  scheduled_date,
  started_at,
  ended_at,
  order_index,
  access_tier,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Cartography',
  'Educational session on cartography fundamentals and techniques',
  'https://www.youtube.com/embed/SsIWMLKUi_I',
  'recording',
  'completed',
  now() - interval '1 day',
  now() - interval '1 day',
  now() - interval '23 hours',
  1,
  'free',
  true,
  now(),
  now()
);