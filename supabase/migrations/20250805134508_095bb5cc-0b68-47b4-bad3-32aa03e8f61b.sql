-- Add professional access for specific users based on email domains
-- Update geoai_usage_tracking table to include admin management fields

ALTER TABLE geoai_usage_tracking 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS last_admin_review TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_geoai_usage_tracking_month_year ON geoai_usage_tracking(month_year);
CREATE INDEX IF NOT EXISTS idx_geoai_usage_tracking_plan_tier ON geoai_usage_tracking(plan_tier);
CREATE INDEX IF NOT EXISTS idx_geoai_jobs_user_status ON geoai_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_geoai_jobs_created_at ON geoai_jobs(created_at DESC);

-- Create enterprise API keys table
CREATE TABLE IF NOT EXISTS enterprise_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  rate_limit INTEGER NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on enterprise_api_keys
ALTER TABLE enterprise_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for enterprise_api_keys
CREATE POLICY "Users can manage their own API keys"
ON enterprise_api_keys
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Create webhook endpoints table
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'failed', 'disabled')),
  last_delivery TIMESTAMP WITH TIME ZONE,
  delivery_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on webhook_endpoints
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_endpoints
CREATE POLICY "Users can manage their own webhooks"
ON webhook_endpoints
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Create visualization dashboards table
CREATE TABLE IF NOT EXISTS visualization_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  dashboard_type TEXT NOT NULL CHECK (dashboard_type IN ('time_series', '3d_terrain', 'heatmap', 'change_detection', 'scenario_simulation')),
  configuration JSONB NOT NULL DEFAULT '{}',
  data_sources JSONB NOT NULL DEFAULT '[]',
  is_public BOOLEAN NOT NULL DEFAULT false,
  shared_url TEXT UNIQUE,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on visualization_dashboards
ALTER TABLE visualization_dashboards ENABLE ROW LEVEL SECURITY;

-- Create policies for visualization_dashboards
CREATE POLICY "Users can manage their own dashboards"
ON visualization_dashboards
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public dashboards"
ON visualization_dashboards
FOR SELECT
TO authenticated
USING (is_public = true);

-- Create API usage analytics table
CREATE TABLE IF NOT EXISTS api_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES enterprise_api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on api_usage_analytics
ALTER TABLE api_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for api_usage_analytics
CREATE POLICY "Users can view their own API analytics"
ON api_usage_analytics
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all API analytics"
ON api_usage_analytics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Grant professional access to specified users
DO $$
DECLARE
    professional_emails TEXT[] := ARRAY[
        'bhumip107@gmail.com',
        'kondojukushi10@gmail.com',
        'adityapipil35@gmail.com',
        'mukherjeejayita14@gmail.com',
        'Tanishkatyagi7500@gmail.com',
        'kamakshiiit@gmail.com',
        'Nareshkumar.tamada@gmail.com',
        'Geospatialshekhar@gmail.com',
        'ps.priyankasingh26996@gmail.com',
        'madhubalapriya2@gmail.com',
        'munmund66@gmail.com',
        'sujansapkota27@gmail.com',
        'sanjanaharidasan@gmail.com',
        'ajays301298@gmail.com',
        'jeevanleo2310@gmail.com',
        'geoaiguru@gmail.com',
        'rashidmsdian@gmail.com',
        'bharath.viswakarma@gmail.com',
        'shaliniazh@gmail.com',
        'sg17122004@gmail.com',
        'veenapoovukal@gmail.com',
        'asadullahm031@gmail.com',
        'moumitadas19996@gmail.com',
        'javvad.rizvi@gmail.com',
        'mandadi.jyothi123@gmail.com',
        'udaypbrn@gmail.com'
    ];
    user_email TEXT;
    user_record RECORD;
BEGIN
    FOREACH user_email IN ARRAY professional_emails
    LOOP
        -- Check if user exists and update their subscription
        SELECT id INTO user_record FROM auth.users WHERE email = user_email;
        
        IF FOUND THEN
            -- Update or create professional subscription
            INSERT INTO user_subscriptions (user_id, subscription_tier, status, created_at, updated_at)
            VALUES (user_record.id, 'pro', 'active', now(), now())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                subscription_tier = 'pro',
                status = 'active',
                updated_at = now();
                
            RAISE NOTICE 'Updated subscription for user: %', user_email;
        ELSE
            RAISE NOTICE 'User not found: %', user_email;
        END IF;
    END LOOP;
END $$;

-- Create function to check professional email domains
CREATE OR REPLACE FUNCTION is_professional_email(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if email is in the professional list or from academic/research domains
  RETURN email_input ~* '\.(edu|ac\.|gov|org)$' 
    OR email_input ~* '@(university|college|institute|research|academic)'
    OR email_input = ANY(ARRAY[
        'bhumip107@gmail.com',
        'kondojukushi10@gmail.com',
        'adityapipil35@gmail.com',
        'mukherjeejayita14@gmail.com',
        'Tanishkatyagi7500@gmail.com',
        'kamakshiiit@gmail.com',
        'Nareshkumar.tamada@gmail.com',
        'Geospatialshekhar@gmail.com',
        'ps.priyankasingh26996@gmail.com',
        'madhubalapriya2@gmail.com',
        'munmund66@gmail.com',
        'sujansapkota27@gmail.com',
        'sanjanaharidasan@gmail.com',
        'ajays301298@gmail.com',
        'jeevanleo2310@gmail.com',
        'geoaiguru@gmail.com',
        'rashidmsdian@gmail.com',
        'bharath.viswakarma@gmail.com',
        'shaliniazh@gmail.com',
        'sg17122004@gmail.com',
        'veenapoovukal@gmail.com',
        'asadullahm031@gmail.com',
        'moumitadas19996@gmail.com',
        'javvad.rizvi@gmail.com',
        'mandadi.jyothi123@gmail.com',
        'udaypbrn@gmail.com'
    ]);
END;
$$;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_enterprise_api_keys_updated_at ON enterprise_api_keys;
CREATE TRIGGER update_enterprise_api_keys_updated_at
  BEFORE UPDATE ON enterprise_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_webhook_endpoints_updated_at ON webhook_endpoints;
CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_visualization_dashboards_updated_at ON visualization_dashboards;
CREATE TRIGGER update_visualization_dashboards_updated_at
  BEFORE UPDATE ON visualization_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();