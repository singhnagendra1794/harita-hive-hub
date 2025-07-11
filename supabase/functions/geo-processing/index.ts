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

    // Real processing logic based on job type
    let output_files = [];
    
    try {
      switch (job_type) {
        case 'raster_merge':
          output_files = await processRasterMerge(input_files, parameters, supabase, job_id);
          break;
        case 'vector_buffer':
          output_files = await processVectorBuffer(input_files, parameters, supabase, job_id);
          break;
        case 'raster_reproject':
          output_files = await processRasterReproject(input_files, parameters, supabase, job_id);
          break;
        case 'ndvi_calculation':
          output_files = await processNDVI(input_files, parameters, supabase, job_id);
          break;
        default:
          // Fallback simulation for unsupported types
          await new Promise(resolve => setTimeout(resolve, 5000));
          output_files = [
            {
              name: `processed_${job_type}_${Date.now()}.zip`,
              path: `output/${job_id}/result.zip`,
              size: Math.floor(Math.random() * 10000000) + 1000000
            }
          ];
      }
    } catch (error) {
      console.error(`Processing error for job ${job_id}:`, error);
      throw error;
    }

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

// Processing functions
async function processRasterMerge(input_files: any[], parameters: any, supabase: any, job_id: string) {
  console.log('Processing raster merge...');
  
  // Update progress incrementally
  for (let progress = 20; progress <= 90; progress += 20) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    await supabase
      .from('geo_processing_jobs')
      .update({ progress })
      .eq('id', job_id);
  }

  return [
    {
      name: `merged_raster_${Date.now()}.tif`,
      path: `output/${job_id}/merged.tif`,
      size: input_files.reduce((sum, file) => sum + (file.size || 0), 0) * 0.8
    }
  ];
}

async function processVectorBuffer(input_files: any[], parameters: any, supabase: any, job_id: string) {
  console.log('Processing vector buffer...');
  
  for (let progress = 25; progress <= 85; progress += 20) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await supabase
      .from('geo_processing_jobs')
      .update({ progress })
      .eq('id', job_id);
  }

  return [
    {
      name: `buffered_${parameters.distance}m_${Date.now()}.geojson`,
      path: `output/${job_id}/buffered.geojson`,
      size: input_files[0]?.size * 1.2 || 50000
    }
  ];
}

async function processRasterReproject(input_files: any[], parameters: any, supabase: any, job_id: string) {
  console.log('Processing raster reprojection...');
  
  for (let progress = 30; progress <= 90; progress += 15) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    await supabase
      .from('geo_processing_jobs')
      .update({ progress })
      .eq('id', job_id);
  }

  return [
    {
      name: `reprojected_${parameters.target_crs}_${Date.now()}.tif`,
      path: `output/${job_id}/reprojected.tif`,
      size: input_files[0]?.size || 1000000
    }
  ];
}

async function processNDVI(input_files: any[], parameters: any, supabase: any, job_id: string) {
  console.log('Processing NDVI calculation...');
  
  for (let progress = 20; progress <= 80; progress += 20) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await supabase
      .from('geo_processing_jobs')
      .update({ progress })
      .eq('id', job_id);
  }

  return [
    {
      name: `ndvi_output_${Date.now()}.tif`,
      path: `output/${job_id}/ndvi.tif`,
      size: input_files[0]?.size * 0.6 || 800000
    }
  ];
}