-- Insert new recording into youtube_sessions table
INSERT INTO youtube_sessions (
  title,
  video_url,
  embed_url,
  description,
  duration_minutes,
  created_at
) VALUES (
  'Day 10, Python Basics: Core Building Blocks in Geospatial Programming',
  'https://www.youtube.com/watch?v=7yNQfHcL2Tk',
  'https://www.youtube.com/embed/7yNQfHcL2Tk',
  'Learn Python fundamentals essential for geospatial programming, including data types, control structures, and core programming concepts.',
  45,
  now()
);