import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirement, region, dataTypes, skillLevel, preferredTools, includeSamples } = await req.json();

    console.log('Toolkit AI Engine:', { requirement, region, skillLevel });

    // Build enhanced system prompt
    const systemPrompt = `You are the Harita Hive Geospatial Toolkit AI Engine — a global knowledge system that helps professionals find the right open data, tools, and workflows.

Your task: Generate a personalized geospatial toolkit recommendation based on user requirements.

AVAILABLE OPEN DATA SOURCES:
- NASA EarthData (MODIS, Landsat, VIIRS, SRTM)
- ESA Copernicus (Sentinel-1, 2, 3)
- USGS Earth Explorer
- OpenStreetMap (OSM)
- Natural Earth Data
- UNEP, FAO datasets
- India NRSC Bhuvan

RESPONSE FORMAT (JSON):
{
  "requirement_summary": "Brief restatement of user need",
  "recommended_tools": [
    {
      "tool_name": "string",
      "description": "string",
      "sector": "string",
      "difficulty": "beginner|intermediate|advanced",
      "type": "Desktop|Cloud|Plugin|Online",
      "link": "URL",
      "guide_link": "URL (optional)"
    }
  ],
  "recommended_datasets": [
    {
      "dataset_name": "string",
      "type": "Raster|Vector|Time-series",
      "source": "NASA|ESA|OSM|etc",
      "coverage": "Global|Regional",
      "download_link": "URL",
      "format": "GeoTIFF|Shapefile|etc",
      "resolution": "string",
      "temporal_range": "string (optional)"
    }
  ],
  "recommended_workflow": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "example_output": "Description of expected result",
  "code_snippet": "Optional Python/GEE code example",
  "starter_project_available": true|false
}

RULES:
- Only recommend REAL, ACCESSIBLE open-source tools and datasets
- Include actual download URLs
- Match recommendations to user's skill level
- Prioritize free and open-source solutions
- Be specific and actionable`;

    const userPrompt = `User Requirement: ${requirement}
Region: ${region}
Data Types Needed: ${dataTypes?.join(', ') || 'Not specified'}
Skill Level: ${skillLevel}
Preferred Tools: ${preferredTools?.join(', ') || 'No preference'}
Include Data Samples: ${includeSamples ? 'Yes' : 'No'}

Generate a comprehensive toolkit recommendation with real datasets and tools.`;

    // Call Lovable AI
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
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolkitRecommendation = JSON.parse(aiData.choices[0].message.content);

    console.log('Generated toolkit recommendation successfully');

    // Store in user's toolkit history if authenticated
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (user) {
        await supabaseClient.from('toolkit_recommendations').insert({
          user_id: user.id,
          requirement,
          region,
          skill_level: skillLevel,
          recommendation_data: toolkitRecommendation,
          created_at: new Date().toISOString()
        });
      }
    }

    return new Response(JSON.stringify(toolkitRecommendation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in toolkit-ai-engine:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: {
        requirement_summary: "Unable to generate recommendation",
        recommended_tools: [],
        recommended_datasets: [],
        recommended_workflow: ["Please try again with more specific details"],
        example_output: "Error occurred",
        starter_project_available: false
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
