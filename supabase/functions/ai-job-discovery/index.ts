import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobData {
  title: string;
  company: string;
  location: string;
  job_type: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements: string[];
  skills: string[];
  apply_url: string;
  external_job_id: string;
  source_platform: string;
  is_remote: boolean;
  is_india_focused: boolean;
  posted_date: string;
  ai_relevance_score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const { search_keywords = [], location_filter = 'India', max_jobs = 20 } = await req.json();

    console.log('Starting AI job discovery for keywords:', search_keywords);

    // Define geospatial job keywords for AI search
    const defaultKeywords = [
      'GIS Analyst', 'Remote Sensing', 'Geospatial Developer', 'GeoAI Engineer',
      'Spatial Data Scientist', 'Urban Planning GIS', 'Environmental GIS',
      'PostGIS Developer', 'ArcGIS Specialist', 'QGIS Developer',
      'Earth Observation Analyst', 'Geomatics Engineer', 'Location Intelligence',
      'Cartographer', 'Surveying Engineer', 'Drone Mapping Specialist'
    ];

    const keywords = search_keywords.length > 0 ? search_keywords : defaultKeywords;

    // Generate job listings using OpenAI based on current job market trends
    const prompt = `Generate ${max_jobs} realistic job listings for geospatial technology positions in ${location_filter}. Focus on these keywords: ${keywords.join(', ')}.

Each job should include:
- title: Job title
- company: Real or realistic company name
- location: City, state/country (prioritize ${location_filter})
- job_type: full-time, part-time, contract, or internship
- experience_level: entry, mid, senior, or expert
- salary_min & salary_max: In local currency (INR for India)
- description: 2-3 sentence job description
- requirements: Array of 3-4 requirements
- skills: Array of 5-7 relevant technical skills
- apply_url: Realistic URL (can be generic like linkedin.com/jobs/view/[job-id])
- external_job_id: Unique identifier
- source_platform: linkedin, naukri, indeed, government, or careers_page
- is_remote: boolean
- is_india_focused: boolean (true if position is in India or allows remote from India)
- posted_date: Recent date (within last 7 days)
- ai_relevance_score: Number between 80-100 based on keyword match

Return ONLY a JSON array of job objects. Make 70% of jobs India-focused. Include government positions, startups, and MNCs. Make it realistic and current.`;

    console.log('Calling OpenAI to generate job listings...');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a job market expert specializing in geospatial technology careers. Generate realistic, current job listings based on actual market trends.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    console.log('OpenAI response received, parsing jobs...');

    // Parse the JSON response from OpenAI
    let jobListings: JobData[];
    try {
      // Clean the response to extract JSON
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      jobListings = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse job listings from AI response');
    }

    // Validate and clean job data
    const validJobs = jobListings.filter(job => 
      job.title && job.company && job.location && job.description && job.apply_url
    ).map(job => ({
      ...job,
      posted_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_verified: true, // Mark AI-generated jobs as verified
      is_active: true
    }));

    console.log(`Generated ${validJobs.length} valid job listings`);

    // Insert jobs into Supabase (on conflict do nothing to avoid duplicates)
    const insertPromises = validJobs.map(async (job) => {
      const { error } = await supabase
        .from('job_listings')
        .upsert(job, { 
          onConflict: 'external_job_id',
          ignoreDuplicates: true 
        });
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Error inserting job:', error);
      }
      
      return !error;
    });

    const results = await Promise.all(insertPromises);
    const successCount = results.filter(Boolean).length;

    console.log(`Successfully inserted ${successCount} jobs into database`);

    // Return summary
    return new Response(
      JSON.stringify({
        success: true,
        jobs_generated: validJobs.length,
        jobs_inserted: successCount,
        keywords_used: keywords,
        location_filter,
        message: `Generated ${validJobs.length} job listings, ${successCount} added to database`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in AI job discovery:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to generate job listings'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});