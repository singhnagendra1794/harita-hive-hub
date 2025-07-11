-- Create geo processing jobs table
CREATE TABLE public.geo_processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL, -- 'raster_merge', 'raster_reproject', 'raster_clip', 'vector_buffer', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  input_files JSONB NOT NULL DEFAULT '[]', -- Array of file paths/URLs
  output_files JSONB DEFAULT '[]', -- Array of output file paths/URLs
  parameters JSONB NOT NULL DEFAULT '{}', -- Processing parameters
  progress INTEGER DEFAULT 0, -- 0-100
  error_message TEXT,
  estimated_completion_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create geo processing job usage tracking
CREATE TABLE public.geo_processing_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL,
  file_size_mb NUMERIC,
  processing_time_seconds INTEGER,
  subscription_tier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.geo_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_processing_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for geo_processing_jobs
CREATE POLICY "Users can view their own jobs" 
ON public.geo_processing_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs" 
ON public.geo_processing_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" 
ON public.geo_processing_jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all jobs" 
ON public.geo_processing_jobs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for geo_processing_usage
CREATE POLICY "Users can view their own usage" 
ON public.geo_processing_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" 
ON public.geo_processing_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage" 
ON public.geo_processing_usage 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Function to check job limits based on subscription tier
CREATE OR REPLACE FUNCTION public.check_geo_processing_limits(
  p_user_id UUID,
  p_job_type TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_subscription TEXT;
  job_count INTEGER;
  monthly_limit INTEGER;
  result JSONB;
BEGIN
  -- Get user subscription tier
  SELECT subscription_tier INTO user_subscription
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  -- Set limits based on tier
  CASE 
    WHEN user_subscription = 'free' THEN monthly_limit := 2;
    WHEN user_subscription = 'premium' THEN monthly_limit := 10;
    WHEN user_subscription = 'pro' THEN monthly_limit := 50;
    WHEN user_subscription = 'enterprise' THEN monthly_limit := -1; -- unlimited
    ELSE monthly_limit := 0;
  END CASE;
  
  -- Count jobs this month
  SELECT COUNT(*)
  INTO job_count
  FROM public.geo_processing_usage
  WHERE user_id = p_user_id
    AND job_type = p_job_type
    AND created_at >= date_trunc('month', now());
  
  -- Build result
  result := jsonb_build_object(
    'subscription_tier', user_subscription,
    'monthly_limit', monthly_limit,
    'current_usage', job_count,
    'can_process', CASE 
      WHEN monthly_limit = -1 THEN true
      WHEN job_count < monthly_limit THEN true
      ELSE false
    END
  );
  
  RETURN result;
END;
$$;

-- Function to update job progress
CREATE OR REPLACE FUNCTION public.update_job_progress()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_geo_processing_jobs_updated_at
BEFORE UPDATE ON public.geo_processing_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_job_progress();

-- Create storage bucket for geo processing files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('geo-processing', 'geo-processing', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for geo processing files
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'geo-processing' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'geo-processing' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'geo-processing' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'geo-processing' AND auth.uid()::text = (storage.foldername(name))[1]);