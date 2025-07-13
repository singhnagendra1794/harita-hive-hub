import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resume, jobDescription, jobTitle } = await req.json();

    console.log('Tailoring resume for job:', jobTitle);

    const prompt = `As an expert career advisor specializing in geospatial careers, analyze this resume against the job posting and provide tailored recommendations.

RESUME:
${resume}

JOB POSTING:
Title: ${jobTitle}
Description: ${jobDescription}

Please provide:
1. Key skills from the resume that match the job requirements
2. 3-5 optimized bullet points that highlight relevant experience
3. Skills or keywords to emphasize
4. Suggestions for improving alignment with the role

Return in this JSON format:
{
  "matchingSkills": ["skill1", "skill2"],
  "optimizedBulletPoints": [
    "• Bullet point 1",
    "• Bullet point 2"
  ],
  "keywordsToEmphasize": ["keyword1", "keyword2"],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ],
  "overallMatch": "percentage like 75%"
}`;

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
            content: 'You are an expert career advisor specializing in geospatial and GIS careers. Provide actionable, specific resume optimization advice in valid JSON format only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let tailoredAdvice;
    
    try {
      const content = data.choices[0].message.content.trim();
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      tailoredAdvice = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback response
      tailoredAdvice = {
        matchingSkills: ["GIS", "Remote Sensing", "Data Analysis"],
        optimizedBulletPoints: [
          "• Leveraged GIS expertise to support geospatial analysis projects",
          "• Applied remote sensing techniques for data interpretation"
        ],
        keywordsToEmphasize: ["geospatial", "analysis", "mapping"],
        recommendations: [
          "Highlight specific GIS software experience",
          "Quantify achievements with metrics where possible"
        ],
        overallMatch: "70%"
      };
    }

    console.log('Resume tailoring completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      tailoredAdvice
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-resume-tailor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});