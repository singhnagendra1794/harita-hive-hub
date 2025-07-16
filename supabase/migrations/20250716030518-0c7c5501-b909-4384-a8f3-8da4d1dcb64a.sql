-- Create platform status table for tracking system readiness
CREATE TABLE IF NOT EXISTS public.platform_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('ready', 'pending', 'error', 'maintenance')),
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Super admins can manage platform status" 
ON public.platform_status 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'contact@haritahive.com'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Anyone can view platform status" 
ON public.platform_status 
FOR SELECT 
USING (true);

-- Insert initial platform status components
INSERT INTO public.platform_status (component_name, status, details) VALUES
  ('access_control', 'ready', '{"description": "User access control and subscription management"}'),
  ('authentication', 'ready', '{"description": "User authentication and session management"}'),
  ('navigation', 'ready', '{"description": "Site navigation and routing"}'),
  ('plugin_marketplace', 'ready', '{"description": "Plugin marketplace and downloads"}'),
  ('community_features', 'ready', '{"description": "Community discussions and user interaction"}'),
  ('legal_pages', 'ready', '{"description": "Terms, privacy, and refund policy pages"}'),
  ('super_admin', 'ready', '{"description": "Super admin privileges and dashboard"}')
ON CONFLICT (component_name) DO UPDATE SET
  status = EXCLUDED.status,
  details = EXCLUDED.details,
  updated_at = now();