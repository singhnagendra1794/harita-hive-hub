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

    // Get the authenticated user
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

    const { title, description } = await req.json()

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Start a new stream session using the database function
    const { data: sessionId, error: sessionError } = await supabaseClient
      .rpc('start_stream_session', {
        p_user_id: user.id,
        p_title: title,
        p_description: description
      })

    if (sessionError) {
      console.error('Error creating stream session:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Failed to create stream session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the stream session details
    const { data: session, error: fetchError } = await supabaseClient
      .from('stream_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError) {
      console.error('Error fetching stream session:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch stream session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the stream key for the user
    const { data: streamKeyData, error: keyError } = await supabaseClient
      .from('stream_keys')
      .select('stream_key')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (keyError) {
      console.error('Error fetching stream key:', keyError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch stream key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const streamKey = streamKeyData.stream_key

    // Return stream configuration for OBS
    return new Response(
      JSON.stringify({ 
        success: true,
        session_id: sessionId,
        stream_key: streamKey,
        rtmp_server: 'rtmp://stream.haritahive.com/live',
        hls_url: `https://stream.haritahive.com/hls/${streamKey}.m3u8`,
        obs_setup: {
          server: 'rtmp://stream.haritahive.com/live',
          stream_key: streamKey,
          recommended_settings: {
            video_bitrate: '3000 Kbps',
            audio_bitrate: '128 Kbps',
            resolution: '1920x1080',
            fps: 30,
            encoder: 'x264'
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})