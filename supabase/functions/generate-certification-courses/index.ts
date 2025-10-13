import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const prompt = `You are the course designer and marketing strategist for *Harita Hive Certifications* — an AI-powered microlearning platform that offers short, affordable certification programs in Geospatial Technology.

Generate 8 professional certification courses (4 one-day, 4 one-week) priced at ₹1,999 each. Each course should be practical, hands-on, and outcome-focused.

**1-Day Courses (₹1,999):**
1. Drone Data Processing using QGIS
2. GIS Automation with Python
3. Land Use Mapping using Google Earth Engine
4. Introduction to PostGIS for Spatial Databases

**1-Week Courses (₹1,999):**
5. Remote Sensing & Image Analysis Fundamentals
6. Web GIS Development with Leaflet & Mapbox
7. GeoAI for Land Cover Classification
8. Urban Planning with GIS & Smart City Analytics

For EACH course, provide:
- **title**: Clear, SEO-friendly (e.g., "1-Day Certificate in Drone Data Processing using QGIS")
- **description**: 4-6 engaging sentences about what learners will achieve
- **duration**: "1 Day" or "1 Week"
- **difficulty**: "Beginner", "Intermediate", or "Advanced"
- **requirements**: Array of 3-5 prerequisites (e.g., "Basic understanding of GIS", "Laptop with 8GB RAM")
- **price**: 1999
- **is_blockchain_verified**: false
- **rating**: 4.7-4.9 (realistic)
- **students_enrolled**: 50-250 (realistic for new courses)
- **estimated_launch**: "Available Now" or "Starting [Date]"
- **features**: Array of 6-8 key features/outcomes (e.g., "Hands-on QGIS training", "Real-world project", "Digital certificate", "Lifetime access to recordings")
- **is_active**: true

Write in a friendly, inspiring, professional tone. Focus on "learn by doing" outcomes. Use action verbs.

Return ONLY a valid JSON array with exactly 8 course objects. No markdown, no explanations.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', errorText);
      throw new Error(`AI API failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let coursesText = aiData.choices[0].message.content;
    
    // Clean markdown formatting if present
    coursesText = coursesText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const courses = JSON.parse(coursesText);

    // Insert courses into database
    const { data: insertedCourses, error: insertError } = await supabase
      .from('certification_courses')
      .upsert(courses, { onConflict: 'title' })
      .select();

    if (insertError) {
      console.error('Database Error:', insertError);
      throw insertError;
    }

    console.log(`Successfully generated and stored ${insertedCourses?.length || 0} certification courses`);

    return new Response(
      JSON.stringify({
        success: true,
        courses: insertedCourses,
        count: insertedCourses?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-certification-courses:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
