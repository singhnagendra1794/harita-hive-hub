import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fieldOfInterest, skillLevel, careerGoal, userId } = await req.json();

    console.log('Generating roadmap for:', { fieldOfInterest, skillLevel, careerGoal, userId });

    // Create AI prompt based on user input
    const prompt = `Generate a personalized learning roadmap for someone interested in ${fieldOfInterest} geospatial technology.

Current details:
- Field of Interest: ${fieldOfInterest}
- Skill Level: ${skillLevel}
- Career Goal: ${careerGoal}

Return a JSON array of learning steps with this exact structure:
[
  {
    "title": "Course/Topic Name",
    "description": "Brief description of what they'll learn",
    "duration": "2-3 weeks",
    "difficulty": "beginner|intermediate|advanced",
    "category": "theory|practical|project",
    "resources": ["resource1", "resource2"],
    "order": 1
  }
]

Include 6-8 relevant steps covering:
- Foundational concepts
- Technical skills (GIS software, programming)
- Practical applications
- Real-world projects
- Career preparation

Make it specific to ${fieldOfInterest} and appropriate for ${skillLevel} level.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert geospatial education advisor. Generate structured learning roadmaps in valid JSON format only. No additional text or explanations.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let roadmapJson;
    
    try {
      const content = data.choices[0].message.content.trim();
      // Remove potential markdown formatting
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      roadmapJson = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback roadmap
      roadmapJson = [
        {
          title: "GIS Fundamentals",
          description: "Learn the basics of Geographic Information Systems",
          duration: "3-4 weeks",
          difficulty: skillLevel,
          category: "theory",
          resources: ["Online courses", "Documentation"],
          order: 1
        },
        {
          title: "Hands-on Practice",
          description: "Apply your knowledge with practical exercises",
          duration: "2-3 weeks", 
          difficulty: skillLevel,
          category: "practical",
          resources: ["Software tutorials", "Sample datasets"],
          order: 2
        }
      ];
    }

    // Save to database
    const { data: savedRoadmap, error: saveError } = await supabase
      .from('user_learning_roadmaps')
      .insert({
        user_id: userId,
        field_of_interest: fieldOfInterest,
        skill_level: skillLevel,
        career_goal: careerGoal,
        input_data: { fieldOfInterest, skillLevel, careerGoal },
        roadmap_json: roadmapJson
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      throw saveError;
    }

    console.log('Roadmap generated and saved successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      roadmap: roadmapJson,
      roadmapId: savedRoadmap.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-roadmap function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});