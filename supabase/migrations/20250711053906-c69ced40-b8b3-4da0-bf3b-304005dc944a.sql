-- Create missing search queries table for Search-Aware Learning
CREATE TABLE public.missing_search_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  query TEXT NOT NULL,
  search_filters JSONB DEFAULT '{}',
  times_requested INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'ignored'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_with JSONB -- Could store content ID, URL, etc. of what resolved it
);

-- Enable RLS
ALTER TABLE public.missing_search_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can insert missing search queries" 
ON public.missing_search_queries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own missing queries" 
ON public.missing_search_queries 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view and manage all missing queries" 
ON public.missing_search_queries 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Function to track missing search queries
CREATE OR REPLACE FUNCTION public.track_missing_search_query(
  p_user_id UUID,
  p_query TEXT,
  p_filters JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_id UUID;
  result_id UUID;
BEGIN
  -- Check if this query already exists (case-insensitive)
  SELECT id INTO existing_id
  FROM public.missing_search_queries
  WHERE LOWER(query) = LOWER(p_query)
  AND status != 'resolved'
  LIMIT 1;
  
  IF existing_id IS NOT NULL THEN
    -- Update existing query count and timestamp
    UPDATE public.missing_search_queries
    SET 
      times_requested = times_requested + 1,
      updated_at = now(),
      user_id = COALESCE(user_id, p_user_id) -- Set user_id if it was null
    WHERE id = existing_id;
    
    result_id := existing_id;
  ELSE
    -- Insert new missing query
    INSERT INTO public.missing_search_queries (user_id, query, search_filters)
    VALUES (p_user_id, p_query, p_filters)
    RETURNING id INTO result_id;
  END IF;
  
  RETURN result_id;
END;
$$;

-- Function to get top requested missing queries for admin dashboard
CREATE OR REPLACE FUNCTION public.get_top_missing_queries(
  p_limit INTEGER DEFAULT 20,
  p_status TEXT DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  query TEXT,
  times_requested INTEGER,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  days_old INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    msq.id,
    msq.query,
    msq.times_requested,
    msq.status,
    msq.created_at,
    msq.updated_at,
    EXTRACT(DAYS FROM (now() - msq.created_at))::INTEGER as days_old
  FROM public.missing_search_queries msq
  WHERE (p_status IS NULL OR msq.status = p_status)
  ORDER BY msq.times_requested DESC, msq.updated_at DESC
  LIMIT p_limit;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_missing_search_queries_query ON public.missing_search_queries USING gin(to_tsvector('english', query));
CREATE INDEX idx_missing_search_queries_times_requested ON public.missing_search_queries (times_requested DESC);
CREATE INDEX idx_missing_search_queries_status ON public.missing_search_queries (status);
CREATE INDEX idx_missing_search_queries_created_at ON public.missing_search_queries (created_at DESC);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_missing_query_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_missing_search_queries_updated_at
BEFORE UPDATE ON public.missing_search_queries
FOR EACH ROW
EXECUTE FUNCTION public.update_missing_query_timestamp();