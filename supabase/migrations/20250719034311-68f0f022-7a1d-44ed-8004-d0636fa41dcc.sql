-- Create storage bucket for uploaded geospatial files
INSERT INTO storage.buckets (id, name, public) VALUES ('geospatial-files', 'geospatial-files', true);

-- Create storage policies for geospatial files
CREATE POLICY "Allow public read access to geospatial files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'geospatial-files');

CREATE POLICY "Allow authenticated users to upload geospatial files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'geospatial-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own geospatial files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'geospatial-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own geospatial files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'geospatial-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table to store map projects
CREATE TABLE public.map_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_data JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for map_projects
ALTER TABLE public.map_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for map_projects
CREATE POLICY "Users can view their own projects" 
ON public.map_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public projects" 
ON public.map_projects 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create their own projects" 
ON public.map_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.map_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.map_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_map_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_map_projects_updated_at
BEFORE UPDATE ON public.map_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_map_projects_updated_at();