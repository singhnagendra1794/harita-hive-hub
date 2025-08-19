-- Secure creator_applications: fix column name error
-- 1) Enable RLS (safe to run multiple times)
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_applications FORCE ROW LEVEL SECURITY;

-- 2) Remove any existing permissive SELECT policies 
DROP POLICY IF EXISTS "Anyone can view creator applications" ON public.creator_applications;
DROP POLICY IF EXISTS "Public can view creator applications" ON public.creator_applications;

-- 3) Create admin-only SELECT policy
CREATE POLICY "Admins can view creator applications"
ON public.creator_applications
FOR SELECT
TO authenticated
USING (public.is_admin_secure());

-- 4) Allow public submissions (keeps form working)
CREATE POLICY "Public can submit creator applications"
ON public.creator_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);