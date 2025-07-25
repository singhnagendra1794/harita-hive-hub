-- Security Fixes Migration
-- Addresses critical security vulnerabilities identified in security review

-- 1. FIX DATABASE FUNCTIONS - Add missing search_path to prevent injection attacks
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_ava_conversations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_content_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_course_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update course enrollment progress when lesson progress changes
  UPDATE public.course_enrollments
  SET progress_percentage = (
    SELECT ROUND((COUNT(CASE WHEN lp.completed THEN 1 END) * 100.0) / COUNT(*))
    FROM public.lessons l
    JOIN public.course_modules m ON l.module_id = m.id
    LEFT JOIN public.lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = NEW.user_id
    WHERE m.course_id = (
      SELECT m2.course_id 
      FROM public.course_modules m2
      JOIN public.lessons l2 ON m2.id = l2.module_id
      WHERE l2.id = NEW.lesson_id
    )
  ),
  completed_at = CASE 
    WHEN (
      SELECT ROUND((COUNT(CASE WHEN lp.completed THEN 1 END) * 100.0) / COUNT(*))
      FROM public.lessons l
      JOIN public.course_modules m ON l.module_id = m.id
      LEFT JOIN public.lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = NEW.user_id
      WHERE m.course_id = (
        SELECT m2.course_id 
        FROM public.course_modules m2
        JOIN public.lessons l2 ON m2.id = l2.module_id
        WHERE l2.id = NEW.lesson_id
      )
    ) = 100 THEN now()
    ELSE NULL
  END
  WHERE user_id = NEW.user_id
  AND course_id = (
    SELECT m2.course_id 
    FROM public.course_modules m2
    JOIN public.lessons l2 ON m2.id = l2.module_id
    WHERE l2.id = NEW.lesson_id
  );
  
  RETURN NEW;
END;
$$;

-- 2. RESTRICT PROFILE TABLE ACCESS - Remove overly permissive policies
DROP POLICY IF EXISTS "profiles_all_access" ON public.profiles;
DROP POLICY IF EXISTS "Allow all operations for profiles" ON public.profiles;

-- Create proper user-specific policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));

-- 3. STRENGTHEN USER ROLES SECURITY
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Users should NOT be able to view their own roles to prevent privilege escalation reconnaissance
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles ur2
  WHERE ur2.user_id = auth.uid() 
  AND ur2.role IN ('admin'::app_role, 'super_admin'::app_role)
));

-- Allow system functions to check roles (for RLS policies)
CREATE POLICY "System can check roles for RLS"
ON public.user_roles
FOR SELECT
USING (true);

-- 4. SECURE CHALLENGE PARTICIPANTS - Require authentication
DROP POLICY IF EXISTS "Anyone can register for challenges" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can view their own participation" ON public.challenge_participants;

CREATE POLICY "Authenticated users can register for challenges"
ON public.challenge_participants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own participation"
ON public.challenge_participants
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all participants"
ON public.challenge_participants
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));

-- 5. ADD SECURITY AUDIT LOGGING
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON public.security_audit_log
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin'::app_role, 'super_admin'::app_role)
));

-- 6. CREATE SECURE ADMIN CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin'::app_role, 'super_admin'::app_role)
  );
$$;

-- 7. ADD RATE LIMITING TABLE
CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  ip_address inet,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limiting
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limiting"
ON public.rate_limit_tracking
FOR ALL
USING (true);

-- 8. UPDATE PASSWORD SECURITY FUNCTION
CREATE OR REPLACE FUNCTION public.is_professional_email(email_address text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  professional_domains text[] := ARRAY[
    'edu', 'gov', 'org', 'ac.uk', 'edu.au', 'edu.in', 'ac.in',
    'university', 'college', 'institute', 'research'
  ];
  domain text;
BEGIN
  -- Extract domain from email
  domain := split_part(email_address, '@', 2);
  
  -- Check if domain ends with professional suffixes
  RETURN EXISTS (
    SELECT 1 FROM unnest(professional_domains) AS pd
    WHERE domain ILIKE '%' || pd
  );
END;
$$;