-- Fix user_resumes table schema by adding missing columns and updating data
ALTER TABLE public.user_resumes 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing records to populate new columns from resume_data
UPDATE public.user_resumes SET 
  file_name = COALESCE((resume_data->>'fileName')::text, 'unknown.pdf'),
  file_path = COALESCE((resume_data->>'filePath')::text, file_url, 'unknown'),
  file_type = COALESCE((resume_data->>'fileType')::text, 'application/pdf'),
  file_size = COALESCE((resume_data->>'fileSize')::integer, 0),
  uploaded_at = COALESCE((resume_data->>'uploadedAt')::timestamp with time zone, created_at)
WHERE file_name IS NULL OR file_path IS NULL OR file_type IS NULL;

-- Now make the new columns NOT NULL after populating them
ALTER TABLE public.user_resumes 
ALTER COLUMN file_name SET NOT NULL,
ALTER COLUMN file_path SET NOT NULL,
ALTER COLUMN file_type SET NOT NULL,
ALTER COLUMN file_size SET NOT NULL;

-- Drop the old resume_data column as it's no longer needed
ALTER TABLE public.user_resumes 
DROP COLUMN IF EXISTS resume_data;