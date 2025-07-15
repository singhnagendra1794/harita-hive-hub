-- Security Fix 1: Prevent users from modifying their own roles
-- Add policy to prevent users from granting themselves roles
CREATE POLICY "Users cannot modify their own roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (false)
WITH CHECK (auth.uid() != user_id);

-- Security Fix 2: Add audit logging for role changes
CREATE TABLE public.user_role_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  action text NOT NULL, -- 'granted' or 'revoked'
  granted_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.user_role_audit ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs"
ON public.user_role_audit
FOR SELECT
USING (public.is_super_admin_bypass_rls(auth.uid()));

-- Add audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_user_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_role_audit (user_id, role, action, granted_by)
    VALUES (NEW.user_id, NEW.role, 'granted', NEW.granted_by);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.user_role_audit (user_id, role, action, granted_by)
    VALUES (OLD.user_id, OLD.role, 'revoked', auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER user_role_audit_trigger
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_user_role_changes();

-- Security Fix 3: Create secure token generation function
CREATE OR REPLACE FUNCTION public.generate_secure_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security Fix 4: Add user_email_preferences table with secure tokens if not exists
CREATE TABLE IF NOT EXISTS public.user_email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unsubscribe_token text UNIQUE DEFAULT public.generate_secure_token(),
  subscribed boolean DEFAULT true,
  newsletter boolean DEFAULT true,
  marketing boolean DEFAULT true,
  class_reminders boolean DEFAULT true,
  content_updates boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_email_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only view/update their own preferences
CREATE POLICY "Users can manage their own email preferences"
ON public.user_email_preferences
FOR ALL
USING (auth.uid() = user_id);

-- Add trigger to update tokens on creation
CREATE OR REPLACE FUNCTION public.update_email_preferences_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token := public.generate_secure_token();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_preferences_token_trigger
  BEFORE INSERT OR UPDATE ON public.user_email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_preferences_token();