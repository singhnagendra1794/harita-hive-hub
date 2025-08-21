-- Fix remaining security vulnerabilities without changing user/admin access

-- Secure user_roles table - restrict to users viewing their own roles and admins
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (is_admin_secure());

-- Secure analytics tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_analytics') THEN
    ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view own analytics" ON public.user_analytics
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own analytics" ON public.user_analytics
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all analytics" ON public.user_analytics
      FOR ALL USING (is_admin_secure());
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'api_usage_analytics') THEN
    ALTER TABLE public.api_usage_analytics ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view own API analytics" ON public.api_usage_analytics
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all API analytics" ON public.api_usage_analytics
      FOR ALL USING (is_admin_secure());
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'platform_analytics') THEN
    ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admins can manage platform analytics" ON public.platform_analytics
      FOR ALL USING (is_admin_secure());
  END IF;
END $$;

-- Secure role audit tables if they exist  
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'role_change_audit') THEN
    ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admins can view role audit" ON public.role_change_audit
      FOR ALL USING (is_admin_secure());
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_role_audit') THEN
    ALTER TABLE public.user_role_audit ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admins can view user role audit" ON public.user_role_audit
      FOR ALL USING (is_admin_secure());
  END IF;
END $$;

-- Secure system health tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_health_logs') THEN
    ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Super admin can manage system health" ON public.system_health_logs
      FOR ALL USING (is_super_admin_secure());
  END IF;
END $$;

-- Secure session related tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
    ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view own sessions" ON public.user_sessions
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can manage own sessions" ON public.user_sessions
      FOR ALL USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all sessions" ON public.user_sessions
      FOR ALL USING (is_admin_secure());
  END IF;
END $$;