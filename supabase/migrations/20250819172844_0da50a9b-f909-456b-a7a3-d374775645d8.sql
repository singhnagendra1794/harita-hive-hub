-- Harden administrative/system tables to admin-only visibility while preserving logging inserts
-- Tables: admin_audit_log, security_events, role_change_audit, user_role_audit

-- Enforce and force RLS on all relevant tables
DO $$ BEGIN
  ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY; 
  ALTER TABLE public.admin_audit_log FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY; 
  ALTER TABLE public.security_events FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY; 
  ALTER TABLE public.role_change_audit FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.user_role_audit ENABLE ROW LEVEL SECURITY; 
  ALTER TABLE public.user_role_audit FORCE ROW LEVEL SECURITY;
END $$;

-- admin_audit_log: make admin-only for all operations
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_audit_log') THEN
    -- Replace existing policies
    PERFORM 1; 
  END IF;
  DROP POLICY IF EXISTS "Super admin can manage audit logs" ON public.admin_audit_log;
  CREATE POLICY "Admins can manage admin audit logs"
  ON public.admin_audit_log
  FOR ALL
  USING (public.is_admin_secure())
  WITH CHECK (public.is_admin_secure());
END $$;

-- security_events: admin-only SELECT; allow inserts (for logging) from any context
DO $$ BEGIN
  -- Drop existing view policies and recreate
  DROP POLICY IF EXISTS "Admins can view security events" ON public.security_events;
  DROP POLICY IF EXISTS "Super admins can view security events" ON public.security_events;
  CREATE POLICY "Admins can view security events"
  ON public.security_events
  FOR SELECT
  USING (public.is_admin_secure());
  -- Allow inserts for logging, including anonymous contexts (edge functions/clients)
  DROP POLICY IF EXISTS "Anyone can insert security events" ON public.security_events;
  CREATE POLICY "Anyone can insert security events"
  ON public.security_events
  FOR INSERT
  WITH CHECK (true);
END $$;

-- role_change_audit: admin-only SELECT; restrict INSERT to admins
DO $$ BEGIN
  DROP POLICY IF EXISTS "Super admin can view audit logs" ON public.role_change_audit;
  DROP POLICY IF EXISTS "System can insert audit logs" ON public.role_change_audit;
  CREATE POLICY "Admins can view role change audit"
  ON public.role_change_audit
  FOR SELECT
  USING (public.is_admin_secure());
  CREATE POLICY "Admins can insert role change audit"
  ON public.role_change_audit
  FOR INSERT
  WITH CHECK (public.is_admin_secure());
END $$;

-- user_role_audit: used by triggers; admin-only SELECT; restrict INSERT to admins
DO $$ BEGIN
  DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.user_role_audit;
  CREATE POLICY "Admins can view user role audit"
  ON public.user_role_audit
  FOR SELECT
  USING (public.is_admin_secure());
  -- Allow trigger inserts executed in admin sessions
  DROP POLICY IF EXISTS "Admins can insert user role audit" ON public.user_role_audit;
  CREATE POLICY "Admins can insert user role audit"
  ON public.user_role_audit
  FOR INSERT
  WITH CHECK (public.is_admin_secure());
END $$;