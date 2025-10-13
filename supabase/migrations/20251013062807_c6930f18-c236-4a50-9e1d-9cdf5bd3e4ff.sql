-- Create trending_news table for storing geospatial news
CREATE TABLE IF NOT EXISTS public.trending_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  published_date TIMESTAMP WITH TIME ZONE NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  relevance_score INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trending_news ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view trending news
CREATE POLICY "Anyone can view trending news"
ON public.trending_news
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_trending_news_fetched_at ON public.trending_news(fetched_at DESC);
CREATE INDEX idx_trending_news_published_date ON public.trending_news(published_date DESC);
CREATE INDEX idx_trending_news_category ON public.trending_news(category);

-- Create function to clean old news (keep only last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_trending_news()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.trending_news
  WHERE fetched_at < now() - interval '7 days';
END;
$function$;