-- FIX SECURITY WARNINGS: SET SEARCH_PATH FOR ALL FUNCTIONS

-- Fix function search_path security warnings
ALTER FUNCTION public.validate_password(TEXT) SET search_path = 'public';
ALTER FUNCTION public.is_valid_email_domain(TEXT) SET search_path = 'public';
ALTER FUNCTION public.create_daily_live_class() SET search_path = 'public';
ALTER FUNCTION update_live_recordings_timestamp() SET search_path = 'public';