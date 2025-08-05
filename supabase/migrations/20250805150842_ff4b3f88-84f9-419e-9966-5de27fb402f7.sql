-- Fix RLS infinite recursion issues - CRITICAL SECURITY FIX
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Super admin can manage all roles" ON user_roles;

-- Create secure, non-recursive RLS policies for user_roles
CREATE POLICY "Users can view roles securely" ON user_roles
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'contact@haritahive.com')
);

CREATE POLICY "Super admin can manage roles" ON user_roles
FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'contact@haritahive.com')
);

-- Add missing RLS policies for Phase 4 tables (correct syntax)
DO $$
BEGIN
  -- Industry intelligence packs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'industry_intelligence_packs' AND policyname = 'Users can view industry packs') THEN
    EXECUTE 'CREATE POLICY "Users can view industry packs" ON industry_intelligence_packs FOR SELECT USING (true)';
  END IF;
  
  -- Marketplace items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_items' AND policyname = 'Users can view marketplace items') THEN
    EXECUTE 'CREATE POLICY "Users can view marketplace items" ON marketplace_items FOR SELECT USING (status = ''active'')';
  END IF;
  
  -- User credits
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credits' AND policyname = 'Users can view their credits') THEN
    EXECUTE 'CREATE POLICY "Users can view their credits" ON user_credits FOR ALL USING (user_id = auth.uid())';
  END IF;
END $$;