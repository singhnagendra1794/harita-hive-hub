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

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // Get all sessions created by the authenticated user
    const { data: mySessions, error } = await supabaseClient
      .from('live_classes')
      .select(`
        id,
        title,
        description,
        stream_key,
        status,
        start_time,
        end_time,
        created_by,
        thumbnail_url,
        recording_url,
        viewer_count,
        created_at,
        updated_at
      `)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch your sessions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enhance the data with additional URLs and streaming details
    const enhancedSessions = (mySessions || []).map(session => ({
      ...session,
      rtmp_url: `rtmp://localhost:1935/live`,
      hls_url: `http://localhost:8080/hls/${session.stream_key}.m3u8`,
      recording_url: session.recording_url || `http://localhost:8080/recordings/${session.stream_key}.mp4`,
      is_live: session.status === 'live',
      has_ended: session.status === 'ended',
      can_start: session.status === 'ended' && !session.end_time, // Can start if created but not live and not ended with end_time
      duration_minutes: session.end_time 
        ? Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60))
        : null,
      obs_setup: {
        server: `rtmp://localhost:1935/live`,
        stream_key: session.stream_key,
        recommended_settings: {
          video_bitrate: '2500 Kbps',
          audio_bitrate: '160 Kbps',
          resolution: '1920x1080',
          fps: 30,
          encoder: 'x264'
        }
      }
    }))

    // Categorize sessions
    const activeSessions = enhancedSessions.filter(s => s.status === 'live')
    const endedSessions = enhancedSessions.filter(s => s.status === 'ended' && s.end_time)
    const readyToStart = enhancedSessions.filter(s => s.status === 'ended' && !s.end_time)

    return new Response(
      JSON.stringify({ 
        success: true,
        my_sessions: enhancedSessions,
        active_sessions: activeSessions,
        ended_sessions: endedSessions,
        ready_to_start: readyToStart,
        total_count: enhancedSessions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-my-sessions:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})