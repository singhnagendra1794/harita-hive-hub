-- Fix the user-resumes storage policy
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;

-- Create the correct INSERT policy for user-resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-resumes' 
  AND auth.role() = 'authenticated'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);