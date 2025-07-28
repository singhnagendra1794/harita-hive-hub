-- Fix security warnings for existing functions
ALTER FUNCTION public.handle_new_user() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.update_project_rating() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.is_professional_email(text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.update_content_stats() SET search_path = 'public', 'pg_temp';