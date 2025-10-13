import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmployerJobSubmission {
  company_name: string;
  company_email: string;
  company_website?: string;
  company_logo_url?: string;
  job_title: string;
  job_description: string;
  required_skills: string[];
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  employment_type: string;
  experience_level: string;
  application_url?: string;
  is_remote: boolean;
  is_india_focused: boolean;
  verification_confirmed: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const submission: EmployerJobSubmission = await req.json();

    console.log('Processing employer job submission:', submission.job_title);

    // Validate required fields
    if (!submission.company_name || !submission.company_email || !submission.job_title || 
        !submission.job_description || !submission.verification_confirmed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields or verification not confirmed'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submission.company_email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email format'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get auth user if logged in (optional)
    const authHeader = req.headers.get('authorization');
    let userId = null;
    if (authHeader) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      if (!authError && user) {
        userId = user.id;
      }
    }

    // Insert submission into database
    const { data, error } = await supabase
      .from('employer_job_submissions')
      .insert({
        company_name: submission.company_name,
        company_email: submission.company_email,
        company_website: submission.company_website,
        company_logo_url: submission.company_logo_url,
        job_title: submission.job_title,
        job_description: submission.job_description,
        required_skills: submission.required_skills,
        location: submission.location,
        salary_min: submission.salary_min,
        salary_max: submission.salary_max,
        salary_currency: submission.salary_currency || 'INR',
        employment_type: submission.employment_type,
        experience_level: submission.experience_level,
        application_url: submission.application_url,
        is_remote: submission.is_remote,
        is_india_focused: submission.is_india_focused,
        verification_confirmed: submission.verification_confirmed,
        submission_status: 'pending',
        submitted_by: userId,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting submission:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to submit job posting'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Job submission successful:', data.id);

    // Send confirmation email (optional - can be added later with Resend)

    return new Response(
      JSON.stringify({
        success: true,
        submission_id: data.id,
        message: 'Job posting submitted successfully! Our team will review it within 24 hours.',
        data: data
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in submit-employer-job function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to process job submission'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
