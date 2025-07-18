-- Fix the user subscription access and plan access for professional users
-- Update handle_new_user function to ensure proper data access

-- Create a secure function to get user profiles for statistics
CREATE OR REPLACE FUNCTION public.get_user_profile_stats(p_user_id uuid)
RETURNS TABLE(
  profile_plan text,
  subscription_tier text,
  subscription_status text,
  expires_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.plan as profile_plan,
    us.subscription_tier,
    us.status as subscription_status,
    us.expires_at
  FROM public.profiles p
  LEFT JOIN public.user_subscriptions us ON p.id = us.user_id
  WHERE p.id = p_user_id;
END;
$$;

-- Create RLS policies to allow users to access their own profile and subscription data
CREATE POLICY "Users can view their own profile stats" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can view their own subscription" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update all specified professional users to have pro subscription
UPDATE public.user_subscriptions 
SET subscription_tier = 'pro', status = 'active', expires_at = NULL
WHERE user_id IN (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.plan = 'professional' 
  AND EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = p.id 
    AND au.email = ANY(ARRAY[
      'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
      'mukherjeejayita14@gmail.com', 'Tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
      'Nareshkumar.tamada@gmail.com', 'Geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
      'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
      'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
      'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
      'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
      'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
      'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'nagendrasingh1794@gmail.com'
    ])
  )
);