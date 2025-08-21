-- Fix security vulnerabilities by adding proper RLS policies

-- Secure profiles table - restrict to user and admins only
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin_secure());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Secure payment_transactions table - restrict to owner and admins only
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.payment_transactions
  FOR SELECT USING (is_admin_secure());

CREATE POLICY "Users can insert their own transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Secure payment_proofs table - restrict to owner and admins only
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment proofs" ON public.payment_proofs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment proofs" ON public.payment_proofs
  FOR SELECT USING (is_admin_secure());

CREATE POLICY "Users can insert their own payment proofs" ON public.payment_proofs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Secure enrollments table - restrict to owner and admins only
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments" ON public.enrollments
  FOR SELECT USING (is_admin_secure());

CREATE POLICY "Users can insert their own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" ON public.enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- Secure mentor_bookings table - restrict to owner, mentors and admins only
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

-- Secure security_events table - restrict to super admin only
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage security events" ON public.security_events
  FOR ALL USING (is_super_admin_secure());

-- Secure security_audit_log table - restrict to super admin only
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage security audit log" ON public.security_audit_log
  FOR ALL USING (is_super_admin_secure());

-- Secure enterprise_api_keys table - restrict to owner and admins only
ALTER TABLE public.enterprise_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API keys" ON public.enterprise_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all API keys" ON public.enterprise_api_keys
  FOR SELECT USING (is_admin_secure());

CREATE POLICY "Users can manage their own API keys" ON public.enterprise_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Secure user_resumes table - restrict to owner and admins only
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resumes" ON public.user_resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all resumes" ON public.user_resumes
  FOR SELECT USING (is_admin_secure());

CREATE POLICY "Users can manage their own resumes" ON public.user_resumes
  FOR ALL USING (auth.uid() = user_id);