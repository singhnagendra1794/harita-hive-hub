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
    
    console.log(`Processing resume analysis for user: ${userId}, resume: ${resumeId}`);

    // Get resume file content from storage
    const { data: resumeRecord, error: resumeError } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (resumeError) {
      throw new Error(`Resume not found: ${resumeError.message}`);
    }

    // Update status to processing
    await supabase
      .from('user_resumes')
      .update({ extraction_status: 'processing' })
      .eq('id', resumeId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('user-resumes')
      .download(resumeRecord.file_path);

    if (downloadError) {
      throw new Error(`Failed to download resume: ${downloadError.message}`);
    }

    // Convert file to base64 for OpenAI processing
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Analyze resume with OpenAI
    console.log('Sending resume to OpenAI for analysis...');
    
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
            content: `You are an expert geospatial career advisor. Analyze resumes and extract detailed information about skills, experience, and career gaps.

Please analyze the provided resume and return a JSON object with the following structure:
{
  "personal_info": {
    "name": "Full Name",
    "title": "Current Job Title",
    "email": "email@example.com",
    "experience_years": 3
  },
  "skills": {
    "programming_languages": ["Python", "R", "JavaScript"],
    "gis_software": ["QGIS", "ArcGIS", "PostGIS"],
    "remote_sensing": ["Google Earth Engine", "ENVI", "Landsat"],
    "web_mapping": ["Leaflet", "Mapbox", "OpenLayers"],
    "databases": ["PostgreSQL", "MongoDB", "Elasticsearch"],
    "cloud_platforms": ["AWS", "Google Cloud", "Azure"],
    "other_technical": ["Docker", "Git", "Linux"]
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "2 years",
      "key_projects": ["Project description"],
      "technologies_used": ["Tech1", "Tech2"]
    }
  ],
  "education": [
    {
      "degree": "Master of Science",
      "field": "Geographic Information Systems",
      "institution": "University Name",
      "year": 2020
    }
  ],
  "skill_gaps": {
    "missing_core_skills": ["Docker", "Kubernetes", "Apache Spark"],
    "outdated_technologies": ["ArcMap 10.x"],
    "trending_skills_needed": ["GeoAI", "Machine Learning", "Cloud Computing"]
  },
  "career_level": "intermediate",
  "specialization_areas": ["Remote Sensing", "Web GIS"],
  "recommended_focus": "Focus on cloud computing and machine learning integration"
}`
          },
          {
            role: 'user',
            content: `Please analyze this ${resumeRecord.file_type} resume file and extract the information as specified. The file contains career information for someone in the geospatial field.

Base64 content: ${base64Data.substring(0, 50000)}` // Limit to avoid token limits
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }),
    });

    const openAIData = await openAIResponse.json();
    
    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIData.error?.message || 'Unknown error'}`);
    }

    const analysisResult = openAIData.choices[0].message.content;
    console.log('OpenAI analysis completed');

    let extractedData;
    try {
      // Try to parse as JSON
      extractedData = JSON.parse(analysisResult);
    } catch (parseError) {
      console.warn('Failed to parse OpenAI response as JSON, using text response');
      extractedData = { raw_analysis: analysisResult };
    }

    // Update resume record with extracted data
    const { error: updateError } = await supabase
      .from('user_resumes')
      .update({
        extraction_status: 'completed',
        processed_at: new Date().toISOString(),
        extracted_data: extractedData
      })
      .eq('id', resumeId);

    if (updateError) {
      throw new Error(`Failed to update resume: ${updateError.message}`);
    }

    console.log('Resume analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      extractedData,
      message: 'Resume analyzed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    
    // Update status to failed if we have resumeId
    const { resumeId } = await req.json().catch(() => ({}));
    if (resumeId) {
      await supabase
        .from('user_resumes')
        .update({ extraction_status: 'failed' })
        .eq('id', resumeId);
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});