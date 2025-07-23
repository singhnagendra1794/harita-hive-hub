-- Fix security warnings: update functions to have proper search_path
CREATE OR REPLACE FUNCTION public.create_geova_daily_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  start_date DATE := '2025-07-22';
  current_day INTEGER;
  session_date DATE;
  topics TEXT[] := ARRAY[
    'Introduction to Geospatial Technology',
    'Understanding Coordinate Systems and Projections',
    'Introduction to QGIS Interface and Basic Tools',
    'Working with Vector Data - Points, Lines, Polygons',
    'Raster Data Fundamentals and Analysis',
    'Spatial Queries and Geoprocessing',
    'Creating Maps and Cartographic Principles',
    'Introduction to Spatial Databases and PostGIS',
    'Web GIS Fundamentals',
    'Remote Sensing Basics',
    'GPS and Field Data Collection',
    'Spatial Analysis Techniques',
    'Introduction to Python for GIS',
    'Automating GIS Workflows',
    'Working with APIs and Web Services',
    'Mobile GIS and Location Services',
    '3D GIS and Visualization',
    'Drone Mapping and Photogrammetry',
    'LiDAR Data Processing',
    'Change Detection Analysis',
    'Environmental Monitoring Applications',
    'Urban Planning with GIS',
    'Transportation Network Analysis',
    'Hydrology and Watershed Analysis',
    'Climate Data Analysis',
    'Machine Learning in Geospatial',
    'Deep Learning for Earth Observation',
    'Geospatial AI Applications',
    'Cloud Computing for GIS',
    'Final Project Presentation'
  ];
  topic_descriptions TEXT[] := ARRAY[
    'Overview of geospatial technology, applications, and career opportunities in the field',
    'Understanding different coordinate systems, projections, and datum transformations',
    'Getting familiar with QGIS interface, basic navigation, and essential tools',
    'Creating, editing, and analyzing vector data formats and their applications',
    'Understanding raster data types, analysis techniques, and processing workflows',
    'Learning spatial query operations and basic geoprocessing tools',
    'Map design principles, symbology, and creating professional cartographic outputs',
    'Introduction to spatial databases, SQL, and PostGIS for geospatial data management',
    'Understanding web mapping technologies, services, and online GIS platforms',
    'Fundamentals of remote sensing, satellite imagery, and image interpretation',
    'GPS technology, field data collection techniques, and survey methods',
    'Advanced spatial analysis methods including proximity, overlay, and statistical analysis',
    'Getting started with Python programming for GIS automation and analysis',
    'Creating automated workflows, batch processing, and scripting for efficiency',
    'Integrating external data sources through APIs and web services',
    'Mobile GIS applications, location-based services, and field mapping solutions',
    'Three-dimensional GIS analysis, modeling, and advanced visualization techniques',
    'Unmanned aerial vehicles for mapping, photogrammetry, and data collection',
    'Light Detection and Ranging data processing, analysis, and applications',
    'Temporal analysis techniques for monitoring environmental and urban changes',
    'Applying GIS for environmental monitoring, conservation, and sustainability projects',
    'Urban planning applications, zoning analysis, and smart city development',
    'Network analysis, route optimization, and transportation planning with GIS',
    'Watershed delineation, flow analysis, and water resource management',
    'Climate data analysis, modeling, and visualization for climate change studies',
    'Introduction to machine learning algorithms for geospatial pattern recognition',
    'Deep learning applications for satellite imagery and earth observation',
    'Artificial intelligence in geospatial analysis and automated feature extraction',
    'Cloud-based GIS platforms, scalable computing, and distributed processing',
    'Students present capstone projects showcasing learned skills and applications'
  ];
BEGIN
  -- Clear existing schedule to avoid duplicates
  DELETE FROM public.geova_teaching_schedule;
  
  -- Generate 30 days of sessions (can be extended to 90+ days)
  FOR current_day IN 1..30 LOOP
    session_date := start_date + (current_day - 1);
    
    INSERT INTO public.geova_teaching_schedule (
      day_number,
      topic_title,
      topic_description,
      scheduled_date,
      scheduled_time,
      learning_objectives,
      practical_exercises,
      tools_used
    ) VALUES (
      current_day,
      topics[current_day],
      topic_descriptions[current_day],
      session_date,
      '05:00:00',
      ARRAY['Understand core concepts', 'Apply practical skills', 'Complete hands-on exercises'],
      ARRAY['Interactive demonstration', 'Guided practice', 'Q&A session'],
      ARRAY['QGIS', 'Python', 'PostGIS', 'Web browsers']
    );
  END LOOP;
END;
$function$;

-- Fix security warnings: update update_geova_student_progress function
CREATE OR REPLACE FUNCTION public.update_geova_student_progress(
  p_user_id UUID,
  p_day_number INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.geova_student_progress (
    user_id,
    current_day,
    completed_days,
    attendance_count,
    last_attended,
    progress_percentage
  ) VALUES (
    p_user_id,
    p_day_number + 1,
    ARRAY[p_day_number],
    1,
    now(),
    ROUND((p_day_number::DECIMAL / 90) * 100, 2)
  )
  ON CONFLICT (user_id, course_title)
  DO UPDATE SET
    current_day = GREATEST(geova_student_progress.current_day, p_day_number + 1),
    completed_days = CASE 
      WHEN p_day_number = ANY(geova_student_progress.completed_days) THEN geova_student_progress.completed_days
      ELSE array_append(geova_student_progress.completed_days, p_day_number)
    END,
    attendance_count = geova_student_progress.attendance_count + 1,
    last_attended = now(),
    progress_percentage = ROUND((array_length(
      CASE 
        WHEN p_day_number = ANY(geova_student_progress.completed_days) THEN geova_student_progress.completed_days
        ELSE array_append(geova_student_progress.completed_days, p_day_number)
      END, 1
    )::DECIMAL / 90) * 100, 2),
    updated_at = now();
END;
$function$;