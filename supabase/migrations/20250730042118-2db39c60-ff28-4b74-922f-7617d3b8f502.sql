-- Create function to automatically refresh OAuth tokens when needed
CREATE OR REPLACE FUNCTION refresh_youtube_oauth_token_if_needed()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    result jsonb := '{"refreshed": 0, "errors": []}'::jsonb;
    token_record RECORD;
    refresh_response jsonb;
BEGIN
    -- Get tokens that need refreshing (expire within 1 hour)
    FOR token_record IN 
        SELECT * FROM youtube_oauth_tokens 
        WHERE expires_at < (now() + interval '1 hour')
        AND refresh_token IS NOT NULL
    LOOP
        -- Call edge function to refresh token
        BEGIN
            SELECT content::jsonb INTO refresh_response
            FROM http_post(
                'https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/youtube-token-refresh',
                '{"user_id": "' || token_record.user_id || '"}',
                'application/json'
            );
            
            result := jsonb_set(result, '{refreshed}', (result->>'refreshed')::int + 1);
        EXCEPTION WHEN OTHERS THEN
            result := jsonb_set(
                result, 
                '{errors}', 
                (result->'errors') || to_jsonb(SQLERRM)
            );
        END;
    END LOOP;
    
    RETURN result;
END;
$$;

-- Create function to handle automated stream detection
CREATE OR REPLACE FUNCTION trigger_youtube_detection()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    detection_result jsonb;
BEGIN
    -- Call YouTube auto-sync function
    BEGIN
        SELECT content::jsonb INTO detection_result
        FROM http_post(
            'https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/youtube-auto-sync',
            '{"automated": true}',
            'application/json'
        );
        
        RETURN detection_result;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
    END;
END;
$$;