-- Create storage bucket for project templates
INSERT INTO storage.buckets (id, name, public) VALUES ('project-templates', 'project-templates', true);

-- Create policy to allow public access to template files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-templates');

-- Create policy to allow admins to upload template files
CREATE POLICY "Admin can upload templates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-templates' AND EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));