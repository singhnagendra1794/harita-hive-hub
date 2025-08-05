-- Phase 4: Industry Intelligence, Automation & Marketplace Tables

-- Industry Intelligence Packs
CREATE TABLE public.industry_intelligence_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  icon_url TEXT,
  tier TEXT NOT NULL DEFAULT 'pro' CHECK (tier IN ('free', 'pro', 'enterprise')),
  models_count INTEGER NOT NULL DEFAULT 0,
  templates_count INTEGER NOT NULL DEFAULT 0,
  datasets_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  users_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]'::jsonb,
  use_cases JSONB DEFAULT '[]'::jsonb,
  color_scheme TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Pack Installations
CREATE TABLE public.user_pack_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES public.industry_intelligence_packs(id) ON DELETE CASCADE,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  UNIQUE(user_id, pack_id)
);

-- Automated Decision Rules
CREATE TABLE public.automated_decision_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_condition TEXT NOT NULL,
  action_definition JSONB NOT NULL,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.8,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  approvals_required INTEGER DEFAULT 1,
  auto_execute BOOLEAN DEFAULT false,
  success_rate DECIMAL(3,2) DEFAULT 0,
  total_executions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Decision Executions
CREATE TABLE public.decision_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.automated_decision_rules(id) ON DELETE CASCADE,
  trigger_data JSONB NOT NULL,
  recommended_action TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  estimated_impact TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'failed')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  execution_result JSONB,
  error_message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- IoT Sensors
CREATE TABLE public.iot_sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates POINT,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'error', 'maintenance')),
  current_value DECIMAL,
  unit TEXT,
  battery_level INTEGER,
  last_reading_at TIMESTAMP WITH TIME ZONE,
  configuration JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- External System Integrations
CREATE TABLE public.external_system_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  system_type TEXT NOT NULL,
  description TEXT,
  endpoint_url TEXT NOT NULL,
  authentication_type TEXT DEFAULT 'api_key',
  credentials JSONB DEFAULT '{}'::jsonb, -- encrypted
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  data_flow TEXT DEFAULT 'inbound' CHECK (data_flow IN ('inbound', 'outbound', 'bidirectional')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency INTEGER DEFAULT 3600, -- seconds
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Data Streams
CREATE TABLE public.data_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'iot_sensor', 'external_system', 'api', 'file_upload'
  source_id UUID,
  frequency_seconds INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  records_processed INTEGER DEFAULT 0,
  last_update_at TIMESTAMP WITH TIME ZONE,
  processing_config JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workflow Schedules
CREATE TABLE public.workflow_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT NOT NULL,
  schedule_type TEXT DEFAULT 'fixed' CHECK (schedule_type IN ('fixed', 'event', 'continuous')),
  schedule_expression TEXT NOT NULL, -- cron expression or event condition
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_duration INTEGER, -- minutes
  output_destination TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  success_rate DECIMAL(3,2) DEFAULT 0,
  total_runs INTEGER DEFAULT 0,
  workflow_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Schedule Executions
CREATE TABLE public.schedule_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.workflow_schedules(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  duration_seconds INTEGER,
  output_size_bytes BIGINT,
  output_location TEXT,
  error_message TEXT,
  execution_log JSONB DEFAULT '{}'::jsonb
);

-- Marketplace Items
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('dataset', 'model', 'plugin', 'template')),
  description TEXT NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'credits')),
  rating DECIMAL(3,2) DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  file_size_bytes BIGINT,
  file_format TEXT,
  accuracy_score DECIMAL(3,2),
  features JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  preview_image_url TEXT,
  download_url TEXT,
  documentation_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_review')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace Purchases
CREATE TABLE public.marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  download_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- User Credits System
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  earned_total INTEGER DEFAULT 0,
  spent_total INTEGER DEFAULT 0,
  last_transaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Credit Transactions
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for earned, negative for spent
  transaction_type TEXT NOT NULL, -- 'purchase', 'reward', 'refund', 'admin_adjustment'
  description TEXT NOT NULL,
  reference_id UUID, -- marketplace_purchase_id, etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.industry_intelligence_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pack_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_decision_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_system_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Industry Intelligence Packs - Public read, admin manage
CREATE POLICY "Anyone can view industry packs" ON public.industry_intelligence_packs
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage industry packs" ON public.industry_intelligence_packs
  FOR ALL USING (public.is_admin_secure());

-- User Pack Installations - Users manage their own
CREATE POLICY "Users can manage their pack installations" ON public.user_pack_installations
  FOR ALL USING (auth.uid() = user_id);

-- Automated Decision Rules - Users and org members
CREATE POLICY "Users can manage their decision rules" ON public.automated_decision_rules
  FOR ALL USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.has_org_permission(organization_id, auth.uid(), 'analyst'))
  );

-- Decision Executions - Users and org members can view, approvers can modify
CREATE POLICY "Users can view decision executions" ON public.decision_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.automated_decision_rules adr 
      WHERE adr.id = rule_id AND (
        adr.user_id = auth.uid() OR 
        (adr.organization_id IS NOT NULL AND public.has_org_permission(adr.organization_id, auth.uid(), 'viewer'))
      )
    )
  );

