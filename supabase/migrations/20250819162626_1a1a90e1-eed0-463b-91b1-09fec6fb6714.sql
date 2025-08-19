-- Secure creator_applications: restrict reads to admins, allow public inserts
-- 1) Enable and force RLS
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_applications FORCE ROW LEVEL SECURITY;

-- 2) Restrictive SELECT policy so even if permissive exists, admin check is required
CREATE POLICY "Only admins can view creator applications (restrictive)"
AS RESTRICTIVE
ON public.creator_applications
FOR SELECT
TO authenticated
USING (public.is_admin_secure());

-- 3) Allow both unauthenticated and authenticated users to submit applications
CREATE POLICY "Anyone can submit creator application"
ON public.creator_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4) (Optional hardening) Restrict updates/deletes to admins if such operations exist
CREATE POLICY "Only admins can modify creator applications (restrictive)"
AS RESTRICTIVE
ON public.creator_applications
FOR UPDATE
TO authenticated
USING (public.is_admin_secure())
WITH CHECK (public.is_admin_secure());

CREATE POLICY "Only admins can delete creator applications (restrictive)"
AS RESTRICTIVE
ON public.creator_applications
FOR DELETE
TO authenticated
USING (public.is_admin_secure());