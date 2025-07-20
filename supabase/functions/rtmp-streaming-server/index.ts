import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const url = new URL(req.url)
    const streamKey = url.searchParams.get('key') || url.pathname.split('/').pop()
    
    console.log(`RTMP Server - Request: ${req.method} ${url.pathname}`, { streamKey })

    // Validate stream key
    if (!streamKey || streamKey === 'rtmp-streaming-server') {
      return new Response(
        JSON.stringify({ error: 'Stream key required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify stream key exists and is active
    const { data: keyData, error: keyError } = await supabase
      .from('stream_keys')
      .select('user_id, stream_key')
      .eq('stream_key', streamKey)
      .eq('is_active', true)
      .single()

    if (keyError || !keyData) {
      console.log('Invalid stream key:', streamKey)
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive stream key' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Handle different streaming operations
    if (req.method === 'POST') {
      // Start/publish stream
      const contentType = req.headers.get('content-type') || ''
      
      if (contentType.includes('application/x-flv') || contentType.includes('video/')) {
        // This is actual video data from OBS
        console.log('Receiving video stream data for key:', streamKey)
        
        // Update or create active session
        const { data: sessionData } = await supabase
          .from('stream_sessions')
          .select('id')
          .eq('user_id', keyData.user_id)
          .eq('status', 'preparing')
          .single()

        if (sessionData) {
          // Update session to live
          await supabase
            .from('stream_sessions')
            .update({ 
              status: 'live',
              started_at: new Date().toISOString(),
              viewer_count: 0
            })
            .eq('id', sessionData.id)
        } else {
          // Create new session
          await supabase
            .from('stream_sessions')
            .insert({
              user_id: keyData.user_id,
              title: 'Live Stream',
              status: 'live',
              started_at: new Date().toISOString(),
              rtmp_endpoint: `https://${req.headers.get('host')}/functions/v1/rtmp-streaming-server/${streamKey}`,
              hls_endpoint: `https://${req.headers.get('host')}/functions/v1/rtmp-streaming-server/hls/${streamKey}`
            })
        }

        // For now, we'll acknowledge the stream but in a real implementation,
        // you'd process and relay the video data
        return new Response('OK', {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        })
      } else {
        // JSON request to start stream
        const { data: sessionData } = await supabase
          .from('stream_sessions')
          .select('id')
          .eq('user_id', keyData.user_id)
          .eq('status', 'preparing')
          .single()

        if (sessionData) {
          await supabase
            .from('stream_sessions')
            .update({ 
              status: 'live',
              started_at: new Date().toISOString()
            })
            .eq('id', sessionData.id)
        }

        return new Response(
          JSON.stringify({ 
            message: 'Stream started',
            status: 'live',
            rtmp_url: `rtmp://${req.headers.get('host')}/live/${streamKey}`,
            hls_url: `https://${req.headers.get('host')}/functions/v1/rtmp-streaming-server/hls/${streamKey}`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    if (req.method === 'GET') {
      const path = url.pathname
      
      // HLS playlist endpoint
      if (path.includes('/hls/')) {
        const key = path.split('/hls/')[1]
        
        // Check if stream is live
        const { data: session } = await supabase
          .from('stream_sessions')
          .select('*')
          .eq('user_id', keyData.user_id)
          .eq('status', 'live')
          .single()

        if (!session) {
          return new Response('Stream not live', { status: 404 })
        }

        // Return HLS playlist (m3u8)
        const playlist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10.0,
segment000.ts
#EXTINF:10.0,
segment001.ts
#EXT-X-ENDLIST`

        return new Response(playlist, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Cache-Control': 'no-cache'
          }
        })
      }

      // Stream info/status endpoint
      const { data: session } = await supabase
        .from('stream_sessions')
        .select('*')
        .eq('user_id', keyData.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!session) {
        return new Response(
          JSON.stringify({ error: 'No stream session found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Return stream viewer page
      const viewerPage = `<!DOCTYPE html>
<html>
<head>
  <title>Live Stream - ${session.title || 'Harita Hive Stream'}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: #fff; 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      min-height: 100vh;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      text-align: center; 
    }
    .header {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .status { 
      display: inline-block;
      padding: 12px 24px; 
      background: ${session.status === 'live' ? '#e74c3c' : '#95a5a6'}; 
      border-radius: 25px; 
      margin-bottom: 20px; 
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .video-container {
      background: rgba(0,0,0,0.3);
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .stream-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
    .info-card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .info-card h3 {
      margin: 0 0 10px 0;
      color: #fff;
      font-size: 18px;
    }
    .info-card p {
      margin: 5px 0;
      opacity: 0.9;
    }
    .pulse {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎥 Harita Hive Live Stream</h1>
      <div class="status ${session.status === 'live' ? 'pulse' : ''}">
        ${session.status === 'live' ? '🔴 LIVE' : '⏸️ ' + session.status.toUpperCase()}
      </div>
      <h2>${session.title || 'Live Stream'}</h2>
      ${session.description ? `<p>${session.description}</p>` : ''}
    </div>
    
    <div class="video-container">
      ${session.status === 'live' ? 
        `<p>🎬 Stream is live and broadcasting!</p>
         <p>HLS URL: <code>https://${req.headers.get('host')}/functions/v1/rtmp-streaming-server/hls/${streamKey}</code></p>` : 
        '<p>Stream is not currently live</p>'
      }
    </div>

    <div class="stream-info">
      <div class="info-card">
        <h3>📊 Stream Details</h3>
        <p><strong>Status:</strong> ${session.status}</p>
        <p><strong>Viewers:</strong> ${session.viewer_count || 0}</p>
        <p><strong>Started:</strong> ${session.started_at ? new Date(session.started_at).toLocaleString() : 'Not started'}</p>
      </div>
      
      <div class="info-card">
        <h3>🔧 Technical Info</h3>
        <p><strong>Stream Key:</strong> ${streamKey.substring(0, 8)}...</p>
        <p><strong>RTMP Endpoint:</strong> Active</p>
        <p><strong>HLS Endpoint:</strong> ${session.status === 'live' ? 'Available' : 'Inactive'}</p>
      </div>
      
      <div class="info-card">
        <h3>📺 Platform</h3>
        <p><strong>Server:</strong> Harita Hive</p>
        <p><strong>Protocol:</strong> RTMP/HLS</p>
        <p><strong>Quality:</strong> Auto-adaptive</p>
      </div>
    </div>
  </div>

  <script>
    // Auto-refresh every 30 seconds if stream is live
    ${session.status === 'live' ? 'setTimeout(() => location.reload(), 30000);' : ''}
  </script>
</body>
</html>`

      return new Response(viewerPage, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      })
    }

    if (req.method === 'DELETE') {
      // Stop stream
      await supabase
        .from('stream_sessions')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('user_id', keyData.user_id)
        .eq('status', 'live')

      return new Response(
        JSON.stringify({ message: 'Stream stopped' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('RTMP streaming server error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})