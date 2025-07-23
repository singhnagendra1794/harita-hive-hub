-- Create GEOVA recordings system
CREATE TABLE IF NOT EXISTS public.geova_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INTEGER NOT NULL,
  topic_title TEXT NOT NULL,
  topic_description TEXT,
  recording_date DATE NOT NULL,
  recording_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 5400, -- 1.5 hours default
  file_size_bytes BIGINT,
  recording_status TEXT DEFAULT 'scheduled' CHECK (recording_status IN ('scheduled', 'recording', 'processing', 'completed', 'failed')),
  hls_url TEXT,
  mp4_url TEXT,
  auto_generated_description TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student recording bookmarks
CREATE TABLE IF NOT EXISTS public.student_recording_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recording_id UUID NOT NULL REFERENCES public.geova_recordings(id) ON DELETE CASCADE,
  bookmarked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, recording_id)
);

-- Create recording Q&A interactions
CREATE TABLE IF NOT EXISTS public.recording_qa_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recording_id UUID NOT NULL REFERENCES public.geova_recordings(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  timestamp_seconds INTEGER, -- Time in recording when question was asked
  ai_response TEXT,
  ai_responder TEXT DEFAULT 'GEOVA', -- Could be GEOVA or AVA
  interaction_type TEXT DEFAULT 'question' CHECK (interaction_type IN ('question', 'clarification', 'follow_up')),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recording analytics
CREATE TABLE IF NOT EXISTS public.recording_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.geova_recordings(id) ON DELETE CASCADE,
  user_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('view_start', 'view_complete', 'bookmark_add', 'bookmark_remove', 'question_ask', 'seek', 'pause', 'resume')),
  timestamp_seconds INTEGER, -- Time in recording for time-based events
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.geova_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_recording_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recording_qa_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recording_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for GEOVA recordings
CREATE POLICY "Enrolled students can view GEOVA recordings" 
ON public.geova_recordings 
FOR SELECT 
USING (
  -- Allow if user has premium access and is enrolled in the course
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND 'Geospatial Technology Unlocked' = ANY(p.enrolled_courses)
    AND public.user_has_premium_access(auth.uid())
  )
);

CREATE POLICY "Admins can manage all GEOVA recordings" 
ON public.geova_recordings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- RLS Policies for student bookmarks
CREATE POLICY "Students can manage their own recording bookmarks" 
ON public.student_recording_bookmarks 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for recording Q&A
CREATE POLICY "Students can view recording Q&A" 
ON public.recording_qa_interactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND 'Geospatial Technology Unlocked' = ANY(p.enrolled_courses)
    AND public.user_has_premium_access(auth.uid())
  )
);

CREATE POLICY "Students can create recording Q&A" 
ON public.recording_qa_interactions 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND 'Geospatial Technology Unlocked' = ANY(p.enrolled_courses)
    AND public.user_has_premium_access(auth.uid())
  )
);

CREATE POLICY "Students can update their own recording Q&A" 
ON public.recording_qa_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for recording analytics
CREATE POLICY "Students can create their own recording analytics" 
ON public.recording_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all recording analytics" 
ON public.recording_analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Create indexes for performance
CREATE INDEX idx_geova_recordings_date ON public.geova_recordings(recording_date DESC);
CREATE INDEX idx_geova_recordings_day_number ON public.geova_recordings(day_number DESC);
CREATE INDEX idx_geova_recordings_status ON public.geova_recordings(recording_status);
CREATE INDEX idx_student_bookmarks_user ON public.student_recording_bookmarks(user_id);
CREATE INDEX idx_recording_qa_user ON public.recording_qa_interactions(user_id);
CREATE INDEX idx_recording_qa_recording ON public.recording_qa_interactions(recording_id);
CREATE INDEX idx_recording_analytics_recording ON public.recording_analytics(recording_id);
CREATE INDEX idx_recording_analytics_user ON public.recording_analytics(user_id);

-- Function to auto-populate recordings from teaching schedule
CREATE OR REPLACE FUNCTION public.sync_geova_recordings_from_schedule()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Insert recordings for all scheduled teaching sessions that don't exist yet
  INSERT INTO public.geova_recordings (
    day_number,
    topic_title,
    topic_description,
    recording_date,
    recording_status,
    auto_generated_description
  )
  SELECT 
    gts.day_number,
    gts.topic_title,
    gts.topic_description,
    gts.scheduled_date,
    CASE 
      WHEN gts.scheduled_date < CURRENT_DATE THEN 'completed'
      WHEN gts.scheduled_date = CURRENT_DATE THEN 'recording'
      ELSE 'scheduled'
    END,
    CONCAT('Day ', gts.day_number, ' of the Geospatial Technology Unlocked course. ', gts.topic_description)
  FROM public.geova_teaching_schedule gts
  WHERE NOT EXISTS (
    SELECT 1 FROM public.geova_recordings gr
    WHERE gr.day_number = gts.day_number
  )
  ORDER BY gts.day_number;
END;
$$;

-- Function to track recording views
CREATE OR REPLACE FUNCTION public.track_recording_view(p_recording_id UUID, p_user_id UUID, p_event_type TEXT, p_timestamp_seconds INTEGER DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Insert analytics event
  INSERT INTO public.recording_analytics (recording_id, user_id, event_type, timestamp_seconds)
  VALUES (p_recording_id, p_user_id, p_event_type, p_timestamp_seconds);
  
  -- Update view count if it's a view start event
  IF p_event_type = 'view_start' THEN
    UPDATE public.geova_recordings 
    SET views_count = views_count + 1 
    WHERE id = p_recording_id;
  END IF;
END;
$$;

-- Function to get next class time
CREATE OR REPLACE FUNCTION public.get_next_geova_class_time()
RETURNS TABLE(
  next_class_date DATE,
  next_class_time TIME,
  next_class_topic TEXT,
  minutes_until_next INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  current_ist_time TIMESTAMP WITH TIME ZONE;
  next_class_datetime TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current time in IST (UTC+5:30)
  current_ist_time := now() AT TIME ZONE 'Asia/Kolkata';
  
  -- Find next scheduled class
  SELECT 
    gts.scheduled_date,
    gts.scheduled_time,
    gts.topic_title,
    EXTRACT(EPOCH FROM ((gts.scheduled_date + gts.scheduled_time) AT TIME ZONE 'Asia/Kolkata' - current_ist_time))/60
  INTO next_class_date, next_class_time, next_class_topic, minutes_until_next
  FROM public.geova_teaching_schedule gts
  WHERE (gts.scheduled_date + gts.scheduled_time) AT TIME ZONE 'Asia/Kolkata' > current_ist_time
  ORDER BY gts.scheduled_date, gts.scheduled_time
  LIMIT 1;
  
  RETURN NEXT;
END;
$$;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_geova_recordings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_geova_recordings_updated_at
  BEFORE UPDATE ON public.geova_recordings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_geova_recordings_updated_at();

CREATE TRIGGER update_recording_qa_updated_at
  BEFORE UPDATE ON public.recording_qa_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_geova_recordings_updated_at();

-- Initial sync of recordings from schedule
SELECT public.sync_geova_recordings_from_schedule();