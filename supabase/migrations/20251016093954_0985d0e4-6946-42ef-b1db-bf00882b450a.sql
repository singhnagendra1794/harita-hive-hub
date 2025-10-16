-- Fix trigger function to have proper search_path
CREATE OR REPLACE FUNCTION public.update_lab_session_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger with the updated function
DROP TRIGGER IF EXISTS update_lab_sessions_updated_at ON public.lab_sessions;
CREATE TRIGGER update_lab_sessions_updated_at
  BEFORE UPDATE ON public.lab_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lab_session_timestamp();