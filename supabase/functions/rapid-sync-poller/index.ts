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

    console.log('⚡ Rapid Sync Poller - 15 second interval check');

    // Check for error patterns
    const { data: recentErrors } = await supabase
      .from('youtube_api_logs')
      .select('consecutive_failures')
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentErrors?.[0]?.consecutive_failures >= 3) {
      console.log('⚠️ Too many consecutive failures, skipping this cycle');
      
      return new Response(JSON.stringify({
        success: false,
        message: 'Skipped due to consecutive failures',
        skipReason: 'error_threshold_exceeded'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Run enhanced sync for immediate detection
    const { data: syncResult, error: syncError } = await supabase.functions.invoke('enhanced-youtube-sync');
    
    console.log('📊 Sync result:', syncResult);

    return new Response(JSON.stringify({
      success: true,
      message: 'Rapid sync completed',
      syncResult,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Rapid sync error:', error);
    
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