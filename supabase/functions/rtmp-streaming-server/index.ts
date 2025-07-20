import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const url = new URL(req.url)
  const { headers } = req
  const upgradeHeader = headers.get("upgrade") || ""

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Handle WebSocket upgrade for live streaming
  if (upgradeHeader.toLowerCase() === "websocket") {
    const streamKey = url.searchParams.get('key')
    
    if (!streamKey) {
      return new Response("Stream key required", { status: 400 })
    }

    // Verify stream key
    const { data: keyData, error } = await supabase
      .from('stream_keys')
      .select('user_id')
      .eq('stream_key', streamKey)
      .eq('is_active', true)
      .single()

    if (error || !keyData) {
      return new Response("Invalid stream key", { status: 401 })
    }

    const { socket, response } = Deno.upgradeWebSocket(req)
    
    // Store active stream connection
    const streamConnections = new Map()
    
    socket.onopen = async () => {
      console.log(`Stream started with key: ${streamKey}`)
      
      // Update session to live
      await supabase
        .from('stream_sessions')
        .update({ 
          status: 'live',
          started_at: new Date().toISOString()
        })
        .eq('user_id', keyData.user_id)
        .eq('status', 'preparing')
      
      // Store connection
      streamConnections.set(streamKey, socket)
      
      // Notify users
      try {
        await supabase.functions.invoke('send-live-notifications', {
          body: { 
            streamTitle: 'Live Stream',
            streamUrl: 'https://haritahive.com/live-classes'
          }
        })
      } catch (error) {
        console.error('Error sending notifications:', error)
      }
    }

    socket.onmessage = (event) => {
      // Handle incoming stream data
      const data = event.data
      console.log('Received stream data:', data.length, 'bytes')
      
      // Broadcast to all viewers (you can implement viewer WebSockets here)
      // For now, we'll store the stream data
    }

    socket.onclose = async () => {
      console.log(`Stream ended for key: ${streamKey}`)
      
      // Update session to ended
      await supabase
        .from('stream_sessions')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('user_id', keyData.user_id)
        .eq('status', 'live')
      
      // Remove connection
      streamConnections.delete(streamKey)
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return response
  }

  // Handle RTMP publish endpoint
  if (req.method === 'POST' && url.pathname.includes('/publish/')) {
    const streamKey = url.pathname.split('/publish/')[1]
    
    if (!streamKey) {
      return new Response(JSON.stringify({ error: 'Stream key required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify stream key
    const { data: keyData, error } = await supabase
      .from('stream_keys')
      .select('user_id')
      .eq('stream_key', streamKey)
      .eq('is_active', true)
      .single()

    if (error || !keyData) {
      return new Response(JSON.stringify({ error: 'Invalid stream key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Handle stream data
    const streamData = await req.arrayBuffer()
    console.log('Received RTMP data:', streamData.byteLength, 'bytes')

    return new Response(JSON.stringify({ 
      status: 'success',
      message: 'Stream data received',
      bytes: streamData.byteLength
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Handle live stream viewer page
  if (req.method === 'GET' && url.pathname.includes('/watch/')) {
    const streamKey = url.pathname.split('/watch/')[1]
    
    // Return live stream viewer page
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>HaritaHive Live Stream</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Inter', system-ui, sans-serif;
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            max-width: 1200px;
            width: 100%;
            padding: 20px;
            text-align: center;
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
          .stream-container {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .stream-placeholder {
            aspect-ratio: 16/9;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            border: 2px dashed rgba(255, 255, 255, 0.3);
          }
          .stream-info {
            text-align: left;
            margin-top: 20px;
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
          .connect-button {
            background: linear-gradient(45deg, #3b82f6, #1d4ed8);
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .connect-button:hover {
            transform: translateY(-2px);
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
          <p class="status">Ready to receive live stream from OBS</p>
          
          <div class="stream-container">
            <div class="stream-placeholder">
              <div>
                <h3>🎥 Waiting for stream...</h3>
                <p>Stream Key: ${streamKey}</p>
                <button class="connect-button" onclick="connectToStream()">
                  Connect to Stream
                </button>
              </div>
            </div>
            
            <div class="stream-info">
              <h3>Stream Information</h3>
              <p><strong>Stream Key:</strong> ${streamKey}</p>
              <p><strong>Status:</strong> <span id="status">Waiting for connection</span></p>
              <p><strong>Viewers:</strong> <span id="viewers">0</span></p>
            </div>
          </div>
        </div>
        
        <script>
          function connectToStream() {
            const ws = new WebSocket(\`wss://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/rtmp-streaming-server?key=${streamKey}\`);
            
            ws.onopen = () => {
              document.getElementById('status').textContent = 'Connected';
              console.log('Connected to stream');
            };
            
            ws.onmessage = (event) => {
              console.log('Received stream data:', event.data);
              // Handle incoming stream data here
            };
            
            ws.onclose = () => {
              document.getElementById('status').textContent = 'Disconnected';
              console.log('Stream disconnected');
            };
            
            ws.onerror = (error) => {
              console.error('Stream error:', error);
              document.getElementById('status').textContent = 'Error';
            };
          }
          
          // Auto-connect on page load
          setTimeout(connectToStream, 1000);
        </script>
      </body>
      </html>`,
      {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      }
    )
  }

  // Default response
  return new Response(
    JSON.stringify({
      message: 'HaritaHive RTMP Streaming Server',
      endpoints: {
        publish: '/publish/{stream_key}',
        watch: '/watch/{stream_key}',
        websocket: '?key={stream_key} (with Upgrade: websocket header)'
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
})