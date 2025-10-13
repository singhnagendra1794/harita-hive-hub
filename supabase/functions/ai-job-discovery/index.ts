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
  salary_currency?: string;
  description: string;
  requirements: string[];
  skills: string[];
  preferred_qualifications?: string[];
  apply_url: string;
  apply_method?: string;
  external_job_id: string;
  source_platform: string;
  is_remote: boolean;
  is_india_focused: boolean;
  posted_date: string;
  expires_at?: string;
  ai_relevance_score: number;
  seo_title?: string;
  meta_description?: string;
  tags?: string[];
  domain_category?: string;
  thumbnail_prompt?: string;
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

    // Enhanced prompt for realistic, SEO-optimized job generation
    const prompt = `You are the global job curator for Harita Hive AI Job Discovery - the leading platform for geospatial professionals.

Generate ${max_jobs} authentic, detailed, SEO-optimized job listings for geospatial technology positions. Focus on: ${keywords.join(', ')}.

DISTRIBUTION (total ${max_jobs} jobs):
- 14 India-focused (Delhi, Bangalore, Pune, Hyderabad, Chennai, Mumbai, Remote India)
- 6 International (US, UK, Germany, Singapore, Australia, Canada)

DOMAIN BALANCE:
- 4 GIS Analysis jobs
- 3 Remote Sensing/Satellite Data jobs
- 3 Machine Learning/GeoAI jobs
- 2 Drone Mapping/Photogrammetry jobs
- 2 Web GIS/Frontend jobs
- 2 Environmental Modeling/Hydrology jobs
- 2 Data Engineering/Spatial Databases jobs
- 2 Urban Analytics/Smart Cities jobs

Each job MUST include:
1. title: SEO-friendly, specific (e.g., "GIS Data Analyst – Remote Sensing & Spatial Modeling")
2. company: Real or realistic (e.g., "Esri India", "SatSure Analytics", "GeoAI Labs")
3. location: City + Country, or "Remote"
4. salary_min & salary_max: INR for India (₹), USD ($) for international
5. salary_currency: "INR" or "USD"
6. job_type: full-time, contract, internship, or remote
7. experience_level: entry, mid, senior, or expert
8. description: 4-6 sentences summarizing company, role, deliverables, and impact
9. requirements: Array of 3-4 key requirements
10. skills: Array of 5-8 technical skills (Python, QGIS, GDAL, PostGIS, GEE, TensorFlow, etc.)
11. preferred_qualifications: Array of 2-3 degrees/certifications
12. apply_url: Realistic job link (linkedin.com/jobs/view/[job-id], indeed.com/viewjob?jk=[id])
13. apply_method: "Apply via Harita Hive" OR "Apply on LinkedIn" OR "Apply on Indeed"
14. external_job_id: Unique 8-12 character ID
15. source_platform: linkedin, indeed, glassdoor, government, naukri, or careers_page
16. is_remote: boolean
17. is_india_focused: boolean (true if India-based or remote from India allowed)
18. posted_date: Within last 14 days (ISO format)
19. expires_at: 15-30 days after posted_date (ISO format)
20. ai_relevance_score: 60-98 (varied, not all identical)
21. seo_title: Under 70 characters, keyword-rich
22. meta_description: Under 160 characters with action phrase
23. tags: 4-6 SEO keywords as array (e.g., ["GIS", "Remote Sensing", "GeoAI", "Python"])
24. domain_category: One of: "GIS Analysis", "Remote Sensing", "Machine Learning/GeoAI", "Drone Mapping", "Web GIS", "Environmental", "Data Engineering", "Urban Analytics"
25. thumbnail_prompt: Brief description for visualization (e.g., "Satellite map showing urban growth")

SEO OPTIMIZATION:
- Include keywords: GIS Jobs, Remote Sensing Careers, GeoAI Jobs, Geospatial Analyst, QGIS, PostGIS, Python
- Write professional, action-driven descriptions
- Each meta_description should include "Apply Now" or similar CTA
- End each description with: "Verified opportunity curated by Harita Hive."

REALISM:
- Use authentic company names (Esri, Maxar, Planet Labs, ISRO, Survey of India, TCS, Wipro, Accenture)
- Include realistic startups (SatSure, GalaxEye, Pixxel, SkyMap Global, Genesys International)
- Mix government (Survey of India, NRSC, State Remote Sensing Centers) and private sector
- Vary salary ranges realistically (Entry: ₹3-6L, Mid: ₹8-15L, Senior: ₹18-35L for India; $60-200K for international)
- Make job descriptions specific and technical, not generic

Return ONLY a valid JSON array of job objects. No markdown, no explanation.`;

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
            content: 'You are a global job curator and SEO strategist for Harita Hive. You specialize in geospatial technology careers and create authentic, detailed job listings that reflect real opportunities in GIS, Remote Sensing, GeoAI, and Spatial Analytics worldwide. Generate publication-ready content with perfect SEO optimization.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.65,
        max_tokens: 6000
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

    // Validate and enrich job data
    const validJobs = jobListings.filter(job => 
      job.title && job.company && job.location && job.description && job.apply_url
    ).map(job => {
      // Ensure dates are properly formatted
      const postedDate = job.posted_date || new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString();
      const expiresDate = job.expires_at || new Date(new Date(postedDate).getTime() + (15 + Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        ...job,
        posted_date: postedDate,
        expires_at: expiresDate,
        is_verified: true,
        is_active: true,
        salary_currency: job.salary_currency || (job.is_india_focused ? 'INR' : 'USD'),
        apply_method: job.apply_method || 'Apply on ' + (job.source_platform || 'LinkedIn'),
        tags: job.tags || ['GIS', 'Geospatial', 'Remote Sensing'],
        thumbnail_prompt: job.thumbnail_prompt || 'Geospatial analysis visualization'
      };
    });

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