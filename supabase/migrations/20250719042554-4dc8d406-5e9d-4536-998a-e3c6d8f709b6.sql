-- Enhance live_classes table for OBS + YouTube streaming support
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS stream_key TEXT,
ADD COLUMN IF NOT EXISTS stream_server_url TEXT DEFAULT 'rtmp://a.rtmp.youtube.com/live2/',
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS class_status TEXT DEFAULT 'upcoming' CHECK (class_status IN ('upcoming', 'live', 'ended', 'recorded')),
ADD COLUMN IF NOT EXISTS viewer_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chat_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_record BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS stream_type TEXT DEFAULT 'youtube' CHECK (stream_type IN ('youtube', 'obs', 'hybrid'));

-- Create class_registrations table for tracking student enrollments
CREATE TABLE IF NOT EXISTS public.class_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attendance_status TEXT DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'missed')),
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(class_id, user_id)
);

-- Create class_qa table for Q&A functionality
CREATE TABLE IF NOT EXISTS public.class_qa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by UUID REFERENCES auth.users(id),
  answered_at TIMESTAMP WITH TIME ZONE,
  is_highlighted BOOLEAN DEFAULT false,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create instructor_stream_settings table
CREATE TABLE IF NOT EXISTS public.instructor_stream_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_stream_type TEXT DEFAULT 'youtube' CHECK (default_stream_type IN ('youtube', 'obs', 'hybrid')),
  youtube_channel_id TEXT,
  obs_stream_key TEXT,
  stream_quality TEXT DEFAULT 'HD' CHECK (stream_quality IN ('SD', 'HD', '4K')),
  enable_chat BOOLEAN DEFAULT true,
  enable_recording BOOLEAN DEFAULT true,
  backup_recording BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(instructor_id)
);

-- Enable RLS on new tables
ALTER TABLE public.class_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_stream_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for class_registrations
CREATE POLICY "Users can view their own registrations" 
ON public.class_registrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can register for classes" 
ON public.class_registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" 
ON public.class_registrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Instructors can view their class registrations" 
ON public.class_registrations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.live_classes lc 
  WHERE lc.id = class_registrations.class_id 
  AND lc.created_by = auth.uid()
));

CREATE POLICY "Admins can manage all registrations" 
ON public.class_registrations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));

-- RLS Policies for class_qa
CREATE POLICY "Users can view Q&A for classes they're registered for" 
ON public.class_qa 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.class_registrations cr 
  WHERE cr.class_id = class_qa.class_id 
  AND cr.user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM public.live_classes lc 
  WHERE lc.id = class_qa.class_id 
  AND lc.created_by = auth.uid()
));

CREATE POLICY "Registered users can ask questions" 
ON public.class_qa 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.class_registrations cr 
  WHERE cr.class_id = class_qa.class_id 
  AND cr.user_id = auth.uid()
));

CREATE POLICY "Users can update their own questions" 
ON public.class_qa 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Instructors can answer questions in their classes" 
ON public.class_qa 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.live_classes lc 
  WHERE lc.id = class_qa.class_id 
  AND lc.created_by = auth.uid()
));

-- RLS Policies for instructor_stream_settings
CREATE POLICY "Instructors can manage their own settings" 
ON public.instructor_stream_settings 
FOR ALL 
USING (auth.uid() = instructor_id);

CREATE POLICY "Admins can view all instructor settings" 
ON public.instructor_stream_settings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));

-- Create function to automatically update class status
CREATE OR REPLACE FUNCTION public.update_class_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update classes to 'live' when they should be live
  UPDATE public.live_classes
  SET class_status = 'live'
  WHERE class_status = 'upcoming'
    AND starts_at <= now()
    AND (ends_at IS NULL OR ends_at > now())
    AND is_live = true;
    
  -- Update classes to 'ended' when they're past end time
  UPDATE public.live_classes
  SET class_status = 'ended'
  WHERE class_status = 'live'
    AND ends_at IS NOT NULL
    AND ends_at <= now();
    
  -- Update classes to 'recorded' when recording is available
  UPDATE public.live_classes
  SET class_status = 'recorded'
  WHERE class_status = 'ended'
    AND recording_url IS NOT NULL;
END;
$$;

-- Create function to track class attendance
CREATE OR REPLACE FUNCTION public.track_class_attendance(
  p_class_id UUID,
  p_user_id UUID,
  p_action TEXT -- 'join' or 'leave'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_action = 'join' THEN
    UPDATE public.class_registrations
    SET 
      attendance_status = 'attended',
      joined_at = CASE WHEN joined_at IS NULL THEN now() ELSE joined_at END
    WHERE class_id = p_class_id AND user_id = p_user_id;
    
    -- Update viewer count
    UPDATE public.live_classes
    SET viewer_count = viewer_count + 1
    WHERE id = p_class_id;
    
  ELSIF p_action = 'leave' THEN
    UPDATE public.class_registrations
    SET left_at = now()
    WHERE class_id = p_class_id AND user_id = p_user_id;
    
    -- Update viewer count
    UPDATE public.live_classes
    SET viewer_count = GREATEST(viewer_count - 1, 0)
    WHERE id = p_class_id;
  END IF;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_registrations_class_user ON public.class_registrations(class_id, user_id);
CREATE INDEX IF NOT EXISTS idx_class_qa_class_id ON public.class_qa(class_id);
CREATE INDEX IF NOT EXISTS idx_class_qa_created_at ON public.class_qa(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON public.live_classes(class_status);
CREATE INDEX IF NOT EXISTS idx_live_classes_starts_at ON public.live_classes(starts_at);

-- Create triggers for updated_at
CREATE TRIGGER update_class_qa_updated_at
  BEFORE UPDATE ON public.class_qa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instructor_stream_settings_updated_at
  BEFORE UPDATE ON public.instructor_stream_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();