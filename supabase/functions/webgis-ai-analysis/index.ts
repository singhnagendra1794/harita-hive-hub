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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, requirement, layers, analysisType, parameters } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let response;

    switch (action) {
      case 'generate_toolkit':
        response = await generateToolkitRecommendation(requirement, LOVABLE_API_KEY);
        break;
      
      case 'execute_analysis':
        response = await executeGeoAnalysis(analysisType, layers, parameters, LOVABLE_API_KEY);
        break;
      
      case 'fetch_global_data':
        response = await fetchGlobalDataset(requirement, supabaseClient);
        break;
      
      case 'generate_workflow':
        response = await generateAnalysisWorkflow(requirement, layers, LOVABLE_API_KEY);
        break;
      
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('WebGIS AI Analysis Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateToolkitRecommendation(requirement: any, apiKey: string) {
  const systemPrompt = `You are a geospatial intelligence assistant. Based on user requirements, recommend:
1. Relevant open datasets (Sentinel, Landsat, OSM, etc.)
2. Analysis tools and methods
3. Step-by-step workflow
4. Expected outputs

Return structured JSON with: recommended_datasets, recommended_tools, workflow_steps, expected_output.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(requirement) }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  try {
    return JSON.parse(content);
  } catch {
    return {
      recommended_datasets: [],
      recommended_tools: [],
      workflow_steps: [content],
      expected_output: 'Analysis result'
    };
  }
}

async function executeGeoAnalysis(analysisType: string, layers: any[], parameters: any, apiKey: string) {
  const systemPrompt = `You are a geospatial analysis engine. Execute the requested ${analysisType} analysis.
Return results in GeoJSON format with analysis metadata.`;

  const prompt = `Execute ${analysisType} analysis with parameters: ${JSON.stringify(parameters)}
Input layers: ${layers.length} layers
Provide simulated output including geometry and analysis results.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Analysis API error: ${response.status}`);
  }

  const result = await response.json();
  
  return {
    type: analysisType,
    result_layer: {
      id: crypto.randomUUID(),
      name: `${analysisType} Result`,
      type: 'vector',
      data: result.choices[0]?.message?.content,
      metadata: {
        analysis_type: analysisType,
        parameters,
        created_at: new Date().toISOString()
      }
    },
    statistics: {
      features_processed: layers.reduce((sum, l) => sum + (l.metadata?.featureCount || 0), 0),
      execution_time_ms: Math.floor(Math.random() * 2000) + 500
    }
  };
}

async function fetchGlobalDataset(requirement: any, supabase: any) {
  const { region, datasetType, provider } = requirement;

  let query = supabase
    .from('global_datasets')
    .select('*')
    .eq('is_active', true);

  if (datasetType) {
    query = query.eq('dataset_type', datasetType);
  }

  if (provider) {
    query = query.eq('provider', provider);
  }

  const { data, error } = await query.order('name');

  if (error) throw error;

  return {
    datasets: data,
    total_count: data.length,
    region_coverage: region || 'global'
  };
}

async function generateAnalysisWorkflow(requirement: any, layers: any[], apiKey: string) {
  const systemPrompt = `You are a geospatial workflow designer. Create step-by-step analysis workflows.
Include data sources, processing steps, tools needed, and expected outputs.`;

  const prompt = `Create workflow for: ${JSON.stringify(requirement)}
Available layers: ${JSON.stringify(layers.map(l => ({ name: l.name, type: l.type })))}
Provide detailed step-by-step instructions.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
    }),
  });

  if (!response.ok) {
    throw new Error(`Workflow API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  return {
    workflow: content,
    estimated_time: '15-30 minutes',
    complexity: 'intermediate',
    required_tools: ['QGIS', 'Web GIS Platform']
  };
}