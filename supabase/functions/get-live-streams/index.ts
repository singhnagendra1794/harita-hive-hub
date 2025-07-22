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

    // Get currently live streams with user profile info
    const { data: liveStreams, error: liveError } = await supabaseClient
      .from('stream_sessions')
      .select(`
        *,
        stream_keys!inner(stream_key)
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
        stream_keys!inner(stream_key)
      `)
      .eq('status', 'ended')
      .order('ended_at', { ascending: false })
      .limit(10)

    if (endedError) {
      console.error('Error fetching ended streams:', endedError)
    }

    // Get user profile info for live streams
    let currentLive = null;
    if (liveStreams?.[0]) {
      const { data: profileData } = await supabaseClient.rpc('get_user_profile_for_stream', {
        p_user_id: liveStreams[0].user_id
      });
      
      currentLive = {
        id: liveStreams[0].id,
        title: liveStreams[0].title,
        description: liveStreams[0].description,
        stream_key: liveStreams[0].stream_keys.stream_key,
        status: liveStreams[0].status,
        start_time: liveStreams[0].started_at,
        viewer_count: liveStreams[0].viewer_count || 0,
        hls_url: `https://stream.haritahive.com/hls/${liveStreams[0].stream_keys.stream_key}.m3u8`,
        instructor: profileData?.[0]?.full_name || 'Instructor'
      };
    }

    // Format past streams with user profile info
    const pastStreams = [];
    if (endedStreams?.length > 0) {
      for (const stream of endedStreams) {
        const { data: profileData } = await supabaseClient.rpc('get_user_profile_for_stream', {
          p_user_id: stream.user_id
        });
        
        pastStreams.push({
          id: stream.id,
          title: stream.title,
          description: stream.description,
          stream_key: stream.stream_keys.stream_key,
          status: stream.status,
          start_time: stream.started_at,
          end_time: stream.ended_at,
          duration_minutes: stream.ended_at && stream.started_at ? 
            Math.round((new Date(stream.ended_at).getTime() - new Date(stream.started_at).getTime()) / (1000 * 60)) : null,
          recording_url: `https://stream.haritahive.com/recordings/${stream.stream_keys.stream_key}.mp4`,
          instructor: profileData?.[0]?.full_name || 'Instructor'
        });
      }
    }

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