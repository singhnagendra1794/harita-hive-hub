-- Enhanced Code Snippets Database Schema
-- This migration creates tables for a production-grade code library

-- Main code snippets table with enhanced metadata
CREATE TABLE IF NOT EXISTS public.enhanced_code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  use_case TEXT NOT NULL,
  language TEXT NOT NULL,
  category TEXT NOT NULL,
  code TEXT NOT NULL,
  inputs_required JSONB DEFAULT '[]'::jsonb,
  output_format TEXT,
  configuration JSONB DEFAULT '{}'::jsonb,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  is_tested BOOLEAN DEFAULT false,
  is_production_ready BOOLEAN DEFAULT false,
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_tested_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notebook_url TEXT,
  colab_url TEXT,
  github_url TEXT,
  preview_image_url TEXT
);

-- Tags table for better categorization
CREATE TABLE IF NOT EXISTS public.code_snippet_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID REFERENCES public.enhanced_code_snippets(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(snippet_id, tag)
);

-- Feedback and issue reporting
CREATE TABLE IF NOT EXISTS public.code_snippet_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID REFERENCES public.enhanced_code_snippets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug_report', 'improvement', 'question', 'rating')),
  title TEXT,
  description TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- User favorites/bookmarks
CREATE TABLE IF NOT EXISTS public.code_snippet_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  snippet_id UUID REFERENCES public.enhanced_code_snippets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, snippet_id)
);

-- Test results for code snippets
CREATE TABLE IF NOT EXISTS public.code_snippet_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID REFERENCES public.enhanced_code_snippets(id) ON DELETE CASCADE,
  test_environment TEXT NOT NULL,
  test_status TEXT NOT NULL CHECK (test_status IN ('passed', 'failed', 'warning')),
  test_output TEXT,
  error_message TEXT,
  test_duration_ms INTEGER,
  tested_by UUID REFERENCES auth.users(id),
  tested_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enhanced_code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippet_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippet_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippet_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippet_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enhanced_code_snippets
CREATE POLICY "Anyone can view active code snippets"
ON public.enhanced_code_snippets
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authors can manage their own snippets"
ON public.enhanced_code_snippets
FOR ALL
USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all snippets"
ON public.enhanced_code_snippets
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for tags
CREATE POLICY "Anyone can view snippet tags"
ON public.code_snippet_tags
FOR SELECT
USING (true);

CREATE POLICY "Authors can manage tags for their snippets"
ON public.code_snippet_tags
FOR ALL
USING (EXISTS (
  SELECT 1 FROM enhanced_code_snippets 
  WHERE id = snippet_id AND author_id = auth.uid()
));

-- RLS Policies for feedback
CREATE POLICY "Anyone can view feedback"
ON public.code_snippet_feedback
FOR SELECT
USING (true);

CREATE POLICY "Users can create feedback"
ON public.code_snippet_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
ON public.code_snippet_feedback
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for favorites
CREATE POLICY "Users can manage their own favorites"
ON public.code_snippet_favorites
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for tests
CREATE POLICY "Anyone can view test results"
ON public.code_snippet_tests
FOR SELECT
USING (true);

CREATE POLICY "Admins and authors can create tests"
ON public.code_snippet_tests
FOR INSERT
WITH CHECK (
  auth.uid() = tested_by AND (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') OR
    EXISTS (SELECT 1 FROM enhanced_code_snippets WHERE id = snippet_id AND author_id = auth.uid())
  )
);

-- Update triggers
CREATE TRIGGER update_enhanced_code_snippets_updated_at
  BEFORE UPDATE ON public.enhanced_code_snippets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update rating average
CREATE OR REPLACE FUNCTION public.update_snippet_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.enhanced_code_snippets
  SET 
    rating_average = (
      SELECT ROUND(AVG(rating::DECIMAL), 2)
      FROM code_snippet_feedback
      WHERE snippet_id = COALESCE(NEW.snippet_id, OLD.snippet_id)
        AND feedback_type = 'rating'
        AND rating IS NOT NULL
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM code_snippet_feedback
      WHERE snippet_id = COALESCE(NEW.snippet_id, OLD.snippet_id)
        AND feedback_type = 'rating'
        AND rating IS NOT NULL
    )
  WHERE id = COALESCE(NEW.snippet_id, OLD.snippet_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
CREATE TRIGGER update_snippet_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.code_snippet_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_snippet_rating();

-- Indexes for performance
CREATE INDEX idx_enhanced_code_snippets_category ON public.enhanced_code_snippets(category);
CREATE INDEX idx_enhanced_code_snippets_language ON public.enhanced_code_snippets(language);
CREATE INDEX idx_enhanced_code_snippets_author ON public.enhanced_code_snippets(author_id);
CREATE INDEX idx_enhanced_code_snippets_active ON public.enhanced_code_snippets(is_active);
CREATE INDEX idx_code_snippet_tags_snippet ON public.code_snippet_tags(snippet_id);
CREATE INDEX idx_code_snippet_tags_tag ON public.code_snippet_tags(tag);
CREATE INDEX idx_code_snippet_feedback_snippet ON public.code_snippet_feedback(snippet_id);
CREATE INDEX idx_code_snippet_favorites_user ON public.code_snippet_favorites(user_id);