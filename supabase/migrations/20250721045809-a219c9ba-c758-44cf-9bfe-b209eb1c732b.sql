-- Clear existing test data for Geospatial Technology Unlocked
DELETE FROM public.live_classes WHERE course_title = 'Geospatial Technology Unlocked';

-- Insert daily sessions for Geospatial Technology Unlocked (Monday to Saturday, 8:00 PM - 9:30 PM)
-- Starting from today for the next 4 weeks
INSERT INTO public.live_classes (
  title,
  course_title,
  description,
  instructor,
  starts_at,
  ends_at,
  class_status,
  stream_status,
  is_live,
  stream_key,
  max_participants
) VALUES
-- Week 1
('Day 1: Introduction to Geospatial Technology', 'Geospatial Technology Unlocked', 'Welcome to the world of geospatial technology. Learn the fundamentals and get started with your journey.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '20 hours', CURRENT_DATE + INTERVAL '21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 2: GIS Fundamentals', 'Geospatial Technology Unlocked', 'Understanding Geographic Information Systems and their core concepts.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '1 day 20 hours', CURRENT_DATE + INTERVAL '1 day 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 3: Spatial Data Types', 'Geospatial Technology Unlocked', 'Exploring different types of spatial data and their applications.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '2 days 20 hours', CURRENT_DATE + INTERVAL '2 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 4: Coordinate Systems', 'Geospatial Technology Unlocked', 'Understanding coordinate reference systems and projections.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '3 days 20 hours', CURRENT_DATE + INTERVAL '3 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 5: Data Collection Methods', 'Geospatial Technology Unlocked', 'Methods and techniques for collecting geospatial data.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '4 days 20 hours', CURRENT_DATE + INTERVAL '4 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 6: GPS and GNSS Technologies', 'Geospatial Technology Unlocked', 'Deep dive into GPS and Global Navigation Satellite Systems.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '5 days 20 hours', CURRENT_DATE + INTERVAL '5 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

-- Week 2
('Day 7: Remote Sensing Basics', 'Geospatial Technology Unlocked', 'Introduction to remote sensing technologies and applications.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '7 days 20 hours', CURRENT_DATE + INTERVAL '7 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 8: Satellite Imagery Analysis', 'Geospatial Technology Unlocked', 'Working with satellite imagery for analysis and interpretation.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '8 days 20 hours', CURRENT_DATE + INTERVAL '8 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 9: QGIS Fundamentals', 'Geospatial Technology Unlocked', 'Getting started with QGIS for geospatial analysis.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '9 days 20 hours', CURRENT_DATE + INTERVAL '9 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 10: Vector Data Analysis', 'Geospatial Technology Unlocked', 'Working with vector data in GIS applications.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '10 days 20 hours', CURRENT_DATE + INTERVAL '10 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 11: Raster Data Processing', 'Geospatial Technology Unlocked', 'Understanding and processing raster data formats.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '11 days 20 hours', CURRENT_DATE + INTERVAL '11 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 12: Spatial Analysis Techniques', 'Geospatial Technology Unlocked', 'Advanced spatial analysis methods and techniques.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '12 days 20 hours', CURRENT_DATE + INTERVAL '12 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

-- Week 3
('Day 13: Web GIS Development', 'Geospatial Technology Unlocked', 'Building web-based GIS applications and services.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '14 days 20 hours', CURRENT_DATE + INTERVAL '14 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 14: Python for Geospatial', 'Geospatial Technology Unlocked', 'Using Python libraries for geospatial data processing.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '15 days 20 hours', CURRENT_DATE + INTERVAL '15 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 15: Database Integration', 'Geospatial Technology Unlocked', 'Integrating geospatial data with databases and PostGIS.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '16 days 20 hours', CURRENT_DATE + INTERVAL '16 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 16: Cartography and Visualization', 'Geospatial Technology Unlocked', 'Creating effective maps and visualizations.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '17 days 20 hours', CURRENT_DATE + INTERVAL '17 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 17: Mobile GIS Applications', 'Geospatial Technology Unlocked', 'Developing and using mobile GIS solutions.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '18 days 20 hours', CURRENT_DATE + INTERVAL '18 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 18: AI in Geospatial Technology', 'Geospatial Technology Unlocked', 'Applying artificial intelligence to geospatial problems.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '19 days 20 hours', CURRENT_DATE + INTERVAL '19 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

-- Week 4
('Day 19: Project Planning and Management', 'Geospatial Technology Unlocked', 'Planning and managing geospatial projects effectively.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '21 days 20 hours', CURRENT_DATE + INTERVAL '21 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 20: Industry Applications', 'Geospatial Technology Unlocked', 'Real-world applications across different industries.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '22 days 20 hours', CURRENT_DATE + INTERVAL '22 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 21: Data Quality and Validation', 'Geospatial Technology Unlocked', 'Ensuring data quality and validation in geospatial workflows.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '23 days 20 hours', CURRENT_DATE + INTERVAL '23 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 22: Career Opportunities', 'Geospatial Technology Unlocked', 'Exploring career paths in the geospatial industry.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '24 days 20 hours', CURRENT_DATE + INTERVAL '24 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 23: Final Project Presentation', 'Geospatial Technology Unlocked', 'Students present their final projects and showcase their learning.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '25 days 20 hours', CURRENT_DATE + INTERVAL '25 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100),

('Day 24: Course Completion and Certification', 'Geospatial Technology Unlocked', 'Course wrap-up, certification ceremony, and next steps.', 'Dr. Sarah Mitchell', 
 CURRENT_DATE + INTERVAL '26 days 20 hours', CURRENT_DATE + INTERVAL '26 days 21 hours 30 minutes', 'upcoming', 'scheduled', false, generate_unique_stream_key(), 100);