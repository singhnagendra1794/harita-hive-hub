-- Add Georeferencing and Scale recording to youtube_sessions
INSERT INTO public.youtube_sessions (
  title,
  description,
  youtube_embed_url,
  session_type,
  status,
  is_active
) VALUES (
  'Georeferencing and Scale',
  'Educational video covering georeferencing concepts and scale in GIS',
  'https://www.youtube.com/embed/zejxvdwrj8U?si=mynSBA_54q6cvoVL',
  'recording',
  'ended',
  true
);