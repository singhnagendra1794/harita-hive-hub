-- Fix remaining security issues in one go
-- 1) Add explicit, least-privilege RLS policies to RLS-enabled tables without policies
-- 2) Set search_path on SECURITY DEFINER functions to avoid search path risks
-- 3) Keep service role behavior intact; do not loosen public access

-- Ensure FORCE RLS on involved tables
DO $$ BEGIN
  ALTER TABLE public.alert_notifications FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.analytics_insights FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.api_performance_logs FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.enhanced_dashboards FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.project_permissions FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.scenario_simulations FORCE ROW LEVEL SECURITY;
END $$;

-- alert_notifications: users can view their own; admins see all; inserts by owner/admin
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users view own alerts" ON public.alert_notifications;
  DROP POLICY IF EXISTS "Admins view all alerts" ON public.alert_notifications;
  DROP POLICY IF EXISTS "Insert alerts (owner or admin)" ON public.alert_notifications;

  CREATE POLICY "Users view own alerts"
  ON public.alert_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

  CREATE POLICY "Admins view all alerts"
  ON public.alert_notifications
  FOR SELECT
  USING (public.is_admin_secure());

  CREATE POLICY "Insert alerts (owner or admin)"
  ON public.alert_notifications
  FOR INSERT
  WITH CHECK (public.is_admin_secure() OR auth.uid() = user_id);

  -- Optional admin updates
  DROP POLICY IF EXISTS "Admins manage alerts" ON public.alert_notifications;
  CREATE POLICY "Admins manage alerts"
  ON public.alert_notifications
  FOR UPDATE
  USING (public.is_admin_secure())
  WITH CHECK (public.is_admin_secure());
END $$;

-- analytics_insights: admin-only or org viewers; creator can view their own
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins manage analytics insights" ON public.analytics_insights;
  DROP POLICY IF EXISTS "Org members view analytics insights" ON public.analytics_insights;
  DROP POLICY IF EXISTS "Creator view analytics insights" ON public.analytics_insights;

  CREATE POLICY "Admins manage analytics insights"
  ON public.analytics_insights
  FOR ALL
  USING (public.is_admin_secure())
  WITH CHECK (public.is_admin_secure());

  CREATE POLICY "Org members view analytics insights"
  ON public.analytics_insights
  FOR SELECT
  USING (
    (organization_id IS NOT NULL AND has_org_permission(organization_id, auth.uid(), 'viewer'))
  );

  CREATE POLICY "Creator view analytics insights"
  ON public.analytics_insights
  FOR SELECT
  USING (auth.uid() = user_id);
END $$;

-- api_performance_logs: allow INSERT for logging; SELECT only for admins
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins view API logs" ON public.api_performance_logs;
  DROP POLICY IF EXISTS "Anyone can insert API logs" ON public.api_performance_logs;

  CREATE POLICY "Admins view API logs"
  ON public.api_performance_logs
  FOR SELECT
  USING (public.is_admin_secure());

  CREATE POLICY "Anyone can insert API logs"
  ON public.api_performance_logs
  FOR INSERT
  WITH CHECK (true);
END $$;

