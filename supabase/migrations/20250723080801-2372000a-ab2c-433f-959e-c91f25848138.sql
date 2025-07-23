-- Fix storage policies for user-resumes bucket
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper path checking
CREATE POLICY "Users can upload their own resumes"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id = 'user-resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own resumes"
  ON storage.objects
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'user-resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own resumes"
  ON storage.objects
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'user-resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );