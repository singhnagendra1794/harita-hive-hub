-- Add missing columns to user_resumes table for resume analysis
ALTER TABLE public.user_resumes 
ADD COLUMN IF NOT EXISTS extraction_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS processed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS extracted_data jsonb;