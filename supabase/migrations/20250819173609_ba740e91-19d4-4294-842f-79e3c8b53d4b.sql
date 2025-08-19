-- Set search_path on all public functions missing it (not just SECURITY DEFINER)
DO $$
DECLARE r RECORD; BEGIN
  FOR r IN 
    SELECT n.nspname AS schema_name, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public'
      AND (
        p.proconfig IS NULL OR NOT EXISTS (
          SELECT 1 FROM unnest(p.proconfig) cfg WHERE cfg LIKE 'search_path=%'
        )
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp', r.schema_name, r.proname, r.args);
  END LOOP;
END $$;