-- Create download logs table for tracking GIS tool downloads
CREATE TABLE IF NOT EXISTS public.download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT,
  download_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  download_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for download logs
CREATE POLICY "Users can view their own download logs" 
ON public.download_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert download logs" 
ON public.download_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_download_logs_user_id ON public.download_logs(user_id);
CREATE INDEX idx_download_logs_tool_id ON public.download_logs(tool_id);
CREATE INDEX idx_download_logs_timestamp ON public.download_logs(download_timestamp);