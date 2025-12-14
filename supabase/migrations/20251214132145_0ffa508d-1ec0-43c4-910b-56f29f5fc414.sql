-- Fix function search path warnings for the new LMS functions
DROP FUNCTION IF EXISTS public.has_batch_access(UUID, UUID);
DROP FUNCTION IF EXISTS public.get_user_batches(UUID);
DROP FUNCTION IF EXISTS public.get_teacher_batches(UUID);
DROP FUNCTION IF EXISTS public.grant_batch_access(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.is_lms_teacher(UUID);

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION public.has_batch_access(p_user_id UUID, p_batch_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM batch_enrollments 
    WHERE user_id = p_user_id 
    AND batch_id = p_batch_id 
    AND payment_status = 'completed'
  ) THEN
    RETURN true;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM lms_teachers 
    WHERE user_id = p_user_id 
    AND batch_id = p_batch_id
  ) THEN
    RETURN true;
  END IF;
  
  IF is_admin_secure() THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_batches(p_user_id UUID)
RETURNS TABLE(
  batch_id UUID,
  batch_name TEXT,
  course_title TEXT,
  course_id UUID,
  payment_status TEXT,
  start_date DATE,
  end_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id AS batch_id,
    b.batch_name,
    c.title AS course_title,
    c.id AS course_id,
    e.payment_status,
    b.start_date,
    b.end_date
  FROM batch_enrollments e
  JOIN lms_batches b ON e.batch_id = b.id
  JOIN lms_courses c ON e.course_id = c.id
  WHERE e.user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_teacher_batches(p_user_id UUID)
RETURNS TABLE(
  batch_id UUID,
  batch_name TEXT,
  course_title TEXT,
  course_id UUID,
  student_count INTEGER,
  start_date DATE,
  end_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id AS batch_id,
    b.batch_name,
    c.title AS course_title,
    c.id AS course_id,
    b.current_enrollments AS student_count,
    b.start_date,
    b.end_date
  FROM lms_teachers t
  JOIN lms_batches b ON t.batch_id = b.id
  JOIN lms_courses c ON b.course_id = c.id
  WHERE t.user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_batch_access(p_user_id UUID, p_batch_id UUID, p_payment_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE batch_enrollments
  SET 
    payment_status = 'completed',
    payment_id = p_payment_id,
    access_granted_at = now()
  WHERE user_id = p_user_id AND batch_id = p_batch_id;
  
  UPDATE lms_batches
  SET current_enrollments = current_enrollments + 1
  WHERE id = p_batch_id;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_lms_teacher(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM lms_teachers WHERE user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = p_user_id AND lms_role IN ('teacher', 'admin', 'super_admin')
  );
$$;