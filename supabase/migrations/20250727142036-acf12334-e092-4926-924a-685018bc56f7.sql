-- Fix 1: Create user_profiles table with proper RLS and triggers
-- Check if user_profiles exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        -- Create user_profiles table
        CREATE TABLE public.user_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            username TEXT,
            display_name TEXT,
            bio TEXT,
            avatar_url TEXT,
            location TEXT,
            website TEXT,
            github_url TEXT,
            linkedin_url TEXT,
            twitter_url TEXT,
            public_profile BOOLEAN DEFAULT true,
            follower_count INTEGER DEFAULT 0,
            following_count INTEGER DEFAULT 0,
            badge_count INTEGER DEFAULT 0,
            tools_contributed INTEGER DEFAULT 0,
            courses_completed INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Enable RLS
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies for user_profiles
        CREATE POLICY "Users can view all public profiles"
            ON public.user_profiles
            FOR SELECT
            USING (public_profile = true OR auth.uid() = id);

        CREATE POLICY "Users can update their own profile"
            ON public.user_profiles
            FOR UPDATE
            USING (auth.uid() = id);

        CREATE POLICY "Users can insert their own profile"
            ON public.user_profiles
            FOR INSERT
            WITH CHECK (auth.uid() = id);

        CREATE POLICY "Users can delete their own profile"
            ON public.user_profiles
            FOR DELETE
            USING (auth.uid() = id);
    END IF;
END $$;

-- Fix 2: Create or replace the handle_new_user function with proper security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, username, display_name)
    VALUES (
        NEW.id, 
        NEW.email,
        SPLIT_PART(NEW.email, '@', 1), -- Use email prefix as default username
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING; -- Prevent duplicate inserts
    RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Fix 3: Update AWS streaming config for better live streaming support
UPDATE public.aws_streaming_config 
SET 
    rtmp_endpoint = 'rtmp://live-stream.haritahive.com/live',
    hls_playback_url = 'https://d3k8h9k5j2l1m9.cloudfront.net/live',
    updated_at = now()
WHERE is_active = true;

-- Fix 4: Add auto-start configuration for live classes
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS auto_start BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS cloudfront_url TEXT;

-- Fix 5: Update existing stream sessions to have proper URLs
UPDATE public.live_classes 
SET 
    cloudfront_url = CASE 
        WHEN status = 'live' THEN 'https://d3k8h9k5j2l1m9.cloudfront.net/live/' || stream_key || '.m3u8'
        ELSE NULL 
    END,
    recording_url = CASE 
        WHEN status = 'ended' THEN 'https://d3k8h9k5j2l1m9.cloudfront.net/recordings/' || stream_key || '.mp4'
        ELSE NULL 
    END
WHERE stream_key IS NOT NULL;