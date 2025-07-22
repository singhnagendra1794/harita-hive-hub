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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const body = await req.json()
      console.log('RTMP Webhook received:', body)

      const { action, stream_key, client_ip } = body

      if (!action || !stream_key) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: action, stream_key' }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        )
      }

      // Handle different RTMP actions
      switch (action) {
        case 'play':
          // Stream started in OBS
          const { error: startError } = await supabaseClient
            .from('live_classes')
            .update({ 
              status: 'live',
              start_time: new Date().toISOString(),
              viewer_count: 1
            })
            .eq('stream_key', stream_key)
            .eq('status', 'preparing')

          if (startError) {
            console.error('Error starting stream:', startError)
          } else {
            console.log(`Stream ${stream_key} is now live`)
          }
          break

        case 'play_done':
          // Stream ended in OBS
          const { error: endError } = await supabaseClient
            .from('live_classes')
            .update({ 
              status: 'ended',
              end_time: new Date().toISOString(),
              recording_url: `https://stream.haritahive.com/recordings/${stream_key}.mp4`
            })
            .eq('stream_key', stream_key)
            .eq('status', 'live')

          if (endError) {
            console.error('Error ending stream:', endError)
          } else {
            console.log(`Stream ${stream_key} has ended`)
          }
          break

        case 'record_done':
          // Recording completed
          const { error: recordError } = await supabaseClient
            .from('live_classes')
            .update({ 
              recording_url: `https://stream.haritahive.com/recordings/${stream_key}.mp4`
            })
            .eq('stream_key', stream_key)

          if (recordError) {
            console.error('Error updating recording URL:', recordError)
          } else {
            console.log(`Recording for stream ${stream_key} is ready`)
          }
          break

        default:
          console.log(`Unhandled action: ${action}`)
      }

      return new Response(
        JSON.stringify({ success: true, action, stream_key }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})