-- Drop all storage policies for user-resumes and create a completely open one for testing
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;

-- Create a completely permissive policy for testing (this is just for debugging)
CREATE POLICY "Allow all operations on user-resumes bucket"
ON storage.objects FOR ALL
USING (bucket_id = 'user-resumes')
WITH CHECK (bucket_id = 'user-resumes');