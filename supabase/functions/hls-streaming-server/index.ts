import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  const url = new URL(req.url)
  const { pathname } = url

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Handle HLS manifest requests (.m3u8)
  if (pathname.endsWith('.m3u8')) {
    const streamKey = pathname.split('/')[1]
    
    if (!streamKey) {
      return new Response("Stream key required", { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Verify stream exists and is live
    const { data: keyData, error } = await supabase
      .from('stream_keys')
      .select('user_id')
      .eq('stream_key', streamKey)
      .eq('is_active', true)
      .single()

    if (error || !keyData) {
      return new Response("Stream not found", { 
        status: 404,
        headers: corsHeaders 
      })
    }

    // Generate HLS playlist
    const playlist = generateHLSPlaylist(streamKey)
    
    return new Response(playlist, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache',
      }
    })
  }

  // Handle segment requests (.ts)
  if (pathname.endsWith('.ts')) {
    const segmentId = pathname.split('/').pop()?.replace('.ts', '')
    
    // In a real implementation, you'd serve actual video segments
    // For now, return a placeholder response
    return new Response("Video segment not available", {
      status: 404,
      headers: corsHeaders
    })
  }

  // Handle stream viewer page
  if (pathname.startsWith('/watch/')) {
    const streamKey = pathname.split('/watch/')[1]
    
    if (!streamKey) {
      return new Response("Stream key required", { status: 400 })
    }

    // Verify stream exists
    const { data: keyData, error } = await supabase
      .from('stream_keys')
      .select('user_id')
      .eq('stream_key', streamKey)
      .eq('is_active', true)
      .single()

    if (error || !keyData) {
      return new Response("Stream not found", { status: 404 })
    }

    // Return HLS video player page
    const playerHTML = generateVideoPlayerHTML(streamKey)
    
    return new Response(playerHTML, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      }
    })
  }

  // Handle stream status endpoint
  if (pathname.startsWith('/status/')) {
    const streamKey = pathname.split('/status/')[1]
    
    const { data: sessionData } = await supabase
      .from('stream_sessions')
      .select('*')
      .eq('status', 'live')
      .limit(1)
      .single()

    return new Response(JSON.stringify({
      isLive: !!sessionData,
      session: sessionData || null,
      hlsUrl: `https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/hls-streaming-server/${streamKey}.m3u8`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      }
    })
  }

  // Default response with API info
  return new Response(
    JSON.stringify({
      message: 'HaritaHive HLS Streaming Server',
      endpoints: {
        playlist: '/{stream_key}.m3u8',
        segments: '/{stream_key}/{segment}.ts',
        watch: '/watch/{stream_key}',
        status: '/status/{stream_key}'
      },
      example: {
        hlsUrl: 'https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/hls-streaming-server/sk_haritahive_admin_2025_permanent.m3u8',
        watchUrl: 'https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/hls-streaming-server/watch/sk_haritahive_admin_2025_permanent'
      }
    }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  )
})

function generateHLSPlaylist(streamKey: string): string {
  const baseUrl = `https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/hls-streaming-server`
  
  return `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:EVENT

#EXTINF:10.0,
${baseUrl}/${streamKey}/segment001.ts
#EXTINF:10.0,
${baseUrl}/${streamKey}/segment002.ts
#EXTINF:10.0,
${baseUrl}/${streamKey}/segment003.ts

#EXT-X-ENDLIST`
}

function generateVideoPlayerHTML(streamKey: string): string {
  const hlsUrl = `https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/hls-streaming-server/${streamKey}.m3u8`
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HaritaHive Live Stream</title>
    <script src="https://vjs.zencdn.net/8.6.1/video.min.js"></script>
    <link href="https://vjs.zencdn.net/8.6.1/video-js.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/@videojs/http-streaming@3.0.2/dist/videojs-http-streaming.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Inter', system-ui, sans-serif;
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .live-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(239, 68, 68, 0.9);
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        .live-dot {
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            animation: blink 1s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        .video-container {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .video-js {
            width: 100%;
            height: 500px;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #fff, #e5e7eb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .status {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 30px;
        }
        .error-message {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 16px;
            margin-top: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="live-indicator">
            <div class="live-dot"></div>
            LIVE
        </div>
        
        <h1>HaritaHive Live Stream</h1>
        <p class="status">Streaming live with HLS technology</p>
        
        <div class="video-container">
            <video
                id="live-player"
                class="video-js vjs-default-skin"
                controls
                preload="auto"
                data-setup="{}"
            >
                <p class="vjs-no-js">
                    To view this video please enable JavaScript, and consider upgrading to a web browser that
                    <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>.
                </p>
            </video>
            
            <div id="error-container"></div>
        </div>
    </div>

    <script>
        const player = videojs('live-player', {
            techOrder: ['html5'],
            html5: {
                hls: {
                    enableLowInitialPlaylist: true,
                    smoothQualityChange: true,
                    overrideNative: true
                }
            },
            sources: [{
                src: '${hlsUrl}',
                type: 'application/x-mpegURL'
            }]
        });

        player.ready(() => {
            console.log('Player is ready');
            player.play().catch(error => {
                console.error('Autoplay failed:', error);
                showError('Click play to start the stream');
            });
        });

        player.on('error', (error) => {
            console.error('Player error:', error);
            showError('Stream temporarily unavailable. Please refresh the page.');
        });

        function showError(message) {
            const errorContainer = document.getElementById('error-container');
            errorContainer.innerHTML = \`
                <div class="error-message">
                    <strong>⚠️ \${message}</strong>
                </div>
            \`;
        }

        // Check stream status periodically
        setInterval(async () => {
            try {
                const response = await fetch('https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/hls-streaming-server/status/${streamKey}');
                const status = await response.json();
                
                if (!status.isLive && player.paused()) {
                    showError('Stream is currently offline');
                }
            } catch (error) {
                console.error('Status check failed:', error);
            }
        }, 30000); // Check every 30 seconds
    </script>
</body>
</html>`
}