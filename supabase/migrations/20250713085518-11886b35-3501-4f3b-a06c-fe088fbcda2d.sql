-- Create FAQs table for dynamic FAQ management
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create About sections table for dynamic about page content
CREATE TABLE public.about_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  section_type TEXT NOT NULL, -- 'hero', 'mission', 'team', 'values', etc.
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Testimonials table (already exists, but let's ensure it has proper structure)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  testimonial TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certificates table for tracking issued certificates
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID,
  learning_path_id UUID,
  certificate_type TEXT NOT NULL, -- 'course', 'learning_path'
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  completion_date DATE NOT NULL,
  certificate_hash TEXT UNIQUE NOT NULL, -- for verification
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_valid BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for FAQs
CREATE POLICY "Anyone can view active FAQs" ON public.faqs
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage FAQs" ON public.faqs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for About sections
CREATE POLICY "Anyone can view active about sections" ON public.about_sections
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage about sections" ON public.about_sections
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for Testimonials
CREATE POLICY "Anyone can view active testimonials" ON public.testimonials
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for Certificates
CREATE POLICY "Users can view their own certificates" ON public.certificates
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certificates" ON public.certificates
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all certificates" ON public.certificates
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert sample data
INSERT INTO public.faqs (question, answer, category, order_index) VALUES
('What is Harita Hive?', 'Harita Hive is a comprehensive geospatial learning platform offering courses in GIS, remote sensing, and spatial analysis.', 'general', 1),
('How do I access premium content?', 'Premium content is available with Pro and Enterprise subscriptions. You can upgrade your plan from the pricing page.', 'subscription', 2),
('Can I download course materials?', 'Yes, all course materials including videos and documents can be downloaded for offline viewing with an active subscription.', 'courses', 3),
('How do live classes work?', 'Live classes are conducted via YouTube Live. You will receive notifications and access links before each session.', 'live-classes', 4);

INSERT INTO public.about_sections (title, content, section_type, order_index) VALUES
('Our Mission', 'To democratize geospatial education and make advanced GIS technologies accessible to learners worldwide.', 'mission', 1),
('Why Choose Harita Hive?', 'We combine cutting-edge technology with expert instruction to deliver the most comprehensive geospatial learning experience.', 'values', 2),
('Expert Instruction', 'Learn from industry professionals with years of real-world experience in geospatial technologies.', 'features', 3);

INSERT INTO public.testimonials (name, title, company, testimonial, rating, is_featured) VALUES
('Sarah Johnson', 'GIS Analyst', 'Environmental Consulting Inc', 'The spatial analysis course completely transformed my understanding of GIS. The hands-on projects were incredibly valuable.', 5, true),
('Dr. Ahmed Hassan', 'Research Scientist', 'Climate Research Institute', 'Excellent platform with comprehensive content. The live classes provide great interaction with instructors.', 5, true),
('Maria Rodriguez', 'Urban Planner', 'City Planning Department', 'Perfect blend of theory and practical application. The certification added great value to my professional profile.', 5, false);