import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationRequest {
  action: 'create_rule' | 'update_rule' | 'execute_decision' | 'approve_decision' | 'reject_decision' | 'get_pending';
  rule_data?: any;
  rule_id?: string;
  decision_id?: string;
  user_id?: string;
  approval_data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, rule_data, rule_id, decision_id, user_id, approval_data }: AutomationRequest = await req.json();

    console.log(`Automation action: ${action}`, { rule_id, decision_id, user_id });

    switch (action) {
      case 'create_rule':
        return await handleCreateRule(supabaseClient, rule_data, user_id!);
      case 'update_rule':
        return await handleUpdateRule(supabaseClient, rule_id!, rule_data, user_id!);
      case 'execute_decision':
        return await handleExecuteDecision(supabaseClient, decision_id!, user_id!);
      case 'approve_decision':
        return await handleApproveDecision(supabaseClient, decision_id!, user_id!, approval_data);
      case 'reject_decision':
        return await handleRejectDecision(supabaseClient, decision_id!, user_id!, approval_data);
      case 'get_pending':
        return await handleGetPendingDecisions(supabaseClient, user_id!);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in automation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleCreateRule(supabase: any, rule_data: any, user_id: string) {
  const { data: rule, error } = await supabase
    .from('automated_decision_rules')
    .insert({
      ...rule_data,
      user_id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create rule: ${error.message}`);
  }

  console.log(`Created decision rule: ${rule.name}`);
  
  return new Response(JSON.stringify({ success: true, rule }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUpdateRule(supabase: any, rule_id: string, rule_data: any, user_id: string) {
  const { data: rule, error } = await supabase
    .from('automated_decision_rules')
    .update(rule_data)
    .eq('id', rule_id)
    .eq('user_id', user_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update rule: ${error.message}`);
  }

  console.log(`Updated decision rule: ${rule_id}`);
  
  return new Response(JSON.stringify({ success: true, rule }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleExecuteDecision(supabase: any, decision_id: string, user_id: string) {
  // Get decision details
  const { data: decision, error: decisionError } = await supabase
    .from('decision_executions')
    .select(`
      *,
      automated_decision_rules!inner(*)
    `)
    .eq('id', decision_id)
    .single();

  if (decisionError || !decision) {
    throw new Error('Decision not found');
  }

  // Check if user has permission to execute
  const rule = decision.automated_decision_rules;
  if (rule.user_id !== user_id) {
    // Check org permissions if applicable
    if (rule.organization_id) {
      const { data: hasPermission } = await supabase
        .rpc('has_org_permission', {
          p_org_id: rule.organization_id,
          p_user_id: user_id,
          p_required_role: 'admin'
        });
      
      if (!hasPermission) {
        throw new Error('Insufficient permissions to execute decision');
      }
    } else {
      throw new Error('Insufficient permissions to execute decision');
    }
  }

  // Simulate executing the action
  const execution_result = await simulateActionExecution(decision.recommended_action, decision.trigger_data);

  // Update decision as executed
  const { data: updatedDecision, error: updateError } = await supabase
    .from('decision_executions')
    .update({
      status: execution_result.success ? 'executed' : 'failed',
      executed_at: new Date().toISOString(),
      execution_result: execution_result,
      error_message: execution_result.success ? null : execution_result.error
    })
    .eq('id', decision_id)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update decision: ${updateError.message}`);
  }

  // Update rule statistics
  await supabase
    .from('automated_decision_rules')
    .update({
      total_executions: rule.total_executions + 1,
      success_rate: execution_result.success ? 
        ((rule.success_rate * rule.total_executions) + 1) / (rule.total_executions + 1) :
        (rule.success_rate * rule.total_executions) / (rule.total_executions + 1)
    })
    .eq('id', rule.id);

  console.log(`Executed decision: ${decision_id}, Result: ${execution_result.success ? 'success' : 'failed'}`);

  return new Response(JSON.stringify({ 
    success: true, 
    decision: updatedDecision,
    execution_result 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleApproveDecision(supabase: any, decision_id: string, user_id: string, approval_data: any) {
  const { data: decision, error } = await supabase
    .from('decision_executions')
    .update({
      status: 'approved',
      approved_by: user_id,
      approved_at: new Date().toISOString()
    })
    .eq('id', decision_id)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to approve decision: ${error.message}`);
  }

  // If auto-execute is enabled, execute the decision
  const { data: rule } = await supabase
    .from('automated_decision_rules')
    .select('auto_execute')
    .eq('id', decision.rule_id)
    .single();

  if (rule?.auto_execute) {
    // Execute the decision automatically
    EdgeRuntime.waitUntil(
      handleExecuteDecision(supabase, decision_id, user_id)
    );
  }

  console.log(`Approved decision: ${decision_id} by user: ${user_id}`);

  return new Response(JSON.stringify({ success: true, decision }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleRejectDecision(supabase: any, decision_id: string, user_id: string, approval_data: any) {
  const { data: decision, error } = await supabase
    .from('decision_executions')
    .update({
      status: 'rejected',
      approved_by: user_id,
      approved_at: new Date().toISOString(),
      error_message: approval_data?.reason || 'Decision rejected by approver'
    })
    .eq('id', decision_id)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to reject decision: ${error.message}`);
  }

  console.log(`Rejected decision: ${decision_id} by user: ${user_id}`);

  return new Response(JSON.stringify({ success: true, decision }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGetPendingDecisions(supabase: any, user_id: string) {
  const { data: decisions, error } = await supabase
    .from('decision_executions')
    .select(`
      *,
      automated_decision_rules!inner(*)
    `)
    .eq('status', 'pending')
    .or(`automated_decision_rules.user_id.eq.${user_id}`) // TODO: Add org permission check
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get pending decisions: ${error.message}`);
  }

  return new Response(JSON.stringify({ decisions }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function simulateActionExecution(action: string, trigger_data: any) {
  // Simulate different types of actions
  console.log(`Simulating action execution: ${action}`, trigger_data);
  
  // Random success/failure for simulation
  const success = Math.random() > 0.1; // 90% success rate
  
  if (success) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      action_taken: action,
      affected_systems: ['alert_system', 'notification_service'],
      output_data: {
        notifications_sent: Math.floor(Math.random() * 100) + 1,
        systems_updated: ['emergency_dashboard', 'public_alerts']
      }
    };
  } else {
    return {
      success: false,
      error: 'Simulated execution failure - external system unavailable',
      timestamp: new Date().toISOString(),
      retry_after: 300 // 5 minutes
    };
  }
}