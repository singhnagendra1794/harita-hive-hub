-- Secure creator_applications without using RESTRICTIVE (compat mode)
-- 1) Enable and force RLS
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_applications FORCE ROW LEVEL SECURITY;

-- 2) Remove any existing SELECT policies that might allow public reads
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN 
    SELECT polname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'creator_applications' 
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.creator_applications', p.polname);
  END LOOP;
END$$;

-- 3) Create strict SELECT policy for admins only
CREATE POLICY "Admins can view creator applications"
ON public.creator_applications
FOR SELECT
TO authenticated
USING (public.is_admin_secure());

-- 4) Allow submissions from both anon and authenticated
-- (keeps the public form working)
CREATE POLICY "Public can submit creator applications"
ON public.creator_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
