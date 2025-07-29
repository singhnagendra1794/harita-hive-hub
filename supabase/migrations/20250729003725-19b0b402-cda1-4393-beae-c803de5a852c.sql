-- Create tables for AI system monitoring and error logging
CREATE TABLE IF NOT EXISTS public.ai_interaction_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ai_system TEXT NOT NULL CHECK (ai_system IN ('ava', 'geova')),
  message_text TEXT NOT NULL,
  response_text TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'timeout', 'retry')),
  context_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_health_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_system TEXT NOT NULL CHECK (ai_system IN ('ava', 'geova')),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  last_successful_response TIMESTAMP WITH TIME ZONE,
  consecutive_failures INTEGER DEFAULT 0,
  last_health_check TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_system TEXT NOT NULL CHECK (ai_system IN ('ava', 'geova')),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('connection_failure', 'api_quota_exceeded', 'timeout', 'repeated_failures')),
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  notified_admin BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_health_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_interaction_logs
CREATE POLICY "Users can view their own AI logs" 
ON public.ai_interaction_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI logs" 
ON public.ai_interaction_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admin can view all AI logs" 
ON public.ai_interaction_logs FOR SELECT 
USING (is_super_admin_secure());

-- RLS Policies for ai_health_status  
CREATE POLICY "Super admin can manage AI health status" 
ON public.ai_health_status FOR ALL 
USING (is_super_admin_secure());

CREATE POLICY "Anyone can view AI health status" 
ON public.ai_health_status FOR SELECT 
USING (true);

-- RLS Policies for ai_alerts
CREATE POLICY "Super admin can manage AI alerts" 
ON public.ai_alerts FOR ALL 
USING (is_super_admin_secure());

-- Insert initial health status records
INSERT INTO public.ai_health_status (ai_system, status, consecutive_failures) 
VALUES 
  ('ava', 'healthy', 0),
  ('geova', 'healthy', 0)
ON CONFLICT DO NOTHING;