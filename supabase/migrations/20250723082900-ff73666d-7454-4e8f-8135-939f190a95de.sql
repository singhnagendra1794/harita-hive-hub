-- First ensure the bucket is configured correctly 
UPDATE storage.buckets 
SET public = false 
WHERE id = 'user-resumes';

-- Drop and recreate the INSERT policy with simpler logic
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;

-- Create a simpler INSERT policy that should work
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-resumes'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);