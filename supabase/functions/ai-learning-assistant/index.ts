import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('AI Learning Assistant function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, userId } = await req.json();
    console.log('Received message:', message);

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        error: 'AI service not configured. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get course context if available
    let courseContext = '';
    if (context?.courseId) {
      console.log('Fetching course context for:', context.courseId);
      
      // Get course details
      const { data: course } = await supabase
        .from('courses')
        .select('title, description, category, tags')
        .eq('id', context.courseId)
        .single();
      
      if (course) {
        courseContext += `Current Course: ${course.title}\nDescription: ${course.description}\nCategory: ${course.category}\nTags: ${course.tags?.join(', ')}\n\n`;
      }

      // Get current module/lesson context
      const { data: modules } = await supabase
        .from('course_modules')
        .select(`
          title, description,
          lessons(title, content, lesson_type)
        `)
        .eq('course_id', context.courseId)
        .order('order_index');

      if (modules && modules.length > 0) {
        courseContext += 'Course Modules:\n';
        modules.forEach((module: any) => {
          courseContext += `- ${module.title}: ${module.description}\n`;
          if (module.lessons) {
            module.lessons.forEach((lesson: any) => {
              courseContext += `  * ${lesson.title} (${lesson.lesson_type})\n`;
            });
          }
        });
      }
    }

    // Get general platform context
    const systemPrompt = `You are an AI Learning Assistant for Harita Hive, a comprehensive GeoAI and Geospatial learning platform. Your role is to help students understand GIS, Machine Learning, GeoAI, Web GIS, Remote Sensing, Python programming, and related geospatial technologies.

Key areas you should help with:
- GIS fundamentals and spatial thinking
- Python programming for geospatial analysis
- Machine Learning applied to geographic data
- Deep learning for remote sensing and satellite imagery
- Web GIS development and deployment
- QGIS, ArcGIS, and other GIS software
- Spatial databases and data management
- Coordinate systems and projections
- Spatial analysis techniques
- Troubleshooting coding errors
- Career advice in the geospatial field

${courseContext ? `Current Course Context:\n${courseContext}` : ''}

Guidelines:
- Be helpful, encouraging, and educational
- Provide practical examples and code snippets when relevant
- Break down complex concepts into understandable parts
- Suggest additional resources when appropriate
- If asked about course schedule or timeline, refer to the 8-week GeoAI Mastery Program structure
- Always relate answers back to real-world geospatial applications
- Be concise but thorough in explanations

Remember: You're helping students master the intersection of AI and geospatial technology to build their careers in this exciting field.`;

    console.log('Making OpenAI API call...');
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
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    // Log the interaction for analytics (optional)
    if (userId) {
      await supabase
        .from('user_analytics')
        .insert({
          user_id: userId,
          event_type: 'ai_assistant_query',
          event_data: {
            message: message.substring(0, 100), // Truncate for privacy
            response_length: aiResponse.length,
            context: context
          }
        });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI Learning Assistant function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process your request. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});