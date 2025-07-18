-- Fix permission denied for table users issue
-- The hook is trying to access auth.users table directly which is not allowed

-- First, let's ensure we have a function to safely check user subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription_safe(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  subscription_tier text,
  status text,
  started_at timestamp with time zone,
  expires_at timestamp with time zone,
  payment_method text,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    us.user_id,
    us.subscription_tier,
    us.status,
    us.started_at,
    us.expires_at,
    us.payment_method,
    us.stripe_customer_id,
    us.stripe_subscription_id,
    us.created_at,
    us.updated_at
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id;
END;
$$;

-- Fix the pro user emails in handle_new_user function to ensure they get professional subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  pro_emails TEXT[] := ARRAY[
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'Tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'Nareshkumar.tamada@gmail.com', 'Geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'nagendrasingh1794@gmail.com'
  ];
BEGIN
  -- Create profile with clean initial stats (all zeros)
  INSERT INTO public.profiles (
    id, 
    full_name, 
    first_name, 
    last_name,
    plan,
    course_count,
    projects_completed,
    community_posts
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE WHEN NEW.email = ANY (pro_emails) THEN 'professional' ELSE 'free' END,
    0,  -- Start with 0 courses
    0,  -- Start with 0 projects
    0   -- Start with 0 posts
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create user subscription with appropriate tier for pro emails
  INSERT INTO public.user_subscriptions (
    user_id, 
    subscription_tier, 
    status,
    started_at,
    expires_at
  )
  VALUES (
    NEW.id, 
    CASE WHEN NEW.email = ANY (pro_emails) THEN 'pro' ELSE 'free' END,
    'active',
    now(),
    CASE WHEN NEW.email = ANY (pro_emails) THEN null ELSE null END  -- No expiry for pro users
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block signup - always return NEW
    RETURN NEW;
END;
$$;

-- Create function to update user stats when they actually do activities
CREATE OR REPLACE FUNCTION public.update_user_stats(
  p_user_id uuid,
  p_stat_type text, -- 'course', 'project', 'post'
  p_increment integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    course_count = CASE WHEN p_stat_type = 'course' THEN course_count + p_increment ELSE course_count END,
    projects_completed = CASE WHEN p_stat_type = 'project' THEN projects_completed + p_increment ELSE projects_completed END,
    community_posts = CASE WHEN p_stat_type = 'post' THEN community_posts + p_increment ELSE community_posts END,
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Add missing search_path to existing functions for security
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  );
$$;