-- enhanced_dashboards: owner/org members access; admins manage
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins manage dashboards" ON public.enhanced_dashboards;
  DROP POLICY IF EXISTS "Owner/org view dashboards" ON public.enhanced_dashboards;
  DROP POLICY IF EXISTS "Owner/org create dashboards" ON public.enhanced_dashboards;
  DROP POLICY IF EXISTS "Owner/org update dashboards" ON public.enhanced_dashboards;

  CREATE POLICY "Admins manage dashboards"
  ON public.enhanced_dashboards
  FOR ALL
  USING (public.is_admin_secure())
  WITH CHECK (public.is_admin_secure());

  CREATE POLICY "Owner/org view dashboards"
  ON public.enhanced_dashboards
  FOR SELECT
  USING (
    public.is_admin_secure() OR
    auth.uid() = user_id OR
    (organization_id IS NOT NULL AND has_org_permission(organization_id, auth.uid(), 'viewer'))
  );

  CREATE POLICY "Owner/org create dashboards"
  ON public.enhanced_dashboards
  FOR INSERT
  WITH CHECK (
    public.is_admin_secure() OR
    auth.uid() = user_id OR
    (organization_id IS NOT NULL AND has_org_permission(organization_id, auth.uid(), 'analyst'))
  );

  CREATE POLICY "Owner/org update dashboards"
  ON public.enhanced_dashboards
  FOR UPDATE
  USING (
    public.is_admin_secure() OR
    auth.uid() = user_id OR
    (organization_id IS NOT NULL AND has_org_permission(organization_id, auth.uid(), 'admin'))
  )
  WITH CHECK (
    public.is_admin_secure() OR
    auth.uid() = user_id OR
    (organization_id IS NOT NULL AND has_org_permission(organization_id, auth.uid(), 'admin'))
  );
END $$;

-- project_permissions: admin/org admin manage; users can view their own grants
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins/org manage project permissions" ON public.project_permissions;
  DROP POLICY IF EXISTS "Users view own permissions" ON public.project_permissions;

  CREATE POLICY "Admins/org manage project permissions"
  ON public.project_permissions
  FOR ALL
  USING (
    public.is_admin_secure() OR 
    (organization_id IS NOT NULL AND has_org_permission(organization_id, auth.uid(), 'admin'))
  )
  WITH CHECK (
    public.is_admin_secure() OR 
    (organization_id IS NOT NULL AND has_org_permission(organization_id, auth.uid(), 'admin'))
  );

  CREATE POLICY "Users view own permissions"
  ON public.project_permissions
  FOR SELECT
  USING (auth.uid() = user_id);
END $$;

-- scenario_simulations: owner/org members access; admins manage
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins manage simulations" ON public.scenario_simulations;
  DROP POLICY IF EXISTS "Owner/org view simulations" ON public.scenario_simulations;
  DROP POLICY IF EXISTS "Owner/org create simulations" ON public.scenario_simulations;
  DROP POLICY IF EXISTS "Owner/org update simulations" ON public.scenario_simulations;

  CREATE POLICY "Admins manage simulations"
  ON public.scenario_simulations
  FOR ALL
  USING (public.is_admin_secure())
  WITH CHECK (public.is_admin_secure());

  CREATE POLICY "Owner/org view simulations"
  ON public.scenario_simulations
  FOR SELECT
  USING (
    public.is_admin_secure() OR
    auth.uid() = user_id OR
    (organization_id IS NOT NULL AND has_org_permission(organization_id, auth.uid(), 'viewer'))
  );

  CREATE POLICY "Owner/org create simulations"
  ON public.scenario_simulations
  FOR INSERT
  WITH CHECK (
    public.is_admin_secure() OR
    auth.uid() = user_id OR
    (organization_id IS NOT NULL AND has_org_permission(organization_id, auth.uid(), 'analyst'))
  );

  CREATE POLICY "Owner/org update simulations"
  ON public.scenario_simulations
  FOR UPDATE
  USING (
    public.is_admin_secure() OR
    auth.uid() = user_id OR
    (organization_id IS NOT NULL AND has_org_permission(organization_id, auth.uid(), 'admin'))
  )
  WITH CHECK (
    public.is_admin_secure() OR
    auth.uid() = user_id OR
    (organization_id IS NOT NULL AND has_org_permission(organization_id, auth.uid(), 'admin'))
  );
END $$;

-- Add search_path to SECURITY DEFINER functions missing it
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT n.nspname AS schema_name, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public'
      AND p.prosecdef = true -- SECURITY DEFINER
      AND (
        p.proconfig IS NULL OR NOT EXISTS (
          SELECT 1 FROM unnest(p.proconfig) cfg WHERE cfg LIKE 'search_path=%'
        )
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp', r.schema_name, r.proname, r.args);
  END LOOP;
END $$;
