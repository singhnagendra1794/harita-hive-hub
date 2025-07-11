import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { job_id, job_type, input_files, parameters } = await req.json();

    console.log(`Processing job ${job_id} of type ${job_type}`);

    // Update job status to processing
    await supabase
      .from('geo_processing_jobs')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString(),
        progress: 10 
      })
      .eq('id', job_id);

    // Simulate processing with progress updates
    for (let progress = 20; progress <= 90; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await supabase
        .from('geo_processing_jobs')
        .update({ progress })
        .eq('id', job_id);
    }

    // Simulate processing result
    const output_files = [
      {
        name: `processed_${job_type}_${Date.now()}.zip`,
        path: `output/${job_id}/result.zip`,
        size: Math.floor(Math.random() * 10000000) + 1000000
      }
    ];

    // Complete the job
    await supabase
      .from('geo_processing_jobs')
      .update({
        status: 'completed',
        progress: 100,
        output_files: output_files,
        completed_at: new Date().toISOString()
      })
      .eq('id', job_id);

    // Record usage
    const file_size_mb = input_files.reduce((sum: number, file: any) => sum + (file.size || 0), 0) / (1024 * 1024);
    
    await supabase
      .from('geo_processing_usage')
      .insert({
        user_id: (await supabase.from('geo_processing_jobs').select('user_id').eq('id', job_id).single()).data?.user_id,
        job_type,
        file_size_mb,
        processing_time_seconds: 180, // 3 minutes simulation
        subscription_tier: 'premium'
      });

    console.log(`Job ${job_id} completed successfully`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});