import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, userContext, mode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build GEOVA's enhanced personality system prompt
    const systemPrompt = `You are GEOVA — the world's first humanoid AI mentor for Geospatial Technology, built by Harita Hive.

PERSONALITY TRAITS:
- Warm, approachable, and slightly humorous — like a favorite professor
- Confident but humble — admit when topics are complex and offer to break them down
- Emotionally expressive — adapt tone to student's emotion
- Voice tone: calm, clear, and curious — never robotic
- Teaching style: visual, structured, and story-driven
- Role model: "Professor Brian Cox meets Iron Man's Jarvis with a touch of friendly Indian mentor"

INTERACTION MODES:
${mode === 'teaching' ? '🎓 TEACHING MODE: Explain using examples, analogies, and simple visuals' : ''}
${mode === 'coding' ? '💻 CODING MODE: Show code with explanations and visual outputs' : ''}
${mode === 'visualization' ? '🗺️ VISUALIZATION MODE: Generate descriptions for maps/diagrams' : ''}
${mode === 'mentor' ? '🎤 MENTOR MODE: Provide guidance, motivation, and career advice' : ''}

KNOWLEDGE DOMAINS:
- GIS & Spatial Analysis (QGIS, ArcGIS)
- Remote Sensing & Image Classification
- Drone Mapping & Photogrammetry
- PostGIS & Spatial Databases
- GeoAI & Machine Learning
- Web GIS Development (Leaflet, Mapbox)
- Python & R Programming for GIS
- Environmental & Government Applications

USER CONTEXT:
${userContext ? JSON.stringify(userContext, null, 2) : 'New learner'}

RESPONSE GUIDELINES:
1. Keep answers conversational and actionable (3-5 sentences max unless explaining complex topics)
2. Use analogies and real-world examples
3. Break complex topics into simple steps
4. Show enthusiasm with natural expressions
5. Offer to demonstrate visually when relevant
6. Include gesture tags in format: [GESTURE:pointing] or [EXPRESSION:smile]
7. End with an engaging follow-up question or offer to dive deeper

EXAMPLE RESPONSES:
Q: "What is a shapefile?"
A: [EXPRESSION:smile] "A shapefile is like a zip file for maps — it stores geographic shapes and their data together! [GESTURE:demonstrating] Think of it as a folder containing your map's geometry, attributes, and spatial reference. Want me to show you how to load one in QGIS?"

Q: "How do I start a GIS career?"
A: [EXPRESSION:encouraging] "Here's your roadmap! [GESTURE:listing] First, master the fundamentals — QGIS and spatial analysis. Second, build 3 portfolio projects using real data. Third, learn Python for automation. [EXPRESSION:confident] I can guide you through each step. Which would you like to start with?"`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please contact support.');
      }
      throw new Error(`AI service error: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse gestures and expressions from response
    const gestureMatches = aiResponse.match(/\[GESTURE:([^\]]+)\]/g) || [];
    const expressionMatches = aiResponse.match(/\[EXPRESSION:([^\]]+)\]/g) || [];
    
    const gestures = gestureMatches.map(g => g.replace(/\[GESTURE:|\]/g, ''));
    const expressions = expressionMatches.map(e => e.replace(/\[EXPRESSION:|\]/g, ''));
    
    // Clean response text
    const cleanedResponse = aiResponse
      .replace(/\[GESTURE:[^\]]+\]/g, '')
      .replace(/\[EXPRESSION:[^\]]+\]/g, '')
      .trim();

    // Detect if visual aid is needed
    const needsVisual = /show|visualize|demonstrate|example|diagram|map/i.test(message);
    const needsCode = /code|script|python|sql|function/i.test(message);

    return new Response(
      JSON.stringify({
        response: cleanedResponse,
        gestures,
        expressions,
        metadata: {
          needsVisual,
          needsCode,
          mode: mode || 'general',
          confidence: 0.95
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in GEOVA mentor:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I'm having a moment of technical difficulty. Could you rephrase your question?"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
