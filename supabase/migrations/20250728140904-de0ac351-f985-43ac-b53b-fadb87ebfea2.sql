-- Fix the UUID issue - user_id should be a UUID, not text for admin
-- Let's use a proper UUID for admin user instead
-- First, get super admin UUID
DO $$
DECLARE
    admin_uuid UUID;
BEGIN
    -- Get the super admin user UUID
    SELECT id INTO admin_uuid 
    FROM auth.users 
    WHERE email = 'contact@haritahive.com' 
    LIMIT 1;
    
    -- If admin user exists, update the table structure and insert proper tokens
    IF admin_uuid IS NOT NULL THEN
        -- Drop and recreate youtube_oauth_tokens with proper UUID column
        DROP TABLE IF EXISTS public.youtube_oauth_tokens CASCADE;
        
        CREATE TABLE public.youtube_oauth_tokens (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(user_id)
        );
        
        -- Enable RLS
        ALTER TABLE public.youtube_oauth_tokens ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for YouTube OAuth tokens (Super admin only)
        CREATE POLICY "Super admin can manage YouTube OAuth tokens" 
        ON public.youtube_oauth_tokens 
        FOR ALL 
        USING (
          EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'contact@haritahive.com'
          )
        );
        
        -- Insert placeholder token with proper UUID
        INSERT INTO public.youtube_oauth_tokens (user_id, access_token, refresh_token)
        VALUES (admin_uuid, 'placeholder_access_token', 'placeholder_refresh_token')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;