
-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_type TEXT NOT NULL, -- 'onboarding', 'class_reminder', 'newsletter', 'welcome'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email queue table for scheduling and tracking
CREATE TABLE public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  template_id UUID REFERENCES public.email_templates NOT NULL,
  recipient_email TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  error_message TEXT,
  email_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user email preferences table
CREATE TABLE public.user_email_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  class_reminders BOOLEAN DEFAULT true,
  newsletter_updates BOOLEAN DEFAULT true,
  onboarding_emails BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create class enrollments table to track who's enrolled in what
CREATE TABLE public.class_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  class_id TEXT NOT NULL, -- Reference to live class
  class_title TEXT NOT NULL,
  class_date TIMESTAMP WITH TIME ZONE NOT NULL,
  instructor TEXT,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, class_id)
);

-- Create onboarding sequence tracking
CREATE TABLE public.user_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  current_step INTEGER DEFAULT 1,
  completed_steps JSONB DEFAULT '[]',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_email_sent TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates (admin only for modifications)
CREATE POLICY "Anyone can view active email templates" 
  ON public.email_templates 
  FOR SELECT 
  USING (is_active = true);

-- RLS Policies for email_queue (users can view their own)
CREATE POLICY "Users can view their own email queue" 
  ON public.email_queue 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policies for user_email_preferences
CREATE POLICY "Users can view their own email preferences" 
  ON public.user_email_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences" 
  ON public.user_email_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences" 
  ON public.user_email_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for class_enrollments
CREATE POLICY "Users can view their own enrollments" 
  ON public.class_enrollments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enrollments" 
  ON public.class_enrollments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enrollments" 
  ON public.class_enrollments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_onboarding
CREATE POLICY "Users can view their own onboarding progress" 
  ON public.user_onboarding 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, html_content, text_content, template_type) VALUES
(
  'welcome_email',
  'Welcome to GeoSpatial Learning Platform! 🌍',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #2563eb;">Welcome to GeoSpatial Learning! 🌍</h1></div><p>Hi {{user_name}},</p><p>Welcome to our platform! We''re excited to have you join our community of GIS professionals and enthusiasts.</p><div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3>What''s Next?</h3><ul><li>📚 Explore our <strong>Learning Resources</strong></li><li>🎥 Join <strong>Live Classes</strong> with expert instructors</li><li>📝 Save important content in <strong>Notes</strong></li><li>💾 Access useful <strong>Code Snippets</strong></li><li>📧 Stay updated with our <strong>Newsletter</strong></li></ul></div><div style="text-align: center; margin: 30px 0;"><a href="{{dashboard_url}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started Now</a></div><p>Happy learning!<br>The GeoSpatial Team</p></body></html>',
  'Welcome to GeoSpatial Learning Platform! We''re excited to have you join our community.',
  'welcome'
),
(
  'class_reminder_24h',
  'Class Reminder: {{class_title}} starts in 24 hours',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #2563eb;">Class Reminder 📅</h2><p>Hi {{user_name}},</p><p>This is a friendly reminder that your class <strong>{{class_title}}</strong> starts in 24 hours.</p><div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3>Class Details:</h3><p><strong>Title:</strong> {{class_title}}</p><p><strong>Date & Time:</strong> {{class_date}}</p><p><strong>Instructor:</strong> {{instructor}}</p></div><div style="text-align: center; margin: 30px 0;"><a href="{{class_url}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Join Class</a></div><p>See you there!</p></body></html>',
  'Class reminder: {{class_title}} starts in 24 hours.',
  'class_reminder'
),
(
  'class_reminder_1h',
  'Starting Soon: {{class_title}} in 1 hour!',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #dc2626;">Starting Soon! ⏰</h2><p>Hi {{user_name}},</p><p><strong>{{class_title}}</strong> starts in just 1 hour!</p><div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3>Join Now:</h3><p><strong>{{class_title}}</strong></p><p>Starting at: {{class_date}}</p></div><div style="text-align: center; margin: 30px 0;"><a href="{{class_url}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Join Live Class</a></div></body></html>',
  'Your class {{class_title}} starts in 1 hour!',
  'class_reminder'
),
(
  'onboarding_day2',
  'Discover Live Classes & Expert Instructors',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #2563eb;">Day 2: Live Classes 🎥</h2><p>Hi {{user_name}},</p><p>Ready to take your GIS skills to the next level? Our live classes offer real-time interaction with expert instructors.</p><div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3>Why Live Classes?</h3><ul><li>🎯 Real-time Q&A with instructors</li><li>🤝 Network with fellow learners</li><li>📹 Access to recordings afterward</li><li>🏆 Earn certificates</li></ul></div><div style="text-align: center; margin: 30px 0;"><a href="{{live_classes_url}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Browse Live Classes</a></div></body></html>',
  'Discover our live classes with expert instructors.',
  'onboarding'
),
(
  'newsletter_update',
  'New Newsletter: {{newsletter_title}}',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #2563eb;">New Newsletter Available! 📧</h2><p>Hi {{user_name}},</p><p>We''ve just published a new newsletter: <strong>{{newsletter_title}}</strong></p><div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;"><p>{{newsletter_description}}</p></div><div style="text-align: center; margin: 30px 0;"><a href="{{newsletter_url}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Read Newsletter</a></div></body></html>',
  'New newsletter available: {{newsletter_title}}',
  'newsletter'
);

-- Create function to automatically create email preferences for new users
CREATE OR REPLACE FUNCTION create_user_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_email_preferences (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_onboarding (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user email preferences
CREATE TRIGGER on_auth_user_created_email_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_email_preferences();

-- Create function to schedule class reminder emails
CREATE OR REPLACE FUNCTION schedule_class_reminders()
RETURNS TRIGGER AS $$
DECLARE
  template_24h UUID;
  template_1h UUID;
BEGIN
  -- Get template IDs
  SELECT id INTO template_24h FROM public.email_templates WHERE name = 'class_reminder_24h';
  SELECT id INTO template_1h FROM public.email_templates WHERE name = 'class_reminder_1h';
  
  -- Schedule 24-hour reminder
  INSERT INTO public.email_queue (user_id, template_id, recipient_email, scheduled_for, email_data)
  VALUES (
    NEW.user_id,
    template_24h,
    (SELECT email FROM auth.users WHERE id = NEW.user_id),
    NEW.class_date - INTERVAL '24 hours',
    jsonb_build_object(
      'class_title', NEW.class_title,
      'class_date', NEW.class_date,
      'instructor', NEW.instructor,
      'class_id', NEW.class_id
    )
  );
  
  -- Schedule 1-hour reminder
  INSERT INTO public.email_queue (user_id, template_id, recipient_email, scheduled_for, email_data)
  VALUES (
    NEW.user_id,
    template_1h,
    (SELECT email FROM auth.users WHERE id = NEW.user_id),
    NEW.class_date - INTERVAL '1 hour',
    jsonb_build_object(
      'class_title', NEW.class_title,
      'class_date', NEW.class_date,
      'instructor', NEW.instructor,
      'class_id', NEW.class_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for class enrollment reminders
CREATE TRIGGER on_class_enrollment_created
  AFTER INSERT ON public.class_enrollments
  FOR EACH ROW EXECUTE FUNCTION schedule_class_reminders();
