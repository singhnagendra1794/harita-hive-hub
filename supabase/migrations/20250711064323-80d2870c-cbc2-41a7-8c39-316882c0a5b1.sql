-- Create payment proof tracking table
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL, -- 'upi' or 'paypal'
  proof_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

-- Create policies for payment proofs
CREATE POLICY "Users can create their own payment proofs" 
ON public.payment_proofs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment proofs" 
ON public.payment_proofs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment proofs" 
ON public.payment_proofs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Admins can update payment proofs" 
ON public.payment_proofs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create trigger for updating timestamp
CREATE OR REPLACE FUNCTION public.update_payment_proofs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_proofs_updated_at
BEFORE UPDATE ON public.payment_proofs
FOR EACH ROW
EXECUTE FUNCTION public.update_payment_proofs_updated_at();