-- Complete HaritaHive YouTube Live automation system setup

-- Add current_live_video_id field to live_classes table for real-time tracking
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS current_live_video_id TEXT;

-- Create course_schedule table for auto-scheduling
CREATE TABLE IF NOT EXISTS course_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL,
  course_module_title TEXT NOT NULL,
  course_summary TEXT,
  day_of_week TEXT NOT NULL, -- 'monday', 'tuesday', etc.
  scheduled_time TIME DEFAULT '19:45:00', -- 7:45 PM IST
  duration_minutes INTEGER DEFAULT 120, -- 2 hours
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create youtube_stream_schedule table for auto-created streams
CREATE TABLE IF NOT EXISTS youtube_stream_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_starting DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  course_schedule_id UUID REFERENCES course_schedule(id),
  youtube_broadcast_id TEXT UNIQUE,
  youtube_stream_key TEXT,
  stream_title TEXT NOT NULL,
  stream_description TEXT,
  scheduled_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create youtube_api_logs table for error tracking
CREATE TABLE IF NOT EXISTS youtube_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  error_message TEXT,
  response_data JSONB,
  consecutive_failures INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample course schedule data for 6 days
INSERT INTO course_schedule (day_number, course_module_title, course_summary, day_of_week) VALUES
(1, 'Introduction to GIS Fundamentals', 'Learn the basics of Geographic Information Systems and their real-world applications', 'monday'),
(2, 'Coordinate Systems & Projections', 'Understanding spatial reference systems and how to work with different coordinate systems', 'tuesday'),
(3, 'Vector Data Analysis', 'Working with points, lines, and polygons in GIS for spatial analysis', 'wednesday'),
(4, 'Raster Data Processing', 'Analyzing satellite imagery and digital elevation models', 'thursday'),
(5, 'Spatial Database Management', 'Managing geospatial data with PostGIS and advanced queries', 'friday'),
(6, 'Advanced Mapping & Visualization', 'Creating professional maps and interactive web visualizations', 'saturday')
ON CONFLICT DO NOTHING;

-- Add RLS policies
ALTER TABLE course_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_stream_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_api_logs ENABLE ROW LEVEL SECURITY;

-- Course schedule policies
CREATE POLICY "Anyone can view course schedule" ON course_schedule FOR SELECT USING (true);
CREATE POLICY "Admins can manage course schedule" ON course_schedule FOR ALL USING (is_admin_secure());

-- YouTube stream schedule policies  
CREATE POLICY "Admins can manage stream schedule" ON youtube_stream_schedule FOR ALL USING (is_admin_secure());
CREATE POLICY "Anyone can view active stream schedule" ON youtube_stream_schedule FOR SELECT USING (status IN ('scheduled', 'live'));

-- API logs policies
CREATE POLICY "Admins can view API logs" ON youtube_api_logs FOR SELECT USING (is_admin_secure());
CREATE POLICY "System can insert API logs" ON youtube_api_logs FOR INSERT WITH CHECK (true);

-- Create function to auto-create weekly YouTube streams
CREATE OR REPLACE FUNCTION create_weekly_youtube_streams()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_monday DATE;
  week_ending DATE;
  schedule_record RECORD;
  stream_datetime TIMESTAMP WITH TIME ZONE;
  result JSONB := '{"created": [], "errors": []}'::jsonb;
BEGIN
  -- Calculate next Monday
  next_monday := CURRENT_DATE + (1 - EXTRACT(DOW FROM CURRENT_DATE) + 7)::INTEGER % 7;
  week_ending := next_monday + INTERVAL '5 days'; -- Saturday
  
  -- Loop through each course schedule (Monday to Saturday)
  FOR schedule_record IN 
    SELECT * FROM course_schedule 
    WHERE is_active = true 
    ORDER BY day_number
  LOOP
    -- Calculate the exact datetime for this day
    stream_datetime := (next_monday + (schedule_record.day_number - 1))::DATE + schedule_record.scheduled_time;
    
    -- Convert to IST (UTC+5:30)
    stream_datetime := stream_datetime AT TIME ZONE 'Asia/Kolkata';
    
    -- Insert into youtube_stream_schedule
    BEGIN
      INSERT INTO youtube_stream_schedule (
        week_starting,
        day_of_week,
        course_schedule_id,
        stream_title,
        stream_description,
        scheduled_datetime,
        status
      ) VALUES (
        next_monday,
        schedule_record.day_of_week,
        schedule_record.id,
        'Day ' || schedule_record.day_number || ' – ' || schedule_record.course_module_title,
        schedule_record.course_summary,
        stream_datetime,
        'scheduled'
      );
      
      result := jsonb_set(
        result, 
        '{created}', 
        (result->'created') || to_jsonb(schedule_record.course_module_title)
      );
    EXCEPTION WHEN OTHERS THEN
      result := jsonb_set(
        result, 
        '{errors}', 
        (result->'errors') || to_jsonb(SQLERRM)
      );
    END;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Create function to log API errors
CREATE OR REPLACE FUNCTION log_youtube_api_error(
  p_endpoint TEXT,
  p_method TEXT,
  p_status_code INTEGER,
  p_error_message TEXT,
  p_response_data JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  consecutive_count INTEGER := 0;
BEGIN
  -- Get consecutive failure count for this endpoint
  SELECT COALESCE(consecutive_failures, 0) + 1
  INTO consecutive_count
  FROM youtube_api_logs
  WHERE api_endpoint = p_endpoint
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Insert new log entry
  INSERT INTO youtube_api_logs (
    api_endpoint,
    method,
    status_code,
    error_message,
    response_data,
    consecutive_failures
  ) VALUES (
    p_endpoint,
    p_method,
    p_status_code,
    p_error_message,
    p_response_data,
    consecutive_count
  );
END;
$$;