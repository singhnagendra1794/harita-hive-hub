import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  summary: string;
  category: string;
  published_date: string;
  relevance_score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🔍 Fetching latest geospatial news from around the world...');

    // Use AI to search for and summarize latest geospatial news
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a geospatial news curator. Find the latest trending news articles from around the world related to:
- GIS (Geographic Information Systems)
- Remote Sensing
- Satellite Imagery
- Geospatial AI and Machine Learning
- Mapping and Cartography
- Spatial Analysis
- Earth Observation
- Climate and Environmental Monitoring
- Urban Planning with GIS
- Drone Mapping and Photogrammetry
- Location Intelligence

Return ONLY a valid JSON array of 15-20 recent news articles from the past 24-48 hours. Each article must have:
- title (headline)
- url (direct link to the article)
- source (publication name)
- summary (2-3 sentence description)
- category (one of: gis, remote-sensing, geoai, mapping, climate, urban-planning, technology)
- published_date (ISO 8601 format, estimate based on current date if exact date unknown)
- relevance_score (1-100, how relevant to geospatial professionals)

Focus on real, recent news from reputable sources like: Geospatial World, GIS Lounge, Directions Magazine, Earth.com, NASA, ESA, tech news sites covering geospatial topics, etc.

IMPORTANT: Return ONLY the JSON array, no additional text or markdown formatting.`
          },
          {
            role: 'user',
            content: `Find the latest trending geospatial news from around the world for ${new Date().toISOString().split('T')[0]}. Focus on recent developments, innovations, and important industry updates.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    console.log('📰 AI response received');

    // Parse the JSON response
    let newsArticles: NewsArticle[];
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      newsArticles = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw content:', content);
      throw new Error('Failed to parse news articles from AI response');
    }

    if (!Array.isArray(newsArticles)) {
      throw new Error('AI response is not an array');
    }

    console.log(`✅ Parsed ${newsArticles.length} news articles`);

    // Delete old news before inserting new ones
    const { error: deleteError } = await supabaseClient
      .from('trending_news')
      .delete()
      .lt('fetched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (deleteError) {
      console.error('Error deleting old news:', deleteError);
    }

    // Insert new articles into database
    const articlesToInsert = newsArticles.map(article => ({
      title: article.title,
      url: article.url,
      source: article.source,
      summary: article.summary,
      category: article.category || 'general',
      published_date: article.published_date,
      relevance_score: article.relevance_score || 50,
      fetched_at: new Date().toISOString()
    }));

    const { data: insertedArticles, error: insertError } = await supabaseClient
      .from('trending_news')
      .insert(articlesToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting news:', insertError);
      throw insertError;
    }

    console.log(`💾 Successfully stored ${insertedArticles?.length || 0} news articles`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: insertedArticles?.length || 0,
        message: 'Trending news updated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-trending-news function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});