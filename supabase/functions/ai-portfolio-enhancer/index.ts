import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { 
      userId, 
      enhancementType, 
      originalContent, 
      userProfile,
      skills,
      projects 
    } = await req.json();

    console.log('AI Enhancement request:', { userId, enhancementType });

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let prompt = '';
    
    switch (enhancementType) {
      case 'summary':
        prompt = `As a professional career advisor specializing in geospatial careers, enhance this professional summary for a geospatial professional:

Original Summary: "${originalContent}"

User Context:
- Skills: ${skills.map((s: any) => s.name).join(', ')}
- Experience Level: ${userProfile.yearsOfExperience}
- Preferred Roles: ${userProfile.preferredJobRoles.join(', ')}
- Projects: ${projects.slice(0, 3).map((p: any) => p.title).join(', ')}

Write a compelling, professional summary (2-3 sentences) that:
1. Highlights key geospatial expertise
2. Mentions specific technologies/skills
3. Shows career progression and goals
4. Uses industry-standard terminology
5. Is ATS-friendly and keyword-rich

Return only the enhanced summary text.`;
        break;

      case 'skills':
        prompt = `As a geospatial technology expert, analyze the user's current skills and suggest improvements:

Current Skills: ${skills.map((s: any) => `${s.name} (${s.level})`).join(', ')}
Projects: ${projects.map((p: any) => `${p.title} - ${p.technologies.join(', ')}`).join('; ')}

Provide recommendations in JSON format:
{
  "missing_skills": ["skill1", "skill2"],
  "skill_upgrades": [{"current": "Python", "suggested_level": "advanced", "reason": "Based on projects"}],
  "trending_skills": ["skill1", "skill2"],
  "certifications": ["certification1", "certification2"]
}`;
        break;

      case 'experience':
        prompt = `Enhance these experience bullet points for a geospatial professional:

Original: "${originalContent}"

Context:
- Skills: ${skills.map((s: any) => s.name).slice(0, 10).join(', ')}
- Projects: ${projects.slice(0, 3).map((p: any) => p.title).join(', ')}

Create 3-5 compelling bullet points that:
- Start with strong action verbs
- Include quantifiable results where possible
- Mention specific GIS/geospatial technologies
- Highlight problem-solving and impact
- Are concise but descriptive

Return as JSON array: ["• bullet point 1", "• bullet point 2", ...]`;
        break;

      case 'projects':
        prompt = `Enhance this project description for a professional portfolio:

Original: "${originalContent}"
Technologies Used: ${projects[0]?.technologies?.join(', ') || 'Not specified'}

Create an enhanced description that:
1. Clearly states the problem solved
2. Highlights technical approach and tools
3. Emphasizes results and impact
4. Uses professional, technical language
5. Is 2-3 sentences maximum

Return only the enhanced description.`;
        break;

      default:
        throw new Error('Invalid enhancement type');
    }

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
            content: 'You are an expert career advisor specializing in geospatial technology and GIS careers. Provide professional, ATS-optimized, industry-specific advice that helps candidates stand out to recruiters.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content.trim();

    // Store the enhancement in the database
    const { error: dbError } = await supabase
      .from('ai_portfolio_enhancements')
      .insert({
        user_id: userId,
        enhancement_type: enhancementType,
        original_content: originalContent,
        enhanced_content: enhancedContent,
        applied: false
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    console.log('AI Enhancement completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      enhancedContent,
      enhancementType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-portfolio-enhancer function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});