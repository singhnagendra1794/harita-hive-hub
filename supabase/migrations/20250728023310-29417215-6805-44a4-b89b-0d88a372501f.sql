-- Create admin_uploads table for super admin universal uploads
CREATE TABLE public.admin_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  assigned_page TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_uploads
CREATE POLICY "Anyone can view admin uploads" 
ON public.admin_uploads 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all uploads" 
ON public.admin_uploads 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_uploads_updated_at
  BEFORE UPDATE ON public.admin_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-uploads', 'admin-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for admin-uploads
CREATE POLICY "Admins can upload admin files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'admin-uploads' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Anyone can view admin uploads" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'admin-uploads');