
-- Create table for managing user sessions (one session per user)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id) -- Ensures only one active session per user
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for user_sessions
CREATE POLICY "Users can manage their own sessions" 
  ON public.user_sessions 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create table for payment transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT NOT NULL, -- 'razorpay', 'paypal', 'upi_manual'
  payment_gateway_id TEXT, -- External payment ID from gateway
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  payment_data JSONB DEFAULT '{}',
  course_id UUID, -- Optional: link to specific course
  subscription_type TEXT, -- 'course', 'premium', 'pro'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  webhook_data JSONB DEFAULT '{}'
);

-- Enable RLS on payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.payment_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
  ON public.payment_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" 
  ON public.payment_transactions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

-- Create function to invalidate previous sessions
CREATE OR REPLACE FUNCTION public.invalidate_previous_sessions(p_user_id UUID, p_new_session_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deactivate all existing sessions for the user
  UPDATE public.user_sessions 
  SET is_active = false 
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Insert new session
  INSERT INTO public.user_sessions (user_id, session_token, expires_at)
  VALUES (p_user_id, p_new_session_token, now() + interval '30 days');
END;
$$;

-- Create function to check if session is valid
CREATE OR REPLACE FUNCTION public.is_session_valid(p_user_id UUID, p_session_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_sessions 
    WHERE user_id = p_user_id 
    AND session_token = p_session_token 
    AND is_active = true 
    AND expires_at > now()
  ) INTO session_exists;
  
  RETURN session_exists;
END;
$$;
