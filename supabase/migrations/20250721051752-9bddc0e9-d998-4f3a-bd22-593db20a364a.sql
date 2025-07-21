-- Update subscription tiers for the three users who should have professional access
UPDATE public.user_subscriptions 
SET 
  subscription_tier = 'pro',
  status = 'active',
  updated_at = now()
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email IN (
    'dhiman.kashyap24@gmail.com',
    'vanditaujwal8@gmail.com', 
    'veenapoovukal@gmail.com'
  )
);

-- Also update their profiles to reflect professional plan
UPDATE public.profiles 
SET 
  plan = 'professional',
  updated_at = now()
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email IN (
    'dhiman.kashyap24@gmail.com',
    'vanditaujwal8@gmail.com', 
    'veenapoovukal@gmail.com'
  )
);