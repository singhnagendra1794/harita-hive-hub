import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SchedulerRequest {
  action: 'create_schedule' | 'update_schedule' | 'trigger_execution' | 'get_schedules' | 'get_executions';
  schedule_data?: any;
  schedule_id?: string;
  user_id?: string;
  execution_data?: any;
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

    const { action, schedule_data, schedule_id, user_id, execution_data }: SchedulerRequest = await req.json();

    console.log(`Scheduler action: ${action}`, { schedule_id, user_id });

    switch (action) {
      case 'create_schedule':
        return await handleCreateSchedule(supabaseClient, schedule_data, user_id!);
      case 'update_schedule':
        return await handleUpdateSchedule(supabaseClient, schedule_id!, schedule_data, user_id!);
      case 'trigger_execution':
        return await handleTriggerExecution(supabaseClient, schedule_id!, execution_data);
      case 'get_schedules':
        return await handleGetSchedules(supabaseClient, user_id!);
      case 'get_executions':
        return await handleGetExecutions(supabaseClient, schedule_id!, user_id!);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in scheduler function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleCreateSchedule(supabase: any, schedule_data: any, user_id: string) {
  // Calculate next run time based on schedule expression
  const next_run_at = calculateNextRun(schedule_data.schedule_expression, schedule_data.schedule_type);

  const { data: schedule, error } = await supabase
    .from('workflow_schedules')
    .insert({
      ...schedule_data,
      user_id,
      next_run_at
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create schedule: ${error.message}`);
  }

  console.log(`Created workflow schedule: ${schedule.name}`);
  
  return new Response(JSON.stringify({ success: true, schedule }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUpdateSchedule(supabase: any, schedule_id: string, schedule_data: any, user_id: string) {
  // Recalculate next run if schedule expression changed
  if (schedule_data.schedule_expression || schedule_data.schedule_type) {
    const { data: currentSchedule } = await supabase
      .from('workflow_schedules')
      .select('schedule_expression, schedule_type')
      .eq('id', schedule_id)
      .single();

    const expression = schedule_data.schedule_expression || currentSchedule.schedule_expression;
    const type = schedule_data.schedule_type || currentSchedule.schedule_type;
    
    schedule_data.next_run_at = calculateNextRun(expression, type);
  }

  const { data: schedule, error } = await supabase
    .from('workflow_schedules')
    .update(schedule_data)
    .eq('id', schedule_id)
    .eq('user_id', user_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update schedule: ${error.message}`);
  }

  console.log(`Updated workflow schedule: ${schedule_id}`);
  
  return new Response(JSON.stringify({ success: true, schedule }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleTriggerExecution(supabase: any, schedule_id: string, execution_data: any) {
  // Get schedule details
  const { data: schedule, error: scheduleError } = await supabase
    .from('workflow_schedules')
    .select('*')
    .eq('id', schedule_id)
    .single();

  if (scheduleError || !schedule) {
    throw new Error('Schedule not found');
  }

  // Create execution record
  const { data: execution, error: executionError } = await supabase
    .from('schedule_executions')
    .insert({
      schedule_id,
      status: 'running',
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (executionError) {
    throw new Error(`Failed to create execution: ${executionError.message}`);
  }

  console.log(`Started workflow execution: ${execution.id} for schedule: ${schedule_id}`);

  // Execute workflow in background
  EdgeRuntime.waitUntil(
    executeWorkflow(supabase, execution.id, schedule)
  );

  return new Response(JSON.stringify({ 
    success: true, 
    execution_id: execution.id,
    status: 'started'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGetSchedules(supabase: any, user_id: string) {
  const { data: schedules, error } = await supabase
    .from('workflow_schedules')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get schedules: ${error.message}`);
  }

  return new Response(JSON.stringify({ schedules }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGetExecutions(supabase: any, schedule_id: string, user_id: string) {
  // Verify user owns the schedule
  const { data: schedule } = await supabase
    .from('workflow_schedules')
    .select('id')
    .eq('id', schedule_id)
    .eq('user_id', user_id)
    .single();

  if (!schedule) {
    throw new Error('Schedule not found or access denied');
  }

  const { data: executions, error } = await supabase
    .from('schedule_executions')
    .select('*')
    .eq('schedule_id', schedule_id)
    .order('started_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to get executions: ${error.message}`);
  }

  return new Response(JSON.stringify({ executions }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function executeWorkflow(supabase: any, execution_id: string, schedule: any) {
  const startTime = Date.now();
  
  try {
    console.log(`Executing workflow: ${schedule.workflow_type} for schedule: ${schedule.name}`);
    
    // Simulate workflow execution based on type
    const result = await simulateWorkflowExecution(schedule.workflow_type, schedule.workflow_config);
    
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    // Update execution as completed
    await supabase
      .from('schedule_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: duration,
        output_size_bytes: result.output_size,
        output_location: result.output_location,
        execution_log: result.log
      })
      .eq('id', execution_id);

    // Update schedule statistics
    const success_rate = schedule.total_runs > 0 ?
      ((schedule.success_rate * schedule.total_runs) + 1) / (schedule.total_runs + 1) : 1.0;

    await supabase
      .from('workflow_schedules')
      .update({
        last_run_at: new Date().toISOString(),
        next_run_at: calculateNextRun(schedule.schedule_expression, schedule.schedule_type),
        total_runs: schedule.total_runs + 1,
        success_rate: success_rate
      })
      .eq('id', schedule.id);

    console.log(`Completed workflow execution: ${execution_id} in ${duration}s`);
    
  } catch (error) {
    console.error(`Workflow execution failed: ${execution_id}`, error);
    
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    // Update execution as failed
    await supabase
      .from('schedule_executions')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        duration_seconds: duration,
        error_message: error.message,
        execution_log: { error: error.message, stack: error.stack }
      })
      .eq('id', execution_id);

    // Update schedule statistics for failure
    const success_rate = schedule.total_runs > 0 ?
      (schedule.success_rate * schedule.total_runs) / (schedule.total_runs + 1) : 0.0;

    await supabase
      .from('workflow_schedules')
      .update({
        last_run_at: new Date().toISOString(),
        total_runs: schedule.total_runs + 1,
        success_rate: success_rate
      })
      .eq('id', schedule.id);
  }
}

async function simulateWorkflowExecution(workflow_type: string, config: any) {
  // Simulate different workflow types
  const executionTime = Math.random() * 30000 + 5000; // 5-35 seconds
  await new Promise(resolve => setTimeout(resolve, executionTime));
  
  const output_size = Math.floor(Math.random() * 1000000000) + 100000; // 100KB - 1GB
  
  return {
    output_size,
    output_location: `gs://harita-hive-output/${workflow_type}/${Date.now()}.zip`,
    log: {
      workflow_type,
      execution_time_ms: executionTime,
      steps_completed: Math.floor(Math.random() * 10) + 5,
      data_processed: `${Math.floor(output_size / 1024)} KB`,
      models_used: getModelsForWorkflowType(workflow_type)
    }
  };
}

function getModelsForWorkflowType(workflow_type: string): string[] {
  const models = {
    'agriculture_analysis': ['crop-yield-predictor-v2', 'soil-moisture-classifier'],
    'urban_planning': ['urban-growth-model', 'traffic-flow-predictor'],
    'disaster_prediction': ['flood-risk-model', 'wildfire-spread-predictor'],
    'environmental_monitoring': ['air-quality-analyzer', 'deforestation-detector']
  };
  
  return models[workflow_type] || ['generic-geoai-model'];
}

function calculateNextRun(expression: string, schedule_type: string): string | null {
  if (schedule_type === 'event') {
    return null; // Event-triggered schedules don't have fixed next run times
  }
  
  // For simplicity, just add some time to current time based on common cron patterns
  const now = new Date();
  
  if (expression.includes('* * * * *')) {
    // Every minute
    now.setMinutes(now.getMinutes() + 1);
  } else if (expression.includes('0 * * * *')) {
    // Every hour
    now.setHours(now.getHours() + 1, 0, 0, 0);
  } else if (expression.includes('0 6 * * *')) {
    // Daily at 6 AM
    now.setDate(now.getDate() + 1);
    now.setHours(6, 0, 0, 0);
  } else if (expression.includes('0 0 * * 0')) {
    // Weekly on Sunday
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    now.setDate(now.getDate() + daysUntilSunday);
    now.setHours(0, 0, 0, 0);
  } else {
    // Default: add 1 hour
    now.setHours(now.getHours() + 1);
  }
  
  return now.toISOString();
}