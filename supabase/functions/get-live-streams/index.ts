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
    )

    // Get currently live streams
    const { data: liveStreams, error: liveError } = await supabaseClient
      .from('stream_sessions')
      .select(`
        *,
        stream_keys!inner(stream_key),
        profiles!inner(full_name)
      `)
      .eq('status', 'live')
      .order('started_at', { ascending: false })

    if (liveError) {
      console.error('Error fetching live streams:', liveError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch live streams' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get recent ended streams
    const { data: endedStreams, error: endedError } = await supabaseClient
      .from('stream_sessions')
      .select(`
        *,
        stream_keys!inner(stream_key),
        profiles!inner(full_name)
      `)
      .eq('status', 'ended')
      .order('ended_at', { ascending: false })
      .limit(10)

    if (endedError) {
      console.error('Error fetching ended streams:', endedError)
    }

    // Format the response
    const currentLive = liveStreams?.[0] ? {
      id: liveStreams[0].id,
      title: liveStreams[0].title,
      description: liveStreams[0].description,
      stream_key: liveStreams[0].stream_keys.stream_key,
      status: liveStreams[0].status,
      start_time: liveStreams[0].started_at,
      viewer_count: liveStreams[0].viewer_count || 0,
      hls_url: `https://haritahive.com/stream/${liveStreams[0].stream_keys.stream_key}`,
      instructor: liveStreams[0].profiles.full_name
    } : null

    const pastStreams = (endedStreams || []).map((stream: any) => ({
      id: stream.id,
      title: stream.title,
      description: stream.description,
      stream_key: stream.stream_keys.stream_key,
      status: stream.status,
      start_time: stream.started_at,
      end_time: stream.ended_at,
      duration_minutes: stream.ended_at && stream.started_at ? 
        Math.round((new Date(stream.ended_at).getTime() - new Date(stream.started_at).getTime()) / (1000 * 60)) : null,
      recording_url: `https://haritahive.com/recordings/${stream.stream_keys.stream_key}.mp4`,
      instructor: stream.profiles.full_name
    }))

    return new Response(
      JSON.stringify({ 
        success: true,
        current_live: currentLive,
        past_streams: pastStreams,
        live_classes: liveStreams || [],
        past_classes: pastStreams
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