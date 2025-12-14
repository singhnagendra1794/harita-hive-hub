-- ============================================
-- HARITA HIVE LMS PLATFORM - COMPLETE DATABASE SCHEMA
-- Based on SRS Document Requirements
-- ============================================

-- 1. LMS COURSES TABLE
CREATE TABLE IF NOT EXISTS public.lms_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  course_fee DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. LMS BATCHES TABLE
CREATE TABLE IF NOT EXISTS public.lms_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  batch_name TEXT NOT NULL,
  batch_number INTEGER NOT NULL,
  teacher_id UUID REFERENCES auth.users(id),
  start_date DATE,
  end_date DATE,
  max_students INTEGER DEFAULT 100,
  current_enrollments INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, batch_number)
);

-- 3. BATCH ENROLLMENTS - Links students to specific batches
CREATE TABLE IF NOT EXISTS public.batch_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.lms_batches(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id TEXT,
  payment_amount DECIMAL(10,2),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  access_granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, batch_id)
);

-- 4. BATCH LIVE SESSIONS - Live sessions per batch
CREATE TABLE IF NOT EXISTS public.batch_live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.lms_batches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_link TEXT,
  meeting_platform TEXT DEFAULT 'zoom' CHECK (meeting_platform IN ('zoom', 'google_meet', 'youtube', 'custom')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BATCH RECORDINGS - Recordings per batch
CREATE TABLE IF NOT EXISTS public.batch_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.lms_batches(id) ON DELETE CASCADE,
  live_session_id UUID REFERENCES public.batch_live_sessions(id),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  video_platform TEXT DEFAULT 'youtube' CHECK (video_platform IN ('youtube', 's3', 'vimeo', 'custom')),
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. BATCH STUDY MATERIALS - Notes and materials per batch
CREATE TABLE IF NOT EXISTS public.batch_study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.lms_batches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes BIGINT,
  category TEXT DEFAULT 'notes' CHECK (category IN ('notes', 'slides', 'assignment', 'resource', 'other')),
  order_index INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. LMS TEACHERS - Teacher assignments to courses/batches
CREATE TABLE IF NOT EXISTS public.lms_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.lms_batches(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, batch_id)
);

-- 8. LMS PAYMENTS - Payment records
CREATE TABLE IF NOT EXISTS public.lms_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  course_id UUID NOT NULL REFERENCES public.lms_courses(id),
  batch_id UUID NOT NULL REFERENCES public.lms_batches(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_gateway TEXT DEFAULT 'razorpay' CHECK (payment_gateway IN ('razorpay', 'stripe', 'paypal')),
  payment_id TEXT,
  order_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  payment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 9. LMS SESSION ATTENDANCE - Track student attendance
CREATE TABLE IF NOT EXISTS public.lms_session_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_id UUID NOT NULL REFERENCES public.batch_live_sessions(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  UNIQUE(user_id, session_id)
);

-- 10. Update profiles to include LMS role
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS lms_role TEXT DEFAULT 'student' CHECK (lms_role IN ('student', 'teacher', 'admin', 'super_admin'));

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_session_attendance ENABLE ROW LEVEL SECURITY;

-- LMS COURSES POLICIES
CREATE POLICY "Anyone can view published courses" ON public.lms_courses
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all courses" ON public.lms_courses
  FOR ALL USING (public.is_admin_secure());

-- LMS BATCHES POLICIES
CREATE POLICY "Anyone can view active batches" ON public.lms_batches
  FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers can manage assigned batches" ON public.lms_batches
  FOR ALL USING (
    teacher_id = auth.uid() OR
    public.is_admin_secure()
  );

-- BATCH ENROLLMENTS POLICIES
CREATE POLICY "Users can view own enrollments" ON public.batch_enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all enrollments" ON public.batch_enrollments
  FOR ALL USING (public.is_admin_secure());

CREATE POLICY "Users can create own enrollments" ON public.batch_enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- BATCH LIVE SESSIONS POLICIES
CREATE POLICY "Paid students can view batch sessions" ON public.batch_live_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.batch_enrollments 
      WHERE batch_enrollments.batch_id = batch_live_sessions.batch_id
      AND batch_enrollments.user_id = auth.uid()
      AND batch_enrollments.payment_status = 'completed'
    ) OR
    EXISTS (
      SELECT 1 FROM public.lms_teachers
      WHERE lms_teachers.batch_id = batch_live_sessions.batch_id
      AND lms_teachers.user_id = auth.uid()
    ) OR
    public.is_admin_secure()
  );

CREATE POLICY "Teachers can manage batch sessions" ON public.batch_live_sessions
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.lms_teachers
      WHERE lms_teachers.batch_id = batch_live_sessions.batch_id
      AND lms_teachers.user_id = auth.uid()
    ) OR
    public.is_admin_secure()
  );

