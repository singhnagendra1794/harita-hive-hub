-- Fix remaining search path vulnerabilities for functions that still need it
CREATE OR REPLACE FUNCTION public.generate_live_stream_key()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'sk_live_' || encode(gen_random_bytes(16), 'hex');
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_stream_key(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_key TEXT;
BEGIN
  -- Generate a secure random stream key
  new_key := 'sk_' || encode(gen_random_bytes(16), 'hex');
  
  -- Insert or update the stream key for the user
  INSERT INTO public.stream_keys (user_id, stream_key)
  VALUES (p_user_id, new_key)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    stream_key = EXCLUDED.stream_key,
    updated_at = now(),
    is_active = true;
  
  RETURN new_key;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_session_stream_key()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'session_' || encode(gen_random_bytes(12), 'hex');
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_unique_stream_key()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_key TEXT;
  key_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 16-character stream key using random() and extract functions
    new_key := substr(md5(random()::text), 1, 16);
    
    -- Check if key already exists
    SELECT EXISTS(SELECT 1 FROM public.live_classes WHERE stream_key = new_key) INTO key_exists;
    
    -- Exit loop if key is unique
    IF NOT key_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_key;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_unsubscribe_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_ga_tracking_id()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Return a placeholder tracking ID for now
  RETURN jsonb_build_object('trackingId', 'G-PLACEHOLDER123');
END;
$function$;