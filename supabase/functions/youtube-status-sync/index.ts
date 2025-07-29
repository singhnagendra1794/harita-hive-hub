import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Auto-sync function that runs every 60 seconds to check YouTube status
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting YouTube status sync...')
    
    // Get all active YouTube live streams from both tables
    const { data: activeStreams, error } = await supabase
      .from('youtube_live_schedule')
      .select('*')
      .in('status', ['scheduled', 'live'])

    if (error) {
      console.error('Error fetching active streams:', error)
      throw error
    }

    const { data: liveClasses, error: liveError } = await supabase
      .from('live_classes')
      .select('*')
      .not('youtube_id', 'is', null)
      .in('status', ['scheduled', 'live'])

    if (liveError) {
      console.error('Error fetching live classes:', liveError)
    }

    const allStreams = [...(activeStreams || []), ...(liveClasses || [])]
    console.log(`Found ${allStreams.length} active streams to check`)
    
    for (const stream of allStreams) {
      try {
        await syncStreamStatus(supabase, stream)
      } catch (error) {
        console.error(`Error syncing stream ${stream.id}:`, error)
        // Continue with other streams
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${activeStreams?.length || 0} streams` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('YouTube sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function syncStreamStatus(supabase: any, stream: any) {
  // Get OAuth token for the stream creator
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token')
    .eq('user_id', stream.created_by)
    .single()

  if (tokenError || !tokenData?.access_token) {
    console.log(`No OAuth token for stream ${stream.id}`)
    return
  }

  // Check YouTube broadcast status
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=status,snippet&id=${stream.youtube_broadcast_id}`,
    {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    }
  )

  if (!response.ok) {
    console.error(`YouTube API error for stream ${stream.id}:`, await response.text())
    return
  }

  const data = await response.json()
  const broadcast = data.items?.[0]

  if (!broadcast) {
    console.log(`Broadcast not found for stream ${stream.id}`)
    return
  }

  const currentStatus = broadcast.status.lifeCycleStatus
  const broadcastStatus = broadcast.status.broadcastStatus
  
  console.log(`Stream ${stream.id}: Current status=${currentStatus}, Broadcast status=${broadcastStatus}`)

  // Update database if status changed
  const updates: any = {}
  
  if (currentStatus === 'live' && stream.status !== 'live') {
    updates.status = 'live'
    updates.actual_start_time = new Date().toISOString()
    console.log(`Stream ${stream.id} went live`)
  } else if (currentStatus === 'complete' && stream.status !== 'ended') {
    updates.status = 'ended'
    updates.actual_end_time = new Date().toISOString()
    console.log(`Stream ${stream.id} ended`)
    
    // Check for recording after delay
    setTimeout(() => {
      checkForRecording(supabase, stream, tokenData.access_token)
    }, 60000) // Wait 1 minute before checking for recording
  }

  // Update thumbnail if available
  if (broadcast.snippet?.thumbnails?.high?.url && !stream.thumbnail_url) {
    updates.thumbnail_url = broadcast.snippet.thumbnails.high.url
  }

  if (Object.keys(updates).length > 0) {
    await supabase
      .from('youtube_live_schedule')
      .update(updates)
      .eq('id', stream.id)
      
    console.log(`Updated stream ${stream.id} with:`, updates)
  }
}

async function checkForRecording(supabase: any, stream: any, accessToken: string) {
  try {
    console.log(`Checking for recording of stream ${stream.id}`)
    
    // Check if video is available and processed
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=status,snippet,recordingDetails&id=${stream.youtube_broadcast_id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Error checking recording status:', await response.text())
      return
    }

    const data = await response.json()
    const video = data.items?.[0]

    if (video && video.status.uploadStatus === 'processed') {
      console.log(`Recording available for stream ${stream.id}`)
      
      // Update YouTube schedule table
      await supabase
        .from('youtube_live_schedule')
        .update({
          recording_available: true,
          recording_url: `https://www.youtube.com/watch?v=${stream.youtube_broadcast_id}`,
        })
        .eq('id', stream.id)

      // Add to class recordings
      await supabase
        .from('class_recordings')
        .insert({
          title: video.snippet?.title || stream.title,
          description: video.snippet?.description || stream.description,
          youtube_url: `https://www.youtube.com/watch?v=${stream.youtube_broadcast_id}`,
          thumbnail_url: video.snippet?.thumbnails?.high?.url || stream.thumbnail_url,
          is_public: true,
          created_by: stream.created_by,
        })
        
      console.log(`Added recording to class_recordings for stream ${stream.id}`)
    } else {
      console.log(`Recording not ready yet for stream ${stream.id}`)
      
      // Schedule another check in 5 minutes
      setTimeout(() => {
        checkForRecording(supabase, stream, accessToken)
      }, 300000)
    }
  } catch (error) {
    console.error(`Error checking recording for stream ${stream.id}:`, error)
  }
}