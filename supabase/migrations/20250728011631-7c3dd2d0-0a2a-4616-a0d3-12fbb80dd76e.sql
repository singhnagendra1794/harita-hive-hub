-- Add the specific YouTube Live class mentioned by the user
INSERT INTO live_classes (
  id,
  title,
  description,
  start_time,
  end_time,
  duration_minutes,
  youtube_url,
  status,
  stream_key,
  course_title,
  is_free_access,
  day_number,
  custom_day_label
) VALUES (
  gen_random_uuid(),
  'Day -1 Intro to Geospatial Tech',
  'Welcome session introducing the fundamentals of geospatial technology and setting up your learning journey.',
  '2025-07-28 06:22:00+05:30',
  '2025-07-28 07:52:00+05:30',
  90,
  'https://www.youtube.com/embed/8t98wDz0JxQ?autoplay=1&modestbranding=1&controls=1',
  'scheduled',
  'welcome_day_minus_1',
  'Geospatial Technology Unlocked',
  true,
  -1,
  'Day -1'
);

-- Add columns for better YouTube Live management
ALTER TABLE live_classes 
ADD COLUMN IF NOT EXISTS is_free_access boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS day_number integer,
ADD COLUMN IF NOT EXISTS custom_day_label text;

-- Update existing classes to set day numbers based on their titles
UPDATE live_classes 
SET day_number = CASE 
  WHEN title LIKE '%Day 7%' THEN 7
  WHEN title LIKE '%Day 8%' THEN 8
  WHEN title LIKE '%Day 9%' THEN 9
  WHEN title LIKE '%Day 10%' THEN 10
  ELSE NULL
END
WHERE day_number IS NULL;

-- Set custom day labels from titles
UPDATE live_classes 
SET custom_day_label = CASE 
  WHEN title LIKE '%Day 7%' THEN 'Day 7'
  WHEN title LIKE '%Day 8%' THEN 'Day 8'
  WHEN title LIKE '%Day 9%' THEN 'Day 9'
  WHEN title LIKE '%Day 10%' THEN 'Day 10'
  ELSE custom_day_label
END
WHERE custom_day_label IS NULL;