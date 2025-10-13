import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { personalInfo, projects, skills, certificates } = await req.json();

    console.log('ATS Score calculation request received');

    const prompt = `Analyze this portfolio for ATS (Applicant Tracking System) compatibility and provide a detailed score.

Portfolio Data:
- Name: ${personalInfo.name}
- Professional Summary: ${personalInfo.professionalSummary || 'Not provided'}
- Career Objective: ${personalInfo.careerObjective || 'Not provided'}
- Years of Experience: ${personalInfo.yearsOfExperience}
- Skills (${skills.length}): ${skills.map((s: any) => s.name).join(', ')}
- Projects (${projects.length}): ${projects.map((p: any) => p.title).join(', ')}
- Certifications: ${certificates.length}
- Contact: ${personalInfo.email}, ${personalInfo.phone || 'Not provided'}, ${personalInfo.linkedin || 'Not provided'}

Analyze and provide a JSON response with:
{
  "overall_score": <number 0-100>,
  "breakdown": {
    "content_quality": <number 0-100>,
    "keyword_optimization": <number 0-100>,
    "formatting": <number 0-100>,
    "completeness": <number 0-100>,
    "industry_relevance": <number 0-100>
  },
  "strengths": ["strength1", "strength2", ...],
  "improvements": [
    {"area": "area name", "suggestion": "specific improvement", "impact": "high|medium|low"},
    ...
  ],
  "missing_keywords": ["keyword1", "keyword2", ...],
  "ats_friendly_score": <number 0-100>,
  "recommendations": ["recommendation1", "recommendation2", ...]
}

Focus on geospatial industry standards and make the score realistic (aim for 85-95 range if content is good).`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are an expert ATS (Applicant Tracking System) analyzer specializing in geospatial and GIS careers. Provide detailed, actionable feedback in JSON format only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Extract JSON from response
    let atsAnalysis;
    try {
      // Try to parse as JSON directly
      atsAnalysis = JSON.parse(content);
    } catch (e) {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        atsAnalysis = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    console.log('ATS Score calculated successfully:', atsAnalysis.overall_score);

    return new Response(JSON.stringify({ 
      success: true, 
      atsAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in calculate-ats-score function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
