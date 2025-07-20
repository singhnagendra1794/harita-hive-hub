import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const url = new URL(req.url)
    const streamKey = url.searchParams.get('key')
    
    if (!streamKey) {
      return new Response(
        JSON.stringify({ error: 'Stream key required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify stream key exists and is active
    const { data: keyData, error: keyError } = await supabase
      .from('stream_keys')
      .select('user_id')
      .eq('stream_key', streamKey)
      .eq('is_active', true)
      .single()

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid stream key' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method === 'POST') {
      // Start streaming session
      const { data: sessionData, error: sessionError } = await supabase
        .from('stream_sessions')
        .select('id')
        .eq('user_id', keyData.user_id)
        .eq('status', 'preparing')
        .single()

      if (sessionData) {
        // Update session to live
        await supabase
          .from('stream_sessions')
          .update({ 
            status: 'live',
            started_at: new Date().toISOString()
          })
          .eq('id', sessionData.id)
      }

      return new Response(
        JSON.stringify({ 
          message: 'Stream started',
          status: 'live',
          endpoint: `${Deno.env.get('SUPABASE_URL')}/functions/v1/streaming-server/stream/${streamKey}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method === 'GET') {
      // Stream endpoint - handle video stream
      const streamPath = url.pathname.split('/').pop()
      
      if (streamPath === streamKey) {
        // Return streaming interface
        return new Response(
          `<!DOCTYPE html>
          <html>
          <head>
            <title>Live Stream</title>
            <style>
              body { margin: 0; padding: 20px; background: #000; color: #fff; font-family: Arial; }
              .container { max-width: 800px; margin: 0 auto; text-align: center; }
              .status { padding: 10px; background: #333; border-radius: 5px; margin-bottom: 20px; }
              .live { background: #e74c3c; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="status live">🔴 LIVE</div>
              <h1>Live Stream Active</h1>
              <p>Stream Key: ${streamKey}</p>
              <p>Status: Broadcasting</p>
            </div>
          </body>
          </html>`,
          {
            headers: { ...corsHeaders, 'Content-Type': 'text/html' }
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Streaming server error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})