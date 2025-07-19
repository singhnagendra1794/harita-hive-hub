-- Create enrollments table for paid course enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  location TEXT NOT NULL,
  how_did_you_hear TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_amount DECIMAL NOT NULL,
  payment_currency TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  is_emi BOOLEAN DEFAULT false,
  emi_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create course_waitlist table for waitlist functionality
CREATE TABLE public.course_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies for enrollments
CREATE POLICY "Users can insert their own enrollments" 
ON public.enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own enrollments" 
ON public.enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments" 
ON public.enrollments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create policies for course_waitlist
CREATE POLICY "Users can insert their own waitlist entries" 
ON public.course_waitlist 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own waitlist entries" 
ON public.course_waitlist 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all waitlist entries" 
ON public.course_waitlist 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_enrollments_updated_at
BEFORE UPDATE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();