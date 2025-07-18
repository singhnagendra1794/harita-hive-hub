-- Add missing tables for newsletter and challenge functionality

-- Create newsletter_posts table
CREATE TABLE IF NOT EXISTS public.newsletter_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  linkedin_url text NOT NULL,
  published_date timestamp with time zone NOT NULL DEFAULT now(),
  tags text[] DEFAULT '{}',
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  subscribed_at timestamp with time zone DEFAULT now(),
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on newsletter tables
ALTER TABLE public.newsletter_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS policies for newsletter_posts (public read, admin write)
CREATE POLICY "Anyone can view newsletter posts" ON public.newsletter_posts
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage newsletter posts" ON public.newsletter_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS policies for newsletter_subscribers
CREATE POLICY "Users can view their own subscription" ON public.newsletter_subscribers
  FOR SELECT USING (auth.uid() = user_id OR email = auth.jwt() ->> 'email');

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own subscription" ON public.newsletter_subscribers
  FOR UPDATE USING (auth.uid() = user_id OR email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can view all subscriptions" ON public.newsletter_subscribers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create updated_at trigger functions
CREATE OR REPLACE FUNCTION public.update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_newsletter_posts_updated_at
  BEFORE UPDATE ON public.newsletter_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_newsletter_updated_at();

CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_newsletter_updated_at();

-- Insert sample newsletter posts
INSERT INTO public.newsletter_posts (title, summary, linkedin_url, published_date, tags, view_count, is_featured) VALUES
('Getting Started with GeoAI and Python', 'Learn how to combine artificial intelligence with geospatial data using Python libraries like GeoPandas and Scikit-learn.', 'https://linkedin.com/posts/haritahive-geoai-python-guide', '2024-01-15', ARRAY['GeoAI', 'Python'], 1250, true),
('Remote Sensing for Climate Monitoring', 'Discover how satellite imagery and remote sensing technologies are revolutionizing climate research and environmental monitoring.', 'https://linkedin.com/posts/haritahive-remote-sensing-climate', '2024-01-08', ARRAY['Remote Sensing', 'Climate'], 890, false),
('Career Opportunities in GIS: 2024 Outlook', 'Explore the growing job market for GIS professionals and learn about the most in-demand skills for 2024.', 'https://linkedin.com/posts/haritahive-gis-careers-2024', '2024-01-01', ARRAY['Careers', 'GIS'], 1100, false),
('Building Interactive Maps with Python', 'Step-by-step tutorial on creating beautiful, interactive maps using Folium and other Python mapping libraries.', 'https://linkedin.com/posts/haritahive-interactive-maps-python', '2023-12-25', ARRAY['Python', 'Mapping'], 950, false),
('OpenStreetMap Data Analysis Techniques', 'Learn advanced techniques for extracting, processing, and analyzing OpenStreetMap data for various applications.', 'https://linkedin.com/posts/haritahive-osm-analysis', '2023-12-18', ARRAY['OpenStreetMap', 'Analysis'], 670, false),
('Precision Agriculture with GIS Technology', 'How farmers are using GIS and remote sensing to optimize crop yields and reduce environmental impact.', 'https://linkedin.com/posts/haritahive-precision-agriculture', '2023-12-11', ARRAY['Agriculture', 'GIS'], 780, false)
ON CONFLICT (id) DO NOTHING;