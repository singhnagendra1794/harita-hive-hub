import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeId, userId } = await req.json();
    
    console.log(`Generating roadmap for user: ${userId}, resume: ${resumeId}`);

    // Get resume data with extracted information
    const { data: resumeData, error: resumeError } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (resumeError) {
      throw new Error(`Resume not found: ${resumeError.message}`);
    }

    // Check user subscription for access control
    const { data: userData, error: userError } = await supabase
      .from('user_subscriptions')
      .select('subscription_tier')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('User subscription not found');
    }

    const hasAccess = ['pro', 'enterprise'].includes(userData.subscription_tier);
    if (!hasAccess) {
      return new Response(JSON.stringify({
        error: 'Premium subscription required for AI-powered roadmaps',
        upgrade_required: true
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get follow-up questions and responses if available
    const { data: followUpData } = await supabase
      .from('resume_follow_up_questions')
      .select('*')
      .eq('resume_id', resumeId)
      .eq('user_id', userId)
      .single();

    // Generate roadmap with OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert geospatial career advisor. Create detailed, actionable 6-month roadmaps for GIS professionals based on their resume analysis and career goals.'
          },
          {
            role: 'user',
            content: `Create a personalized 6-month geospatial career roadmap based on the following:

RESUME ANALYSIS:
${JSON.stringify(resumeData.extracted_data, null, 2)}

FOLLOW-UP RESPONSES:
${followUpData?.responses ? JSON.stringify(followUpData.responses, null, 2) : 'No additional responses provided'}

Please provide a structured roadmap in the following JSON format:
{
  "roadmapTitle": "6-Month Career Development Plan",
  "targetRole": "specific role based on analysis",
  "estimatedTimeToGoal": "6 months",
  "months": [
    {
      "month": 1,
      "focus": "Foundation Building",
      "weeklyGoals": [
        {
          "week": 1,
          "theme": "Getting Started",
          "dailyTasks": [
            {
              "day": "Monday",
              "tasks": [
                {
                  "type": "study",
                  "task": "Learn QGIS basics",
                  "duration": "2 hours",
                  "resources": ["specific resource links"]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "skillsToAcquire": ["list of skills"],
  "toolsToMaster": ["list of tools"],
  "projectMilestones": ["list of projects"],
  "certificationTargets": ["relevant certifications"],
  "networkingGoals": ["networking objectives"],
  "salaryProjection": "expected salary increase"
}

Make it highly specific to their current level and target goals.`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      }),
    });

    const openAIData = await openAIResponse.json();
    
    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIData.error?.message || 'Unknown error'}`);
    }

    const roadmapContent = openAIData.choices[0].message.content;

    // Create roadmap record
    const { data: roadmapRecord, error: roadmapError } = await supabase
      .from('career_roadmaps')
      .insert({
        user_id: userId,
        resume_id: resumeId,
        roadmap_data: { content: roadmapContent },
        generation_status: 'completed'
      })
      .select()
      .single();

    if (roadmapError) {
      throw new Error(`Failed to create roadmap: ${roadmapError.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      roadmapId: roadmapRecord.id,
      message: 'Roadmap generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
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