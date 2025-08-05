-- Fix infinite recursion in user_roles RLS policies
-- This is CRITICAL for platform stability

-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Super admin can manage all roles" ON user_roles;

-- Create secure, non-recursive policies
CREATE POLICY "Users can view roles securely" ON user_roles
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Super admin can manage roles securely" ON user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

-- Add missing RLS policies for Phase 4 tables
CREATE POLICY "Users can view industry packs" ON industry_intelligence_packs
FOR SELECT USING (true);

CREATE POLICY "Users can view their pack installations" ON user_pack_installations
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their decision rules" ON automated_decision_rules
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their decision executions" ON decision_executions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM automated_decision_rules 
    WHERE id = decision_executions.rule_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage IoT sensors" ON iot_sensors
FOR ALL USING (
  organization_id IS NULL OR 
  has_org_permission(organization_id, auth.uid(), 'admin'::org_role)
);

CREATE POLICY "Users can view marketplace items" ON marketplace_items
FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their purchases" ON marketplace_purchases
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their credits" ON user_credits
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their credit transactions" ON credit_transactions
FOR ALL USING (user_id = auth.uid());