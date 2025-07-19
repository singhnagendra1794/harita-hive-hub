-- Create video content table for studio uploads
CREATE TABLE IF NOT EXISTS studio_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  content_type text NOT NULL DEFAULT 'video', -- video, image, embed
  file_url text,
  thumbnail_url text,
  embed_url text, -- for YouTube/Vimeo
  file_size bigint,
  duration integer, -- in seconds
  tags jsonb DEFAULT '[]'::jsonb,
  tools_used text[] DEFAULT '{}',
  skill_domain text,
  region text,
  goal text,
  outcome text,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create content interactions table
CREATE TABLE IF NOT EXISTS studio_content_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id uuid NOT NULL REFERENCES studio_content(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  interaction_type text NOT NULL, -- like, view, share
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(content_id, user_id, interaction_type)
);

-- Create content comments table
CREATE TABLE IF NOT EXISTS studio_content_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id uuid NOT NULL REFERENCES studio_content(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  parent_id uuid REFERENCES studio_content_comments(id) ON DELETE CASCADE,
  is_deleted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create creator profiles table
CREATE TABLE IF NOT EXISTS creator_profiles_enhanced (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  bio text,
  specialties text[],
  tools_expertise text[],
  experience_level text DEFAULT 'intermediate',
  location text,
  portfolio_url text,
  linkedin_url text,
  github_url text,
  behance_url text,
  total_views integer DEFAULT 0,
  total_likes integer DEFAULT 0,
  featured_this_week boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE studio_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_content_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles_enhanced ENABLE ROW LEVEL SECURITY;

-- RLS Policies for studio_content
CREATE POLICY "Users can view published content" ON studio_content
FOR SELECT USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own content" ON studio_content
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for interactions
CREATE POLICY "Users can view all interactions" ON studio_content_interactions
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own interactions" ON studio_content_interactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions" ON studio_content_interactions
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Users can view active comments" ON studio_content_comments
FOR SELECT USING (is_deleted = false);

CREATE POLICY "Users can create comments" ON studio_content_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON studio_content_comments
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for creator profiles
CREATE POLICY "Anyone can view creator profiles" ON creator_profiles_enhanced
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own profile" ON creator_profiles_enhanced
FOR ALL USING (auth.uid() = user_id);

-- Create functions to update interaction counts
CREATE OR REPLACE FUNCTION update_content_stats()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update content stats
    UPDATE studio_content SET
      likes_count = CASE WHEN NEW.interaction_type = 'like' THEN likes_count + 1 ELSE likes_count END,
      views_count = CASE WHEN NEW.interaction_type = 'view' THEN views_count + 1 ELSE views_count END
    WHERE id = NEW.content_id;
    
    -- Update creator profile stats
    UPDATE creator_profiles_enhanced SET
      total_likes = CASE WHEN NEW.interaction_type = 'like' THEN total_likes + 1 ELSE total_likes END,
      total_views = CASE WHEN NEW.interaction_type = 'view' THEN total_views + 1 ELSE total_views END
    WHERE user_id = (SELECT user_id FROM studio_content WHERE id = NEW.content_id);
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update content stats
    UPDATE studio_content SET
      likes_count = CASE WHEN OLD.interaction_type = 'like' THEN GREATEST(likes_count - 1, 0) ELSE likes_count END,
      views_count = CASE WHEN OLD.interaction_type = 'view' THEN GREATEST(views_count - 1, 0) ELSE views_count END
    WHERE id = OLD.content_id;
    
    -- Update creator profile stats
    UPDATE creator_profiles_enhanced SET
      total_likes = CASE WHEN OLD.interaction_type = 'like' THEN GREATEST(total_likes - 1, 0) ELSE total_likes END,
      total_views = CASE WHEN OLD.interaction_type = 'view' THEN GREATEST(total_views - 1, 0) ELSE total_views END
    WHERE user_id = (SELECT user_id FROM studio_content WHERE id = OLD.content_id);
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for interaction stats
CREATE TRIGGER update_content_stats_trigger
  AFTER INSERT OR DELETE ON studio_content_interactions
  FOR EACH ROW EXECUTE FUNCTION update_content_stats();

-- Create function to update comment counts
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE studio_content SET comments_count = comments_count + 1 WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE studio_content SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment counts
CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE ON studio_content_comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Create storage buckets for studio content
INSERT INTO storage.buckets (id, name, public) VALUES ('studio-content', 'studio-content', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('studio-thumbnails', 'studio-thumbnails', true) ON CONFLICT DO NOTHING;

-- Storage policies for studio content
CREATE POLICY "Users can upload their own content" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'studio-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view studio content" ON storage.objects 
FOR SELECT USING (bucket_id = 'studio-content');

CREATE POLICY "Users can update their own content" ON storage.objects 
FOR UPDATE USING (bucket_id = 'studio-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for thumbnails
CREATE POLICY "Users can upload their own thumbnails" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'studio-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view thumbnails" ON storage.objects 
FOR SELECT USING (bucket_id = 'studio-thumbnails');

CREATE POLICY "Users can update their own thumbnails" ON storage.objects 
FOR UPDATE USING (bucket_id = 'studio-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Super admin access
CREATE POLICY "Super admin can manage all studio content" ON studio_content
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Super admin can manage all interactions" ON studio_content_interactions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Super admin can manage all comments" ON studio_content_comments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Super admin can manage all creator profiles" ON creator_profiles_enhanced
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);