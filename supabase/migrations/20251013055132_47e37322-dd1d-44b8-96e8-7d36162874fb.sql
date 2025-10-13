-- Fix newsletter_posts schema by adding missing columns if they don't exist
-- This handles cases where the table was created with an older schema

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'newsletter_posts' 
    AND column_name = 'user_id'
  ) THEN
    -- Add user_id column (allow NULL temporarily for existing data)
    ALTER TABLE public.newsletter_posts 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Update existing rows to use super admin's user ID
    UPDATE public.newsletter_posts
    SET user_id = public.get_super_admin_user_id()
    WHERE user_id IS NULL;
    
    -- Make user_id NOT NULL after backfilling
    ALTER TABLE public.newsletter_posts 
    ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Add is_deleted column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'newsletter_posts' 
    AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE public.newsletter_posts 
    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add likes_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'newsletter_posts' 
    AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE public.newsletter_posts 
    ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add comments_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'newsletter_posts' 
    AND column_name = 'comments_count'
  ) THEN
    ALTER TABLE public.newsletter_posts 
    ADD COLUMN comments_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add cover_image_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'newsletter_posts' 
    AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE public.newsletter_posts 
    ADD COLUMN cover_image_url TEXT;
  END IF;
END $$;

-- Ensure content column exists (some older schemas only had summary)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'newsletter_posts' 
    AND column_name = 'content'
  ) THEN
    -- Add content column
    ALTER TABLE public.newsletter_posts 
    ADD COLUMN content TEXT;
    
    -- Backfill content from summary if summary exists
    UPDATE public.newsletter_posts
    SET content = COALESCE(summary, title)
    WHERE content IS NULL;
    
    -- Make content NOT NULL after backfilling
    ALTER TABLE public.newsletter_posts 
    ALTER COLUMN content SET NOT NULL;
  END IF;
END $$;

-- Drop all existing RLS policies on newsletter_posts
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'newsletter_posts'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.newsletter_posts', policy_record.policyname);
  END LOOP;
END $$;

-- Recreate RLS policies to ensure they match the latest schema
CREATE POLICY "Anyone can view non-deleted posts" 
ON public.newsletter_posts 
FOR SELECT 
USING (is_deleted = false);

CREATE POLICY "Authenticated users can create posts" 
ON public.newsletter_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.newsletter_posts 
FOR UPDATE 
USING (auth.uid() = user_id OR public.is_super_admin());

CREATE POLICY "Super admins can delete posts" 
ON public.newsletter_posts 
FOR DELETE
USING (public.is_super_admin());