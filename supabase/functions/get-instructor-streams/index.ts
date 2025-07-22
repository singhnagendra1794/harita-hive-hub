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

    const { data: sessions, error: sessionsError } = await supabaseClient
      .from('stream_sessions')
      .select(`
        *,
        stream_keys!inner(stream_key)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sessions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const mySessions = (sessions || []).map((session: any) => ({
      id: session.id,
      title: session.title,
      description: session.description,
      stream_key: session.stream_keys.stream_key,
      status: session.status,
      start_time: session.started_at,
      end_time: session.ended_at,
      created_by: session.user_id,
      thumbnail_url: null,
      recording_url: session.recording_url,
      viewer_count: session.viewer_count || 0,
      created_at: session.created_at,
      updated_at: session.updated_at,
      rtmp_url: `rtmp://stream.haritahive.com/live`,
      hls_url: `https://stream.haritahive.com/hls/${session.stream_keys.stream_key}.m3u8`,
      is_live: session.status === 'live',
      has_ended: session.status === 'ended',
      can_start: session.status === 'preparing',
      duration_minutes: session.ended_at && session.started_at ? 
        Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / (1000 * 60)) : null,
      obs_setup: {
        server: `rtmp://stream.haritahive.com/live`,
        stream_key: session.stream_keys.stream_key,
        recommended_settings: {
          video_bitrate: '3000 Kbps',
          audio_bitrate: '128 Kbps',
          resolution: '1920x1080',
          fps: 30,
          encoder: 'x264'
        }
      }
    }))

    return new Response(
      JSON.stringify({ 
        success: true,
        my_sessions: mySessions
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