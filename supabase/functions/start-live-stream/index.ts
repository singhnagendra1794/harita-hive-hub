import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { class_id } = await req.json()

    if (!class_id) {
      return new Response(
        JSON.stringify({ error: 'class_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the live class to verify ownership
    const { data: liveClass, error: fetchError } = await supabaseClient
      .from('live_classes')
      .select('*')
      .eq('id', class_id)
      .eq('created_by', user.id)
      .single()

    if (fetchError || !liveClass) {
      return new Response(
        JSON.stringify({ error: 'Live class not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already live
    if (liveClass.status === 'live') {
      return new Response(
        JSON.stringify({ 
          success: true,
          live_class: liveClass,
          message: 'Stream is already live',
          hls_url: `http://localhost:8080/hls/${liveClass.stream_key}.m3u8`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the live class to live status
    const { data: updatedClass, error: updateError } = await supabaseClient
      .from('live_classes')
      .update({
        status: 'live',
        start_time: new Date().toISOString(),
        end_time: null, // Clear any previous end time
        viewer_count: 0 // Reset viewer count
      })
      .eq('id', class_id)
      .eq('created_by', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error starting live stream:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to start live stream' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        live_class: updatedClass,
        message: 'Stream started successfully',
        hls_url: `http://localhost:8080/hls/${updatedClass.stream_key}.m3u8`,
        rtmp_url: `rtmp://localhost:1935/live`,
        stream_key: updatedClass.stream_key,
        viewer_url: `/live-classes?stream=${updatedClass.stream_key}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in start-live-stream:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})