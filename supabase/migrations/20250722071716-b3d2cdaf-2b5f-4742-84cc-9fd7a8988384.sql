-- Drop and recreate get_user_stats_safe function to include enrolled_courses_count
DROP FUNCTION IF EXISTS public.get_user_stats_safe(uuid);

CREATE OR REPLACE FUNCTION public.get_user_stats_safe(p_user_id uuid)
RETURNS TABLE(user_id uuid, subscription_tier text, course_count integer, projects_completed integer, community_posts integer, spatial_analyses integer, plan text, enrolled_courses_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Ensure user has a subscription
  IF NOT EXISTS (SELECT 1 FROM user_subscriptions WHERE user_subscriptions.user_id = p_user_id) THEN
    -- Check if professional email and create appropriate subscription
    PERFORM public.user_has_premium_access(p_user_id);
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    COALESCE(us.subscription_tier, 'free') as subscription_tier,
    COALESCE(p.course_count, 0) as course_count,
    COALESCE(p.projects_completed, 0) as projects_completed,
    COALESCE(p.community_posts, 0) as community_posts,
    COALESCE(p.spatial_analyses, 0) as spatial_analyses,
    COALESCE(p.plan, 'free') as plan,
    COALESCE(p.enrolled_courses_count, 0) as enrolled_courses_count
  FROM public.profiles p
  LEFT JOIN public.user_subscriptions us ON p.id = us.user_id
  WHERE p.id = p_user_id;
END;
$$;