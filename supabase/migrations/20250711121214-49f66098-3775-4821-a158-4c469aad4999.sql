-- Create user_uploads table for storing user uploaded files
CREATE TABLE public.user_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'vector', 'raster', 'satellite'
  file_format TEXT NOT NULL, -- 'GEOJSON', 'SHP', 'TIFF', etc.
  file_size BIGINT NOT NULL,
  storage_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  coordinate_system TEXT DEFAULT 'EPSG:4326',
  status TEXT DEFAULT 'uploading',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for user uploads
CREATE POLICY "Users can view their own uploads" 
ON public.user_uploads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads" 
ON public.user_uploads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads" 
ON public.user_uploads 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads" 
ON public.user_uploads 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_uploads_user_id ON public.user_uploads(user_id);
CREATE INDEX idx_user_uploads_status ON public.user_uploads(status);
CREATE INDEX idx_user_uploads_created_at ON public.user_uploads(created_at);