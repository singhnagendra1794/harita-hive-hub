import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface YouTubeAPIResponse {
  id: string
  snippet: {
    title: string
    description: string
    scheduledStartTime: string
    thumbnails: {
      default: { url: string }
      medium: { url: string }
      high: { url: string }
    }
  }
  status: {
    privacyStatus: string
    lifeCycleStatus: string
  }
  cdn?: {
    ingestionInfo: {
      streamName: string
      ingestionAddress: string
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, ...payload } = await req.json()

    switch (action) {
      case 'create_live_stream':
        return await createLiveStream(supabase, payload)
      case 'start_live_stream':
        return await startLiveStream(supabase, payload)
      case 'end_live_stream':
        return await endLiveStream(supabase, payload)
      case 'get_stream_status':
        return await getStreamStatus(supabase, payload)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('YouTube Live Manager Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function createLiveStream(supabase: any, payload: any) {
  const { title, description, scheduledTime, thumbnailUrl, userId, accessToken } = payload
  const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
  const YOUTUBE_CLIENT_ID = Deno.env.get('YOUTUBE_CLIENT_ID')
  const YOUTUBE_CLIENT_SECRET = Deno.env.get('YOUTUBE_CLIENT_SECRET')

  if (!YOUTUBE_API_KEY || !accessToken) {
    throw new Error('YouTube API key and access token required')
  }

  // Convert IST to UTC
  const scheduledStartTime = new Date(scheduledTime).toISOString()

  // Create YouTube Live Broadcast
  const broadcastResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status&key=${YOUTUBE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        snippet: {
          title,
          description,
          scheduledStartTime,
        },
        status: {
          privacyStatus: 'unlisted',
          selfDeclaredMadeForKids: false,
        },
      }),
    }
  )

  if (!broadcastResponse.ok) {
    const error = await broadcastResponse.text()
    console.error('YouTube Broadcast Error:', error)
    throw new Error(`Failed to create YouTube broadcast: ${error}`)
  }

  const broadcast: YouTubeAPIResponse = await broadcastResponse.json()

  // Create YouTube Live Stream
  const streamResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn&key=${YOUTUBE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        snippet: {
          title: `${title} - Stream`,
        },
        cdn: {
          format: '1080p',
          ingestionType: 'rtmp',
        },
      }),
    }
  )

  if (!streamResponse.ok) {
    const error = await streamResponse.text()
    console.error('YouTube Stream Error:', error)
    throw new Error(`Failed to create YouTube stream: ${error}`)
  }

  const stream: YouTubeAPIResponse = await streamResponse.json()

  // Bind stream to broadcast
  await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?part=id&id=${broadcast.id}&streamId=${stream.id}&key=${YOUTUBE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  // Save to database
  const { data: scheduleData, error: scheduleError } = await supabase
    .from('youtube_live_schedule')
    .insert({
      youtube_broadcast_id: broadcast.id,
      youtube_stream_id: stream.id,
      title,
      description,
      scheduled_time: scheduledStartTime,
      stream_url: stream.cdn?.ingestionInfo?.ingestionAddress || '',
      stream_key: stream.cdn?.ingestionInfo?.streamName || '',
      thumbnail_url: thumbnailUrl || broadcast.snippet.thumbnails?.medium?.url,
      privacy_status: 'unlisted',
      created_by: userId,
    })
    .select()
    .single()

  if (scheduleError) {
    console.error('Database Error:', scheduleError)
    throw new Error(`Failed to save schedule: ${scheduleError.message}`)
  }

  // Log API operation
  await supabase.from('youtube_api_operations').insert({
    operation_type: 'create_broadcast',
    youtube_broadcast_id: broadcast.id,
    request_data: { title, description, scheduledTime },
    response_data: { broadcast, stream },
    performed_by: userId,
  })

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        scheduleId: scheduleData.id,
        broadcastId: broadcast.id,
        streamId: stream.id,
        streamUrl: stream.cdn?.ingestionInfo?.ingestionAddress,
        streamKey: stream.cdn?.ingestionInfo?.streamName,
        watchUrl: `https://www.youtube.com/watch?v=${broadcast.id}`,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function startLiveStream(supabase: any, payload: any) {
  const { scheduleId, userId } = payload

  // Get schedule data and OAuth token
  const { data: schedule, error: scheduleError } = await supabase
    .from('youtube_live_schedule')
    .select('*')
    .eq('id', scheduleId)
    .single()

  if (scheduleError || !schedule) {
    throw new Error('Schedule not found')
  }

  // Get access token for the user
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token')
    .eq('user_id', userId)
    .single()

  if (tokenError || !tokenData?.access_token) {
    throw new Error('YouTube account not connected')
  }

  // Transition broadcast to live
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?part=status&id=${schedule.youtube_broadcast_id}&broadcastStatus=live`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('YouTube API Error:', error)
    throw new Error(`Failed to start live stream: ${error}`)
  }

  // Update database
  await supabase
    .from('youtube_live_schedule')
    .update({
      status: 'live',
      actual_start_time: new Date().toISOString(),
    })
    .eq('id', scheduleId)

  // Log operation
  await supabase.from('youtube_api_operations').insert({
    operation_type: 'start_broadcast',
    youtube_broadcast_id: schedule.youtube_broadcast_id,
    performed_by: userId,
    response_data: { success: true },
  })

  return new Response(
    JSON.stringify({ success: true, message: 'Live stream started' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function endLiveStream(supabase: any, payload: any) {
  const { scheduleId, userId } = payload

  // Get schedule data and OAuth token
  const { data: schedule, error: scheduleError } = await supabase
    .from('youtube_live_schedule')
    .select('*')
    .eq('id', scheduleId)
    .single()

  if (scheduleError || !schedule) {
    throw new Error('Schedule not found')
  }

  // Get access token for the user
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token')
    .eq('user_id', userId)
    .single()

  if (tokenError || !tokenData?.access_token) {
    throw new Error('YouTube account not connected')
  }

  // End broadcast
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?part=status&id=${schedule.youtube_broadcast_id}&broadcastStatus=complete`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('YouTube API Error:', error)
    throw new Error(`Failed to end live stream: ${error}`)
  }

  // Check for recording availability after 30 seconds delay
  setTimeout(async () => {
    try {
      await checkAndFetchRecording(supabase, schedule.youtube_broadcast_id, tokenData.access_token)
    } catch (error) {
      console.error('Recording fetch error:', error)
    }
  }, 30000)

  // Update database
  await supabase
    .from('youtube_live_schedule')
    .update({
      status: 'ended',
      actual_end_time: new Date().toISOString(),
    })
    .eq('id', scheduleId)

  // Log operation
  await supabase.from('youtube_api_operations').insert({
    operation_type: 'end_broadcast',
    youtube_broadcast_id: schedule.youtube_broadcast_id,
    performed_by: userId,
    response_data: { success: true },
  })

  return new Response(
    JSON.stringify({ success: true, message: 'Live stream ended, checking for recording...' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function checkAndFetchRecording(supabase: any, broadcastId: string, accessToken: string) {
  // Check if recording is available
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=status,recordingDetails&id=${broadcastId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  if (response.ok) {
    const data = await response.json()
    const video = data.items?.[0]
    
    if (video && video.status.uploadStatus === 'processed') {
      // Recording is available, update database
      await supabase
        .from('youtube_live_schedule')
        .update({
          recording_available: true,
          recording_url: `https://www.youtube.com/watch?v=${broadcastId}`,
        })
        .eq('youtube_broadcast_id', broadcastId)
        
      // Move to class recordings
      await supabase
        .from('class_recordings')
        .insert({
          title: video.snippet?.title || 'Live Stream Recording',
          description: video.snippet?.description,
          youtube_url: `https://www.youtube.com/watch?v=${broadcastId}`,
          thumbnail_url: video.snippet?.thumbnails?.high?.url,
          is_public: true,
          created_by: (await supabase.auth.getUser()).data?.user?.id,
        })
    }
  }
}

async function getStreamStatus(supabase: any, payload: any) {
  const { broadcastId } = payload
  const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=status,snippet&id=${broadcastId}&key=${YOUTUBE_API_KEY}`
  )

  if (!response.ok) {
    throw new Error('Failed to get stream status')
  }

  const data = await response.json()
  const broadcast = data.items?.[0]

  if (!broadcast) {
    throw new Error('Broadcast not found')
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        status: broadcast.status.lifeCycleStatus,
        privacyStatus: broadcast.status.privacyStatus,
        actualStartTime: broadcast.snippet.actualStartTime,
        actualEndTime: broadcast.snippet.actualEndTime,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}