-- Fix remaining security vulnerabilities without changing user/admin access
-- Using IF NOT EXISTS to avoid conflicts

-- Secure user_roles table - restrict to users viewing their own roles and admins
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate specific policies with conflict handling
DO $$
BEGIN
  -- Handle user_roles policies
  BEGIN
    DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
    CREATE POLICY "Users can view own roles" ON public.user_roles
      FOR SELECT USING (auth.uid() = user_id);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
    CREATE POLICY "Admins can manage all roles" ON public.user_roles
      FOR ALL USING (is_admin_secure());
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- Secure analytics tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_analytics') THEN
    ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
    
    -- Only create policies if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_analytics' AND policyname = 'Users can view own analytics') THEN
      CREATE POLICY "Users can view own analytics" ON public.user_analytics
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_analytics' AND policyname = 'Users can insert own analytics') THEN
      CREATE POLICY "Users can insert own analytics" ON public.user_analytics
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_analytics' AND policyname = 'Admins can view all analytics') THEN
      CREATE POLICY "Admins can view all analytics" ON public.user_analytics
        FOR ALL USING (is_admin_secure());
    END IF;
  END IF;
END $$;

-- Secure role audit tables if they exist  
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'role_change_audit') THEN
    ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'role_change_audit' AND policyname = 'Admins can view role audit') THEN
      CREATE POLICY "Admins can view role audit" ON public.role_change_audit
        FOR ALL USING (is_admin_secure());
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_role_audit') THEN
    ALTER TABLE public.user_role_audit ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_role_audit' AND policyname = 'Admins can view user role audit') THEN
      CREATE POLICY "Admins can view user role audit" ON public.user_role_audit
        FOR ALL USING (is_admin_secure());
    END IF;
  END IF;
END $$;

-- Secure system health tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_health_logs') THEN
    ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_health_logs' AND policyname = 'Super admin can manage system health') THEN
      CREATE POLICY "Super admin can manage system health" ON public.system_health_logs
        FOR ALL USING (is_super_admin_secure());
    END IF;
  END IF;
END $$;