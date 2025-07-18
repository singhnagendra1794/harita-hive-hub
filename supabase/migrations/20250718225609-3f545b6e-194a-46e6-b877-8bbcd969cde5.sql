-- Create table for storing user resumes
CREATE TABLE IF NOT EXISTS public.user_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  extracted_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for storing generated roadmaps
CREATE TABLE IF NOT EXISTS public.career_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.user_resumes(id) ON DELETE SET NULL,
  roadmap_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_path TEXT,
  generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for skill recommendations and tracking
CREATE TABLE IF NOT EXISTS public.skill_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.career_roadmaps(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
  current_level TEXT DEFAULT 'beginner' CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
  target_level TEXT DEFAULT 'intermediate' CHECK (target_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_weeks INTEGER DEFAULT 4,
  recommended_resources JSONB DEFAULT '[]'::jsonb,
  is_trending BOOLEAN DEFAULT false,
  market_demand TEXT DEFAULT 'medium' CHECK (market_demand IN ('low', 'medium', 'high', 'very_high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_resumes
CREATE POLICY "Users can manage their own resumes" ON public.user_resumes
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for career_roadmaps  
CREATE POLICY "Users can manage their own roadmaps" ON public.career_roadmaps
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for skill_recommendations
CREATE POLICY "Users can view their own skill recommendations" ON public.skill_recommendations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.career_roadmaps 
      WHERE id = skill_recommendations.roadmap_id 
      AND user_id = auth.uid()
    )
  );

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-resumes', 
  'user-resumes', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for generated PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'roadmap-pdfs', 
  'roadmap-pdfs', 
  false,
  20971520 -- 20MB limit
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for user-resumes bucket
CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own resumes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for roadmap-pdfs bucket
CREATE POLICY "Users can view their own roadmap PDFs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'roadmap-pdfs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_user_id ON public.career_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_roadmap_id ON public.skill_recommendations(roadmap_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_user_resumes_updated_at
  BEFORE UPDATE ON public.user_resumes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_roadmaps_updated_at
  BEFORE UPDATE ON public.career_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();