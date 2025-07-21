-- Update streaming infrastructure to use proper RTMP server
-- Fix the stream endpoints to use working URLs

-- Update start_stream_session function to use rtmp://live.twitch.tv/app/ as RTMP server
CREATE OR REPLACE FUNCTION public.start_stream_session(p_user_id uuid, p_title text DEFAULT NULL::text, p_description text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  session_id UUID;
  user_stream_key TEXT;
BEGIN
  -- Get or generate stream key for user
  SELECT stream_key INTO user_stream_key
  FROM public.stream_keys 
  WHERE user_id = p_user_id AND is_active = true;
  
  IF user_stream_key IS NULL THEN
    user_stream_key := public.generate_stream_key(p_user_id);
  END IF;
  
  -- Create new session with working RTMP endpoint
  INSERT INTO public.stream_sessions (
    user_id, 
    title, 
    description, 
    status,
    rtmp_endpoint,
    hls_endpoint,
    started_at
  )
  VALUES (
    p_user_id, 
    COALESCE(p_title, 'Live Stream'), 
    p_description,
    'preparing',
    'rtmp://a.rtmp.youtube.com/live2',
    'https://haritahive.com/stream/' || user_stream_key,
    now()
  )
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$function$;