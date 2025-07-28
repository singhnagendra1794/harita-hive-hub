import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StreamConfig {
  title: string
  description: string
  scheduledStartTime?: string
  privacy: 'public' | 'unlisted' | 'private'
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

    const { config }: { config: StreamConfig } = await req.json()
    
    console.log('Auto-creating YouTube stream with config:', config)

    // Get super admin OAuth token
    const { data: superAdmin } = await supabase.auth.admin.listUsers()
    const superAdminUser = superAdmin?.users?.find(user => user.email === 'contact@haritahive.com')
    
    if (!superAdminUser) {
      throw new Error('Super admin user not found')
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from('youtube_oauth_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', superAdminUser.id)
      .single()

    if (tokenError || !tokenData?.access_token || tokenData.access_token === 'placeholder_access_token') {
      throw new Error('YouTube OAuth not configured. Please complete OAuth setup first.')
    }

    // Check if token is expired and refresh if needed
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    
    let accessToken = tokenData.access_token
    
    if (now >= expiresAt) {
      console.log('Access token expired, refreshing...')
      accessToken = await refreshAccessToken(supabase, tokenData.refresh_token, superAdminUser.id)
    }

    // Step 1: Create YouTube Live Stream
    const streamResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            title: `${config.title} - Stream`,
            description: 'Auto-generated live stream for HaritaHive'
          },
          cdn: {
            format: '1080p',
            ingestionType: 'rtmp',
            frameRate: 'variable',
            resolution: 'variable'
          },
          status: {
            streamStatus: 'active'
          }
        })
      }
    )

    if (!streamResponse.ok) {
      const error = await streamResponse.text()
      throw new Error(`Failed to create YouTube stream: ${error}`)
    }

    const stream = await streamResponse.json()
    console.log('YouTube stream created:', stream.id)

    // Step 2: Create YouTube Live Broadcast
    const broadcastResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            title: config.title,
            description: config.description,
            scheduledStartTime: config.scheduledStartTime || new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
          },
          status: {
            privacyStatus: config.privacy,
            lifeCycleStatus: 'ready',
            selfDeclaredMadeForKids: false
          },
          contentDetails: {
            enableDvr: true,
            enableContentEncryption: false,
            enableEmbed: true,
            recordFromStart: true,
            startWithSlate: false,
            latencyPreference: 'ultraLow'
          }
        })
      }
    )

    if (!broadcastResponse.ok) {
      const error = await broadcastResponse.text()
      throw new Error(`Failed to create YouTube broadcast: ${error}`)
    }

    const broadcast = await broadcastResponse.json()
    console.log('YouTube broadcast created:', broadcast.id)

    // Step 3: Bind stream to broadcast
    const bindResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${broadcast.id}&streamId=${stream.id}&part=id,status`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    )

    if (!bindResponse.ok) {
      const error = await bindResponse.text()
      throw new Error(`Failed to bind stream to broadcast: ${error}`)
    }

    console.log('Stream bound to broadcast successfully')

    // Step 4: Store in HaritaHive database
    const { error: dbError } = await supabase
      .from('youtube_live_schedule')
      .insert({
        youtube_broadcast_id: broadcast.id,
        youtube_stream_id: stream.id,
        title: config.title,
        description: config.description,
        scheduled_start_time: broadcast.snippet.scheduledStartTime,
        status: 'scheduled',
        rtmp_url: stream.cdn.ingestionInfo.ingestionAddress,
        stream_key: stream.cdn.ingestionInfo.streamName,
        thumbnail_url: `https://img.youtube.com/vi/${broadcast.id}/maxresdefault.jpg`,
        created_by: superAdminUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    // Step 5: Create entry in live_classes for immediate availability
    const { error: liveClassError } = await supabase
      .from('live_classes')
      .insert({
        title: config.title,
        description: config.description,
        starts_at: broadcast.snippet.scheduledStartTime,
        status: 'scheduled',
        youtube_url: `https://www.youtube.com/watch?v=${broadcast.id}`,
        embed_url: `https://www.youtube-nocookie.com/embed/${broadcast.id}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`,
        thumbnail_url: `https://img.youtube.com/vi/${broadcast.id}/maxresdefault.jpg`,
        instructor: 'Auto-Generated',
        access_tier: 'professional', // Restrict to professional plan
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (liveClassError) {
      console.error('Live class creation error:', liveClassError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        broadcast_id: broadcast.id,
        stream_id: stream.id,
        rtmp_url: stream.cdn.ingestionInfo.ingestionAddress,
        stream_key: stream.cdn.ingestionInfo.streamName,
        youtube_url: `https://www.youtube.com/watch?v=${broadcast.id}`,
        embed_url: `https://www.youtube-nocookie.com/embed/${broadcast.id}`,
        message: 'YouTube live stream created and configured automatically'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Auto-create stream error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

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

  // Update token in database
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