-- BATCH RECORDINGS POLICIES
CREATE POLICY "Paid students can view batch recordings" ON public.batch_recordings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.batch_enrollments 
      WHERE batch_enrollments.batch_id = batch_recordings.batch_id
      AND batch_enrollments.user_id = auth.uid()
      AND batch_enrollments.payment_status = 'completed'
    ) OR
    EXISTS (
      SELECT 1 FROM public.lms_teachers
      WHERE lms_teachers.batch_id = batch_recordings.batch_id
      AND lms_teachers.user_id = auth.uid()
    ) OR
    public.is_admin_secure()
  );

CREATE POLICY "Teachers can manage batch recordings" ON public.batch_recordings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lms_teachers
      WHERE lms_teachers.batch_id = batch_recordings.batch_id
      AND lms_teachers.user_id = auth.uid()
    ) OR
    public.is_admin_secure()
  );

-- BATCH STUDY MATERIALS POLICIES
CREATE POLICY "Paid students can view batch materials" ON public.batch_study_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.batch_enrollments 
      WHERE batch_enrollments.batch_id = batch_study_materials.batch_id
      AND batch_enrollments.user_id = auth.uid()
      AND batch_enrollments.payment_status = 'completed'
    ) OR
    EXISTS (
      SELECT 1 FROM public.lms_teachers
      WHERE lms_teachers.batch_id = batch_study_materials.batch_id
      AND lms_teachers.user_id = auth.uid()
    ) OR
    public.is_admin_secure()
  );

CREATE POLICY "Teachers can manage batch materials" ON public.batch_study_materials
  FOR ALL USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.lms_teachers
      WHERE lms_teachers.batch_id = batch_study_materials.batch_id
      AND lms_teachers.user_id = auth.uid()
    ) OR
    public.is_admin_secure()
  );

-- LMS TEACHERS POLICIES
CREATE POLICY "Teachers can view own assignments" ON public.lms_teachers
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure());

CREATE POLICY "Admins can manage teacher assignments" ON public.lms_teachers
  FOR ALL USING (public.is_admin_secure());

-- LMS PAYMENTS POLICIES
CREATE POLICY "Users can view own payments" ON public.lms_payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own payments" ON public.lms_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all payments" ON public.lms_payments
  FOR ALL USING (public.is_admin_secure());

-- SESSION ATTENDANCE POLICIES
CREATE POLICY "Users can view own attendance" ON public.lms_session_attendance
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own attendance" ON public.lms_session_attendance
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all attendance" ON public.lms_session_attendance
  FOR SELECT USING (public.is_admin_secure());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user has batch access
CREATE OR REPLACE FUNCTION public.has_batch_access(p_user_id UUID, p_batch_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is enrolled with completed payment
  IF EXISTS (
    SELECT 1 FROM batch_enrollments 
    WHERE user_id = p_user_id 
    AND batch_id = p_batch_id 
    AND payment_status = 'completed'
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is a teacher for this batch
  IF EXISTS (
    SELECT 1 FROM lms_teachers 
    WHERE user_id = p_user_id 
    AND batch_id = p_batch_id
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is admin/super_admin
  IF is_admin_secure() THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Get user's enrolled batches
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
SET search_path TO 'public'
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

-- Get teacher's assigned batches
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
SET search_path TO 'public'
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

-- Grant batch access after payment
CREATE OR REPLACE FUNCTION public.grant_batch_access(p_user_id UUID, p_batch_id UUID, p_payment_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE batch_enrollments
  SET 
    payment_status = 'completed',
    payment_id = p_payment_id,
    access_granted_at = now()
  WHERE user_id = p_user_id AND batch_id = p_batch_id;
  
  -- Update batch enrollment count
  UPDATE lms_batches
  SET current_enrollments = current_enrollments + 1
  WHERE id = p_batch_id;
  
  RETURN true;
END;
$$;

-- Check if user is LMS teacher
CREATE OR REPLACE FUNCTION public.is_lms_teacher(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM lms_teachers WHERE user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = p_user_id AND lms_role IN ('teacher', 'admin', 'super_admin')
  );
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_user ON public.batch_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_batch ON public.batch_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_payment ON public.batch_enrollments(payment_status);
CREATE INDEX IF NOT EXISTS idx_lms_batches_course ON public.lms_batches(course_id);
CREATE INDEX IF NOT EXISTS idx_batch_live_sessions_batch ON public.batch_live_sessions(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_recordings_batch ON public.batch_recordings(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_study_materials_batch ON public.batch_study_materials(batch_id);
CREATE INDEX IF NOT EXISTS idx_lms_teachers_user ON public.lms_teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_lms_payments_user ON public.lms_payments(user_id);