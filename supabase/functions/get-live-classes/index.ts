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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    const status = url.searchParams.get('status') || 'all'
    const course = url.searchParams.get('course')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    let query = supabaseClient
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
        course_title,
        created_at,
        updated_at
      `)
      .order('start_time', { ascending: false })
      .limit(limit)

    // Filter by status if specified
    if (status === 'live') {
      query = query.eq('status', 'live')
    } else if (status === 'ended') {
      query = query.eq('status', 'ended')
    } else if (status !== 'all') {
      // For any other status value, filter by it
      query = query.eq('status', status)
    }

    // Filter by course if specified
    if (course) {
      query = query.eq('course_title', course)
    }

    const { data: liveClasses, error } = await query

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch live classes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enhance the data with additional URLs
    const enhancedClasses = (liveClasses || []).map(liveClass => ({
      ...liveClass,
      hls_url: `http://localhost:8080/hls/${liveClass.stream_key}.m3u8`,
      recording_url: liveClass.recording_url || `http://localhost:8080/recordings/${liveClass.stream_key}.mp4`,
      is_live: liveClass.status === 'live',
      has_ended: liveClass.status === 'ended',
      duration_minutes: liveClass.end_time 
        ? Math.round((new Date(liveClass.end_time).getTime() - new Date(liveClass.start_time).getTime()) / (1000 * 60))
        : null
    }))

    // Separate current live class and others
    const currentLiveClass = enhancedClasses.find(cls => cls.status === 'live')
    const pastClasses = enhancedClasses.filter(cls => cls.status === 'ended')
    const scheduledClasses = enhancedClasses.filter(cls => cls.status === 'scheduled')

    return new Response(
      JSON.stringify({ 
        success: true,
        live_classes: enhancedClasses,
        current_live: currentLiveClass || null,
        past_classes: pastClasses,
        scheduled_classes: scheduledClasses,
        total_count: enhancedClasses.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-live-classes:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})