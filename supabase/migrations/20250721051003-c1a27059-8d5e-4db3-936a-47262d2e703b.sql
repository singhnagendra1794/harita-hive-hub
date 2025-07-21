-- Update RLS policy to allow viewing scheduled classes
DROP POLICY IF EXISTS "Public can view live and ended classes" ON public.live_classes;
DROP POLICY IF EXISTS "Public can view live classes" ON public.live_classes;

-- Create new policy that allows viewing all public classes
CREATE POLICY "Public can view all classes" ON public.live_classes
FOR SELECT USING (true);