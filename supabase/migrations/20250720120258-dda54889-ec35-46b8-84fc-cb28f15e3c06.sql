-- Update subscription tier for tharun.ravichandran@gmail.com and maneetsethi954@gmail.com
UPDATE public.user_subscriptions 
SET subscription_tier = 'pro', 
    status = 'active', 
    updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('tharun.ravichandran@gmail.com', 'maneetsethi954@gmail.com')
);

-- Update profiles plan for these users
UPDATE public.profiles 
SET plan = 'professional', 
    updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('tharun.ravichandran@gmail.com', 'maneetsethi954@gmail.com')
);

-- Auto-enroll these users into "Geospatial Technology Unlocked" course if not already enrolled
INSERT INTO public.enrollments (
  user_id,
  course_id,
  full_name,
  email,
  mobile_number,
  location,
  how_did_you_hear,
  payment_status,
  payment_amount,
  payment_currency,
  is_emi
)
SELECT 
  au.id,
  'geospatial-technology-unlocked',
  COALESCE(p.full_name, au.email),
  au.email,
  '+91 0000000000',
  'India',
  'Professional Access',
  'completed',
  0,
  'INR',
  false
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email IN ('tharun.ravichandran@gmail.com', 'maneetsethi954@gmail.com')
  AND au.id NOT IN (
    SELECT user_id FROM public.enrollments 
    WHERE course_id = 'geospatial-technology-unlocked'
  );