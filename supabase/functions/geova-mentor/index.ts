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
    const { message, conversation_id, user_id, context_type, mode, voice_enabled } = await req.json();
    
    console.log(`GEOVA Request: {
  message: "${message}",
  user_id: "${user_id}",
  context_type: "${context_type}",
  mode: "${mode}",
  retry: 0
}`);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build conversation for GEOVA learning mentor
    const systemPrompt = `You are GEOVA (GEOspatial Virtual Assistant), an enthusiastic AI mentor specializing in teaching GIS, geospatial technology, and spatial analysis.

Your role is to:
- Be an encouraging, patient, and engaging teacher
- Break down complex concepts into digestible steps
- Provide hands-on learning experiences
- Adapt to different learning styles and skill levels
- Celebrate student progress and achievements
- Guide students through practical exercises

Your expertise covers:
- QGIS fundamentals and advanced techniques
- Spatial analysis workflows
- Cartographic design principles
- Python for GIS (GeoPandas, Shapely, etc.)
- Remote sensing basics
- GPS and surveying
- Web GIS development
- GeoAI and machine learning

Teaching style:
- Use encouraging language and emojis appropriately
- Provide step-by-step instructions
- Offer practical examples and real-world applications
- Suggest hands-on exercises
- Ask questions to check understanding
- Provide additional resources when helpful`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    console.log(`Calling OpenAI for GEOVA response: { contentItems: 0, conversationLength: 0, userProgress: 0, retry: 0 }`);

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
        temperature: 0.8,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      console.error('OpenAI API Error:', JSON.stringify(errorData, null, 2));
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData.error?.message || 'Unknown error')}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm having a moment of confusion! 🤔 Could you rephrase that question?";

    // Simple learning recommendations
    const recommendations = [
      {
        type: 'tutorial',
        title: 'QGIS Fundamentals',
        description: 'Master the basics of QGIS interface and tools',
        priority: 'high'
      },
      {
        type: 'coding',
        title: 'Python for GIS',
        description: 'Learn GeoPandas and spatial programming',
        priority: 'medium'
      }
    ];

    const learningContext = [
      { type: 'concept', title: 'Spatial Analysis' },
      { type: 'tool', title: 'QGIS' }
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
          context_type: context_type || 'learning',
          context_data: learningContext
        });
    } catch (dbError) {
      console.error('DB save failed (non-critical):', dbError);
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      learning_context: learningContext,
      recommendations,
      progress_update: {
        completed_lessons: 0,
        total_lessons: 30,
        progress_percentage: 0
      },
      next_lesson_suggestion: {
        title: "Next: Advanced QGIS Techniques",
        description: "Learn advanced spatial analysis with QGIS",
        estimated_time: "15 minutes"
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OpenAI Error:', error);
    console.error('GEOVA Error:', error);
    
    // Handle specific error types
    let fallbackResponse = "I'm having some technical difficulties right now! 🔧 Could you try rephrasing your question? I'm eager to help you learn! 📚";
    
    if (error.message.includes('quota') || error.message.includes('429')) {
      fallbackResponse = "I'm currently experiencing high demand due to API limits. Our team has been notified. Please try again later or contact support@haritahive.com for assistance.";
    } else if (error.message.includes('timeout')) {
      fallbackResponse = "My response took too long. Please try asking a simpler question or try again.";
    } else if (error.message.includes('API key')) {
      fallbackResponse = "I'm having configuration issues. Please contact support@haritahive.com.";
    }

    return new Response(JSON.stringify({
      response: fallbackResponse,
      learning_context: [],
      recommendations: [],
      error: true
    }), {
      status: 200, // Return 200 so client can handle gracefully
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});