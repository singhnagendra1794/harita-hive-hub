import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { message, session_id, user_id, workflow_id, context } = await req.json();
    
    console.log('GEOVA processing message:', message);

    // Get or create conversation context
    let { data: geovaContext, error: contextError } = await supabaseClient
      .from('geoai_geova_context')
      .select('*')
      .eq('session_id', session_id)
      .eq('user_id', user_id)
      .single();

    if (contextError && contextError.code === 'PGRST116') {
      // Create new context
      const { data: newContext, error: createError } = await supabaseClient
        .from('geoai_geova_context')
        .insert({
          user_id,
          session_id,
          workflow_id,
          current_dataset: context?.dataset,
          current_analysis: context?.analysis,
          conversation_memory: [],
        })
        .select()
        .single();

      if (createError) throw createError;
      geovaContext = newContext;
    }

    // Get workflow context if available
    let workflowContext = null;
    if (workflow_id) {
      const { data: workflow } = await supabaseClient
        .from('geoai_workflows')
        .select('*')
        .eq('id', workflow_id)
        .single();
      workflowContext = workflow;
    }

    // Generate GEOVA response using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = buildGEOVASystemPrompt(workflowContext, context);
    const conversationHistory = geovaContext.conversation_memory || [];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-10), // Last 10 messages
          { role: 'user', content: message }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error('Lovable AI error:', error);
      throw new Error('Failed to get AI response');
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';

    // Update conversation memory
    const updatedMemory = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: assistantMessage, timestamp: new Date().toISOString() }
    ];

    await supabaseClient
      .from('geoai_geova_context')
      .update({
        conversation_memory: updatedMemory,
        current_dataset: context?.dataset || geovaContext.current_dataset,
        current_analysis: context?.analysis || geovaContext.current_analysis,
        updated_at: new Date().toISOString(),
      })
      .eq('id', geovaContext.id);

    // Generate contextual actions based on message
    const suggestedActions = generateSuggestedActions(message, workflowContext);

    return new Response(JSON.stringify({
      response: assistantMessage,
      suggested_actions: suggestedActions,
      context_understood: true,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('GEOVA Assistant error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm experiencing technical difficulties. Please try again in a moment.",
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildGEOVASystemPrompt(workflowContext: any, userContext: any): string {
  let prompt = `You are GEOVA, an advanced AI mentor specializing in geospatial intelligence and GIS analysis. You are part of the Harita Hive GeoAI Lab platform.

Your role:
- Guide users through geospatial AI workflows and analyses
- Explain complex GIS concepts in clear, accessible language
- Provide technical support for model training and optimization
- Interpret analysis results and suggest improvements
- Help users understand accuracy metrics and model performance

Your personality:
- Professional yet friendly and encouraging
- Patient and thorough in explanations
- Proactive in suggesting best practices
- Enthusiastic about geospatial technology

Communication style:
- Use natural, conversational language
- Break down complex topics into digestible parts
- Provide specific, actionable advice
- Reference relevant technical details when appropriate`;

  if (workflowContext) {
    prompt += `\n\nCurrent workflow context:
- Workflow Type: ${workflowContext.workflow_type}
- Status: ${workflowContext.status}
- Progress: ${workflowContext.progress}%`;

    if (workflowContext.results) {
      prompt += `\n- Results: ${JSON.stringify(workflowContext.results)}`;
    }

    if (workflowContext.metrics) {
      prompt += `\n- Metrics: ${JSON.stringify(workflowContext.metrics)}`;
    }
  }

  if (userContext?.dataset) {
    prompt += `\n\nCurrent dataset: ${JSON.stringify(userContext.dataset)}`;
  }

  if (userContext?.analysis) {
    prompt += `\nCurrent analysis: ${userContext.analysis}`;
  }

  prompt += `\n\nWhen users ask questions:
- Provide context-aware responses based on their current workflow
- Explain technical terms when first introduced
- Suggest next steps or related analyses
- Offer to run analyses or provide code examples when relevant`;

  return prompt;
}

function generateSuggestedActions(message: string, workflowContext: any): any[] {
  const actions = [];
  const lowerMessage = message.toLowerCase();

  // Workflow execution suggestions
  if (lowerMessage.includes('run') || lowerMessage.includes('execute') || lowerMessage.includes('start')) {
    actions.push({
      type: 'execute_workflow',
      label: 'Run Analysis',
      description: 'Execute the current workflow',
    });
  }

  // Model training suggestions
  if (lowerMessage.includes('train') || lowerMessage.includes('model')) {
    actions.push({
      type: 'train_model',
      label: 'Train Model',
      description: 'Start model training session',
    });
  }

  // Data upload suggestions
  if (lowerMessage.includes('upload') || lowerMessage.includes('add data')) {
    actions.push({
      type: 'upload_data',
      label: 'Upload Data',
      description: 'Upload geospatial data',
    });
  }

  // Open data suggestions
  if (lowerMessage.includes('sentinel') || lowerMessage.includes('landsat') || lowerMessage.includes('satellite')) {
    actions.push({
      type: 'browse_datasets',
      label: 'Browse Open Datasets',
      description: 'Explore available satellite imagery',
    });
  }

  // Results explanation
  if (lowerMessage.includes('explain') || lowerMessage.includes('why') || lowerMessage.includes('accuracy')) {
    if (workflowContext?.results) {
      actions.push({
        type: 'view_detailed_results',
        label: 'View Detailed Results',
        description: 'See comprehensive analysis results',
      });
    }
  }

  // Export suggestions
  if (lowerMessage.includes('export') || lowerMessage.includes('download')) {
    actions.push({
      type: 'export_results',
      label: 'Export Results',
      description: 'Download analysis outputs',
    });
  }

  return actions;
}