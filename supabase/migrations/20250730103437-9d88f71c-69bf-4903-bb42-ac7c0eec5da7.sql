-- Fix security warnings by setting search_path for the new functions

-- Fix search_path for create_weekly_youtube_streams function
CREATE OR REPLACE FUNCTION create_weekly_youtube_streams()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Fix search_path for log_youtube_api_error function
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
SET search_path = 'public'
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