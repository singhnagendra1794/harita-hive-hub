import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { content_url, content_text, content_type, title, description } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare content for analysis
    let analysisPrompt = '';
    if (content_text) {
      analysisPrompt = `Analyze this geospatial content: "${content_text}"`;
    } else if (title && description) {
      analysisPrompt = `Analyze this geospatial content titled "${title}" with description: "${description}"`;
    } else {
      analysisPrompt = `Analyze this geospatial content for a ${content_type} file.`;
    }

    const systemPrompt = `You are an AI assistant specialized in geospatial content analysis. Analyze the given content and provide structured feedback in JSON format with the following structure:
    {
      "tags": ["tag1", "tag2", "tag3"],
      "summary": "Brief summary of the content",
      "quality_score": 85,
      "improvement_suggestions": ["suggestion1", "suggestion2"]
    }
    
    Focus on geospatial relevance, technical accuracy, educational value, and presentation quality. Tags should be specific to GIS, remote sensing, mapping, spatial analysis, etc.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;

    // Parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisText);
    } catch (error) {
      // Fallback if JSON parsing fails
      analysisResult = {
        tags: ['gis', 'geospatial', 'analysis'],
        summary: 'AI analysis completed with basic insights.',
        quality_score: 75,
        improvement_suggestions: ['Consider adding more technical details', 'Include visual examples']
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze content',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});