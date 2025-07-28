-- Get the super admin user UUID and update OAuth tokens
DO $$
DECLARE
    super_admin_uuid UUID;
BEGIN
    -- Get the super admin UUID
    SELECT id INTO super_admin_uuid 
    FROM auth.users 
    WHERE email = 'contact@haritahive.com';
    
    -- If super admin exists, update/insert OAuth token
    IF super_admin_uuid IS NOT NULL THEN
        INSERT INTO public.youtube_oauth_tokens (
            user_id,
            access_token,
            refresh_token,
            expires_at,
            created_at,
            updated_at
        ) VALUES (
            super_admin_uuid,
            'placeholder_access_token',
            'placeholder_refresh_token', 
            now() + interval '1 hour',
            now(),
            now()
        ) ON CONFLICT (user_id) 
        DO UPDATE SET
            access_token = 'placeholder_access_token',
            refresh_token = 'placeholder_refresh_token',
            expires_at = now() + interval '1 hour',
            updated_at = now();
        
        -- Clear any existing placeholder entries
        DELETE FROM public.youtube_live_schedule WHERE is_override = true;
        
        RAISE NOTICE 'Updated OAuth tokens for super admin UUID: %', super_admin_uuid;
    ELSE
        RAISE NOTICE 'Super admin user not found';
    END IF;
END $$;