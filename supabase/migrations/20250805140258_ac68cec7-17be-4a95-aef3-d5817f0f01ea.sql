-- GeoAI Phase 3: Enterprise Intelligence & Multi-Tenant Support

-- Create enum for alert types
CREATE TYPE alert_type AS ENUM (
  'anomaly_detection',
  'threshold_breach',
  'predictive_warning',
  'data_quality_issue',
  'system_notification'
);

-- Create enum for alert severity
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Create enum for organization roles
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'analyst', 'viewer');

-- Create enum for scenario types
CREATE TYPE scenario_type AS ENUM (
  'urban_growth',
  'climate_projection',
  'flood_simulation',
  'drought_prediction',
  'vegetation_change'
);

-- Organizations table for multi-tenant support
CREATE TABLE organizations (
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
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- AI Alerts system
CREATE TABLE ai_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  alert_type alert_type NOT NULL,
  severity alert_severity NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  data_sources JSONB DEFAULT '[]',
  affected_regions JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Analytics insights table
CREATE TABLE analytics_insights (
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
CREATE TABLE scenario_simulations (
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
CREATE TABLE project_permissions (
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
CREATE TABLE enhanced_dashboards (
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

-- API performance tracking
CREATE TABLE api_performance_logs (
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
CREATE TABLE alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES ai_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL, -- 'email', 'webhook', 'in_app'
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage their organizations" ON organizations
  FOR ALL USING (created_by = auth.uid());

-- RLS Policies for Organization Members
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

CREATE POLICY "Admins can manage organization members" ON organization_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members om 
      WHERE om.organization_id = organization_members.organization_id 
      AND om.user_id = auth.uid() 
      AND om.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for AI Alerts
CREATE POLICY "Users can view organization alerts" ON ai_alerts
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = ai_alerts.organization_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create alerts" ON ai_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Analysts can manage alerts" ON ai_alerts
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = ai_alerts.organization_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'analyst')
    )
  );

-- RLS Policies for Analytics Insights
CREATE POLICY "Users can view organization insights" ON analytics_insights
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = analytics_insights.organization_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Analysts can manage insights" ON analytics_insights
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = analytics_insights.organization_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'analyst')
    )
  );

-- RLS Policies for Scenario Simulations
CREATE POLICY "Users can view organization scenarios" ON scenario_simulations
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = scenario_simulations.organization_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Analysts can manage scenarios" ON scenario_simulations
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = scenario_simulations.organization_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'analyst')
    )
  );

-- RLS Policies for Enhanced Dashboards
CREATE POLICY "Users can view organization dashboards" ON enhanced_dashboards
  FOR SELECT USING (
    user_id = auth.uid() OR
    is_shared = true OR
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = enhanced_dashboards.organization_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own dashboards" ON enhanced_dashboards
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Project Permissions
CREATE POLICY "Users can view their project permissions" ON project_permissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage project permissions" ON project_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = project_permissions.organization_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for API Performance Logs
CREATE POLICY "Admins can view API performance" ON api_performance_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = api_performance_logs.organization_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for Alert Notifications
CREATE POLICY "Users can view their notifications" ON alert_notifications
  FOR SELECT USING (auth.uid() = user_id);

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

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_insights_updated_at
  BEFORE UPDATE ON analytics_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenario_simulations_updated_at
  BEFORE UPDATE ON scenario_simulations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_dashboards_updated_at
  BEFORE UPDATE ON enhanced_dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();