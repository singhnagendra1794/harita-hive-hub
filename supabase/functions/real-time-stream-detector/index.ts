import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Real-time stream detection that runs every 10 seconds
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Starting real-time stream detection...')
    
    // Multi-layer detection strategy
    await Promise.all([
      detectViaYouTubeAPI(supabase),
      detectViaEmbedFailover(supabase),
      detectViaChannelScraping(supabase)
    ])

    return new Response(
      JSON.stringify({ success: true, message: 'Real-time detection complete' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Real-time detection error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Method 1: YouTube API detection (primary)
async function detectViaYouTubeAPI(supabase: any) {
  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID')
    
    if (!apiKey || !channelId) {
      console.log('⚠️ YouTube API credentials missing, skipping API detection')
      return
    }

    console.log(`🔍 Checking YouTube API for channel: ${channelId}`)

    // First check for scheduled upcoming streams  
    const upcomingResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&channelId=${channelId}&eventType=upcoming&type=video&key=${apiKey}&maxResults=10`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (upcomingResponse.ok) {
      const upcomingData = await upcomingResponse.json()
      console.log(`📅 Found ${upcomingData.items?.length || 0} upcoming streams`)
      
      for (const item of upcomingData.items || []) {
        const videoId = item.id.videoId
        const title = item.snippet.title
        const description = item.snippet.description
        const thumbnail = item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url
        const scheduledStart = item.snippet.publishedAt

        // Check if stream should be starting soon (within 30 minutes)
        const now = new Date()
        const startTime = new Date(scheduledStart)
        const timeDiff = startTime.getTime() - now.getTime()
        
        const status = (timeDiff <= 30 * 60 * 1000 && timeDiff >= -5 * 60 * 1000) ? 'live' : 'scheduled'

        await upsertLiveStream(supabase, {
          youtube_id: videoId,
          title,
          description,
          thumbnail_url: thumbnail,
          embed_url: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1`,
          is_live: status === 'live',
          scheduled_start: scheduledStart,
          detection_method: 'youtube_api_upcoming'
        })
        
        console.log(`📋 API found upcoming: ${title} (${status})`)
      }
    }

    // Then check for currently live broadcasts
    const liveResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}&maxResults=5`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!liveResponse.ok) {
      console.error(`❌ YouTube live API error: ${liveResponse.status}`)
      return
    }

    const liveData = await liveResponse.json()
    console.log(`🔴 Found ${liveData.items?.length || 0} live streams`)
    
    for (const item of liveData.items || []) {
      const videoId = item.id.videoId
      const title = item.snippet.title
      const description = item.snippet.description
      const thumbnail = item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url

      await upsertLiveStream(supabase, {
        youtube_id: videoId,
        title,
        description,
        thumbnail_url: thumbnail,
        embed_url: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1`,
        is_live: true,
        detection_method: 'youtube_api_live'
      })
      
      console.log(`✅ API detected LIVE stream: ${title}`)
    }
  } catch (error) {
    console.error('❌ YouTube API detection failed:', error)
  }
}

// Method 2: Embed failover detection
async function detectViaEmbedFailover(supabase: any) {
  try {
    const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID')
    if (!channelId) return

    // Common live stream IDs to check (you can expand this list)
    const possibleStreamIds = [
      'live', // YouTube sometimes uses this for live streams
      'watch?v=live',
      // Add any specific video IDs you commonly use
    ]

    for (const streamId of possibleStreamIds) {
      try {
        const embedUrl = `https://www.youtube-nocookie.com/embed/${streamId}`
        
        // Check if embed is accessible
        const response = await fetch(embedUrl, { 
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HaritaHive/1.0)' }
        })
        
        if (response.ok) {
          await upsertLiveStream(supabase, {
            youtube_id: streamId,
            title: 'Live Stream - Auto Detected',
            description: 'Automatically detected live stream via embed failover',
            embed_url: embedUrl,
            is_live: true,
            detection_method: 'embed_failover'
          })
          
          console.log(`✅ Embed failover detected stream: ${streamId}`)
        }
      } catch (error) {
        // Silent fail for embed checks
      }
    }
  } catch (error) {
    console.error('❌ Embed failover detection failed:', error)
  }
}

// Method 3: Channel page scraping (last resort)
async function detectViaChannelScraping(supabase: any) {
  try {
    const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID')
    if (!channelId) return

    const response = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HaritaHive/1.0)' }
    })

    if (response.ok) {
      const html = await response.text()
      
      // Look for video ID in the HTML
      const videoIdMatch = html.match(/"videoId":"([^"]+)"/);
      const titleMatch = html.match(/"title":"([^"]+)"/);
      
      if (videoIdMatch && titleMatch) {
        const videoId = videoIdMatch[1]
        const title = titleMatch[1].replace(/\\u[\dA-F]{4}/gi, (match) => 
          String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
        )

        await upsertLiveStream(supabase, {
          youtube_id: videoId,
          title: title || 'Live Stream - Channel Detected',
          description: 'Detected via channel page scraping',
          embed_url: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1`,
          is_live: true,
          detection_method: 'channel_scraping'
        })
        
        console.log(`✅ Channel scraping detected: ${title}`)
      }
    }
  } catch (error) {
    console.error('❌ Channel scraping detection failed:', error)
  }
}

// Helper function to upsert live stream
async function upsertLiveStream(supabase: any, streamData: any) {
  try {
    // First update detection table (triggers will handle live_classes)
    const { error: detectionError } = await supabase
      .from('live_stream_detection')
      .upsert({
        youtube_id: streamData.youtube_id,
        title: streamData.title,
        description: streamData.description,
        embed_url: streamData.embed_url,
        thumbnail_url: streamData.thumbnail_url,
        is_live: streamData.is_live,
        last_checked: new Date().toISOString()
      }, { 
        onConflict: 'youtube_id'
      })

    if (detectionError) {
      console.error('Detection upsert error:', detectionError)
    }

    // Also directly update live_classes for immediate real-time effect
    const currentTime = new Date().toISOString()
    const scheduledTime = streamData.scheduled_start || currentTime
    
    const { error: classError } = await supabase
      .from('live_classes')
      .upsert({
        stream_key: streamData.youtube_id,
        title: streamData.title,
        description: streamData.description,
        youtube_url: `https://www.youtube.com/watch?v=${streamData.youtube_id}`,
        embed_url: streamData.embed_url,
        thumbnail_url: streamData.thumbnail_url,
        status: streamData.is_live ? 'live' : 'scheduled',
        starts_at: scheduledTime,
        access_tier: 'professional',
        viewer_count: 0,
        instructor: 'HaritaHive Team',
        created_by: '00000000-0000-0000-0000-000000000000', // System user
        updated_at: currentTime
      }, { 
        onConflict: 'stream_key'
      })

    if (classError) {
      console.error('Live class upsert error:', classError)
    }

    console.log(`💾 Upserted stream: ${streamData.title} via ${streamData.detection_method}`)
  } catch (error) {
    console.error('Upsert error:', error)
  }
}