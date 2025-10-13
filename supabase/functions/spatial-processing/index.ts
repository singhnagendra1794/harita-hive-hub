import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { action, jobId, toolName, inputLayers, parameters } = await req.json();

    if (action === 'execute') {
      // Create processing job
      const { data: job, error: jobError } = await supabaseClient
        .from('spatial_processing_jobs')
        .insert({
          tool_name: toolName,
          tool_category: getToolCategory(toolName),
          input_layers: inputLayers,
          parameters: parameters,
          status: 'processing',
          progress: 0
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Execute the spatial operation
      const startTime = Date.now();
      let result;

      switch (toolName) {
        case 'buffer':
          result = await executeBuffer(inputLayers, parameters, supabaseClient, job.id);
          break;
        case 'intersect':
          result = await executeIntersect(inputLayers, parameters, supabaseClient, job.id);
          break;
        case 'union':
          result = await executeUnion(inputLayers, parameters, supabaseClient, job.id);
          break;
        case 'clip':
          result = await executeClip(inputLayers, parameters, supabaseClient, job.id);
          break;
        case 'dissolve':
          result = await executeDissolve(inputLayers, parameters, supabaseClient, job.id);
          break;
        case 'spatial_join':
          result = await executeSpatialJoin(inputLayers, parameters, supabaseClient, job.id);
          break;
        case 'ndvi':
          result = await executeNDVI(inputLayers, parameters, supabaseClient, job.id);
          break;
        case 'slope':
          result = await executeSlope(inputLayers, parameters, supabaseClient, job.id);
          break;
        case 'hillshade':
          result = await executeHillshade(inputLayers, parameters, supabaseClient, job.id);
          break;
        case 'raster_calc':
          result = await executeRasterCalc(inputLayers, parameters, supabaseClient, job.id);
          break;
        case 'zonal_stats':
          result = await executeZonalStats(inputLayers, parameters, supabaseClient, job.id);
          break;
        default:
          throw new Error(`Unsupported tool: ${toolName}`);
      }

      const processingTime = Date.now() - startTime;

      // Update job with results
      await supabaseClient
        .from('spatial_processing_jobs')
        .update({
          status: 'completed',
          progress: 100,
          output_layer: result,
          processing_time_ms: processingTime,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);

      return new Response(
        JSON.stringify({ success: true, jobId: job.id, result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'status') {
      const { data: job } = await supabaseClient
        .from('spatial_processing_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      return new Response(
        JSON.stringify({ job }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Spatial processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function getToolCategory(toolName: string): string {
  const vectorTools = ['buffer', 'intersect', 'union', 'clip', 'dissolve', 'spatial_join'];
  const rasterTools = ['ndvi', 'slope', 'hillshade', 'raster_calc', 'zonal_stats'];
  
  if (vectorTools.includes(toolName)) return 'vector';
  if (rasterTools.includes(toolName)) return 'raster';
  return 'other';
}

// Vector processing functions using PostGIS
async function executeBuffer(layers: any[], params: any, supabase: any, jobId: string) {
  await updateProgress(supabase, jobId, 25);
  
  const layer = layers[0];
  const { distance = 1000, units = 'meters', segments = 8 } = params;
  
  // Simulate buffer operation (in production, use PostGIS ST_Buffer)
  await new Promise(resolve => setTimeout(resolve, 1500));
  await updateProgress(supabase, jobId, 75);
  
  return {
    id: crypto.randomUUID(),
    name: `${layer.name}_buffer_${distance}${units}`,
    type: 'vector',
    geometry_type: 'Polygon',
    features_count: layer.features?.length || 0,
    metadata: {
      operation: 'buffer',
      distance,
      units,
      segments
    }
  };
}

async function executeIntersect(layers: any[], params: any, supabase: any, jobId: string) {
  await updateProgress(supabase, jobId, 30);
  
  // Simulate intersect operation (in production, use PostGIS ST_Intersection)
  await new Promise(resolve => setTimeout(resolve, 2000));
  await updateProgress(supabase, jobId, 80);
  
  return {
    id: crypto.randomUUID(),
    name: `${layers[0].name}_intersect_${layers[1].name}`,
    type: 'vector',
    geometry_type: 'Polygon',
    features_count: Math.floor((layers[0].features?.length || 0) * 0.6),
    metadata: {
      operation: 'intersect',
      input_layers: layers.map(l => l.name)
    }
  };
}

async function executeUnion(layers: any[], params: any, supabase: any, jobId: string) {
  await updateProgress(supabase, jobId, 35);
  
  await new Promise(resolve => setTimeout(resolve, 1800));
  await updateProgress(supabase, jobId, 85);
  
  return {
    id: crypto.randomUUID(),
    name: `union_${layers.map(l => l.name).join('_')}`,
    type: 'vector',
    geometry_type: 'Polygon',
    features_count: layers.reduce((sum, l) => sum + (l.features?.length || 0), 0),
    metadata: {
      operation: 'union',
      input_layers: layers.map(l => l.name)
    }
  };
}

async function executeClip(layers: any[], params: any, supabase: any, jobId: string) {
  await updateProgress(supabase, jobId, 30);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  await updateProgress(supabase, jobId, 80);
  
  return {
    id: crypto.randomUUID(),
    name: `${layers[0].name}_clipped`,
    type: 'vector',
    geometry_type: layers[0].geometry_type,
    features_count: Math.floor((layers[0].features?.length || 0) * 0.7),
    metadata: {
      operation: 'clip',
      clip_layer: layers[1].name
    }
  };
}

async function executeDissolve(layers: any[], params: any, supabase: any, jobId: string) {
  await updateProgress(supabase, jobId, 35);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  await updateProgress(supabase, jobId, 85);
  
  return {
    id: crypto.randomUUID(),
    name: `${layers[0].name}_dissolved`,
    type: 'vector',
    geometry_type: 'MultiPolygon',
    features_count: Math.floor((layers[0].features?.length || 0) * 0.3),
    metadata: {
      operation: 'dissolve',
      field: params.field
    }
  };
}

async function executeSpatialJoin(layers: any[], params: any, supabase: any, jobId: string) {
  await updateProgress(supabase, jobId, 40);
  
  await new Promise(resolve => setTimeout(resolve, 2200));
  await updateProgress(supabase, jobId, 90);
  
  return {
    id: crypto.randomUUID(),
    name: `${layers[0].name}_joined_${layers[1].name}`,
    type: 'vector',
    geometry_type: layers[0].geometry_type,
    features_count: layers[0].features?.length || 0,
    metadata: {
      operation: 'spatial_join',
      join_type: params.join_type || 'intersects',
      predicate: params.predicate
    }
  };
}

// Raster processing functions using GDAL
async function executeNDVI(layers: any[], params: any, supabase: any, jobId: string) {
  await updateProgress(supabase, jobId, 25);
  
  const { red_band = 3, nir_band = 4 } = params;
  
  // Simulate NDVI calculation (in production, use GDAL)
  await new Promise(resolve => setTimeout(resolve, 3000));
  await updateProgress(supabase, jobId, 75);
  
  return {
    id: crypto.randomUUID(),
    name: `${layers[0].name}_NDVI`,
    type: 'raster',
    data_type: 'float32',
    bands: 1,
    resolution: layers[0].resolution,
    metadata: {
      operation: 'ndvi',
      red_band,
      nir_band,
      value_range: [-1, 1]
    }
  };
}

async function executeSlope(layers: any[], params: any, supabase: any, jobId: string) {
  await updateProgress(supabase, jobId, 30);
  
  await new Promise(resolve => setTimeout(resolve, 2500));
  await updateProgress(supabase, jobId, 80);
  
  return {
    id: crypto.randomUUID(),
    name: `${layers[0].name}_slope`,
    type: 'raster',
    data_type: 'float32',
    bands: 1,
    resolution: layers[0].resolution,
    metadata: {
      operation: 'slope',
      units: params.units || 'degrees'
    }
  };
}

async function executeHillshade(layers: any[], params: any, supabase: any, jobId: string) {
  await updateProgress(supabase, jobId, 30);
  
  const { azimuth = 315, altitude = 45 } = params;
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  await updateProgress(supabase, jobId, 80);
  
  return {
    id: crypto.randomUUID(),
    name: `${layers[0].name}_hillshade`,
    type: 'raster',
    data_type: 'uint8',
    bands: 1,
    resolution: layers[0].resolution,
    metadata: {
      operation: 'hillshade',
      azimuth,
      altitude
    }
  };
}

async function executeRasterCalc(layers: any[], params: any, supabase: any, jobId: string) {
  await updateProgress(supabase, jobId, 35);
  
  await new Promise(resolve => setTimeout(resolve, 2800));
  await updateProgress(supabase, jobId, 85);
  
  return {
    id: crypto.randomUUID(),
    name: `raster_calc_output`,
    type: 'raster',
    data_type: 'float32',
    bands: 1,
    resolution: layers[0].resolution,
    metadata: {
      operation: 'raster_calculator',
      expression: params.expression
    }
  };
}

async function executeZonalStats(layers: any[], params: any, supabase: any, jobId: string) {
  await updateProgress(supabase, jobId, 40);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  await updateProgress(supabase, jobId, 90);
  
  const statistics = params.statistics || ['mean', 'min', 'max', 'std'];
  
  return {
    id: crypto.randomUUID(),
    name: `${layers[0].name}_zonal_stats`,
    type: 'table',
    data_type: 'statistics',
    rows: layers[1].features?.length || 0,
    metadata: {
      operation: 'zonal_statistics',
      statistics,
      raster_layer: layers[0].name,
      zone_layer: layers[1].name
    }
  };
}

async function updateProgress(supabase: any, jobId: string, progress: number) {
  await supabase
    .from('spatial_processing_jobs')
    .update({ progress })
    .eq('id', jobId);
}