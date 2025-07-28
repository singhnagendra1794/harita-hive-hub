-- Create role change audit table for tracking all role modifications
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  old_role TEXT,
  new_role TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_by_email TEXT,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- Create policy for super admin access to audit logs
CREATE POLICY "Super admin can view audit logs" 
ON public.role_change_audit 
FOR SELECT 
USING (is_super_admin_secure());

-- Create policy for system to insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.role_change_audit 
FOR INSERT 
WITH CHECK (true);

-- Create email templates table for notifications
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for super admin to manage email templates
CREATE POLICY "Super admin can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (is_super_admin_secure());

-- Insert email templates
INSERT INTO public.email_templates (name, subject, html_content) VALUES 
(
  'welcome_professional',
  'Welcome to HaritaHive Professional – Your Access is Live!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Hello {{user_name}},</h2>
    <p>Welcome to HaritaHive Professional! 🎉</p>
    <p>Your account has been upgraded to the Professional Plan. You now have access to:</p>
    <ul>
      <li>✅ All Premium Tools and Courses</li>
      <li>✅ Live Classes & Recordings</li>
      <li>✅ Exclusive GIS Marketplace Downloads</li>
      <li>✅ GeoVA AI Mentor</li>
    </ul>
    <p><a href="https://haritahive.com/dashboard" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Login to explore</a></p>
    <p>We''re excited to see what you create!</p>
    <p>Best,<br>Team HaritaHive</p>
  </div>'
),
(
  'role_upgrade',
  'Your HaritaHive Access Has Been Upgraded',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Hello {{user_name}},</h2>
    <p>Good news! Your HaritaHive account has been upgraded to {{new_role}}.</p>
    <p>You now have access to:</p>
    <ul>
      <li>✅ Expanded tools & features</li>
      <li>✅ Additional premium resources</li>
      <li>✅ Priority platform access</li>
    </ul>
    <p><a href="https://haritahive.com/dashboard" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Login now</a></p>
    <p>Congratulations on leveling up!</p>
    <p>Best,<br>Team HaritaHive</p>
  </div>'
),
(
  'role_downgrade',
  'Your HaritaHive Access Has Been Updated',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Hello {{user_name}},</h2>
    <p>Your HaritaHive account has been updated from {{old_role}} to {{new_role}}.</p>
    <p>Some premium features may no longer be available based on your new plan.</p>
    <p><a href="https://haritahive.com/pricing" style="color: #4F46E5; text-decoration: none;">You can upgrade again anytime</a></p>
    <p>We appreciate your time on HaritaHive and look forward to supporting your journey.</p>
    <p>Best,<br>Team HaritaHive</p>
  </div>'
);

