-- Create the user_resumes table with all necessary columns
CREATE TABLE IF NOT EXISTS public.user_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resume_data JSONB DEFAULT '{}'::jsonb,
  file_url TEXT,
  extraction_status TEXT DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own resumes" 
ON public.user_resumes 
FOR ALL 
USING (auth.uid() = user_id);

-- Create storage bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-resumes', 'user-resumes', false) 
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'user-resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read their own resumes" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'user-resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own resumes" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'user-resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own resumes" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'user-resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create follow-up questions table
CREATE TABLE IF NOT EXISTS public.resume_follow_up_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resume_id UUID NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  responses JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for follow-up questions
ALTER TABLE public.resume_follow_up_questions ENABLE ROW LEVEL SECURITY;

-- Create policy for follow-up questions
CREATE POLICY "Users can manage their own follow-up questions" 
ON public.resume_follow_up_questions 
FOR ALL 
USING (auth.uid() = user_id);