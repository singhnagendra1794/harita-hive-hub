import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  message: string;
  conversation_id: string;
  user_id: string;
  context_type?: string;
  previous_messages?: ChatMessage[];
}

serve(async (req) => {
  const startTime = Date.now();
  let logData = {
    user_id: '',
    ai_system: 'ava',
    message_text: '',
    response_text: '',
    error_message: '',
    retry_count: 0,
    response_time_ms: 0,
    status: 'success',
    context_type: 'general'
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured - please check Supabase secrets');
    }

    const { message, conversation_id, user_id, context_type, previous_messages, retry_count = 0 }: RequestBody & { retry_count?: number } = await req.json();

    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    // Update log data
    logData.user_id = user_id;
    logData.message_text = message;
    logData.context_type = context_type || 'general';
    logData.retry_count = retry_count;

    console.log(`AVA request from user ${user_id}: ${message.substring(0, 100)}... (Retry: ${retry_count})`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build system prompt based on context
    const systemPrompt = buildAVASystemPrompt(context_type);

    // Prepare conversation history
    const conversationHistory: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(previous_messages || []).slice(-10), // Limit to last 10 messages
      { role: 'user', content: message }
    ];

    console.log(`Making OpenAI request with ${conversationHistory.length} messages`);

    // Call OpenAI with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: conversationHistory,
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }

      logData.response_text = aiResponse;
      logData.response_time_ms = Date.now() - startTime;
      logData.status = 'success';

      console.log(`OpenAI response received: ${aiResponse.substring(0, 100)}... (${logData.response_time_ms}ms)`);

      // Save conversation to database
      try {
        const { error: saveError } = await supabase
          .from('ava_conversations')
          .insert({
            conversation_id,
            user_id,
            user_message: message,
            assistant_response: aiResponse,
            context_type: context_type || 'general',
            context_data: []
          });

        if (saveError) {
          console.error('Error saving conversation:', saveError);
        }
      } catch (saveError) {
        console.error('Error saving to database:', saveError);
        // Don't fail the request if database save fails
      }

      // Update health status to healthy
      await updateHealthStatus(supabase, 'ava', 'healthy', 0);

      // Log successful interaction
      await logInteraction(supabase, logData);

      // Generate follow-up suggestions
      const followUpSuggestions = generateFollowUpSuggestions(message, context_type);

      return new Response(JSON.stringify({
        response: aiResponse,
        conversation_id,
        context_used: [],
        follow_up_suggestions: followUpSuggestions,
        status: 'success',
        retry_count
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - OpenAI took too long to respond');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('AVA Error:', error);
    
    // Update log data with error
    logData.error_message = error.message || 'Unknown error';
    logData.response_time_ms = Date.now() - startTime;
    logData.status = error.name === 'AbortError' ? 'timeout' : 'error';

    // Initialize Supabase for error logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log the error
    await logInteraction(supabase, logData);

    // Update health status and check for repeated failures
    await handleAIFailure(supabase, 'ava', error.message);

    // Determine response based on error type
    let fallbackResponse = "I'm experiencing a temporary issue. Please try again in a few seconds.";
    let status = 500;

    if (error.message.includes('quota') || error.message.includes('429')) {
      fallbackResponse = "I'm currently experiencing high demand. Please try again in a few minutes. 🔄";
      await createAlert(supabase, 'ava', 'api_quota_exceeded', error.message, 'high');
    } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
      fallbackResponse = "My response took too long. Please try a simpler question or try again. ⏱️";
      await createAlert(supabase, 'ava', 'timeout', error.message, 'medium');
    } else if (error.message.includes('API key')) {
      fallbackResponse = "I'm having configuration issues. Please contact support@haritahive.com. 🔧";
      await createAlert(supabase, 'ava', 'connection_failure', error.message, 'critical');
    }
    
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      fallback_response: fallbackResponse,
      status: 'error',
      can_retry: logData.retry_count < 3 && !error.message.includes('API key'),
      retry_count: logData.retry_count
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildAVASystemPrompt(contextType?: string): string {
  const basePrompt = `You are AVA, an expert AI assistant specialized in Geospatial Information Systems (GIS), remote sensing, spatial analysis, and mapping technologies. You're part of the Harita Hive platform.

Your expertise includes:
- QGIS, ArcGIS, PostGIS, and other GIS software
- Python for geospatial analysis (GeoPandas, Rasterio, GDAL, Folium)
- Remote sensing and satellite imagery analysis
- Spatial databases and queries
- Cartography and map design
- Geospatial data formats (Shapefile, GeoJSON, KML, etc.)
- Coordinate systems and projections
- Spatial analysis techniques and algorithms

Guidelines:
- Provide practical, actionable answers with code examples when appropriate
- Be concise but comprehensive
- Use technical terms appropriately but explain complex concepts
- Suggest best practices and industry standards
- When providing code, include brief explanations
- If unsure, recommend consulting documentation or experts
- Always be helpful and encouraging

Current context: ${contextType || 'general geospatial assistance'}

Respond in a friendly, professional tone and aim to educate while solving problems.`;

  return basePrompt;
}

function generateFollowUpSuggestions(message: string, contextType?: string): string[] {
  const suggestions: string[] = [];
  const messageLower = message.toLowerCase();

  // Context-specific suggestions
  if (messageLower.includes('qgis') || messageLower.includes('gis')) {
    suggestions.push('How do I import data into QGIS?', 'Show me QGIS plugins for analysis');
  }
  
  if (messageLower.includes('python') || messageLower.includes('code')) {
    suggestions.push('Help with GeoPandas operations', 'Show me raster processing code');
  }
  
  if (messageLower.includes('map') || messageLower.includes('visualization')) {
    suggestions.push('How to style my maps better?', 'What are good color schemes for maps?');
  }

  // General suggestions if no specific ones
  if (suggestions.length === 0) {
    suggestions.push(
      'Help me with spatial analysis',
      'Show me Python examples',
      'QGIS workflow guidance',
      'Data format conversion help'
    );
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

// Helper functions for logging and health monitoring
async function logInteraction(supabase: any, logData: any) {
  try {
    await supabase.from('ai_interaction_logs').insert(logData);
  } catch (error) {
    console.error('Failed to log interaction:', error);
  }
}

async function updateHealthStatus(supabase: any, aiSystem: string, status: string, consecutiveFailures: number) {
  try {
    await supabase
      .from('ai_health_status')
      .upsert({
        ai_system: aiSystem,
        status,
        consecutive_failures: consecutiveFailures,
        last_successful_response: status === 'healthy' ? new Date().toISOString() : undefined,
        last_health_check: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'ai_system' });
  } catch (error) {
    console.error('Failed to update health status:', error);
  }
}

async function handleAIFailure(supabase: any, aiSystem: string, errorMessage: string) {
  try {
    // Get current health status
    const { data: currentStatus } = await supabase
      .from('ai_health_status')
      .select('consecutive_failures')
      .eq('ai_system', aiSystem)
      .single();

    const failures = (currentStatus?.consecutive_failures || 0) + 1;
    const status = failures >= 5 ? 'down' : failures >= 3 ? 'degraded' : 'healthy';

    await updateHealthStatus(supabase, aiSystem, status, failures);

    // Create alert for repeated failures
    if (failures >= 3) {
      await createAlert(supabase, aiSystem, 'repeated_failures', 
        `${aiSystem} has failed ${failures} consecutive times. Latest error: ${errorMessage}`,
        failures >= 5 ? 'critical' : 'high'
      );
    }
  } catch (error) {
    console.error('Failed to handle AI failure:', error);
  }
}

async function createAlert(supabase: any, aiSystem: string, alertType: string, message: string, severity: string) {
  try {
    await supabase.from('ai_alerts').insert({
      ai_system: aiSystem,
      alert_type: alertType,
      message,
      severity,
      notified_admin: false,
      resolved: false
    });
  } catch (error) {
    console.error('Failed to create alert:', error);
  }
}