import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { endpoint } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[]
    };

    if (!endpoint || endpoint === 'ava') {
      // Test AVA endpoint
      try {
        const avaResponse = await supabaseClient.functions.invoke('ava-assistant', {
          body: {
            message: "Hello AVA, can you hear me?",
            conversation_id: "test-" + Date.now(),
            user_id: "test-user",
            context_type: "health_check"
          }
        });

        results.tests.push({
          service: 'ava',
          status: avaResponse.error ? 'error' : 'success',
          error: avaResponse.error?.message,
          response: avaResponse.data?.response?.substring(0, 100)
        });
      } catch (error) {
        results.tests.push({
          service: 'ava',
          status: 'error',
          error: error.message
        });
      }
    }

    if (!endpoint || endpoint === 'geova') {
      // Test GEOVA endpoint
      try {
        const geovaResponse = await supabaseClient.functions.invoke('geova-mentor', {
          body: {
            message: "Hello GEOVA, are you working?",
            conversation_id: "test-" + Date.now(),
            user_id: "test-user",
            context_type: "health_check"
          }
        });

        results.tests.push({
          service: 'geova',
          status: geovaResponse.error ? 'error' : 'success',
          error: geovaResponse.error?.message,
          response: geovaResponse.data?.response?.substring(0, 100)
        });
      } catch (error) {
        results.tests.push({
          service: 'geova',
          status: 'error',
          error: error.message
        });
      }
    }

    // Check OpenAI API key
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    results.tests.push({
      service: 'openai_config',
      status: openAIKey ? 'configured' : 'missing',
      key_present: !!openAIKey,
      key_length: openAIKey?.length || 0
    });

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});