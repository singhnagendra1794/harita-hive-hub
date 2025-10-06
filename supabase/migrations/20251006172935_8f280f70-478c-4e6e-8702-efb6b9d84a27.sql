-- Insert Track 2, Day 26 recording into youtube_sessions
INSERT INTO public.youtube_sessions (
  title,
  description,
  youtube_embed_url,
  session_type,
  is_active,
  order_index,
  status
) VALUES (
  'Track 2, Day 26: Introduction to Python Programming',
  'Comprehensive introduction to Python programming fundamentals and best practices for beginners.',
  'https://www.youtube.com/embed/N65U4tkTt4c?si=WV-yhHvVD6_qPBvi',
  'recording',
  true,
  26,
  'ended'
);