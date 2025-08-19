-- Tighten waitlist table access without breaking functionality
-- Ensure RLS is enabled and enforced, and ensure only admins (including super admins) can read all entries

-- Enforce RLS on both tables
ALTER TABLE public.course_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_waitlist FORCE ROW LEVEL SECURITY;

ALTER TABLE public.upcoming_course_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upcoming_course_waitlist FORCE ROW LEVEL SECURITY;

-- Update admin SELECT policies to use the secure helper that includes super_admins and the primary admin account
DO $$
BEGIN
  -- course_waitlist: restrict admin read policy via is_admin_secure()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='course_waitlist' AND policyname='Admins can view all waitlist entries'
  ) THEN
    ALTER POLICY "Admins can view all waitlist entries"
      ON public.course_waitlist
      USING (public.is_admin_secure());
  END IF;

  -- upcoming_course_waitlist: restrict admin read policy via is_admin_secure()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='upcoming_course_waitlist' AND policyname='Admins can view waitlist'
  ) THEN
    ALTER POLICY "Admins can view waitlist"
      ON public.upcoming_course_waitlist
      USING (public.is_admin_secure());
  END IF;
END $$;

-- Keep existing self-visibility and public INSERT for upcoming_course_waitlist intact
-- No changes to INSERT policies required
