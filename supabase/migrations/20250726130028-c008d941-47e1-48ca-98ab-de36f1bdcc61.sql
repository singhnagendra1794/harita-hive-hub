-- Create missing user_location table that's referenced in handle_new_user function
CREATE TABLE IF NOT EXISTS public.user_location (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  country TEXT,
  city TEXT,
  ip_address TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_location ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own location" ON public.user_location
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own location" ON public.user_location
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert location data" ON public.user_location
  FOR INSERT WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_user_location_updated_at
  BEFORE UPDATE ON public.user_location
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();