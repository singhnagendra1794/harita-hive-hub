-- Fix the order of GEOVA bootcamp recordings
UPDATE youtube_sessions 
SET order_index = 9 
WHERE title = 'Day 9, Intro to QGIS Plugins & Basics of Python Programming';

UPDATE youtube_sessions 
SET order_index = 10 
WHERE title = 'Day 10, Python Basics: Core Building Blocks in Geospatial Programming';