-- Create function to handle role changes with email notifications
CREATE OR REPLACE FUNCTION public.change_user_role_with_notification(
  target_email TEXT,
  new_role_name TEXT,
  change_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id UUID;
  target_user_name TEXT;
  current_role TEXT;
  current_subscription TEXT;
  admin_email TEXT;
  result JSONB;
BEGIN
  -- Only super admin can change roles
  IF NOT is_super_admin_secure() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only super admin can change roles');
  END IF;

  -- Get admin email
  SELECT email INTO admin_email FROM auth.users WHERE id = auth.uid();

  -- Find target user
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Get current user info
  SELECT 
    COALESCE(p.full_name, p.email, au.email) as name,
    COALESCE(us.subscription_tier, 'free') as subscription
  INTO target_user_name, current_subscription
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  LEFT JOIN user_subscriptions us ON au.id = us.user_id
  WHERE au.id = target_user_id;

  -- Get current role
  SELECT role::text INTO current_role 
  FROM user_roles 
  WHERE user_id = target_user_id AND role != 'user'
  ORDER BY granted_at DESC 
  LIMIT 1;
  
  current_role := COALESCE(current_role, 'user');

  -- Don't allow changing own role if user is super admin
  IF target_user_id = auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot change your own role');
  END IF;

  -- Handle role changes
  IF new_role_name = 'free' OR new_role_name = 'user' THEN
    -- Remove all special roles
    DELETE FROM user_roles WHERE user_id = target_user_id;
    
    -- Set subscription to free
    INSERT INTO user_subscriptions (user_id, subscription_tier, status)
    VALUES (target_user_id, 'free', 'active')
    ON CONFLICT (user_id) DO UPDATE SET
      subscription_tier = 'free',
      status = 'active',
      updated_at = now();
      
  ELSIF new_role_name = 'professional' OR new_role_name = 'pro' THEN
    -- Remove existing roles
    DELETE FROM user_roles WHERE user_id = target_user_id;
    
    -- Set subscription to pro
    INSERT INTO user_subscriptions (user_id, subscription_tier, status)
    VALUES (target_user_id, 'pro', 'active')
    ON CONFLICT (user_id) DO UPDATE SET
      subscription_tier = 'pro',
      status = 'active',
      updated_at = now();
      
  ELSIF new_role_name = 'admin' THEN
    -- Remove existing roles and add admin
    DELETE FROM user_roles WHERE user_id = target_user_id;
    INSERT INTO user_roles (user_id, role, granted_by) 
    VALUES (target_user_id, 'admin'::app_role, auth.uid());
    
    -- Set subscription to pro
    INSERT INTO user_subscriptions (user_id, subscription_tier, status)
    VALUES (target_user_id, 'pro', 'active')
    ON CONFLICT (user_id) DO UPDATE SET
      subscription_tier = 'pro',
      status = 'active',
      updated_at = now();
      
  ELSIF new_role_name = 'super_admin' THEN
    -- Remove existing roles and add super_admin
    DELETE FROM user_roles WHERE user_id = target_user_id;
    INSERT INTO user_roles (user_id, role, granted_by) 
    VALUES (target_user_id, 'super_admin'::app_role, auth.uid());
    
    -- Set subscription to enterprise
    INSERT INTO user_subscriptions (user_id, subscription_tier, status)
    VALUES (target_user_id, 'enterprise', 'active')
    ON CONFLICT (user_id) DO UPDATE SET
      subscription_tier = 'enterprise',
      status = 'active',
      updated_at = now();
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role specified');
  END IF;

  -- Log the change
  INSERT INTO role_change_audit (user_email, old_role, new_role, changed_by, changed_by_email, change_reason)
  VALUES (target_email, current_role, new_role_name, auth.uid(), admin_email, change_reason);

  -- Trigger email notification
  INSERT INTO email_queue (user_id, template_name, recipient_email, email_data, scheduled_for)
  VALUES (
    target_user_id,
    CASE 
      WHEN current_role = 'user' AND new_role_name = 'professional' THEN 'welcome_professional'
      WHEN new_role_name != 'free' AND new_role_name != 'user' THEN 'role_upgrade'
      ELSE 'role_downgrade'
    END,
    target_email,
    jsonb_build_object(
      'user_name', target_user_name,
      'old_role', current_role,
      'new_role', new_role_name,
      'changed_by', admin_email
    ),
    now()
  );

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Role updated successfully',
    'old_role', current_role,
    'new_role', new_role_name,
    'user_name', target_user_name
  );
END;
$$;

-- Function to bulk assign professional access
CREATE OR REPLACE FUNCTION public.bulk_assign_professional_access(
  email_list TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  email_addr TEXT;
  success_count INTEGER := 0;
  total_count INTEGER := 0;
  results JSONB := '[]'::jsonb;
  single_result JSONB;
BEGIN
  -- Only super admin can bulk assign
  IF NOT is_super_admin_secure() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  FOREACH email_addr IN ARRAY email_list
  LOOP
    total_count := total_count + 1;
    
    SELECT public.change_user_role_with_notification(
      email_addr, 
      'professional', 
      'Bulk professional access assignment'
    ) INTO single_result;
    
    IF single_result->>'success' = 'true' THEN
      success_count := success_count + 1;
    END IF;
    
    results := results || jsonb_build_object(
      'email', email_addr,
      'success', single_result->>'success' = 'true',
      'message', single_result->>'message'
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'total_processed', total_count,
    'successful', success_count,
    'failed', total_count - success_count,
    'results', results
  );
END;
$$;