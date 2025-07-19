-- Fix search_path security warnings for all functions
-- This prevents search path manipulation attacks by setting explicit search paths

-- Update map projects trigger function
CREATE OR REPLACE FUNCTION public.update_map_projects_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update monthly points reset function
CREATE OR REPLACE FUNCTION public.reset_monthly_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.user_leaderboard_stats 
  SET monthly_points = 0, updated_at = now();
END;
$function$;

-- Update regional price function
CREATE OR REPLACE FUNCTION public.get_regional_price(p_base_price_usd numeric, p_country_code text DEFAULT 'US'::text)
RETURNS TABLE(local_price numeric, currency_code text, tax_rate numeric)
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(p_base_price_usd * rp.exchange_rate, 2) as local_price,
    rp.currency_code,
    rp.tax_rate
  FROM regional_pricing rp
  WHERE rp.country_code = p_country_code
    AND rp.is_active = true
  LIMIT 1;
END;
$function$;

-- Update audit user role changes function
CREATE OR REPLACE FUNCTION public.audit_user_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_role_audit (user_id, role, action, granted_by)
    VALUES (NEW.user_id, NEW.role, 'granted', NEW.granted_by);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.user_role_audit (user_id, role, action, granted_by)
    VALUES (OLD.user_id, OLD.role, 'revoked', auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update snippet rating function
CREATE OR REPLACE FUNCTION public.update_snippet_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  UPDATE public.enhanced_code_snippets
  SET 
    rating_average = (
      SELECT ROUND(AVG(rating::DECIMAL), 2)
      FROM code_snippet_feedback
      WHERE snippet_id = COALESCE(NEW.snippet_id, OLD.snippet_id)
        AND feedback_type = 'rating'
        AND rating IS NOT NULL
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM code_snippet_feedback
      WHERE snippet_id = COALESCE(NEW.snippet_id, OLD.snippet_id)
        AND feedback_type = 'rating'
        AND rating IS NOT NULL
    )
  WHERE id = COALESCE(NEW.snippet_id, OLD.snippet_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update tool rating function
CREATE OR REPLACE FUNCTION public.update_tool_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  UPDATE marketplace_tools
  SET 
    rating = (
      SELECT ROUND(AVG(rating::DECIMAL), 2)
      FROM tool_reviews
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM tool_reviews
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
    )
  WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update GA tracking function
CREATE OR REPLACE FUNCTION public.get_ga_tracking_id()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Return a placeholder tracking ID for now
  RETURN jsonb_build_object('trackingId', 'G-PLACEHOLDER123');
END;
$function$;

-- Update weekly points reset function
CREATE OR REPLACE FUNCTION public.reset_weekly_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.user_leaderboard_stats 
  SET weekly_points = 0, updated_at = now();
END;
$function$;

-- Update showcase likes count function
CREATE OR REPLACE FUNCTION public.update_showcase_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tool_showcases 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.showcase_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tool_showcases 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.showcase_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update updated_at column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update comment count function
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE studio_content SET comments_count = comments_count + 1 WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE studio_content SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update class attendance tracking function
CREATE OR REPLACE FUNCTION public.track_class_attendance(p_class_id uuid, p_user_id uuid, p_action text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF p_action = 'join' THEN
    UPDATE public.class_registrations
    SET 
      attendance_status = 'attended',
      joined_at = CASE WHEN joined_at IS NULL THEN now() ELSE joined_at END
    WHERE class_id = p_class_id AND user_id = p_user_id;
    
    -- Update viewer count
    UPDATE public.live_classes
    SET viewer_count = viewer_count + 1
    WHERE id = p_class_id;
    
  ELSIF p_action = 'leave' THEN
    UPDATE public.class_registrations
    SET left_at = now()
    WHERE class_id = p_class_id AND user_id = p_user_id;
    
    -- Update viewer count
    UPDATE public.live_classes
    SET viewer_count = GREATEST(viewer_count - 1, 0)
    WHERE id = p_class_id;
  END IF;
END;
$function$;

-- Update project rating function
CREATE OR REPLACE FUNCTION public.update_project_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  UPDATE project_submissions
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating::DECIMAL), 2)
      FROM project_ratings
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM project_ratings
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    )
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update follower counts function
CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update following count for follower
    UPDATE public.user_profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
    -- Update follower count for followed user
    UPDATE public.user_profiles 
    SET follower_count = follower_count + 1 
    WHERE user_id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update following count for follower
    UPDATE public.user_profiles 
    SET following_count = GREATEST(following_count - 1, 0) 
    WHERE user_id = OLD.follower_id;
    
    -- Update follower count for followed user
    UPDATE public.user_profiles 
    SET follower_count = GREATEST(follower_count - 1, 0) 
    WHERE user_id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update professional email check function
