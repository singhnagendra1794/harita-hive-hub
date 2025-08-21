-- Fix security vulnerabilities by adding proper RLS policies for existing tables

-- Secure profiles table - use correct column name (id instead of user_id)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin_secure());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Secure payment_transactions table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
    ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own transactions" ON public.payment_transactions
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all transactions" ON public.payment_transactions
      FOR SELECT USING (is_admin_secure());
    
    CREATE POLICY "Users can insert their own transactions" ON public.payment_transactions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Secure payment_proofs table if it exists  
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_proofs') THEN
    ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own payment proofs" ON public.payment_proofs
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all payment proofs" ON public.payment_proofs
      FOR SELECT USING (is_admin_secure());
    
    CREATE POLICY "Users can insert their own payment proofs" ON public.payment_proofs
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Secure enrollments table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'enrollments') THEN
    ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own enrollments" ON public.enrollments
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all enrollments" ON public.enrollments
      FOR SELECT USING (is_admin_secure());
    
    CREATE POLICY "Users can insert their own enrollments" ON public.enrollments
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own enrollments" ON public.enrollments
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Secure mentor_bookings table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mentor_bookings') THEN
    ALTER TABLE public.mentor_bookings ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own bookings" ON public.mentor_bookings
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Mentors can view their bookings" ON public.mentor_bookings
      FOR SELECT USING (auth.uid() = mentor_id);
    
    CREATE POLICY "Admins can view all bookings" ON public.mentor_bookings
      FOR SELECT USING (is_admin_secure());
    
    CREATE POLICY "Users can insert their own bookings" ON public.mentor_bookings
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own bookings" ON public.mentor_bookings
      FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Mentors can update their bookings" ON public.mentor_bookings
      FOR UPDATE USING (auth.uid() = mentor_id);
  END IF;
END $$;

-- Secure security_events table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_events') THEN
    ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Super admin can manage security events" ON public.security_events
      FOR ALL USING (is_super_admin_secure());
  END IF;
END $$;

-- Secure security_audit_log table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_audit_log') THEN
    ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Super admin can manage security audit log" ON public.security_audit_log
      FOR ALL USING (is_super_admin_secure());
  END IF;
END $$;

-- Secure enterprise_api_keys table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'enterprise_api_keys') THEN
    ALTER TABLE public.enterprise_api_keys ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own API keys" ON public.enterprise_api_keys
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all API keys" ON public.enterprise_api_keys
      FOR SELECT USING (is_admin_secure());
    
    CREATE POLICY "Users can manage their own API keys" ON public.enterprise_api_keys
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Secure user_resumes table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_resumes') THEN
    ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own resumes" ON public.user_resumes
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all resumes" ON public.user_resumes
      FOR SELECT USING (is_admin_secure());
    
    CREATE POLICY "Users can manage their own resumes" ON public.user_resumes
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;