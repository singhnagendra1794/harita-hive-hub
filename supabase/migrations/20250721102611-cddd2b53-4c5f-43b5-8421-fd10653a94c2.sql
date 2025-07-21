-- Fix function search_path security warnings
ALTER FUNCTION public.generate_session_stream_key() SET search_path = public;
ALTER FUNCTION public.generate_unique_stream_key() SET search_path = public;
ALTER FUNCTION public.generate_stream_key(uuid) SET search_path = public;
ALTER FUNCTION public.update_stream_status(uuid, text, integer) SET search_path = public;
ALTER FUNCTION public.start_stream_session(uuid, text, text) SET search_path = public;
ALTER FUNCTION public.generate_live_stream_key() SET search_path = public;