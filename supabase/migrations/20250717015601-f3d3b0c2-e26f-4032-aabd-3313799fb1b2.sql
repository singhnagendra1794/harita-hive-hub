-- Fix the database error that's preventing user signups
-- The issue is with the update_email_preferences_token trigger function
-- trying to reference a non-existent unsubscribe_token field

-- First, add the missing unsubscribe_token column to user_email_preferences
ALTER TABLE public.user_email_preferences 
ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT;

-- Update the trigger function to handle the column properly
CREATE OR REPLACE FUNCTION public.update_email_preferences_token()
RETURNS trigger AS $$
BEGIN
  -- Only set unsubscribe_token if it's null and the column exists
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token := public.generate_secure_token();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- Ensure the trigger is properly configured
DROP TRIGGER IF EXISTS update_email_preferences_token_trigger ON public.user_email_preferences;
CREATE TRIGGER update_email_preferences_token_trigger
  BEFORE INSERT OR UPDATE ON public.user_email_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_email_preferences_token();