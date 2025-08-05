-- Fix RLS infinite recursion issues - CRITICAL
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Super admin can manage all roles" ON user_roles;

-- Create non-recursive RLS policies for user_roles
CREATE POLICY "Users can view roles securely" ON user_roles
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'contact@haritahive.com')
);

CREATE POLICY "Super admin can manage roles" ON user_roles
FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'contact@haritahive.com')
);

-- Add missing Phase 4 RLS policies
CREATE POLICY IF NOT EXISTS "Users can view industry packs" ON industry_intelligence_packs
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can view marketplace items" ON marketplace_items  
FOR SELECT USING (status = 'active');

CREATE POLICY IF NOT EXISTS "Users can view their credits" ON user_credits
FOR ALL USING (user_id = auth.uid());