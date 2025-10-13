-- Create table for storing AI-generated toolkit recommendations
CREATE TABLE IF NOT EXISTS public.toolkit_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requirement TEXT NOT NULL,
  region TEXT,
  skill_level TEXT NOT NULL DEFAULT 'intermediate',
  recommendation_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.toolkit_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can view their own recommendations
CREATE POLICY "Users can view their own toolkit recommendations"
  ON public.toolkit_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own recommendations
CREATE POLICY "Users can create toolkit recommendations"
  ON public.toolkit_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own recommendations
CREATE POLICY "Users can delete their own toolkit recommendations"
  ON public.toolkit_recommendations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_toolkit_recommendations_user_id ON public.toolkit_recommendations(user_id);
CREATE INDEX idx_toolkit_recommendations_created_at ON public.toolkit_recommendations(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_toolkit_recommendations_updated_at
  BEFORE UPDATE ON public.toolkit_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();