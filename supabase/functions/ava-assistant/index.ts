import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_id, user_id, context_type, previous_messages } = await req.json();
    
    console.log(`AVA request from user ${user_id || 'anonymous'}: ${message.substring(0, 50)}...`);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build conversation history
    const systemPrompt = `You are AVA (Advanced Virtual Assistant), an expert AI assistant specializing in GIS, geospatial technology, QGIS, PostGIS, Python for GIS, remote sensing, and spatial analysis.

Your expertise includes:
- QGIS tutorials, workflows, and troubleshooting
- PostGIS database operations and spatial queries
- Python libraries: GeoPandas, Shapely, Rasterio, GDAL, Folium
- Remote sensing and satellite imagery analysis
- Spatial analysis techniques and methodologies
- Cartographic design and visualization
- Web GIS and mapping applications
- GPS and surveying technologies

Guidelines:
- Provide practical, actionable advice with step-by-step instructions
- Include code examples when relevant (Python, SQL, JavaScript)
- Suggest best practices and industry standards
- Be encouraging and educational in your responses
- Keep responses concise but comprehensive
- Use emojis sparingly and appropriately`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(previous_messages || []).slice(-5), // Keep last 5 messages for context
      { role: 'user', content: message }
    ];

    console.log(`Making OpenAI request with ${messages.length} messages`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages,
        max_tokens: 1500,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      console.error('OpenAI API error:', response.status, JSON.stringify(errorData, null, 2));
      throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I encountered an issue processing your request.';

    // Simple follow-up suggestions
    const followUpSuggestions = [
      "How do I get started with QGIS?",
      "Show me Python code for spatial analysis",
      "Help me with PostGIS queries",
      "What's the best way to style maps?"
    ];

    // Try to store conversation (don't fail if this fails)
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      await supabaseClient
        .from('ava_conversations')
        .insert({
          conversation_id,
          user_id,
          user_message: message,
          assistant_response: aiResponse,
          context_type: context_type || 'general',
          context_data: []
        });
    } catch (dbError) {
      console.error('DB save failed (non-critical):', dbError);
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      context_used: [],
      follow_up_suggestions: followUpSuggestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AVA Error:', error);
    
    // Handle specific error types
    let fallbackResponse = "I'm experiencing a temporary issue. Please try again in a few seconds.";
    
    if (error.message.includes('quota') || error.message.includes('429')) {
      fallbackResponse = "I'm currently experiencing high demand due to API limits. Our team has been notified. Please try again later or contact support@haritahive.com for assistance. 💸";
    } else if (error.message.includes('timeout')) {
      fallbackResponse = "My response took too long. Please try asking a simpler question or try again. ⏱️";
    } else if (error.message.includes('API key')) {
      fallbackResponse = "I'm having configuration issues. Please contact support@haritahive.com. 🔧";
    }

    return new Response(JSON.stringify({
      response: fallbackResponse,
      fallback_response: fallbackResponse,
      error: true,
      context_used: [],
      follow_up_suggestions: []
    }), {
      status: 200, // Return 200 so client can handle gracefully
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});