-- Add YouTube recording so it appears in Recorded Sessions
INSERT INTO public.youtube_sessions (
  title,
  youtube_embed_url,
  session_type,
  status,
  is_active,
  description,
  access_tier
) VALUES (
  'Day 10, Python Basics: Core Building Blocks in Geospatial Programming',
  public.get_secure_embed_url('https://www.youtube.com/watch?v=7yNQfHcL2Tk'),
  'recording',
  'ended',
  true,
  'GEOVA Bootcamp Day 10 — Python basics for geospatial programming.',
  'free'
);