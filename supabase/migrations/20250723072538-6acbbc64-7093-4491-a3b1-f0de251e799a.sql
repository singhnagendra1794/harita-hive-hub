-- Create follow-up questions table if it doesn't exist
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

-- Create policy for follow-up questions if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'resume_follow_up_questions' 
    AND policyname = 'Users can manage their own follow-up questions'
  ) THEN
    CREATE POLICY "Users can manage their own follow-up questions" 
    ON public.resume_follow_up_questions 
    FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;