CREATE POLICY "Users can approve/reject decisions" ON public.decision_executions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.automated_decision_rules adr 
      WHERE adr.id = rule_id AND (
        adr.user_id = auth.uid() OR 
        (adr.organization_id IS NOT NULL AND public.has_org_permission(adr.organization_id, auth.uid(), 'admin'))
      )
    )
  );

-- IoT Sensors - Users and org members
CREATE POLICY "Users can manage their IoT sensors" ON public.iot_sensors
  FOR ALL USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.has_org_permission(organization_id, auth.uid(), 'analyst'))
  );

-- External Systems - Users and org members
CREATE POLICY "Users can manage their external integrations" ON public.external_system_integrations
  FOR ALL USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.has_org_permission(organization_id, auth.uid(), 'analyst'))
  );

-- Data Streams - Users and org members
CREATE POLICY "Users can manage their data streams" ON public.data_streams
  FOR ALL USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.has_org_permission(organization_id, auth.uid(), 'analyst'))
  );

-- Workflow Schedules - Users and org members
CREATE POLICY "Users can manage their workflow schedules" ON public.workflow_schedules
  FOR ALL USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.has_org_permission(organization_id, auth.uid(), 'analyst'))
  );

-- Schedule Executions - Users and org members can view
CREATE POLICY "Users can view schedule executions" ON public.schedule_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workflow_schedules ws 
      WHERE ws.id = schedule_id AND (
        ws.user_id = auth.uid() OR 
        (ws.organization_id IS NOT NULL AND public.has_org_permission(ws.organization_id, auth.uid(), 'viewer'))
      )
    )
  );

-- Marketplace Items - Public read, providers manage their own
CREATE POLICY "Anyone can view active marketplace items" ON public.marketplace_items
  FOR SELECT USING (status = 'active');

CREATE POLICY "Providers can manage their items" ON public.marketplace_items
  FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "Admins can manage all marketplace items" ON public.marketplace_items
  FOR ALL USING (public.is_admin_secure());

-- Marketplace Purchases - Users manage their own
CREATE POLICY "Users can view their purchases" ON public.marketplace_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON public.marketplace_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update purchase status" ON public.marketplace_purchases
  FOR UPDATE USING (true); -- Will be handled by edge functions with service role

-- User Credits - Users manage their own
CREATE POLICY "Users can view their credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their credits" ON public.user_credits
  FOR ALL USING (auth.uid() = user_id);

-- Credit Transactions - Users view their own
CREATE POLICY "Users can view their credit transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create credit transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (true); -- Will be handled by edge functions

-- Create indexes for performance
CREATE INDEX idx_user_pack_installations_user_id ON public.user_pack_installations(user_id);
CREATE INDEX idx_automated_decision_rules_user_id ON public.automated_decision_rules(user_id);
CREATE INDEX idx_automated_decision_rules_status ON public.automated_decision_rules(status);
CREATE INDEX idx_decision_executions_rule_id ON public.decision_executions(rule_id);
CREATE INDEX idx_decision_executions_status ON public.decision_executions(status);
CREATE INDEX idx_iot_sensors_user_id ON public.iot_sensors(user_id);
CREATE INDEX idx_iot_sensors_status ON public.iot_sensors(status);
CREATE INDEX idx_external_system_integrations_user_id ON public.external_system_integrations(user_id);
CREATE INDEX idx_data_streams_user_id ON public.data_streams(user_id);
CREATE INDEX idx_workflow_schedules_user_id ON public.workflow_schedules(user_id);
CREATE INDEX idx_workflow_schedules_next_run ON public.workflow_schedules(next_run_at) WHERE status = 'active';
CREATE INDEX idx_marketplace_items_category ON public.marketplace_items(category);
CREATE INDEX idx_marketplace_items_status ON public.marketplace_items(status);
CREATE INDEX idx_marketplace_purchases_user_id ON public.marketplace_purchases(user_id);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);

-- Functions for credit management
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  credits INTEGER;
BEGIN
  SELECT balance INTO credits
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  IF credits IS NULL THEN
    -- Create initial credits record
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (p_user_id, 100) -- 100 free credits for new users
    RETURNING balance INTO credits;
  END IF;
  
  RETURN credits;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_credits(p_user_id UUID, p_amount INTEGER, p_transaction_type TEXT, p_description TEXT, p_reference_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current balance
  current_balance := public.get_user_credits(p_user_id);
  
  -- Check if user has enough credits for negative transactions
  IF p_amount < 0 AND current_balance + p_amount < 0 THEN
    RETURN FALSE;
  END IF;
  
  new_balance := current_balance + p_amount;
  
  -- Update balance
  UPDATE public.user_credits
  SET 
    balance = new_balance,
    earned_total = earned_total + GREATEST(p_amount, 0),
    spent_total = spent_total + GREATEST(-p_amount, 0),
    last_transaction_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create transaction record
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, reference_id)
  VALUES (p_user_id, p_amount, p_transaction_type, p_description, p_reference_id);
  
  RETURN TRUE;
END;
$$;