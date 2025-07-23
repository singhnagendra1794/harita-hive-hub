-- Fix search path security warnings for existing functions
ALTER FUNCTION public.update_geova_recordings_updated_at() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.sync_geova_recordings_from_schedule() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.track_recording_view(UUID, UUID, TEXT, INTEGER) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.get_next_geova_class_time() SET search_path = 'public', 'pg_temp';