-- Add missing RLS policies for Phase 3 tables

-- Analytics Insights policies
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

-- Scenario Simulations policies
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

-- Project Permissions policies
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

-- Enhanced Dashboards policies
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

-- API Performance Logs policies
CREATE POLICY "Admins can view API performance" ON api_performance_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = api_performance_logs.organization_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Alert Notifications policies
CREATE POLICY "Users can view their notifications" ON alert_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Updated AI Alerts policies for organization support
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