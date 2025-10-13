import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

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

    // Generate comprehensive roadmap with Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert geospatial and GIS career advisor with deep knowledge of the industry, tools, technologies, and learning resources. 

Your task is to create EXTREMELY DETAILED, step-by-step career roadmaps that include:
- Day-by-day breakdown of activities
- Specific learning resources with actual URLs
- Platform recommendations (YouTube channels, Coursera courses, Udemy courses, documentation sites)
- Hands-on project ideas with implementation details
- Skill progression milestones
- Tool mastery checkpoints
- Industry best practices
- Real-world application examples

CRITICAL INSTRUCTIONS:
1. Be EXTREMELY specific - no generic advice
2. Include actual resource URLs when possible (YouTube videos, courses, documentation)
3. Break down every skill into micro-steps
4. Provide alternative resources for each topic
5. Include time estimates for each activity
6. Suggest practical projects to apply knowledge
7. Recommend specific tools, software versions, and configurations
8. Include troubleshooting tips and common pitfalls

Return ONLY valid JSON without markdown code blocks.`
          },
          {
            role: 'user',
            content: `Create an ULTRA-COMPREHENSIVE 6-month geospatial career roadmap based on:

RESUME ANALYSIS:
${JSON.stringify(resumeData.extracted_data, null, 2)}

FOLLOW-UP RESPONSES:
${followUpData?.responses ? JSON.stringify(followUpData.responses, null, 2) : 'No additional responses provided'}

Generate a JSON roadmap with this structure:
{
  "roadmapTitle": "6-Month Comprehensive Geospatial Career Development Plan",
  "targetRole": "specific target role based on analysis",
  "currentLevel": "assessed current level",
  "estimatedTimeToGoal": "6 months",
  "learningApproach": "recommended learning strategy",
  "months": [
    {
      "month": 1,
      "monthTitle": "Month 1: [Descriptive Title]",
      "focus": "Primary focus area",
      "objectives": ["objective 1", "objective 2"],
      "weeks": [
        {
          "week": 1,
          "weekTheme": "Specific theme",
          "weekObjective": "What to achieve this week",
          "days": {
            "Monday": {
              "focus": "Daily focus",
              "morning": {
                "activity": "Specific activity",
                "duration": "1.5 hours",
                "resources": [
                  {
                    "title": "Resource name",
                    "url": "actual URL",
                    "platform": "YouTube/Coursera/Udemy/Documentation",
                    "type": "video/article/course/documentation"
                  }
                ],
                "deliverable": "What to complete"
              },
              "afternoon": {
                "activity": "Hands-on practice",
                "duration": "2 hours",
                "tasks": ["micro-task 1", "micro-task 2"],
                "tools": ["tool 1", "tool 2"],
                "checkpoints": ["verify step 1", "verify step 2"]
              },
              "evening": {
                "activity": "Review and practice",
                "duration": "1 hour",
                "exercises": ["exercise 1", "exercise 2"]
              }
            },
            "Tuesday": { ... },
            "Wednesday": { ... },
            "Thursday": { ... },
            "Friday": { ... },
            "Weekend": {
              "project": "Weekend project",
              "description": "Detailed project description",
              "steps": ["step 1", "step 2", "step 3"],
              "expectedOutcome": "What you'll have built",
              "resources": []
            }
          },
          "weekendProject": {
            "title": "Project name",
            "description": "Full description",
            "difficulty": "beginner/intermediate/advanced",
            "estimatedTime": "4-6 hours",
            "technologies": ["tech 1", "tech 2"],
            "steps": ["detailed step 1", "detailed step 2"],
            "resources": [],
            "bonus": "Extra challenges"
          },
          "milestones": ["checkpoint 1", "checkpoint 2"]
        }
      ],
      "monthlyProject": {
        "title": "Major project",
        "description": "Comprehensive project",
        "skills": ["skill 1", "skill 2"],
        "deliverables": ["deliverable 1"],
        "resources": []
      },
      "certificationPrep": {
        "recommended": "Certification name",
        "studyResources": [],
        "practiceTests": []
      }
    }
  ],
  "skillsToAcquire": [
    {
      "skill": "Skill name",
      "priority": "high/medium/low",
      "currentLevel": "beginner/intermediate/advanced",
      "targetLevel": "intermediate/advanced/expert",
      "resources": [
        {
          "title": "Resource",
          "url": "URL",
          "platform": "Platform",
          "estimatedTime": "time"
        }
      ],
      "practiceProjects": ["project 1", "project 2"],
      "milestones": ["milestone 1", "milestone 2"]
    }
  ],
  "toolsToMaster": [
    {
      "tool": "Tool name",
      "purpose": "Why learn this",
      "learningPath": {
        "beginner": {
          "topics": ["topic 1", "topic 2"],
          "resources": [],
          "projects": []
        },
        "intermediate": { ... },
        "advanced": { ... }
      },
      "alternatives": ["alternative tool 1"]
    }
  ],
  "platformRecommendations": {
    "youtube": ["Channel 1", "Channel 2"],
    "coursera": ["Course 1"],
    "udemy": ["Course 1"],
    "documentation": ["Site 1"],
    "practice": ["Platform 1"],
    "community": ["Forum 1", "Discord 1"]
  },
  "certificationTargets": [
    {
      "name": "Cert name",
      "provider": "Provider",
      "difficulty": "level",
      "cost": "cost",
      "preparationTime": "time",
      "resources": [],
      "examTips": ["tip 1", "tip 2"]
    }
  ],
  "projectMilestones": [
    {
      "month": 1,
      "project": "Project name",
      "description": "Description",
      "technologies": [],
      "steps": [],
      "resources": [],
      "portfolio": "How to showcase"
    }
  ],
  "careerProgression": {
    "currentPosition": "Current role",
    "sixMonthGoal": "Role after roadmap",
    "marketDemand": "Industry demand info",
    "salaryRange": "Salary range",
    "requiredSkills": [],
    "recommendedActions": []
  },
  "networkingStrategy": {
    "platforms": ["LinkedIn", "GIS Stack Exchange"],
    "communities": [],
    "events": [],
    "mentorship": []
  },
  "portfolioBuilding": {
    "projects": [],
    "githubStrategy": "Strategy",
    "showcaseIdeas": []
  },
  "additionalResources": {
    "books": [],
    "blogs": [],
    "podcasts": [],
    "newsletters": []
  }
}

