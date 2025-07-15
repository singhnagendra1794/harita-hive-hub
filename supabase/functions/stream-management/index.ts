import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StreamRequest {
  action: 'start' | 'stop' | 'status'
  liveClassId: string
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

    const { action, liveClassId } = await req.json() as StreamRequest
    
    console.log(`Stream management request: ${action} for class ${liveClassId}`)

    switch (action) {
      case 'start': {
        // Call the database function to start stream session
        const { data, error } = await supabaseClient.rpc('start_stream_session', {
          p_live_class_id: liveClassId
        })

        if (error) {
          console.error('Error starting stream:', error)
          throw error
        }

        return new Response(JSON.stringify({
          success: true,
          ...data
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'stop': {
        // Call the database function to stop stream session
        const { data, error } = await supabaseClient.rpc('stop_stream_session', {
          p_live_class_id: liveClassId
        })

        if (error) {
          console.error('Error stopping stream:', error)
          throw error
        }

        return new Response(JSON.stringify({
          success: true,
          ...data
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'status': {
        // Get current stream status
        const { data: streamSession, error } = await supabaseClient
          .from('stream_sessions')
          .select('*')
          .eq('live_class_id', liveClassId)
          .eq('is_active', true)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error getting stream status:', error)
          throw error
        }

        const { data: liveClass, error: classError } = await supabaseClient
          .from('live_classes')
          .select('*')
          .eq('id', liveClassId)
          .single()

        if (classError) {
          console.error('Error getting live class:', classError)
          throw classError
        }

        return new Response(JSON.stringify({
          success: true,
          isActive: !!streamSession,
          streamSession,
          liveClass
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      default:
        return new Response(JSON.stringify({
          error: 'Invalid action'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
    }
  } catch (error) {
    console.error('Stream management error:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})