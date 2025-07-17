
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Simple connectivity test
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const country = req.headers.get('cf-ipcountry') || 'unknown';
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown';
    
    console.log('Connectivity test from:', { country, ip, userAgent });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Connectivity test successful',
        timestamp: new Date().toISOString(),
        country,
        ip: ip.substring(0, 10) + '...' // Partially hide IP for privacy
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Connectivity test error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
