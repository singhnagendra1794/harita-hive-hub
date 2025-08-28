-- Add Day 11 recording to youtube_sessions table with correct columns
INSERT INTO youtube_sessions (
  title,
  description,
  youtube_embed_url,
  session_type,
  status,
  order_index,
  access_tier
) VALUES (
  'Day 11, Python Basics: Decision Making in Geospatial Programming',
  'Learn decision making concepts in Python programming for geospatial applications including conditional statements, loops, and logical operators.',
  'https://www.youtube.com/embed/_OO323Gwbz4?si=ZZIrRG-QcnY0RqCz',
  'recording',
  'ended',
  11,
  'free'
);