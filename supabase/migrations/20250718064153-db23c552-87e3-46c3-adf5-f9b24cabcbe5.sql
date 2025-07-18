-- Create newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  preferences JSONB DEFAULT '{"weekly_updates": true, "job_alerts": true, "course_updates": true, "tool_releases": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create newsletter posts table for storing LinkedIn newsletter content
CREATE TABLE public.newsletter_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  linkedin_url TEXT,
  published_date DATE NOT NULL,
  featured_image_url TEXT,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  challenge_name TEXT NOT NULL DEFAULT 'geoai-dashboard-challenge',
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submission_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'submitted', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter_subscribers
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own subscription" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own subscription" 
ON public.newsletter_subscribers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" 
ON public.newsletter_subscribers 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for newsletter_posts
CREATE POLICY "Anyone can view published newsletter posts" 
ON public.newsletter_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage newsletter posts" 
ON public.newsletter_posts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for challenge_participants
CREATE POLICY "Anyone can register for challenges" 
ON public.challenge_participants 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own participation" 
ON public.challenge_participants 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own participation" 
ON public.challenge_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all participants" 
ON public.challenge_participants 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_newsletter_posts_updated_at
  BEFORE UPDATE ON public.newsletter_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenge_participants_updated_at
  BEFORE UPDATE ON public.challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample newsletter posts
INSERT INTO public.newsletter_posts (title, summary, linkedin_url, published_date, tags, is_featured) VALUES
('Revolutionizing Geospatial Analysis with AI', 'Explore the latest trends in GeoAI and how artificial intelligence is transforming spatial analysis across industries.', 'https://linkedin.com/pulse/sample-1', '2024-12-01', ARRAY['GeoAI', 'Machine Learning', 'Remote Sensing'], true),
('OpenStreetMap Data Processing Best Practices', 'Learn advanced techniques for processing and analyzing OpenStreetMap data for professional GIS applications.', 'https://linkedin.com/pulse/sample-2', '2024-11-28', ARRAY['OpenStreetMap', 'Data Processing', 'GIS'], false),
('Career Opportunities in Geospatial Technology', 'Discover the latest job trends, salary insights, and career paths in the rapidly growing geospatial industry.', 'https://linkedin.com/pulse/sample-3', '2024-11-25', ARRAY['Careers', 'Jobs', 'Industry Trends'], false),
('Python Libraries for Geospatial Development', 'A comprehensive guide to essential Python libraries for geospatial analysis, from GeoPandas to Folium.', 'https://linkedin.com/pulse/sample-4', '2024-11-22', ARRAY['Python', 'Programming', 'Libraries'], true),
('Remote Sensing Applications in Agriculture', 'How satellite imagery and remote sensing technologies are revolutionizing modern agriculture and crop monitoring.', 'https://linkedin.com/pulse/sample-5', '2024-11-19', ARRAY['Remote Sensing', 'Agriculture', 'Satellites'], false);