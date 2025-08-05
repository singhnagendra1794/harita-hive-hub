-- GeoAI Phase 3: Enterprise Intelligence & Multi-Tenant Support (Updated)

-- Check if enums exist and create only if they don't
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
    CREATE TYPE alert_type AS ENUM (
      'anomaly_detection',
      'threshold_breach',
      'predictive_warning',
      'data_quality_issue',
      'system_notification'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_severity') THEN
    CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_role') THEN
    CREATE TYPE org_role AS ENUM ('owner', 'admin', 'analyst', 'viewer');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scenario_type') THEN
    CREATE TYPE scenario_type AS ENUM (
      'urban_growth',
      'climate_projection',
      'flood_simulation',
      'drought_prediction',
      'vegetation_change'
    );
  END IF;
END $$;

-- Organizations table for multi-tenant support
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'pro',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Update existing ai_alerts table if it doesn't have all columns
DO $$
BEGIN
  -- Add organization_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_alerts' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE ai_alerts ADD COLUMN organization_id UUID REFERENCES organizations(id);
  END IF;
  
  -- Add confidence_score if it doesn't exist  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_alerts' AND column_name = 'confidence_score'
  ) THEN
    ALTER TABLE ai_alerts ADD COLUMN confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1);
  END IF;
  
  -- Add data_sources if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_alerts' AND column_name = 'data_sources'
  ) THEN
    ALTER TABLE ai_alerts ADD COLUMN data_sources JSONB DEFAULT '[]';
  END IF;
  
  -- Add affected_regions if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_alerts' AND column_name = 'affected_regions'
  ) THEN
    ALTER TABLE ai_alerts ADD COLUMN affected_regions JSONB DEFAULT '[]';
  END IF;
  
  -- Add expires_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_alerts' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE ai_alerts ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Analytics insights table
CREATE TABLE IF NOT EXISTS analytics_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  data_period_start DATE,
  data_period_end DATE,
  metrics JSONB DEFAULT '{}',
  visualizations JSONB DEFAULT '[]',
  trends JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  confidence_level DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Scenario simulations table
CREATE TABLE IF NOT EXISTS scenario_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  scenario_type scenario_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL DEFAULT '{}',
  input_datasets JSONB DEFAULT '[]',
  output_results JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Project permissions table
CREATE TABLE IF NOT EXISTS project_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID,
  permission_type TEXT NOT NULL,
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_admin BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced visualization dashboards
CREATE TABLE IF NOT EXISTS enhanced_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  layout_config JSONB DEFAULT '{}',
  data_sources JSONB DEFAULT '[]',
  ai_insights JSONB DEFAULT '{}',
  export_settings JSONB DEFAULT '{}',
  sharing_settings JSONB DEFAULT '{}',
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- API performance tracking (separate from existing api_usage_analytics)
CREATE TABLE IF NOT EXISTS api_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_time_ms INTEGER,
  status_code INTEGER,
  payload_size_bytes INTEGER,
  error_details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Alert notifications tracking
CREATE TABLE IF NOT EXISTS alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES ai_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL, -- 'email', 'webhook', 'in_app'
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organizations'
  ) THEN
    ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organization_members'
  ) THEN
    ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_insights'
  ) THEN
    ALTER TABLE analytics_insights ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scenario_simulations'
  ) THEN
    ALTER TABLE scenario_simulations ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'project_permissions'
  ) THEN
    ALTER TABLE project_permissions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'enhanced_dashboards'
  ) THEN
    ALTER TABLE enhanced_dashboards ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_performance_logs'
  ) THEN
    ALTER TABLE api_performance_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'alert_notifications'
  ) THEN
    ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- RLS Policies for Organizations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Users can view their organizations'
  ) THEN
    CREATE POLICY "Users can view their organizations" ON organizations
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM organization_members 
          WHERE organization_id = organizations.id 
          AND user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Owners can manage their organizations'
  ) THEN
    CREATE POLICY "Owners can manage their organizations" ON organizations
      FOR ALL USING (created_by = auth.uid());
  END IF;
END $$;

-- RLS Policies for Organization Members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organization_members' AND policyname = 'Members can view organization membership'
  ) THEN
    CREATE POLICY "Members can view organization membership" ON organization_members
      FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM organization_members om2 
          WHERE om2.organization_id = organization_members.organization_id 
          AND om2.user_id = auth.uid() 
          AND om2.role IN ('owner', 'admin')
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organization_members' AND policyname = 'Admins can manage organization members'
  ) THEN
    CREATE POLICY "Admins can manage organization members" ON organization_members
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM organization_members om 
          WHERE om.organization_id = organization_members.organization_id 
          AND om.user_id = auth.uid() 
          AND om.role IN ('owner', 'admin')
        )
      );
  END IF;
END $$;

-- Functions for organization management
CREATE OR REPLACE FUNCTION create_organization(
  p_name TEXT,
  p_slug TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  org_id UUID;
BEGIN
  INSERT INTO organizations (name, slug, description, created_by)
  VALUES (p_name, p_slug, p_description, auth.uid())
  RETURNING id INTO org_id;
  
  -- Add creator as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (org_id, auth.uid(), 'owner');
  
  RETURN org_id;
END;
$$;

-- Function to check organization permissions
CREATE OR REPLACE FUNCTION has_org_permission(
  p_org_id UUID,
  p_user_id UUID,
  p_required_role org_role
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_org_id
    AND user_id = p_user_id
    AND CASE p_required_role
      WHEN 'viewer' THEN role IN ('viewer', 'analyst', 'admin', 'owner')
      WHEN 'analyst' THEN role IN ('analyst', 'admin', 'owner')
      WHEN 'admin' THEN role IN ('admin', 'owner')
      WHEN 'owner' THEN role = 'owner'
      ELSE false
    END
  );
END;
$$;

-- Function to generate AI alerts
CREATE OR REPLACE FUNCTION generate_ai_alert(
  p_org_id UUID,
  p_user_id UUID,
  p_alert_type alert_type,
  p_severity alert_severity,
  p_title TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_confidence_score DECIMAL DEFAULT 0.95
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO ai_alerts (
    organization_id, user_id, alert_type, severity,
    title, description, metadata, confidence_score
  ) VALUES (
    p_org_id, p_user_id, p_alert_type, p_severity,
    p_title, p_description, p_metadata, p_confidence_score
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;