Make this THE MOST COMPREHENSIVE roadmap possible - every day should have specific, actionable tasks with real resources.`
          }
        ],
        temperature: 0.4,
      }),
    });

    const aiData = await aiResponse.json();
    
    if (!aiResponse.ok) {
      const errorMsg = aiData.error?.message || 'AI API error';
      console.error('AI API error:', errorMsg, aiData);
      
      if (aiResponse.status === 429) {
        throw new Error('AI service rate limit exceeded. Please try again in a moment.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI service credits exhausted. Please contact support.');
      }
      throw new Error(`AI API error: ${errorMsg}`);
    }

    let roadmapContent = aiData.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    roadmapContent = roadmapContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Validate JSON
    let parsedRoadmap;
    try {
      parsedRoadmap = JSON.parse(roadmapContent);
    } catch (e) {
      console.error('Failed to parse roadmap JSON:', roadmapContent);
      throw new Error('Generated roadmap was not valid JSON');
    }

    // Create roadmap record with parsed data
    const { data: roadmapRecord, error: roadmapError } = await supabase
      .from('career_roadmaps')
      .insert({
        user_id: userId,
        resume_id: resumeId,
        roadmap_data: parsedRoadmap,
        generation_status: 'completed'
      })
      .select()
      .single();

    if (roadmapError) {
      throw new Error(`Failed to create roadmap: ${roadmapError.message}`);
    }

    console.log('Comprehensive roadmap generated successfully for user:', userId);

    return new Response(JSON.stringify({
      success: true,
      roadmapId: roadmapRecord.id,
      roadmap: parsedRoadmap,
      message: 'Comprehensive roadmap generated successfully'
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