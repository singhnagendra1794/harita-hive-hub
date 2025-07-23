import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeId, careerGoal, weeklyTime, userId } = await req.json();
    
    console.log(`Generating personalized plan for user: ${userId}, resume: ${resumeId}`);

    // Get resume with extracted data
    const { data: resumeRecord, error: resumeError } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (resumeError) {
      throw new Error(`Resume not found: ${resumeError.message}`);
    }

    let personalizedPlan;

    // If we have OpenAI API key and extracted data, use AI to generate personalized plan
    if (openAIApiKey && resumeRecord.extracted_data) {
      console.log('Using AI to generate personalized plan...');
      
      const systemPrompt = `You are an expert geospatial career advisor. Create a personalized weekly learning plan based on the user's resume analysis, career goal, and available study time.

Return a JSON object with this structure:
{
  "generatedDate": "2024-01-15",
  "week": "Week 1",
  "careerGoal": "Remote Sensing Specialist",
  "weeklyTime": "10-15 hours",
  "days": [
    {
      "day": "Monday",
      "theme": "Foundation Building",
      "tasks": [
        {
          "type": "study",
          "description": "Study remote sensing fundamentals",
          "duration": "2 hours"
        }
      ]
    }
  ]
}

Focus on addressing the user's skill gaps and building towards their career goal.`;

      const userPrompt = `Create a personalized weekly learning plan for:

Career Goal: ${careerGoal}
Weekly Time Available: ${weeklyTime}

Resume Analysis: ${JSON.stringify(resumeRecord.extracted_data, null, 2)}

Base the plan on their current skills, experience level, and identified skill gaps. Make it actionable and specific to geospatial technology.`;

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
      });

      const openAIData = await openAIResponse.json();
      
      if (!openAIResponse.ok) {
        throw new Error(`OpenAI API error: ${openAIData.error?.message || 'Unknown error'}`);
      }

      try {
        personalizedPlan = JSON.parse(openAIData.choices[0].message.content);
        console.log('AI-generated personalized plan created');
      } catch (parseError) {
        console.warn('Failed to parse AI response, falling back to template');
        personalizedPlan = createDefaultPlan(careerGoal, weeklyTime);
      }
    } else {
      console.log('Using default plan template...');
      personalizedPlan = createDefaultPlan(careerGoal, weeklyTime);
    }

    return new Response(JSON.stringify({
      success: true,
      plan: personalizedPlan
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating personalized plan:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createDefaultPlan(careerGoal: string, weeklyTime: string) {
  const timeHours = weeklyTime.includes('5') ? 5 : weeklyTime.includes('10') ? 10 : 15;
  const dailyHours = Math.floor(timeHours / 5);

  return {
    generatedDate: new Date().toISOString().split('T')[0],
    week: "Week 1",
    careerGoal,
    weeklyTime,
    days: [
      {
        day: "Monday",
        theme: "Foundation Building",
        tasks: [
          {
            type: "study",
            description: `Study ${careerGoal.toLowerCase()} fundamentals`,
            duration: `${dailyHours} hours`
          }
        ]
      },
      {
        day: "Tuesday", 
        theme: "Hands-on Practice",
        tasks: [
          {
            type: "build",
            description: "Practice with QGIS or relevant GIS software",
            duration: `${dailyHours} hours`
          }
        ]
      },
      {
        day: "Wednesday",
        theme: "Technical Skills",
        tasks: [
          {
            type: "study",
            description: "Learn programming for GIS (Python/R)",
            duration: `${dailyHours} hours`
          }
        ]
      },
      {
        day: "Thursday",
        theme: "Project Work",
        tasks: [
          {
            type: "build",
            description: "Work on a small geospatial project",
            duration: `${dailyHours} hours`
          }
        ]
      },
      {
        day: "Friday",
        theme: "Career Development",
        tasks: [
          {
            type: "apply",
            description: "Research job opportunities and network",
            duration: `${dailyHours} hours`
          }
        ]
      }
    ]
  };
}