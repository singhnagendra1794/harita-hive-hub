-- Create newsletter_posts table
CREATE TABLE public.newsletter_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0
);

-- Create newsletter_comments table
CREATE TABLE public.newsletter_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.newsletter_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.newsletter_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create newsletter_likes table
CREATE TABLE public.newsletter_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.newsletter_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.newsletter_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter_posts
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
USING (auth.uid() = user_id);

CREATE POLICY "Super admins and post owners can delete posts" 
ON public.newsletter_posts 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  public.is_super_admin()
);

-- RLS Policies for newsletter_comments
CREATE POLICY "Anyone can view comments" 
ON public.newsletter_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.newsletter_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.newsletter_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.newsletter_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for newsletter_likes
CREATE POLICY "Anyone can view likes" 
ON public.newsletter_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage their own likes" 
ON public.newsletter_likes 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update post stats
CREATE OR REPLACE FUNCTION public.update_newsletter_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'newsletter_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.newsletter_posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.newsletter_posts 
      SET comments_count = GREATEST(comments_count - 1, 0) 
      WHERE id = OLD.post_id;
      RETURN OLD;
    END IF;
  ELSIF TG_TABLE_NAME = 'newsletter_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.newsletter_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.newsletter_posts 
      SET likes_count = GREATEST(likes_count - 1, 0) 
      WHERE id = OLD.post_id;
      RETURN OLD;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_newsletter_comments_count
  AFTER INSERT OR DELETE ON public.newsletter_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_newsletter_post_stats();

CREATE TRIGGER update_newsletter_likes_count
  AFTER INSERT OR DELETE ON public.newsletter_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_newsletter_post_stats();

-- Create trigger for updated_at
CREATE TRIGGER update_newsletter_posts_updated_at
  BEFORE UPDATE ON public.newsletter_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_newsletter_comments_updated_at
  BEFORE UPDATE ON public.newsletter_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for newsletter images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('newsletter-images', 'newsletter-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can view newsletter images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'newsletter-images');

CREATE POLICY "Authenticated users can upload newsletter images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'newsletter-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own newsletter images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'newsletter-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own newsletter images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'newsletter-images' AND auth.uid()::text = (storage.foldername(name))[1]);