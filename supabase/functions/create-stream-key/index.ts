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

    const { title, description } = await req.json()

    if (!title || title.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique stream key
    const { data: streamKeyData, error: streamKeyError } = await supabaseClient
      .rpc('generate_unique_stream_key')

    if (streamKeyError) {
      console.error('Error generating stream key:', streamKeyError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate stream key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const streamKey = streamKeyData as string

    // Create live class record
    const { data: liveClass, error: insertError } = await supabaseClient
      .from('live_classes')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        stream_key: streamKey,
        created_by: user.id,
        status: 'ended', // Created but not started yet
        start_time: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating live class:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create live class' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success response with streaming details
    return new Response(
      JSON.stringify({
        success: true,
        live_class: liveClass,
        stream_key: streamKey,
        rtmp_url: `rtmp://localhost:1935/live`,
        hls_url: `http://localhost:8080/hls/${streamKey}.m3u8`,
        dashboard_url: `/instructor-dashboard`,
        obs_setup: {
          server: 'rtmp://localhost:1935/live',
          stream_key: streamKey,
          recommended_settings: {
            video_bitrate: '2500 Kbps',
            audio_bitrate: '160 Kbps',
            resolution: '1920x1080',
            fps: 30,
            encoder: 'x264'
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in create-stream-key:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})