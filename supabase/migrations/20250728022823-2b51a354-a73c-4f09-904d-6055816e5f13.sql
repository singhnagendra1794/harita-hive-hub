-- Create marketplace_tools table for user uploads
CREATE TABLE public.marketplace_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  file_url TEXT,
  uploader_id UUID NOT NULL,
  gis_software TEXT[] DEFAULT '{}',
  demo_url TEXT,
  github_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

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
ALTER TABLE public.marketplace_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_tools
CREATE POLICY "Anyone can view approved tools" 
ON public.marketplace_tools 
FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Professional users can insert tools" 
ON public.marketplace_tools 
FOR INSERT 
WITH CHECK (
  auth.uid() = uploader_id AND 
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.plan = 'Professional'
  )
);

CREATE POLICY "Users can update their own tools" 
ON public.marketplace_tools 
FOR UPDATE 
USING (auth.uid() = uploader_id);

CREATE POLICY "Admins can manage all tools" 
ON public.marketplace_tools 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

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

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketplace_tools_updated_at
  BEFORE UPDATE ON public.marketplace_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_uploads_updated_at
  BEFORE UPDATE ON public.admin_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('marketplace-tools', 'marketplace-tools', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-uploads', 'admin-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for marketplace-tools
CREATE POLICY "Users can upload to their own folder" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'marketplace-tools' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view marketplace tools" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'marketplace-tools');

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