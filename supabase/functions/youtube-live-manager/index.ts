import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    scheduledStartTime?: string;
    thumbnails: {
      high: { url: string };
    };
  };
  status: {
    lifeCycleStatus: string;
    broadcastStatus: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, ...body } = await req.json()
    
    console.log(`YouTube Live Manager: ${action}`, body)

    switch (action) {
      case 'sync_upcoming_streams':
        return await syncUpcomingStreams(supabase)
      case 'get_active_stream':
        return await getActiveStream(supabase)
      case 'create_live_stream':
        return await createLiveStream(supabase, body)
      case 'start_live_stream':
        return await startLiveStream(supabase, body)
      case 'end_live_stream':
        return await endLiveStream(supabase, body)
      case 'manual_refresh':
        return await manualRefresh(supabase)
      case 'update_stream_details':
        return await updateStreamDetails(supabase, body)
      case 'override_stream':
        return await overrideStream(supabase, body)
      case 'check_stream_status':
        return await checkStreamStatus(supabase, body)
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('YouTube Live Manager error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function syncUpcomingStreams(supabase: any) {
  console.log('Syncing upcoming YouTube streams...')
  
  // Get YouTube OAuth token for admin (Super Admin)
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token, refresh_token')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id || 'admin')
    .maybeSingle()

  if (tokenError || !tokenData?.access_token || tokenData.access_token === 'placeholder_access_token') {
    console.log('No valid YouTube OAuth token found, creating placeholder entries...')
    
    // Create placeholder upcoming stream for demo with the current video ID
    await supabase
      .from('youtube_live_schedule')
      .upsert({
        youtube_broadcast_id: '94NaFHNEi9k',
        title: 'Geospatial Technology Unlocked - Live Session',
        description: 'Interactive AI-powered learning session covering geospatial concepts and tools',
        scheduled_start_time: new Date().toISOString(), // Current time so it shows as live
        thumbnail_url: 'https://img.youtube.com/vi/94NaFHNEi9k/maxresdefault.jpg',
        status: 'live',
        created_by: 'admin',
        is_override: true
      }, {
        onConflict: 'youtube_broadcast_id'
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        streamsFound: 1,
        message: 'Created demo stream (YouTube OAuth not configured)' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Fetch upcoming live streams from YouTube
  const youtubeResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status&broadcastStatus=upcoming&maxResults=10`,
    {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    }
  )

  if (!youtubeResponse.ok) {
    if (youtubeResponse.status === 401) {
      // Token expired, try to refresh
      console.log('YouTube token expired, attempting refresh...')
      const refreshed = await refreshAccessToken(supabase, tokenData.refresh_token)
      if (refreshed) {
        // Retry with new token
        return await syncUpcomingStreams(supabase)
      }
    }
    throw new Error(`YouTube API error: ${youtubeResponse.statusText}`)
  }

  const data = await youtubeResponse.json()
  const upcomingStreams = data.items || []

  // Filter for "Geospatial Technology Unlocked" streams
  const geoStreams = upcomingStreams.filter((stream: YouTubeVideo) =>
    stream.snippet.title.toLowerCase().includes('geospatial technology unlocked')
  )

  console.log(`Found ${geoStreams.length} Geospatial Technology streams`)

  // Update database with upcoming streams
  for (const stream of geoStreams) {
    await supabase
      .from('youtube_live_schedule')
      .upsert({
        youtube_broadcast_id: stream.id,
        title: stream.snippet.title,
        description: stream.snippet.description?.substring(0, 200),
        scheduled_start_time: stream.snippet.scheduledStartTime,
        thumbnail_url: stream.snippet.thumbnails.high.url,
        status: 'scheduled',
        created_by: 'admin',
      }, {
        onConflict: 'youtube_broadcast_id'
      })
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      streamsFound: geoStreams.length,
      message: `Synced ${geoStreams.length} upcoming streams` 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getActiveStream(supabase: any) {
  // Get current live or upcoming stream for Geospatial Technology Unlocked
  const { data: streams, error } = await supabase
    .from('youtube_live_schedule')
    .select('*')
    .in('status', ['scheduled', 'live'])
    .ilike('title', '%geospatial technology unlocked%')
    .order('scheduled_start_time', { ascending: true })
    .limit(1)

  if (error) throw error

  const activeStream = streams?.[0] || null

  return new Response(
    JSON.stringify({ success: true, stream: activeStream }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createLiveStream(supabase: any, body: any) {
  const { title, description, scheduled_start_time, privacy_status = 'unlisted' } = body

  // Get YouTube OAuth token
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token')
    .eq('user_id', 'admin')
    .single()

  if (tokenError || !tokenData?.access_token) {
    throw new Error('YouTube OAuth not configured')
  }

  // Create YouTube Live Stream with Ultra Low Latency
  const streamResponse = await fetch(
    'https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn,status',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          title: `${title} - Stream`,
        },
        cdn: {
          format: '1080p',
          ingestionType: 'rtmp',
          frameRate: 'variable',
          resolution: 'variable',
        },
        status: {
          streamStatus: 'active',
        },
      }),
    }
  )

  if (!streamResponse.ok) {
    throw new Error(`Failed to create YouTube stream: ${streamResponse.statusText}`)
  }

  const stream = await streamResponse.json()

  // Create YouTube Live Broadcast with Ultra Low Latency
  const broadcastResponse = await fetch(
    'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          title,
          description,
          scheduledStartTime: scheduled_start_time,
        },
        status: {
          privacyStatus: privacy_status,
          lifeCycleStatus: 'ready',
          selfDeclaredMadeForKids: false,
        },
        contentDetails: {
          enableDvr: true,
          enableContentEncryption: false,
          enableEmbed: true,
          recordFromStart: true,
          startWithSlate: false,
          latencyPreference: 'ultraLow',
        },
      }),
    }
  )

  if (!broadcastResponse.ok) {
    throw new Error(`Failed to create YouTube broadcast: ${broadcastResponse.statusText}`)
  }

  const broadcast = await broadcastResponse.json()

  // Bind broadcast to stream
  const bindResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${broadcast.id}&streamId=${stream.id}&part=id,status`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    }
  )

  if (!bindResponse.ok) {
    throw new Error(`Failed to bind stream to broadcast: ${bindResponse.statusText}`)
  }

  // Save to database
  const { error: dbError } = await supabase
    .from('youtube_live_schedule')
    .insert({
      youtube_broadcast_id: broadcast.id,
      youtube_stream_id: stream.id,
      title,
      description,
      scheduled_start_time,
      status: 'scheduled',
      rtmp_url: stream.cdn.ingestionInfo.ingestionAddress,
      stream_key: stream.cdn.ingestionInfo.streamName,
      created_by: 'admin',
      thumbnail_url: `https://img.youtube.com/vi/${broadcast.id}/maxresdefault.jpg`,
    })

  if (dbError) throw dbError

  return new Response(
    JSON.stringify({ 
      success: true, 
      broadcast_id: broadcast.id,
      stream_key: stream.cdn.ingestionInfo.streamName,
      rtmp_url: stream.cdn.ingestionInfo.ingestionAddress,
      message: 'Ultra Low Latency stream created successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function startLiveStream(supabase: any, body: any) {
  const { schedule_id } = body

  // Get stream details
  const { data: stream, error } = await supabase
    .from('youtube_live_schedule')
    .select('*')
    .eq('id', schedule_id)
    .single()

  if (error || !stream) throw new Error('Stream not found')

  // Get YouTube OAuth token
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token')
    .eq('user_id', 'admin')
    .single()

  if (tokenError || !tokenData?.access_token) {
    throw new Error('YouTube OAuth not configured')
  }

  // Start YouTube Live Broadcast
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?broadcastStatus=live&id=${stream.youtube_broadcast_id}&part=id`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to start YouTube stream: ${response.statusText}`)
  }

  // Update database
  await supabase
    .from('youtube_live_schedule')
    .update({
      status: 'live',
      actual_start_time: new Date().toISOString(),
    })
    .eq('id', schedule_id)

  return new Response(
    JSON.stringify({ success: true, message: 'Stream started successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function endLiveStream(supabase: any, body: any) {
  const { schedule_id } = body

  // Get stream details
  const { data: stream, error } = await supabase
    .from('youtube_live_schedule')
    .select('*')
    .eq('id', schedule_id)
    .single()

  if (error || !stream) throw new Error('Stream not found')

  // Get YouTube OAuth token
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token')
    .eq('user_id', 'admin')
    .single()

  if (tokenError || !tokenData?.access_token) {
    throw new Error('YouTube OAuth not configured')
  }

  // End YouTube Live Broadcast
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?broadcastStatus=complete&id=${stream.youtube_broadcast_id}&part=id`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to end YouTube stream: ${response.statusText}`)
  }

  // Update database
  await supabase
    .from('youtube_live_schedule')
    .update({
      status: 'ended',
      actual_end_time: new Date().toISOString(),
    })
    .eq('id', schedule_id)

  // Check for recording after 2 minutes
  setTimeout(async () => {
    await checkForRecording(supabase, stream, tokenData.access_token)
  }, 120000)

  return new Response(
    JSON.stringify({ success: true, message: 'Stream ended successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function manualRefresh(supabase: any) {
  console.log('Manual refresh triggered')
  return await syncUpcomingStreams(supabase)
}

async function refreshAccessToken(supabase: any, refreshToken: string) {
  try {
    const clientId = Deno.env.get('YOUTUBE_CLIENT_ID')
    const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET')

    if (!clientId || !clientSecret) return false

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) return false

    const tokens = await response.json()

    // Update token in database
    await supabase
      .from('youtube_oauth_tokens')
      .update({
        access_token: tokens.access_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', 'admin')

    return true
  } catch (error) {
    console.error('Error refreshing token:', error)
    return false
  }
}

async function updateStreamDetails(supabase: any, body: any) {
  const { schedule_id, title, description, scheduled_start_time } = body

  // Get stream details
  const { data: stream, error } = await supabase
    .from('youtube_live_schedule')
    .select('*')
    .eq('id', schedule_id)
    .single()

  if (error || !stream) throw new Error('Stream not found')

  // Get YouTube OAuth token
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token')
    .eq('user_id', 'admin')
    .single()

  if (tokenError || !tokenData?.access_token) {
    throw new Error('YouTube OAuth not configured')
  }

  // Update YouTube broadcast
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet&id=${stream.youtube_broadcast_id}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: stream.youtube_broadcast_id,
        snippet: {
          title,
          description,
          scheduledStartTime: scheduled_start_time,
          categoryId: '27', // Education category
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to update YouTube broadcast: ${response.statusText}`)
  }

  // Update database
  await supabase
    .from('youtube_live_schedule')
    .update({
      title,
      description,
      scheduled_start_time,
      updated_at: new Date().toISOString(),
    })
    .eq('id', schedule_id)

  return new Response(
    JSON.stringify({ success: true, message: 'Stream details updated successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function overrideStream(supabase: any, body: any) {
  const { youtube_video_id, title, description } = body

  // Verify the YouTube video exists and get details
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token')
    .eq('user_id', 'admin')
    .single()

  if (tokenError || !tokenData?.access_token) {
    throw new Error('YouTube OAuth not configured')
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${youtube_video_id}`,
    {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch YouTube video details')
  }

  const data = await response.json()
  const video = data.items?.[0]

  if (!video) {
    throw new Error('YouTube video not found')
  }

  // Override current active stream
  await supabase
    .from('youtube_live_schedule')
    .update({ status: 'overridden' })
    .in('status', ['scheduled', 'live'])
    .ilike('title', '%geospatial technology unlocked%')

  // Create new override entry
  const { error: dbError } = await supabase
    .from('youtube_live_schedule')
    .insert({
      youtube_broadcast_id: youtube_video_id,
      title: title || video.snippet.title,
      description: description || video.snippet.description?.substring(0, 200),
      scheduled_start_time: video.liveStreamingDetails?.scheduledStartTime || new Date().toISOString(),
      thumbnail_url: video.snippet.thumbnails?.high?.url,
      status: 'live',
      created_by: 'admin',
      is_override: true,
    })

  if (dbError) throw dbError

  return new Response(
    JSON.stringify({ success: true, message: 'Stream override successful' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function checkStreamStatus(supabase: any, body: any) {
  const { schedule_id } = body

  // Get stream details
  const { data: stream, error } = await supabase
    .from('youtube_live_schedule')
    .select('*')
    .eq('id', schedule_id)
    .single()

  if (error || !stream) throw new Error('Stream not found')

  // Get YouTube OAuth token
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token')
    .eq('user_id', 'admin')
    .single()

  if (tokenError || !tokenData?.access_token) {
    return new Response(
      JSON.stringify({ success: true, status: stream.status, live: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check YouTube Live status
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=status&id=${stream.youtube_broadcast_id}`,
    {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    }
  )

  if (!response.ok) {
    return new Response(
      JSON.stringify({ success: true, status: stream.status, live: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const data = await response.json()
  const broadcast = data.items?.[0]
  const isLive = broadcast?.status?.lifeCycleStatus === 'live'

  // Update database if status changed
  if (isLive && stream.status !== 'live') {
    await supabase
      .from('youtube_live_schedule')
      .update({
        status: 'live',
        actual_start_time: new Date().toISOString(),
      })
      .eq('id', schedule_id)
  } else if (!isLive && stream.status === 'live') {
    await supabase
      .from('youtube_live_schedule')
      .update({
        status: 'ended',
        actual_end_time: new Date().toISOString(),
      })
      .eq('id', schedule_id)

    // Check for recording after stream ends
    setTimeout(async () => {
      await checkForRecording(supabase, stream, tokenData.access_token)
    }, 120000)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      status: isLive ? 'live' : stream.status,
      live: isLive,
      lifecycle_status: broadcast?.status?.lifeCycleStatus 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function checkForRecording(supabase: any, stream: any, accessToken: string) {
  try {
    console.log(`Checking for recording: ${stream.youtube_broadcast_id}`)
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=status,snippet&id=${stream.youtube_broadcast_id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) return

    const data = await response.json()
    const video = data.items?.[0]

    if (video && video.status.uploadStatus === 'processed') {
      // Update YouTube schedule
      await supabase
        .from('youtube_live_schedule')
        .update({
          recording_available: true,
          recording_url: `https://www.youtube.com/watch?v=${stream.youtube_broadcast_id}`,
        })
        .eq('id', stream.id)

      // Add to class recordings with unlisted privacy for Professional Plan only
      await supabase
        .from('class_recordings')
        .insert({
          title: video.snippet?.title || stream.title,
          description: video.snippet?.description || stream.description,
          youtube_url: `https://www.youtube.com/watch?v=${stream.youtube_broadcast_id}`,
          thumbnail_url: video.snippet?.thumbnails?.high?.url || stream.thumbnail_url,
          is_public: false, // Keep unlisted but embedded for Professional Plan
          created_by: 'admin',
        })
        
      console.log(`Recording processed for: ${stream.title}`)
    }
  } catch (error) {
    console.error('Error checking for recording:', error)
  }
}