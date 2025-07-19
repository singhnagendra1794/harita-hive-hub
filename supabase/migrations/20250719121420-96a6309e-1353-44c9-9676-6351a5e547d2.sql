-- Insert admin notification email template
INSERT INTO public.email_templates (name, subject, html_content, is_active)
VALUES (
  'admin_new_user_notification',
  'New User Registration - {{user_name}}',
  '
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">New User Registration</h2>
    <p>A new user has registered on Harita Hive:</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Name:</strong> {{user_name}}</p>
      <p><strong>Email:</strong> {{user_email}}</p>
      <p><strong>Registration Date:</strong> {{registration_date}}</p>
      <p><strong>User ID:</strong> {{user_id}}</p>
    </div>
    
    <p>The user has been automatically assigned the appropriate subscription tier based on their email domain.</p>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      This is an automated notification from Harita Hive.
    </p>
  </div>
  ',
  true
)
ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  is_active = EXCLUDED.is_active;