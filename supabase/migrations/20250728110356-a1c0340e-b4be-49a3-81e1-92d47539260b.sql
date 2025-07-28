-- Create secure YouTube management tables
CREATE TABLE IF NOT EXISTS public.youtube_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  youtube_embed_url text NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('live', 'recording')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'archived')),
  scheduled_date timestamp with time zone,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  order_index integer DEFAULT 0,
  access_tier text NOT NULL DEFAULT 'professional' CHECK (access_tier IN ('free', 'professional', 'enterprise')),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.youtube_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for youtube_sessions
CREATE POLICY "Super admins can manage all YouTube sessions"
ON public.youtube_sessions
FOR ALL
USING (public.is_super_admin_secure());

CREATE POLICY "Professional users can view active YouTube sessions"
ON public.youtube_sessions
FOR SELECT
USING (
  is_active = true 
  AND (
    access_tier = 'free' 
    OR public.user_has_premium_access(auth.uid())
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_youtube_sessions_updated_at
BEFORE UPDATE ON public.youtube_sessions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for performance
CREATE INDEX idx_youtube_sessions_type_status ON public.youtube_sessions(session_type, status);
CREATE INDEX idx_youtube_sessions_active ON public.youtube_sessions(is_active);
CREATE INDEX idx_youtube_sessions_order ON public.youtube_sessions(order_index);