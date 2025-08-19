-- Fix business intelligence data access - secure sensitive tables properly
-- Enforce RLS and restrict SELECT to admins/self while preserving public form INSERTs

-- Force RLS on all sensitive tables (safe to run multiple times)
DO $$ BEGIN
  ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.newsletter_subscribers FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY; 
  ALTER TABLE public.corporate_inquiries FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.beta_waitlist ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.beta_waitlist FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.challenge_participants FORCE ROW LEVEL SECURITY;
END $$;

-- Fix overly permissive newsletter_subscribers policies
-- Drop the policy that allows anonymous reads (auth.uid() IS NULL)
DROP POLICY IF EXISTS "Users can view their newsletter subscription status" ON public.newsletter_subscribers;

-- Ensure self-view policy ONLY allows authenticated users viewing their own data
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='newsletter_subscribers' AND policyname='Users can view their own subscription') THEN
    DROP POLICY "Users can view their own subscription" ON public.newsletter_subscribers;
  END IF;
  
  CREATE POLICY "Users can view their own subscription" 
  ON public.newsletter_subscribers 
  FOR SELECT 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);
END $$;

-- Update admin policies to use is_admin_secure() for better security
DO $$
BEGIN
  -- newsletter_subscribers admin policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='newsletter_subscribers' AND policyname='Admins can manage all subscriptions') THEN
    DROP POLICY "Admins can manage all subscriptions" ON public.newsletter_subscribers;
  END IF;
  CREATE POLICY "Admins can manage all subscriptions" 
  ON public.newsletter_subscribers 
  FOR ALL 
  USING (public.is_admin_secure()) 
  WITH CHECK (public.is_admin_secure());

  -- beta_waitlist admin policy  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='beta_waitlist' AND policyname='Admins can view all waitlist') THEN
    DROP POLICY "Admins can view all waitlist" ON public.beta_waitlist;
  END IF;
  CREATE POLICY "Admins can view all waitlist" 
  ON public.beta_waitlist 
  FOR SELECT 
  USING (public.is_admin_secure());

  -- corporate_inquiries admin policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='corporate_inquiries' AND policyname='Admins can view all inquiries') THEN
    DROP POLICY "Admins can view all inquiries" ON public.corporate_inquiries;
  END IF;
  CREATE POLICY "Admins can view all inquiries" 
  ON public.corporate_inquiries 
  FOR SELECT 
  USING (public.is_admin_secure());

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='corporate_inquiries' AND policyname='Admins can update inquiries') THEN
    DROP POLICY "Admins can update inquiries" ON public.corporate_inquiries;
  END IF;
  CREATE POLICY "Admins can update inquiries" 
  ON public.corporate_inquiries 
  FOR UPDATE 
  USING (public.is_admin_secure()) 
  WITH CHECK (public.is_admin_secure());

  -- challenge_participants admin policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='challenge_participants' AND policyname='Admins can view all participants') THEN
    DROP POLICY "Admins can view all participants" ON public.challenge_participants;
  END IF;
  CREATE POLICY "Admins can view all participants" 
  ON public.challenge_participants 
  FOR SELECT 
  USING (public.is_admin_secure());

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='challenge_participants' AND policyname='Admins can manage all participants') THEN
    DROP POLICY "Admins can manage all participants" ON public.challenge_participants;
  END IF;
  CREATE POLICY "Admins can manage all participants" 
  ON public.challenge_participants 
  FOR ALL 
  USING (public.is_admin_secure()) 
  WITH CHECK (public.is_admin_secure());
END $$;

-- Preserve necessary public INSERT policies for forms (these should already exist)
-- newsletter_subscribers: keep "Anyone can subscribe to newsletter" 
-- corporate_inquiries: keep "Allow public to insert inquiries"
-- beta_waitlist: keep "Allow public beta waitlist signup"
-- challenge_participants: keep "Authenticated users can register for challenges"