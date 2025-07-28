import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CourseStreamConfig {
  dayNumber?: number
  manualTitle?: string
  manualDescription?: string
  scheduledTime?: string
  thumbnailUrl?: string
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

    const { action, config }: { action: string, config?: CourseStreamConfig } = await req.json()
    console.log('YouTube Course Automation:', action, config)

    switch (action) {
      case 'create_from_schedule':
        return await createStreamFromSchedule(supabase, config)
      case 'auto_create_next_session':
        return await autoCreateNextSession(supabase)
      case 'get_next_scheduled':
        return await getNextScheduledSession(supabase)
      case 'bulk_create_week':
        return await bulkCreateWeekSessions(supabase)
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Course automation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function createStreamFromSchedule(supabase: any, config?: CourseStreamConfig) {
  // Get course schedule data
  let scheduleData: any

  if (config?.dayNumber) {
    const { data, error } = await supabase
      .from('geova_teaching_schedule')
      .select('*')
      .eq('day_number', config.dayNumber)
      .single()
    
    if (error) throw new Error(`Course schedule not found for day ${config.dayNumber}`)
    scheduleData = data
  } else {
    // Get next upcoming session
    const { data, error } = await supabase
      .from('geova_teaching_schedule')
      .select('*')
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(1)
      .single()
    
    if (error) throw new Error('No upcoming course sessions found')
    scheduleData = data
  }

  // Prepare stream configuration
  const streamTitle = config?.manualTitle || 
    `Day ${scheduleData.day_number} – ${scheduleData.topic_title}`
  
  const streamDescription = config?.manualDescription || 
    `${scheduleData.topic_description}\n\nLearning Objectives:\n${scheduleData.learning_objectives?.join('\n• ') || 'Interactive learning session'}\n\nPart of the Geospatial Technology Unlocked course by HaritaHive.`

  const scheduledStartTime = config?.scheduledTime || 
    new Date(`${scheduleData.scheduled_date}T${scheduleData.scheduled_time || '05:00:00'}.000Z`).toISOString()

  // Get super admin OAuth token
  const { data: superAdmin } = await supabase.auth.admin.listUsers()
  const superAdminUser = superAdmin?.users?.find((user: any) => user.email === 'contact@haritahive.com')
  
  if (!superAdminUser) {
    throw new Error('Super admin user not found')
  }

  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', superAdminUser.id)
    .single()

  if (tokenError || !tokenData?.access_token) {
    throw new Error('YouTube OAuth not configured. Please complete OAuth setup first.')
  }

  // Check and refresh token if needed
  let accessToken = tokenData.access_token
  const now = new Date()
  const expiresAt = new Date(tokenData.expires_at)
  
  if (now >= expiresAt) {
    accessToken = await refreshAccessToken(supabase, tokenData.refresh_token, superAdminUser.id)
  }

  // Create YouTube Live Stream
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
          title: `${streamTitle} - Stream`,
          description: 'HaritaHive Live Stream'
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

  // Create YouTube Live Broadcast
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
          title: streamTitle,
          description: streamDescription,
          scheduledStartTime: scheduledStartTime,
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en'
        },
        status: {
          privacyStatus: 'unlisted', // As requested
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

  // Bind stream to broadcast
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

  // Store in database
  const { error: dbError } = await supabase
    .from('youtube_live_schedule')
    .insert({
      youtube_broadcast_id: broadcast.id,
      youtube_stream_id: stream.id,
      title: streamTitle,
      description: streamDescription,
      scheduled_start_time: scheduledStartTime,
      status: 'scheduled',
      rtmp_url: stream.cdn.ingestionInfo.ingestionAddress,
      stream_key: stream.cdn.ingestionInfo.streamName,
      thumbnail_url: config?.thumbnailUrl || `https://img.youtube.com/vi/${broadcast.id}/maxresdefault.jpg`,
      created_by: superAdminUser.id,
      course_day_number: scheduleData.day_number,
      course_schedule_id: scheduleData.id
    })

  if (dbError) throw dbError

  // Create entry in live_classes
  const { error: liveClassError } = await supabase
    .from('live_classes')
    .insert({
      title: streamTitle,
      description: streamDescription,
      starts_at: scheduledStartTime,
      status: 'scheduled',
      youtube_url: `https://www.youtube.com/watch?v=${broadcast.id}`,
      embed_url: `https://www.youtube-nocookie.com/embed/${broadcast.id}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&fs=0&disablekb=1`,
      thumbnail_url: config?.thumbnailUrl || `https://img.youtube.com/vi/${broadcast.id}/maxresdefault.jpg`,
      instructor: 'GEOVA AI',
      access_tier: 'professional', // Professional Plan only
      course_name: 'Geospatial Technology Unlocked',
      course_day: scheduleData.day_number
    })

  if (liveClassError) {
    console.error('Live class creation error:', liveClassError)
  }

  // Update schedule status
  await supabase
    .from('geova_teaching_schedule')
    .update({ 
      status: 'youtube_created',
      session_id: broadcast.id
    })
    .eq('id', scheduleData.id)

  return new Response(
    JSON.stringify({
      success: true,
      broadcast_id: broadcast.id,
      stream_id: stream.id,
      title: streamTitle,
      description: streamDescription,
      scheduled_start_time: scheduledStartTime,
      rtmp_url: stream.cdn.ingestionInfo.ingestionAddress,
      stream_key: stream.cdn.ingestionInfo.streamName,
      youtube_url: `https://www.youtube.com/watch?v=${broadcast.id}`,
      embed_url: `https://www.youtube-nocookie.com/embed/${broadcast.id}`,
      course_day: scheduleData.day_number,
      message: 'Course-based YouTube Live stream created successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function autoCreateNextSession(supabase: any) {
  // Get next 7 days of sessions that don't have YouTube streams yet
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 7)

  const { data: upcomingSessions, error } = await supabase
    .from('geova_teaching_schedule')
    .select('*')
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .lte('scheduled_date', endDate.toISOString().split('T')[0])
    .is('session_id', null)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true })
    .limit(5) // Limit to 5 sessions to avoid quota issues

  if (error) throw error

  const results = []
  for (const session of upcomingSessions) {
    try {
      const response = await createStreamFromSchedule(supabase, { dayNumber: session.day_number })
      const data = await response.json()
      results.push({
        day: session.day_number,
        title: session.topic_title,
        success: true,
        broadcast_id: data.broadcast_id
      })
    } catch (error) {
      results.push({
        day: session.day_number,
        title: session.topic_title,
        success: false,
        error: error.message
      })
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      created_sessions: results.filter(r => r.success).length,
      failed_sessions: results.filter(r => !r.success).length,
      results
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getNextScheduledSession(supabase: any) {
  const { data, error } = await supabase
    .from('geova_teaching_schedule')
    .select('*')
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true })
    .limit(5)

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      upcoming_sessions: data
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function bulkCreateWeekSessions(supabase: any) {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 7)

  const { data: weekSessions, error } = await supabase
    .from('geova_teaching_schedule')
    .select('*')
    .gte('scheduled_date', startDate.toISOString().split('T')[0])
    .lte('scheduled_date', endDate.toISOString().split('T')[0])
    .is('session_id', null)
    .order('scheduled_date', { ascending: true })

  if (error) throw error

  const results = []
  for (const session of weekSessions) {
    try {
      const response = await createStreamFromSchedule(supabase, { dayNumber: session.day_number })
      const data = await response.json()
      results.push({
        day: session.day_number,
        title: session.topic_title,
        success: true,
        broadcast_id: data.broadcast_id
      })
    } catch (error) {
      results.push({
        day: session.day_number,
        title: session.topic_title,
        success: false,
        error: error.message
      })
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      total_sessions: weekSessions.length,
      created_sessions: results.filter(r => r.success).length,
      failed_sessions: results.filter(r => !r.success).length,
      results
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