-- Secure user_roles table: enable RLS and add strict policies
DO $$
BEGIN
  -- Enable RLS (safe if already enabled)
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    JOIN pg_namespace n ON n.nspname = t.schemaname
    JOIN pg_catalog.pg_policy p ON p.polrelid = c.oid
    WHERE t.schemaname = 'public' AND t.tablename = 'user_roles'
  ) THEN
    -- Ensure table exists before any operations
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'user_roles'
    ) THEN
      EXECUTE 'ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY';
    END IF;
  ELSE
    -- Table exists; still ensure RLS is enabled
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'user_roles'
    ) THEN
      EXECUTE 'ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY';
    END IF;
  END IF;
  
  -- Drop potentially permissive or duplicate policies if present
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_roles') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public can read user_roles" ON public.user_roles';
    EXECUTE 'DROP POLICY IF EXISTS "Allow read to all" ON public.user_roles';
    EXECUTE 'DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles';

    -- Create least-privilege policies
    EXECUTE $$
      CREATE POLICY "Users can view own roles"
      ON public.user_roles
      FOR SELECT
      USING (auth.uid() = user_id)
    $$;

    EXECUTE $$
      CREATE POLICY "Admins manage user roles"
      ON public.user_roles
      FOR ALL
      USING (
        public.has_role_bypass_rls(auth.uid(), 'admin'::app_role)
        OR public.has_role_bypass_rls(auth.uid(), 'super_admin'::app_role)
      )
      WITH CHECK (
        public.has_role_bypass_rls(auth.uid(), 'admin'::app_role)
        OR public.has_role_bypass_rls(auth.uid(), 'super_admin'::app_role)
      )
    $$;

    -- Belt-and-suspenders: revoke any direct grants to anon/authenticated
    EXECUTE 'REVOKE ALL ON TABLE public.user_roles FROM anon';
    EXECUTE 'REVOKE ALL ON TABLE public.user_roles FROM authenticated';
  END IF;
END $$;