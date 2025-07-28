import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Starting YouTube auto-sync...')

    // Get super admin for OAuth token
    const { data: superAdmin } = await supabase.auth.admin.listUsers()
    const superAdminUser = superAdmin?.users?.find(user => user.email === 'contact@haritahive.com')
    
    if (!superAdminUser) {
      throw new Error('Super admin user not found')
    }

    // Get OAuth token
    const { data: tokenData, error: tokenError } = await supabase
      .from('youtube_oauth_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', superAdminUser.id)
      .single()

    let accessToken = tokenData?.access_token
    
    // If no OAuth token, try using API key for public live streams
    if (tokenError || !tokenData?.access_token || tokenData.access_token === 'placeholder_access_token') {
      console.log('No OAuth token, using API key for public stream detection...')
      return await syncWithApiKey(supabase)
    }

    // Check if token needs refresh
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    
    if (now >= expiresAt) {
      console.log('Refreshing expired token...')
      accessToken = await refreshAccessToken(supabase, tokenData.refresh_token, superAdminUser.id)
    }

    // Step 1: Get all active/scheduled broadcasts
    const broadcastsResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,liveStreamingDetails&broadcastStatus=all&maxResults=50',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    )

    if (!broadcastsResponse.ok) {
      console.error('Failed to fetch broadcasts, falling back to API key method')
      return await syncWithApiKey(supabase)
    }

    const broadcastsData = await broadcastsResponse.json()
    const broadcasts = broadcastsData.items || []
    
    console.log(`Found ${broadcasts.length} broadcasts`)

    let syncedCount = 0
    let liveCount = 0

    // Step 2: Process each broadcast
    for (const broadcast of broadcasts) {
      try {
        const broadcastId = broadcast.id
        const status = broadcast.status.lifeCycleStatus
        const broadcastStatus = broadcast.status.broadcastStatus || 'unknown'
        
        console.log(`Processing broadcast ${broadcastId}: ${status}/${broadcastStatus}`)

        // Update youtube_live_schedule
        const { error: scheduleError } = await supabase
          .from('youtube_live_schedule')
          .upsert({
            youtube_broadcast_id: broadcastId,
            title: broadcast.snippet.title,
            description: broadcast.snippet.description?.substring(0, 500),
            scheduled_start_time: broadcast.snippet.scheduledStartTime || new Date().toISOString(),
            actual_start_time: broadcast.liveStreamingDetails?.actualStartTime,
            actual_end_time: broadcast.liveStreamingDetails?.actualEndTime,
            status: status === 'live' ? 'live' : status === 'complete' ? 'ended' : 'scheduled',
            thumbnail_url: broadcast.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${broadcastId}/maxresdefault.jpg`,
            created_by: superAdminUser.id,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'youtube_broadcast_id'
          })

        if (scheduleError) {
          console.error('Schedule update error:', scheduleError)
          continue
        }

        // Update or create live_classes entry
        if (status === 'live' || status === 'liveStarting') {
          liveCount++
          
          const { error: liveClassError } = await supabase
            .from('live_classes')
            .upsert({
              youtube_broadcast_id: broadcastId,
              title: broadcast.snippet.title,
              description: broadcast.snippet.description?.substring(0, 500),
              starts_at: broadcast.liveStreamingDetails?.actualStartTime || broadcast.snippet.scheduledStartTime,
              status: 'live',
              youtube_url: `https://www.youtube.com/watch?v=${broadcastId}`,
              embed_url: `https://www.youtube-nocookie.com/embed/${broadcastId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`,
              thumbnail_url: broadcast.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${broadcastId}/maxresdefault.jpg`,
              instructor: 'Live Session',
              access_tier: 'professional',
              viewer_count: broadcast.liveStreamingDetails?.concurrentViewers ? parseInt(broadcast.liveStreamingDetails.concurrentViewers) : 0,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'youtube_broadcast_id'
            })

          if (liveClassError) {
            console.error('Live class update error:', liveClassError)
          }
        } 
        // Handle completed streams - move to recordings
        else if (status === 'complete') {
          // Check if recording is available
          const videoResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=status,snippet&id=${broadcastId}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              }
            }
          )

          if (videoResponse.ok) {
            const videoData = await videoResponse.json()
            const video = videoData.items?.[0]

            if (video && video.status.uploadStatus === 'processed') {
              // Add to recordings table
              const { error: recordingError } = await supabase
                .from('live_recordings')
                .upsert({
                  youtube_broadcast_id: broadcastId,
                  title: video.snippet.title,
                  description: video.snippet.description?.substring(0, 500),
                  youtube_url: `https://www.youtube.com/watch?v=${broadcastId}`,
                  embed_url: `https://www.youtube-nocookie.com/embed/${broadcastId}?controls=1&rel=0&modestbranding=1`,
                  thumbnail_url: video.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${broadcastId}/maxresdefault.jpg`,
                  duration_seconds: null, // Could parse from video if needed
                  recorded_at: broadcast.liveStreamingDetails?.actualEndTime || new Date().toISOString(),
                  access_tier: 'professional',
                  is_public: false,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'youtube_broadcast_id'
                })

              if (recordingError) {
                console.error('Recording creation error:', recordingError)
              }

              // Update live_classes status to ended
              await supabase
                .from('live_classes')
                .update({ 
                  status: 'ended',
                  updated_at: new Date().toISOString()
                })
                .eq('youtube_broadcast_id', broadcastId)
            }
          }
        }

        syncedCount++
      } catch (error) {
        console.error(`Error processing broadcast ${broadcast.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedCount,
        live: liveCount,
        message: `Synced ${syncedCount} broadcasts, ${liveCount} currently live`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Auto-sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function syncWithApiKey(supabase: any) {
  const apiKey = Deno.env.get('YOUTUBE_API_KEY')
  
  if (!apiKey) {
    throw new Error('No YouTube API access available')
  }

  console.log('Syncing with API key...')

  // Search for live streams with relevant keywords
  const searchQueries = [
    'gis live',
    'geospatial live',
    'mapping live',
    'remote sensing live',
    'qgis live',
    'arcgis live'
  ]

  let foundStreams = 0

  for (const query of searchQueries) {
    try {
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&eventType=live&type=video&key=${apiKey}&maxResults=10`
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        
        if (searchData.items?.length > 0) {
          for (const item of searchData.items) {
            // Get detailed video info
            const videoResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,statistics&id=${item.id.videoId}&key=${apiKey}`
            )

            if (videoResponse.ok) {
              const videoData = await videoResponse.json()
              const video = videoData.items?.[0]

              if (video && video.liveStreamingDetails) {
                // Store in live_classes
                await supabase
                  .from('live_classes')
                  .upsert({
                    youtube_broadcast_id: video.id,
                    title: video.snippet.title,
                    description: video.snippet.description?.substring(0, 500),
                    starts_at: video.liveStreamingDetails.actualStartTime || new Date().toISOString(),
                    status: 'live',
                    youtube_url: `https://www.youtube.com/watch?v=${video.id}`,
                    embed_url: `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`,
                    thumbnail_url: video.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
                    instructor: 'Live Session',
                    access_tier: 'professional',
                    viewer_count: video.liveStreamingDetails.concurrentViewers ? parseInt(video.liveStreamingDetails.concurrentViewers) : 0,
                    updated_at: new Date().toISOString()
                  }, {
                    onConflict: 'youtube_broadcast_id'
                  })

                foundStreams++
                console.log(`Found and synced live stream: ${video.snippet.title}`)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error searching for "${query}":`, error)
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      synced: foundStreams,
      live: foundStreams,
      message: `Found and synced ${foundStreams} live streams using API key`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function refreshAccessToken(supabase: any, refreshToken: string, userId: string): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

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

  if (!response.ok) {
    throw new Error('Failed to refresh access token')
  }

  const tokens = await response.json()

  await supabase
    .from('youtube_oauth_tokens')
    .update({
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return tokens.access_token
}