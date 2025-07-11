-- Create live_classes table for YouTube Live streaming
CREATE TABLE public.live_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_live BOOLEAN NOT NULL DEFAULT true,
  access_tier TEXT NOT NULL DEFAULT 'pro',
  thumbnail_url TEXT,
  instructor TEXT DEFAULT 'Nagendra Singh',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view live classes" 
ON public.live_classes 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage live classes" 
ON public.live_classes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_live_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_live_classes_updated_at
BEFORE UPDATE ON public.live_classes
FOR EACH ROW
EXECUTE FUNCTION public.update_live_classes_updated_at();