CREATE OR REPLACE FUNCTION public.is_professional_email(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $function$
DECLARE
  pro_emails TEXT[] := ARRAY[
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'nareshkumar.tamada@gmail.com', 'geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'anshumanavasthi1411@gmail.com',
    'sruthythulasi2017@gmail.com', 'nagendrasingh1794@gmail.com'
  ];
BEGIN
  RETURN LOWER(email_to_check) = ANY(pro_emails);
END;
$function$;

-- Update premium plugin download check function
CREATE OR REPLACE FUNCTION public.can_download_premium_plugin(p_user_id uuid, p_tool_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  tool_is_free BOOLEAN;
  user_has_premium BOOLEAN;
  is_super_admin BOOLEAN;
BEGIN
  -- Check if tool is free
  SELECT is_free INTO tool_is_free
  FROM marketplace_tools
  WHERE id = p_tool_id;
  
  -- If tool is free, allow download
  IF tool_is_free THEN
    RETURN true;
  END IF;
  
  -- Check if user is super admin
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = p_user_id 
    AND email = 'contact@haritahive.com'
  ) INTO is_super_admin;
  
  IF is_super_admin THEN
    RETURN true;
  END IF;
  
  -- Check if user has premium access
  SELECT user_has_premium_access(p_user_id) INTO user_has_premium;
  
  RETURN user_has_premium;
END;
$function$;

-- Update leaderboard stats function
CREATE OR REPLACE FUNCTION public.update_leaderboard_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  week_start DATE;
  month_start DATE;
BEGIN
  -- Calculate week and month start dates
  week_start := date_trunc('week', NEW.created_at)::date;
  month_start := date_trunc('month', NEW.created_at)::date;
  
  -- Insert or update user leaderboard stats
  INSERT INTO public.user_leaderboard_stats (
    user_id, 
    total_points,
    weekly_points,
    monthly_points,
    tool_uploads,
    code_shares,
    note_shares,
    challenge_participations,
    post_creations,
    comments,
    likes_given,
    courses_completed
  ) VALUES (
    NEW.user_id,
    NEW.points_earned,
    CASE WHEN NEW.created_at >= week_start THEN NEW.points_earned ELSE 0 END,
    CASE WHEN NEW.created_at >= month_start THEN NEW.points_earned ELSE 0 END,
    CASE WHEN NEW.activity_type = 'tool_upload' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'code_share' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'note_share' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'challenge_join' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'post_create' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'comment_create' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'like_give' THEN 1 ELSE 0 END,
    CASE WHEN NEW.activity_type = 'course_complete' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = user_leaderboard_stats.total_points + NEW.points_earned,
    weekly_points = CASE 
      WHEN NEW.created_at >= week_start 
      THEN user_leaderboard_stats.weekly_points + NEW.points_earned 
      ELSE user_leaderboard_stats.weekly_points 
    END,
    monthly_points = CASE 
      WHEN NEW.created_at >= month_start 
      THEN user_leaderboard_stats.monthly_points + NEW.points_earned 
      ELSE user_leaderboard_stats.monthly_points 
    END,
    tool_uploads = user_leaderboard_stats.tool_uploads + CASE WHEN NEW.activity_type = 'tool_upload' THEN 1 ELSE 0 END,
    code_shares = user_leaderboard_stats.code_shares + CASE WHEN NEW.activity_type = 'code_share' THEN 1 ELSE 0 END,
    note_shares = user_leaderboard_stats.note_shares + CASE WHEN NEW.activity_type = 'note_share' THEN 1 ELSE 0 END,
    challenge_participations = user_leaderboard_stats.challenge_participations + CASE WHEN NEW.activity_type = 'challenge_join' THEN 1 ELSE 0 END,
    post_creations = user_leaderboard_stats.post_creations + CASE WHEN NEW.activity_type = 'post_create' THEN 1 ELSE 0 END,
    comments = user_leaderboard_stats.comments + CASE WHEN NEW.activity_type = 'comment_create' THEN 1 ELSE 0 END,
    likes_given = user_leaderboard_stats.likes_given + CASE WHEN NEW.activity_type = 'like_give' THEN 1 ELSE 0 END,
    courses_completed = user_leaderboard_stats.courses_completed + CASE WHEN NEW.activity_type = 'course_complete' THEN 1 ELSE 0 END,
    updated_at = now();
    
  RETURN NEW;
END;
$function$;

-- Update class status function
CREATE OR REPLACE FUNCTION public.update_class_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Update classes to 'live' when they should be live
  UPDATE public.live_classes
  SET class_status = 'live'
  WHERE class_status = 'upcoming'
    AND starts_at <= now()
    AND (ends_at IS NULL OR ends_at > now())
    AND is_live = true;
    
  -- Update classes to 'ended' when they're past end time
  UPDATE public.live_classes
  SET class_status = 'ended'
  WHERE class_status = 'live'
    AND ends_at IS NOT NULL
    AND ends_at <= now();
    
  -- Update classes to 'recorded' when recording is available
  UPDATE public.live_classes
  SET class_status = 'recorded'
  WHERE class_status = 'ended'
    AND recording_url IS NOT NULL;
END;
$function$;

-- Update template rating function
CREATE OR REPLACE FUNCTION public.update_template_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  UPDATE public.enhanced_project_templates
  SET 
    rating_average = (
      SELECT ROUND(AVG(rating::DECIMAL), 2)
      FROM template_ratings
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM template_ratings
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    )
  WHERE id = COALESCE(NEW.template_id, OLD.template_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update project activity logging function
CREATE OR REPLACE FUNCTION public.log_project_activity(p_project_id uuid, p_user_id uuid, p_activity_type text, p_description text, p_activity_data jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO project_activities (project_id, user_id, activity_type, description, activity_data)
  VALUES (p_project_id, p_user_id, p_activity_type, p_description, p_activity_data);
END;
$function$;

-- Update user activity tracking function
CREATE OR REPLACE FUNCTION public.track_user_activity(p_user_id uuid, p_activity_type text, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  points INTEGER;
BEGIN
  -- Define points for each activity type
  points := CASE p_activity_type
    WHEN 'tool_upload' THEN 10
    WHEN 'code_share' THEN 5
    WHEN 'note_share' THEN 7
    WHEN 'challenge_join' THEN 8
    WHEN 'post_create' THEN 3
    WHEN 'comment_create' THEN 2
    WHEN 'like_give' THEN 1
    WHEN 'course_complete' THEN 15
    ELSE 0
  END;
  
  -- Insert the activity
  INSERT INTO public.user_activities (user_id, activity_type, points_earned, metadata)
  VALUES (p_user_id, p_activity_type, points, p_metadata);
END;
$function$;

-- Update content stats function
CREATE OR REPLACE FUNCTION public.update_content_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update content stats
    UPDATE studio_content SET
      likes_count = CASE WHEN NEW.interaction_type = 'like' THEN likes_count + 1 ELSE likes_count END,
      views_count = CASE WHEN NEW.interaction_type = 'view' THEN views_count + 1 ELSE views_count END
    WHERE id = NEW.content_id;
    
    -- Update creator profile stats
    UPDATE creator_profiles_enhanced SET
      total_likes = CASE WHEN NEW.interaction_type = 'like' THEN total_likes + 1 ELSE total_likes END,
      total_views = CASE WHEN NEW.interaction_type = 'view' THEN total_views + 1 ELSE total_views END
    WHERE user_id = (SELECT user_id FROM studio_content WHERE id = NEW.content_id);
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update content stats
    UPDATE studio_content SET
      likes_count = CASE WHEN OLD.interaction_type = 'like' THEN GREATEST(likes_count - 1, 0) ELSE likes_count END,
      views_count = CASE WHEN OLD.interaction_type = 'view' THEN GREATEST(views_count - 1, 0) ELSE views_count END
    WHERE id = OLD.content_id;
    
    -- Update creator profile stats
    UPDATE creator_profiles_enhanced SET
      total_likes = CASE WHEN OLD.interaction_type = 'like' THEN GREATEST(total_likes - 1, 0) ELSE total_likes END,
      total_views = CASE WHEN OLD.interaction_type = 'view' THEN GREATEST(total_views - 1, 0) ELSE total_views END
    WHERE user_id = (SELECT user_id FROM studio_content WHERE id = OLD.content_id);
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;