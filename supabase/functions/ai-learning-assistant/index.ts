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

// Security: Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests = 20, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

function sanitizeError(error: any): string {
  if (error?.message) {
    return error.message.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
                       .replace(/password/gi, '[CREDENTIAL]')
                       .replace(/token/gi, '[TOKEN]')
                       .replace(/key/gi, '[KEY]');
  }
  return 'An error occurred';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown';
    
    // Security: Rate limiting
    if (!checkRateLimit(clientIP, 20, 60000)) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { message, context, userId } = body;
    
    // Security: Input validation
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid message parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Security: Limit message length
    if (message.length > 2000) {
      return new Response(JSON.stringify({ error: 'Message too long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        error: 'AI service temporarily unavailable' 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get course context if available
    let courseContext = '';
    if (context?.courseId) {
      // Get course details
      const { data: course } = await supabase
        .from('courses')
        .select('title, description, category, tags')
        .eq('id', context.courseId)
        .maybeSingle();
      
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
      console.error('OpenAI API error:', response.status, sanitizeError(errorText));
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Log the interaction for analytics (optional) - only if user is authenticated
    if (userId && typeof userId === 'string') {
      try {
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
      } catch (analyticsError) {
        // Don't fail the request if analytics fails
        console.error('Analytics error:', sanitizeError(analyticsError));
      }
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI Learning Assistant function:', sanitizeError(error));
    return new Response(JSON.stringify({ 
      error: 'Failed to process your request. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});