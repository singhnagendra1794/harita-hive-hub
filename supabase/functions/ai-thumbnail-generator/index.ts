import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { prompt, content_type, style = 'professional-gis' } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhance the prompt for geospatial content
    const enhancedPrompt = `Create a professional thumbnail for geospatial content: ${prompt}. 
    Style: ${style}. 
    Include elements like: maps, satellite imagery, GIS interface, data visualization, geographic elements.
    Make it clean, modern, and suitable for educational/professional content.
    Avoid text overlays. Focus on visual appeal and geospatial themes.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const imageResponse = await response.json();
    const imageUrl = imageResponse.data[0].url;

    // Download and store the image in Supabase storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const imageBlob = await fetch(imageUrl).then(res => res.blob());
    const fileName = `thumbnails/${Date.now()}-ai-thumbnail.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('studio-content')
      .upload(fileName, imageBlob);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('studio-content')
      .getPublicUrl(fileName);

    return new Response(JSON.stringify({ 
      thumbnail_url: publicUrl,
      original_url: imageUrl 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate thumbnail',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});