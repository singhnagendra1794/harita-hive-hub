-- Create admin_errors table for error monitoring
CREATE TABLE IF NOT EXISTS public.admin_errors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type text NOT NULL,
  error_message text NOT NULL,
  context_data jsonb DEFAULT '{}',
  resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_errors
ALTER TABLE public.admin_errors ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_errors
CREATE POLICY "Super admin can manage errors" ON public.admin_errors
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

-- Create function to log errors automatically
CREATE OR REPLACE FUNCTION public.log_admin_error(
  p_error_type text,
  p_error_message text,
  p_context_data jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  error_id uuid;
BEGIN
  INSERT INTO public.admin_errors (error_type, error_message, context_data)
  VALUES (p_error_type, p_error_message, p_context_data)
  RETURNING id INTO error_id;
  
  RETURN error_id;
END;
$function$;

-- Create auto-sync trigger function for YouTube to Live Classes
CREATE OR REPLACE FUNCTION public.sync_youtube_to_live_classes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert or update live_classes when youtube_live_schedule changes
  INSERT INTO public.live_classes (
    title,
    description,
    starts_at,
    status,
    access_tier,
    instructor,
    is_ai_generated,
    hls_manifest_url,
    youtube_stream_id,
    youtube_broadcast_id
  ) VALUES (
    NEW.title,
    NEW.description,
    NEW.scheduled_time,
    CASE NEW.status 
      WHEN 'live' THEN 'live'
      WHEN 'ended' THEN 'ended' 
      ELSE 'scheduled'
    END,
    'pro', -- Professional plan required
    'HaritaHive Studio',
    false,
    CASE WHEN NEW.status = 'live' THEN 
      'https://www.youtube.com/embed/' || NEW.youtube_broadcast_id || '?modestbranding=1&rel=0&disablekb=1&controls=1&showinfo=0&iv_load_policy=3&fs=0'
    ELSE NULL END,
    NEW.youtube_stream_id,
    NEW.youtube_broadcast_id
  )
  ON CONFLICT (youtube_stream_id) 
  DO UPDATE SET
    title = NEW.title,
    description = NEW.description,
    starts_at = NEW.scheduled_time,
    status = CASE NEW.status 
      WHEN 'live' THEN 'live'
      WHEN 'ended' THEN 'ended' 
      ELSE 'scheduled'
    END,
    hls_manifest_url = CASE WHEN NEW.status = 'live' THEN 
      'https://www.youtube.com/embed/' || NEW.youtube_broadcast_id || '?modestbranding=1&rel=0&disablekb=1&controls=1&showinfo=0&iv_load_policy=3&fs=0'
    ELSE live_classes.hls_manifest_url END,
    youtube_broadcast_id = NEW.youtube_broadcast_id,
    updated_at = now();
    
  RETURN NEW;
END;
$function$;

-- Create or recreate the trigger
DROP TRIGGER IF EXISTS sync_youtube_live_trigger ON public.youtube_live_schedule;
CREATE TRIGGER sync_youtube_live_trigger
  AFTER INSERT OR UPDATE ON public.youtube_live_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_youtube_to_live_classes();

-- Create unique constraint for youtube integration
CREATE UNIQUE INDEX IF NOT EXISTS live_classes_youtube_stream_id_idx 
ON public.live_classes (youtube_stream_id) WHERE youtube_stream_id IS NOT NULL;