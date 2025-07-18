-- Final launch readiness fixes

-- Fix permission issues for newsletter subscription checks
CREATE POLICY "Users can view their newsletter subscription status" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Create edge function to get GA tracking ID securely
CREATE OR REPLACE FUNCTION public.get_ga_tracking_id()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return a placeholder tracking ID for now
  RETURN jsonb_build_object('trackingId', 'G-PLACEHOLDER123');
END;
$$;

-- Add email templates for better email deliverability
INSERT INTO public.email_templates (name, subject, html_content, template_type, is_active) VALUES
('welcome_onboard', 'Welcome to Harita Hive - Your Geospatial Journey Begins!', 
'<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://haritahive.com/lovable-uploads/245fdd41-dd5b-4d86-872c-311b8d050135.png" alt="Harita Hive" style="width: 60px; height: 60px;">
    <h1 style="color: #004aad; margin: 10px 0;">Welcome to Harita Hive!</h1>
  </div>
  <p>Hi {{name}},</p>
  <p>Welcome to the Harita Hive community! We''re excited to have you join thousands of geospatial professionals on their learning journey.</p>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">🎯 Get Started:</h3>
    <ul style="padding-left: 20px;">
      <li>📚 Browse our comprehensive course library</li>
      <li>🛠️ Access cutting-edge GIS tools and templates</li>
      <li>👥 Connect with our vibrant community</li>
      <li>🎯 Track your learning progress</li>
    </ul>
  </div>
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://haritahive.com/dashboard" style="background: #004aad; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
  </div>
  <p>Happy learning!<br>The Harita Hive Team</p>
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
  <p style="color: #666; font-size: 12px;">This email was sent to {{email}}. If you have any questions, reply to this email or contact us at contact@haritahive.com</p>
</div>
</body></html>', 
'onboarding', true),

('newsletter_welcome', 'Welcome to Harita Hive Newsletter!', 
'<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://haritahive.com/lovable-uploads/245fdd41-dd5b-4d86-872c-311b8d050135.png" alt="Harita Hive" style="width: 60px; height: 60px;">
    <h1 style="color: #004aad; margin: 10px 0;">📧 Newsletter Subscription Confirmed!</h1>
  </div>
  <p>Hi {{name}},</p>
  <p>Thank you for subscribing to the Harita Hive newsletter! You''ll now receive:</p>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <ul style="padding-left: 20px; margin: 0;">
      <li>🛠️ New GIS tools and templates</li>
      <li>📚 Course launches and updates</li>
      <li>💼 Job opportunities and internships</li>
      <li>🧠 AI tutorials and GeoAI tips</li>
    </ul>
  </div>
  <p>Our newsletter goes out every Wednesday with the latest geospatial insights and opportunities.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://haritahive.com/newsletter" style="background: #004aad; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Newsletter Archive</a>
  </div>
  <p>Welcome to the community!<br>The Harita Hive Team</p>
</div>
</body></html>', 
'newsletter', true) 

ON CONFLICT (name) DO UPDATE SET 
html_content = EXCLUDED.html_content,
updated_at = now();