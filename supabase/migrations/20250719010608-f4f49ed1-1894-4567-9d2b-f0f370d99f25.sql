-- Create corporate_inquiries table
CREATE TABLE public.corporate_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  email TEXT NOT NULL,
  team_size TEXT NOT NULL,
  areas_of_interest TEXT[] DEFAULT '{}',
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public to insert inquiries" 
ON public.corporate_inquiries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries" 
ON public.corporate_inquiries 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Admins can update inquiries" 
ON public.corporate_inquiries 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create trigger for updated_at
CREATE TRIGGER update_corporate_inquiries_updated_at
BEFORE UPDATE ON public.corporate_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();