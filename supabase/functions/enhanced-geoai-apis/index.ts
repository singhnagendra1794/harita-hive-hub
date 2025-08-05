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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const path = url.pathname;
    
    // Route to appropriate handler
    if (path.includes('/v1/alerts')) {
      return await handleAlerts(supabaseClient, req);
    } else if (path.includes('/v1/analytics')) {
      return await handleAnalytics(supabaseClient, req);
    } else if (path.includes('/v1/scenarios')) {
      return await handleScenarios(supabaseClient, req);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleAlerts(supabase: any, req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const severity = url.searchParams.get('severity');
  const limit = parseInt(url.searchParams.get('limit') || '20');

  let query = supabase.from('ai_alerts').select('*');
  
  if (status) query = query.eq('is_resolved', status === 'resolved');
  if (severity) query = query.eq('severity', severity);
  
  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);

  if (error) throw error;

  return new Response(JSON.stringify({ alerts: data, total: data?.length || 0 }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleAnalytics(supabase: any, req: Request) {
  const url = new URL(req.url);
  const data_type = url.searchParams.get('data_type');
  const region = url.searchParams.get('region');

  // Mock analytics response
  const mockInsights = {
    title: `${data_type?.toUpperCase()} Analysis for ${region}`,
    summary: 'AI-generated insights based on your data parameters',
    metrics: {
      average_value: 0.67,
      trend: 'stable',
      confidence: 0.89
    },
    recommendations: ['Monitor changes closely', 'Consider additional data sources']
  };

  return new Response(JSON.stringify({ insights: mockInsights }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleScenarios(supabase: any, req: Request) {
  if (req.method === 'POST') {
    const body = await req.json();
    
    const { data, error } = await supabase
      .from('scenario_simulations')
      .insert({
        scenario_type: body.scenario_type,
        name: body.name,
        parameters: body.parameters,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      scenario: { 
        id: data.id, 
        status: 'queued', 
        estimated_completion: new Date(Date.now() + 3600000).toISOString() 
      } 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}