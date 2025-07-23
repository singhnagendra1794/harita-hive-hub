-- Check if RLS is enabled on storage.objects and enable if not
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Update user_resumes table to match the expected schema
ALTER TABLE public.user_resumes 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Drop the old resume_data column if it exists and update constraints
ALTER TABLE public.user_resumes 
DROP COLUMN IF EXISTS resume_data CASCADE;

-- Make sure file_name, file_path, file_type are NOT NULL if they don't have values
UPDATE public.user_resumes SET 
  file_name = COALESCE(file_name, 'unknown.pdf'),
  file_path = COALESCE(file_path, file_url),
  file_type = COALESCE(file_type, 'application/pdf'),
  file_size = COALESCE(file_size, 0)
WHERE file_name IS NULL OR file_path IS NULL OR file_type IS NULL;

-- Now add NOT NULL constraints
ALTER TABLE public.user_resumes 
ALTER COLUMN file_name SET NOT NULL,
ALTER COLUMN file_path SET NOT NULL,
ALTER COLUMN file_type SET NOT NULL,
ALTER COLUMN file_size SET NOT NULL;