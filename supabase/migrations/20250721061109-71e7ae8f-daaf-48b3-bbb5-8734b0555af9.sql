-- Update the first live class to start today at 8:00 PM IST (14:30 UTC)
-- Current time in India is 11:40 AM on July 21st, so 8:00 PM today would be 14:30 UTC

UPDATE live_classes 
SET 
  start_time = '2025-07-21 14:30:00+00',
  end_time = '2025-07-21 16:00:00+00',
  status = 'scheduled'
WHERE title = 'Day 1: Introduction to Geospatial Technology';

-- Update subsequent classes to be at the same time on consecutive days
UPDATE live_classes 
SET 
  start_time = '2025-07-22 14:30:00+00',
  end_time = '2025-07-22 16:00:00+00'
WHERE title = 'Day 2: GIS Fundamentals';

UPDATE live_classes 
SET 
  start_time = '2025-07-23 14:30:00+00',
  end_time = '2025-07-23 16:00:00+00'
WHERE title = 'Day 3: Spatial Data Types';

UPDATE live_classes 
SET 
  start_time = '2025-07-24 14:30:00+00',
  end_time = '2025-07-24 16:00:00+00'
WHERE title = 'Day 4: Coordinate Systems';

UPDATE live_classes 
SET 
  start_time = '2025-07-25 14:30:00+00',
  end_time = '2025-07-25 16:00:00+00'
WHERE title = 'Day 5: Data Collection Methods';