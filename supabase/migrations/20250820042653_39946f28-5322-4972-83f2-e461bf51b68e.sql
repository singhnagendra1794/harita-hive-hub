-- Comprehensive security hardening: enable RLS and add strict access policies
-- Note: Uses conditional checks to avoid errors if tables/columns are missing

-- Helper: safely enable RLS and reset policies
DO $$
DECLARE
  _tbl text;
BEGIN
  -- Profiles: restrict to owner and admins
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='profiles'
  ) THEN
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles';
    EXECUTE 'CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (is_admin_secure()) WITH CHECK (is_admin_secure())';
  END IF;

  -- user_roles: only admins manage, users can view their own
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='user_roles'
  ) THEN
    EXECUTE 'ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles';
    EXECUTE 'CREATE POLICY "Admins manage user roles" ON public.user_roles FOR ALL USING (is_admin_secure()) WITH CHECK (is_admin_secure())';
    EXECUTE 'CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id)';
  END IF;

  -- Admin logs: restrict to admins only
  FOREACH _tbl IN ARRAY ARRAY['admin_actions','admin_audit_log','role_change_audit'] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema='public' AND table_name=_tbl
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', _tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Admins view %s" ON public.%I', _tbl, _tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Admins manage %s" ON public.%I', _tbl, _tbl);
      EXECUTE format('CREATE POLICY "Admins view %s" ON public.%I FOR SELECT USING (is_admin_secure())', _tbl, _tbl);
      EXECUTE format('CREATE POLICY "Admins manage %s" ON public.%I FOR ALL USING (is_admin_secure()) WITH CHECK (is_admin_secure())', _tbl, _tbl);
    END IF;
  END LOOP;

  -- Payment-related tables: user owns their records; admins manage all
  FOREACH _tbl IN ARRAY ARRAY['payment_transactions','payment_proofs','tool_orders','enrollments','user_subscriptions'] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema='public' AND table_name=_tbl
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', _tbl);
      -- Drop previous generic policies if present
      EXECUTE format('DROP POLICY IF EXISTS "Users manage own %s" ON public.%I', _tbl, _tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Users view own %s" ON public.%I', _tbl, _tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Users insert own %s" ON public.%I', _tbl, _tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Admins manage %s" ON public.%I', _tbl, _tbl);

      -- Determine if table has user_id column
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name=_tbl AND column_name='user_id'
      ) THEN
        EXECUTE format('CREATE POLICY "Users view own %s" ON public.%I FOR SELECT USING (auth.uid() = user_id)', _tbl, _tbl);
        EXECUTE format('CREATE POLICY "Users insert own %s" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', _tbl, _tbl);
        EXECUTE format('CREATE POLICY "Users manage own %s" ON public.%I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', _tbl, _tbl);
      END IF;

      -- Admins can manage all
      EXECUTE format('CREATE POLICY "Admins manage %s" ON public.%I FOR ALL USING (is_admin_secure()) WITH CHECK (is_admin_secure())', _tbl, _tbl);
    END IF;
  END LOOP;

  -- Analytics/business tables: admins only; users may see own if user_id exists
  FOREACH _tbl IN ARRAY ARRAY['platform_analytics','geoai_usage_tracking','beta_analytics','api_usage_analytics'] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema='public' AND table_name=_tbl
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', _tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Admins view %s" ON public.%I', _tbl, _tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Admins manage %s" ON public.%I', _tbl, _tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Users view own %s" ON public.%I', _tbl, _tbl);

      -- Admins
      EXECUTE format('CREATE POLICY "Admins view %s" ON public.%I FOR SELECT USING (is_admin_secure())', _tbl, _tbl);
      EXECUTE format('CREATE POLICY "Admins manage %s" ON public.%I FOR ALL USING (is_admin_secure()) WITH CHECK (is_admin_secure())', _tbl, _tbl);

      -- If user_id exists, allow users to view their own analytics rows
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name=_tbl AND column_name='user_id'
      ) THEN
        EXECUTE format('CREATE POLICY "Users view own %s" ON public.%I FOR SELECT USING (auth.uid() = user_id)', _tbl, _tbl);
      END IF;
    END IF;
  END LOOP;
END $$;

-- Note: Leaked Password Protection must be enabled via Supabase Dashboard settings
-- See: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection