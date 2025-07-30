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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔄 Starting live stream polling...');

    // Run sync functions in parallel
    const syncPromise = supabase.functions.invoke('youtube-auto-sync');
    const detectorPromise = supabase.functions.invoke('real-time-stream-detector');

    const [syncResult, detectorResult] = await Promise.allSettled([
      syncPromise,
      detectorPromise
    ]);

    const results = {
      sync: syncResult.status === 'fulfilled' ? syncResult.value : { error: syncResult.reason },
      detector: detectorResult.status === 'fulfilled' ? detectorResult.value : { error: detectorResult.reason }
    };

    console.log('✅ Polling completed:', results);

    return new Response(JSON.stringify({
      success: true,
      message: 'Live stream polling completed',
      results,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Live stream polling error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});