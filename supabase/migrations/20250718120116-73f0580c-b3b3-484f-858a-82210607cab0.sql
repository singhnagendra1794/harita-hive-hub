-- Store Razorpay credentials securely
-- This migration creates secure storage for Razorpay keys

-- Create a secure function to store Razorpay configuration
CREATE OR REPLACE FUNCTION public.get_razorpay_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return Razorpay configuration
  RETURN jsonb_build_object(
    'key_id', 'rzp_live_brnHWpkHS6YtlJ',
    'environment', 'live'
  );
END;
$$;

-- Create payments table for transaction tracking
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  plan_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text DEFAULT 'razorpay',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.payment_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
ON public.payment_transactions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Add trigger for updated_at
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create webhook processing function
CREATE OR REPLACE FUNCTION public.process_razorpay_webhook(
  p_event_type text,
  p_payment_id text,
  p_order_id text,
  p_signature text,
  p_amount decimal,
  p_currency text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update payment transaction status
  UPDATE public.payment_transactions
  SET 
    razorpay_payment_id = p_payment_id,
    razorpay_signature = p_signature,
    status = CASE 
      WHEN p_event_type = 'payment.captured' THEN 'paid'
      WHEN p_event_type = 'payment.failed' THEN 'failed'
      ELSE status
    END,
    updated_at = now()
  WHERE razorpay_order_id = p_order_id;
  
  -- If payment successful, upgrade user subscription
  IF p_event_type = 'payment.captured' THEN
    UPDATE public.user_subscriptions
    SET 
      subscription_tier = (
        SELECT plan_type FROM public.payment_transactions 
        WHERE razorpay_order_id = p_order_id
      ),
      status = 'active',
      updated_at = now()
    WHERE user_id = (
      SELECT user_id FROM public.payment_transactions 
      WHERE razorpay_order_id = p_order_id
    );
  END IF;
END;
$$;