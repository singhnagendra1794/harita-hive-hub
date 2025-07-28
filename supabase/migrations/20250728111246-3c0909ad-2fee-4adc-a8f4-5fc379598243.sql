-- Add functions for YouTube session management
CREATE OR REPLACE FUNCTION public.move_live_to_recording(p_session_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.youtube_sessions
  SET 
    session_type = 'recording',
    status = 'ended',
    ended_at = now(),
    updated_at = now()
  WHERE id = p_session_id 
    AND session_type = 'live' 
    AND status = 'live';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.update_session_order(p_session_id uuid, p_new_order integer)
RETURNS void AS $$
BEGIN
  UPDATE public.youtube_sessions
  SET order_index = p_new_order
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.get_secure_embed_url(p_youtube_url text)
RETURNS text AS $$
BEGIN
  -- Clean and secure YouTube URL for embedding
  RETURN regexp_replace(p_youtube_url, 
    '(youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]+)',
    'https://www.youtube.com/embed/\2?modestbranding=1&rel=0&controls=1&showinfo=0&iv_load_policy=3&disablekb=1'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';