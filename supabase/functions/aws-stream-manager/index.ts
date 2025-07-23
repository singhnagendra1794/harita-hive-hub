import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
    )

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, class_id, recording_s3_key, viewer_count, analytics_data } = await req.json()

    switch (action) {
      case 'start_stream': {
        const { data, error } = await supabaseClient.rpc('start_aws_stream', {
          p_class_id: class_id,
          p_admin_user_id: user.id
        })

        if (error) {
          console.error('Error starting stream:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to start stream' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'stop_stream': {
        const { data, error } = await supabaseClient.rpc('stop_aws_stream', {
          p_class_id: class_id,
          p_admin_user_id: user.id,
          p_recording_s3_key: recording_s3_key
        })

        if (error) {
          console.error('Error stopping stream:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to stop stream' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_analytics': {
        const { error } = await supabaseClient
          .from('stream_analytics')
          .insert({
            class_id,
            event_type: analytics_data.event_type,
            event_data: analytics_data.data || {},
            viewer_count: viewer_count || 0,
            bitrate: analytics_data.bitrate,
            quality_metrics: analytics_data.quality_metrics || {}
          })

        if (error) {
          console.error('Error updating analytics:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to update analytics' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_stream_config': {
        const { data, error } = await supabaseClient
          .from('aws_streaming_config')
          .select('*')
          .eq('is_active', true)
          .single()

        if (error) {
          console.error('Error getting stream config:', error)
          return new Response(
            JSON.stringify({ error: 'No active streaming configuration found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})