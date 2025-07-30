import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Pre-stream validation and connectivity check
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Running pre-stream validation check...')
    
    const results = {
      timestamp: new Date().toISOString(),
      apiCredentials: await checkAPICredentials(),
      youtubeConnection: await checkYouTubeConnection(),
      databaseSync: await checkDatabaseSync(supabase),
      realTimeDetection: await testRealTimeDetection(supabase),
      failoverStatus: await checkFailoverSystems(supabase)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pre-stream validation complete',
        results,
        readyForStream: Object.values(results).every(r => r.status === 'ok')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Pre-stream validation failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function checkAPICredentials() {
  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID')
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')
    
    if (!apiKey || !channelId || !googleClientId) {
      return {
        status: 'error',
        message: 'Missing required API credentials',
        details: {
          hasApiKey: !!apiKey,
          hasChannelId: !!channelId,
          hasGoogleClientId: !!googleClientId
        }
      }
    }

    return {
      status: 'ok',
      message: 'All API credentials present',
      details: {
        apiKeyLength: apiKey.length,
        channelIdLength: channelId.length
      }
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to check credentials',
      error: error.message
    }
  }
}

async function checkYouTubeConnection() {
  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID')
    
    if (!apiKey || !channelId) {
      return {
        status: 'error',
        message: 'YouTube credentials missing'
      }
    }

    // Test YouTube API connectivity
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) {
      return {
        status: 'error',
        message: `YouTube API error: ${response.status}`,
        statusCode: response.status
      }
    }

    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return {
        status: 'error',
        message: 'Channel not found or not accessible'
      }
    }

    return {
      status: 'ok',
      message: 'YouTube API connection successful',
      channelTitle: data.items[0].snippet.title,
      channelId: data.items[0].id
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'YouTube connection failed',
      error: error.message
    }
  }
}

async function checkDatabaseSync(supabase: any) {
  try {
    // Check if we can read from live_classes
    const { data: liveClasses, error: liveError } = await supabase
      .from('live_classes')
      .select('id, title, status')
      .limit(5)
    
    if (liveError) {
      return {
        status: 'error',
        message: 'Cannot read from live_classes table',
        error: liveError.message
      }
    }

    // Check if we can read from live_stream_detection
    const { data: detections, error: detectionError } = await supabase
      .from('live_stream_detection')
      .select('id, youtube_id, is_live')
      .limit(5)
    
    if (detectionError) {
      return {
        status: 'error',
        message: 'Cannot read from live_stream_detection table',
        error: detectionError.message
      }
    }

    return {
      status: 'ok',
      message: 'Database connectivity confirmed',
      liveClassCount: liveClasses?.length || 0,
      detectionCount: detections?.length || 0
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Database check failed',
      error: error.message
    }
  }
}

async function testRealTimeDetection(supabase: any) {
  try {
    // Trigger real-time detection function
    const { data, error } = await supabase.functions.invoke('real-time-stream-detector')
    
    if (error) {
      return {
        status: 'error',
        message: 'Real-time detection function failed',
        error: error.message
      }
    }

    return {
      status: 'ok',
      message: 'Real-time detection working',
      response: data
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Cannot trigger real-time detection',
      error: error.message
    }
  }
}

async function checkFailoverSystems(supabase: any) {
  try {
    // Test YouTube auto-sync fallback
    const { data, error } = await supabase.functions.invoke('youtube-auto-sync')
    
    let syncStatus = 'ok'
    let syncMessage = 'YouTube auto-sync working'
    
    if (error) {
      syncStatus = 'warning'
      syncMessage = 'YouTube auto-sync has issues but failover available'
    }

    return {
      status: syncStatus,
      message: syncMessage,
      hasFailover: true,
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'warning',
      message: 'Some failover systems may be impacted',
      error: error.message
    }
  }
}