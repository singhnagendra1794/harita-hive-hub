-- Fix critical security vulnerability: Enable RLS on user_subscriptions table
-- This prevents public access to sensitive subscription data

-- Enable Row Level Security on user_subscriptions table
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own subscription data
CREATE POLICY "Users can view their own subscription" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own subscription data
CREATE POLICY "Users can create their own subscription" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own subscription data
CREATE POLICY "Users can update their own subscription" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy 4: Admins can manage all subscriptions (view, insert, update, delete)
CREATE POLICY "Admins can manage all subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ) OR EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

-- Policy 5: Allow security definer functions to access subscription data
-- This ensures existing RPC functions like get_user_subscription_safe still work
CREATE POLICY "Security definer functions can access subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (current_setting('role') = 'postgres');

-- Note: The existing security definer functions (like get_user_subscription_safe, 
-- user_has_premium_access, create_user_subscription) will continue to work 
-- because they run with elevated privileges and bypass RLS when needed.