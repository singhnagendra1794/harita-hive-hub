-- Secure business-sensitive tables without breaking public submission flows
-- 1) Enforce RLS and remove public read from newsletter_subscribers
-- 2) Standardize admin policies to use is_admin_secure() where applicable
-- 3) Keep public INSERT where forms need anonymous submissions

-- Enforce RLS where relevant (safe to run multiple times)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='newsletter_subscribers') THEN
    EXECUTE 'ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.newsletter_subscribers FORCE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='corporate_inquiries') THEN
    EXECUTE 'ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.corporate_inquiries FORCE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='beta_waitlist') THEN
    EXECUTE 'ALTER TABLE public.beta_waitlist ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.beta_waitlist FORCE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='challenge_participants') THEN
    EXECUTE 'ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.challenge_participants FORCE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Fix overly permissive SELECT on newsletter_subscribers
DO $$
DECLARE
  pol_exists BOOLEAN;
BEGIN
  -- Drop redundant policy if present (status check) to avoid duplicates
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='newsletter_subscribers' 
      AND policyname='Users can view their newsletter subscription status'
  ) INTO pol_exists;
  IF pol_exists THEN
    EXECUTE 'DROP POLICY "Users can view their newsletter subscription status" ON public.newsletter_subscribers';
  END IF;

  -- Ensure the self-view policy does NOT allow anonymous reads
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='newsletter_subscribers' 
      AND policyname='Users can view their own subscription'
  ) INTO pol_exists;
  IF pol_exists THEN
    EXECUTE 'ALTER POLICY "Users can view their own subscription" 
             ON public.newsletter_subscribers 
             FOR SELECT 
             USING (auth.uid() = user_id)';
  ELSE
    EXECUTE 'CREATE POLICY "Users can view their own subscription" 
             ON public.newsletter_subscribers 
             FOR SELECT 
             USING (auth.uid() = user_id)';
  END IF;

  -- Keep anonymous INSERTs for public signup form
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='newsletter_subscribers' 
      AND policyname='Anyone can subscribe to newsletter'
  ) INTO pol_exists;
  IF NOT pol_exists THEN
    EXECUTE 'CREATE POLICY "Anyone can subscribe to newsletter" 
             ON public.newsletter_subscribers 
             FOR INSERT 
             WITH CHECK (true)';
  END IF;

  -- Ensure admin full management uses the secure helper
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='newsletter_subscribers' 
      AND policyname='Admins can manage all subscriptions'
  ) INTO pol_exists;
  IF pol_exists THEN
    EXECUTE 'ALTER POLICY "Admins can manage all subscriptions" 
             ON public.newsletter_subscribers 
             USING (public.is_admin_secure()) 
             WITH CHECK (public.is_admin_secure())';
  ELSE
    EXECUTE 'CREATE POLICY "Admins can manage all subscriptions" 
             ON public.newsletter_subscribers 
             FOR ALL 
             USING (public.is_admin_secure()) 
             WITH CHECK (public.is_admin_secure())';
  END IF;
END $$;

-- Standardize admin policies on other sensitive tables to include super admin logic
DO $$
DECLARE pol_exists BOOLEAN; BEGIN
  -- corporate_inquiries
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='corporate_inquiries') THEN
    -- Admin SELECT
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='corporate_inquiries' 
        AND policyname='Admins can view all inquiries'
    ) INTO pol_exists;
    IF pol_exists THEN
      EXECUTE 'ALTER POLICY "Admins can view all inquiries" 
               ON public.corporate_inquiries 
               USING (public.is_admin_secure())';
    ELSE
      EXECUTE 'CREATE POLICY "Admins can view all inquiries" 
               ON public.corporate_inquiries 
               FOR SELECT 
               USING (public.is_admin_secure())';
    END IF;

    -- Admin UPDATE/ALL
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='corporate_inquiries' 
        AND policyname='Admins can update inquiries'
    ) INTO pol_exists;
    IF pol_exists THEN
      EXECUTE 'ALTER POLICY "Admins can update inquiries" 
               ON public.corporate_inquiries 
               USING (public.is_admin_secure()) 
               WITH CHECK (public.is_admin_secure())';
    END IF;

    -- Keep public INSERT for lead capture if not present
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='corporate_inquiries' 
        AND policyname='Allow public to insert inquiries'
    ) INTO pol_exists;
    IF NOT pol_exists THEN
      EXECUTE 'CREATE POLICY "Allow public to insert inquiries" 
               ON public.corporate_inquiries 
               FOR INSERT 
               WITH CHECK (true)';
    END IF;
  END IF;

  -- beta_waitlist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='beta_waitlist') THEN
    -- Admin SELECT should use is_admin_secure
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='beta_waitlist' 
        AND policyname='Admins can view all waitlist'
    ) INTO pol_exists;
    IF pol_exists THEN
      EXECUTE 'ALTER POLICY "Admins can view all waitlist" 
               ON public.beta_waitlist 
               USING (public.is_admin_secure())';
    ELSE
      EXECUTE 'CREATE POLICY "Admins can view all waitlist" 
               ON public.beta_waitlist 
               FOR SELECT 
               USING (public.is_admin_secure())';
    END IF;
  END IF;

  -- challenge_participants (admin view)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='challenge_participants') THEN
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='challenge_participants' 
        AND policyname='Admins can view all participants'
    ) INTO pol_exists;
    IF pol_exists THEN
      EXECUTE 'ALTER POLICY "Admins can view all participants" 
               ON public.challenge_participants 
               USING (public.is_admin_secure())';
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='challenge_participants' 
        AND policyname='Admins can manage all participants'
    ) INTO pol_exists;
    IF pol_exists THEN
      EXECUTE 'ALTER POLICY "Admins can manage all participants" 
               ON public.challenge_participants 
               USING (public.is_admin_secure()) 
               WITH CHECK (public.is_admin_secure())';
    END IF;
  END IF;
END $$;