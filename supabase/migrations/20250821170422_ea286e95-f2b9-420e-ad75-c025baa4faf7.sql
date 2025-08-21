-- Final security fixes for remaining tables

-- Secure user_location table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_location') THEN
    ALTER TABLE public.user_location ENABLE ROW LEVEL SECURITY;
    
    -- Only create policies if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_location' AND policyname = 'Users can view own location data') THEN
      CREATE POLICY "Users can view own location data" ON public.user_location
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_location' AND policyname = 'System can insert location data') THEN
      CREATE POLICY "System can insert location data" ON public.user_location
        FOR INSERT WITH CHECK (true);  -- Allow system to track location
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_location' AND policyname = 'Admins can view all location data') THEN
      CREATE POLICY "Admins can view all location data" ON public.user_location
        FOR ALL USING (is_admin_secure());
    END IF;
  END IF;
END $$;

-- Ensure admin_errors table is properly secured (already has RLS but verify)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_errors') THEN
    -- Table should already have super admin policy, but ensure RLS is enabled
    ALTER TABLE public.admin_errors ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Ensure ai_interaction_logs table has proper user restriction
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_interaction_logs') THEN
    -- Table should already have user-only and admin policies, ensure RLS is enabled
    ALTER TABLE public.ai_interaction_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Additional security for any remaining tables without RLS
DO $$
BEGIN
  -- Enable RLS on any public tables that might not have it enabled yet
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'platform_usage_stats') THEN
    ALTER TABLE public.platform_usage_stats ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_usage_stats' AND policyname = 'Admins only view platform stats') THEN
      CREATE POLICY "Admins only view platform stats" ON public.platform_usage_stats
        FOR ALL USING (is_admin_secure());
    END IF;
  END IF;
  
  -- Secure system configuration tables
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_config') THEN
    ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_config' AND policyname = 'Super admin can manage system config') THEN
      CREATE POLICY "Super admin can manage system config" ON public.system_config
        FOR ALL USING (is_super_admin_secure());
    END IF;
  END IF;
END $$;