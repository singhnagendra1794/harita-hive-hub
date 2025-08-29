-- Create zoom_meetings table for meeting management
CREATE TABLE IF NOT EXISTS public.zoom_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zoom_meeting_id TEXT NOT NULL UNIQUE,
  host_user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  password TEXT,
  join_url TEXT NOT NULL,
  start_url TEXT NOT NULL,
  meeting_type TEXT NOT NULL DEFAULT 'scheduled',
  status TEXT NOT NULL DEFAULT 'scheduled',
  access_tier TEXT NOT NULL DEFAULT 'free',
  recording_enabled BOOLEAN DEFAULT true,
  waiting_room BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create zoom_meeting_participants table
CREATE TABLE IF NOT EXISTS public.zoom_meeting_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.zoom_meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  UNIQUE(meeting_id, user_id)
);

-- Create zoom_recordings table
CREATE TABLE IF NOT EXISTS public.zoom_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.zoom_meetings(id) ON DELETE CASCADE,
  zoom_recording_id TEXT NOT NULL,
  recording_type TEXT NOT NULL DEFAULT 'shared_screen_with_speaker_view',
  file_type TEXT NOT NULL DEFAULT 'MP4',
  file_size BIGINT,
  download_url TEXT NOT NULL,
  play_url TEXT,
  recording_start TIMESTAMP WITH TIME ZONE,
  recording_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.zoom_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoom_meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoom_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for zoom_meetings
CREATE POLICY "Admins can manage all meetings" 
ON public.zoom_meetings 
FOR ALL 
USING (is_admin_secure());

CREATE POLICY "Users can view meetings they can access" 
ON public.zoom_meetings 
FOR SELECT 
USING (
  access_tier = 'free' OR 
  user_has_premium_access(auth.uid()) OR 
  host_user_id = auth.uid()
);

CREATE POLICY "Admins can create meetings" 
ON public.zoom_meetings 
FOR INSERT 
WITH CHECK (is_admin_secure());

-- RLS Policies for zoom_meeting_participants
CREATE POLICY "Users can manage their own participation" 
ON public.zoom_meeting_participants 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all participants" 
ON public.zoom_meeting_participants 
FOR ALL 
USING (is_admin_secure());

-- RLS Policies for zoom_recordings
CREATE POLICY "Users can view recordings for meetings they can access" 
ON public.zoom_recordings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.zoom_meetings zm 
    WHERE zm.id = zoom_recordings.meeting_id 
    AND (
      zm.access_tier = 'free' OR 
      user_has_premium_access(auth.uid()) OR 
      zm.host_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Admins can manage all recordings" 
ON public.zoom_recordings 
FOR ALL 
USING (is_admin_secure());

-- Create indexes for performance
CREATE INDEX idx_zoom_meetings_host_user_id ON public.zoom_meetings(host_user_id);
CREATE INDEX idx_zoom_meetings_start_time ON public.zoom_meetings(start_time);
CREATE INDEX idx_zoom_meetings_status ON public.zoom_meetings(status);
CREATE INDEX idx_zoom_meeting_participants_meeting_id ON public.zoom_meeting_participants(meeting_id);
CREATE INDEX idx_zoom_meeting_participants_user_id ON public.zoom_meeting_participants(user_id);
CREATE INDEX idx_zoom_recordings_meeting_id ON public.zoom_recordings(meeting_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_zoom_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_zoom_meetings_updated_at
  BEFORE UPDATE ON public.zoom_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_zoom_meetings_updated_at();