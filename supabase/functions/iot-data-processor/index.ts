import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IoTRequest {
  action: 'register_sensor' | 'update_sensor' | 'ingest_data' | 'get_sensors' | 'connect_system';
  sensor_data?: any;
  sensor_id?: string;
  user_id?: string;
  reading_data?: any;
  system_data?: any;
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

    const { action, sensor_data, sensor_id, user_id, reading_data, system_data }: IoTRequest = await req.json();

    console.log(`IoT action: ${action}`, { sensor_id, user_id });

    switch (action) {
      case 'register_sensor':
        return await handleRegisterSensor(supabaseClient, sensor_data, user_id!);
      case 'update_sensor':
        return await handleUpdateSensor(supabaseClient, sensor_id!, sensor_data, user_id!);
      case 'ingest_data':
        return await handleIngestData(supabaseClient, sensor_id!, reading_data);
      case 'get_sensors':
        return await handleGetSensors(supabaseClient, user_id!);
      case 'connect_system':
        return await handleConnectSystem(supabaseClient, system_data, user_id!);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in IoT function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleRegisterSensor(supabase: any, sensor_data: any, user_id: string) {
  const { data: sensor, error } = await supabase
    .from('iot_sensors')
    .insert({
      ...sensor_data,
      user_id,
      status: 'online',
      last_reading_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to register sensor: ${error.message}`);
  }

  console.log(`Registered IoT sensor: ${sensor.name}`);
  
  return new Response(JSON.stringify({ success: true, sensor }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUpdateSensor(supabase: any, sensor_id: string, sensor_data: any, user_id: string) {
  const { data: sensor, error } = await supabase
    .from('iot_sensors')
    .update({
      ...sensor_data,
      updated_at: new Date().toISOString()
    })
    .eq('id', sensor_id)
    .eq('user_id', user_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update sensor: ${error.message}`);
  }

  console.log(`Updated IoT sensor: ${sensor_id}`);
  
  return new Response(JSON.stringify({ success: true, sensor }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleIngestData(supabase: any, sensor_id: string, reading_data: any) {
  // Update sensor with latest reading
  const { data: sensor, error: sensorError } = await supabase
    .from('iot_sensors')
    .update({
      current_value: reading_data.value,
      battery_level: reading_data.battery_level,
      last_reading_at: new Date().toISOString(),
      status: reading_data.status || 'online'
    })
    .eq('id', sensor_id)
    .select()
    .single();

  if (sensorError) {
    throw new Error(`Failed to update sensor reading: ${sensorError.message}`);
  }

  // Check if this reading should trigger any automated decisions
  EdgeRuntime.waitUntil(
    checkAutomationTriggers(supabase, sensor, reading_data)
  );

  console.log(`Ingested data for sensor: ${sensor_id}, value: ${reading_data.value}`);
  
  return new Response(JSON.stringify({ 
    success: true, 
    sensor_id,
    timestamp: new Date().toISOString(),
    triggers_checked: true
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGetSensors(supabase: any, user_id: string) {
  const { data: sensors, error } = await supabase
    .from('iot_sensors')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get sensors: ${error.message}`);
  }

  return new Response(JSON.stringify({ sensors }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleConnectSystem(supabase: any, system_data: any, user_id: string) {
  const { data: system, error } = await supabase
    .from('external_system_integrations')
    .insert({
      ...system_data,
      user_id,
      status: 'connected',
      last_sync_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to connect system: ${error.message}`);
  }

  console.log(`Connected external system: ${system.name}`);
  
  return new Response(JSON.stringify({ success: true, system }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function checkAutomationTriggers(supabase: any, sensor: any, reading_data: any) {
  try {
    console.log(`Checking automation triggers for sensor: ${sensor.name}`);
    
    // Get all active decision rules that might be triggered by this sensor
    const { data: rules, error } = await supabase
      .from('automated_decision_rules')
      .select('*')
      .eq('status', 'active')
      .eq('user_id', sensor.user_id)
      .contains('trigger_condition', sensor.sensor_type);

    if (error || !rules || rules.length === 0) {
      console.log('No matching automation rules found');
      return;
    }

    for (const rule of rules) {
      // Evaluate trigger condition
      const shouldTrigger = evaluateTriggerCondition(rule.trigger_condition, {
        sensor_type: sensor.sensor_type,
        current_value: reading_data.value,
        battery_level: reading_data.battery_level,
        location: sensor.location,
        sensor_id: sensor.id
      });

      if (shouldTrigger) {
        console.log(`Trigger condition met for rule: ${rule.name}`);
        
        // Create decision execution
        const estimatedImpact = generateEstimatedImpact(rule, sensor, reading_data);
        
        const { data: decision, error: decisionError } = await supabase
          .from('decision_executions')
          .insert({
            rule_id: rule.id,
            trigger_data: {
              sensor_id: sensor.id,
              sensor_name: sensor.name,
              sensor_type: sensor.sensor_type,
              reading_value: reading_data.value,
              battery_level: reading_data.battery_level,
              location: sensor.location,
              timestamp: new Date().toISOString()
            },
            recommended_action: rule.action_definition.description || 'Execute automated response',
            confidence_score: 0.95, // High confidence for sensor-triggered events
            estimated_impact: estimatedImpact,
            expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
            status: rule.auto_execute ? 'approved' : 'pending'
          })
          .select()
          .single();

        if (decisionError) {
          console.error(`Failed to create decision execution: ${decisionError.message}`);
          continue;
        }

        console.log(`Created decision execution: ${decision.id} for rule: ${rule.name}`);

        // If auto-execute is enabled, execute immediately
        if (rule.auto_execute) {
          EdgeRuntime.waitUntil(
            executeAutomatedAction(supabase, decision.id, rule, sensor, reading_data)
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking automation triggers:', error);
  }
}

function evaluateTriggerCondition(condition: string, context: any): boolean {
  try {
    // Simple condition evaluation - in production, use a proper expression evaluator
    // Examples: "current_value > 50", "battery_level < 20", "sensor_type = 'temperature'"
    
    if (condition.includes('current_value >')) {
      const threshold = parseFloat(condition.split('>')[1].trim());
      return context.current_value > threshold;
    }
    
    if (condition.includes('current_value <')) {
      const threshold = parseFloat(condition.split('<')[1].trim());
      return context.current_value < threshold;
    }
    
    if (condition.includes('battery_level <')) {
      const threshold = parseFloat(condition.split('<')[1].trim());
      return context.battery_level < threshold;
    }
    
    if (condition.includes('sensor_type =')) {
      const expected = condition.split('=')[1].trim().replace(/['"]/g, '');
      return context.sensor_type === expected;
    }
    
    // Default: don't trigger
    return false;
  } catch (error) {
    console.error('Error evaluating trigger condition:', error);
    return false;
  }
}

function generateEstimatedImpact(rule: any, sensor: any, reading_data: any): string {
  const impacts = [
    `Sensor ${sensor.name} detected critical reading: ${reading_data.value}${sensor.unit}`,
    `Automated response will be triggered for location: ${sensor.location}`,
    `Priority level: ${rule.priority.toUpperCase()}`,
    `Expected response time: ${rule.priority === 'critical' ? '< 5 minutes' : '< 30 minutes'}`
  ];
  
  return impacts.join('. ');
}

async function executeAutomatedAction(supabase: any, decision_id: string, rule: any, sensor: any, reading_data: any) {
  try {
    console.log(`Executing automated action for decision: ${decision_id}`);
    
    // Simulate action execution
    const execution_result = {
      success: true,
      timestamp: new Date().toISOString(),
      action_taken: rule.action_definition.description,
      sensor_id: sensor.id,
      trigger_value: reading_data.value,
      notifications_sent: Math.floor(Math.random() * 10) + 1,
      systems_updated: ['alert_dashboard', 'notification_service']
    };
    
    // Update decision as executed
    await supabase
      .from('decision_executions')
      .update({
        status: 'executed',
        executed_at: new Date().toISOString(),
        execution_result: execution_result
      })
      .eq('id', decision_id);
    
    console.log(`Successfully executed automated action for decision: ${decision_id}`);
    
  } catch (error) {
    console.error(`Failed to execute automated action: ${error.message}`);
    
    // Update decision as failed
    await supabase
      .from('decision_executions')
      .update({
        status: 'failed',
        executed_at: new Date().toISOString(),
        error_message: error.message
      })
      .eq('id', decision_id);
  }
}