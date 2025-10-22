-- Ensure RLS is enabled on live_classes
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Only admins can insert live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Only admins can update live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Only admins can delete live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Everyone can view live classes" ON public.live_classes;

-- Create policy for viewing live classes (everyone can view)
CREATE POLICY "Everyone can view live classes"
ON public.live_classes
FOR SELECT
USING (true);

-- Create policy for inserting live classes (only admins and super_admins)
CREATE POLICY "Only admins can insert live classes"
ON public.live_classes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Create policy for updating live classes (only admins and super_admins)
CREATE POLICY "Only admins can update live classes"
ON public.live_classes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Create policy for deleting live classes (only admins and super_admins)
CREATE POLICY "Only admins can delete live classes"
ON public.live_classes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Create a security definer function to check if user can go live
CREATE OR REPLACE FUNCTION public.can_user_go_live(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id
    AND role IN ('admin', 'super_admin')
  );
$$;