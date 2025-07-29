import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId, title, description, streamId } = await req.json();
    
    console.log(`GEOVA YouTube Stream Request: {
  action: "${action}",
  sessionId: "${sessionId}",
  title: "${title}"
}`);

    switch (action) {
      case 'start':
        return await startYouTubeStream(title, description, sessionId);
      case 'stop':
        return await stopYouTubeStream(streamId);
      case 'get_status':
        return await getStreamStatus(streamId);
      case 'create_scheduled':
        return await createScheduledStream(title, description, sessionId);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('GEOVA YouTube Stream Error:', error);
    return new Response(JSON.stringify({
      error: true,
      message: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function startYouTubeStream(title: string, description: string, sessionId: string) {
  try {
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    const youtubeClientId = Deno.env.get('YOUTUBE_CLIENT_ID');
    const youtubeClientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET');
    const youtubeRefreshToken = Deno.env.get('YOUTUBE_REFRESH_TOKEN');

    if (!youtubeApiKey || !youtubeClientId || !youtubeClientSecret || !youtubeRefreshToken) {
      throw new Error('YouTube API credentials not configured');
    }

    // Get access token using refresh token
    const accessToken = await getYouTubeAccessToken(youtubeClientId, youtubeClientSecret, youtubeRefreshToken);

    // Create live broadcast
    const broadcastResponse = await fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          title: title || `GEOVA Live Mentor Session - ${new Date().toLocaleDateString()}`,
          description: description || 'Live AI-powered geospatial technology mentoring with GEOVA',
          scheduledStartTime: new Date().toISOString(),
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
        contentDetails: {
          enableAutoStart: true,
          enableAutoStop: true,
          enableDvr: true,
          enableContentEncryption: false,
          startWithSlate: false,
          recordFromStart: true,
        },
      }),
    });

    if (!broadcastResponse.ok) {
      const error = await broadcastResponse.text();
      console.error('YouTube broadcast creation error:', error);
      throw new Error(`Failed to create YouTube broadcast: ${error}`);
    }

    const broadcast = await broadcastResponse.json();

    // Create live stream
    const streamResponse = await fetch('https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn,status', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          title: `GEOVA Stream - ${sessionId}`,
          description: 'GEOVA Live Mentor Stream',
        },
        cdn: {
          frameRate: '30fps',
          ingestionType: 'rtmp',
          resolution: '1080p',
        },
      }),
    });

    if (!streamResponse.ok) {
      const error = await streamResponse.text();
      console.error('YouTube stream creation error:', error);
      throw new Error(`Failed to create YouTube stream: ${error}`);
    }

    const stream = await streamResponse.json();

    // Bind stream to broadcast
    const bindResponse = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?part=id&id=${broadcast.id}&streamId=${stream.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!bindResponse.ok) {
      const error = await bindResponse.text();
      console.error('YouTube stream binding error:', error);
      throw new Error(`Failed to bind stream to broadcast: ${error}`);
    }

    // Transition broadcast to live
    const liveResponse = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?part=status&id=${broadcast.id}&broadcastStatus=live`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!liveResponse.ok) {
      console.log('Note: Could not automatically start live broadcast, may need manual activation');
    }

    return new Response(JSON.stringify({
      success: true,
      broadcastId: broadcast.id,
      streamId: stream.id,
      streamUrl: `https://www.youtube.com/watch?v=${broadcast.id}`,
      rtmpUrl: stream.cdn.ingestionInfo.ingestionAddress,
      streamKey: stream.cdn.ingestionInfo.streamName,
      watchUrl: `https://www.youtube.com/watch?v=${broadcast.id}`,
      embedUrl: `https://www.youtube.com/embed/${broadcast.id}?autoplay=1&mute=1`,
      message: 'YouTube live stream created and started successfully!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error starting YouTube stream:', error);
    throw error;
  }
}

async function stopYouTubeStream(streamId: string) {
  try {
    const youtubeClientId = Deno.env.get('YOUTUBE_CLIENT_ID');
    const youtubeClientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET');
    const youtubeRefreshToken = Deno.env.get('YOUTUBE_REFRESH_TOKEN');

    if (!youtubeClientId || !youtubeClientSecret || !youtubeRefreshToken) {
      throw new Error('YouTube API credentials not configured');
    }

    const accessToken = await getYouTubeAccessToken(youtubeClientId, youtubeClientSecret, youtubeRefreshToken);

    // Transition broadcast to complete
    const response = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?part=status&id=${streamId}&broadcastStatus=complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('YouTube stream stop error:', error);
      throw new Error(`Failed to stop YouTube stream: ${error}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'YouTube stream stopped successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error stopping YouTube stream:', error);
    throw error;
  }
}

async function getStreamStatus(streamId: string) {
  try {
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!youtubeApiKey) {
      throw new Error('YouTube API key not configured');
    }

    const response = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts?part=status,snippet&id=${streamId}&key=${youtubeApiKey}`);

    if (!response.ok) {
      throw new Error('Failed to get stream status');
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      status: data.items?.[0]?.status || 'unknown',
      broadcast: data.items?.[0] || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting stream status:', error);
    throw error;
  }
}

async function createScheduledStream(title: string, description: string, sessionId: string) {
  try {
    // Create a scheduled stream for future GEOVA sessions
    const youtubeClientId = Deno.env.get('YOUTUBE_CLIENT_ID');
    const youtubeClientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET');
    const youtubeRefreshToken = Deno.env.get('YOUTUBE_REFRESH_TOKEN');

    if (!youtubeClientId || !youtubeClientSecret || !youtubeRefreshToken) {
      throw new Error('YouTube API credentials not configured');
    }

    const accessToken = await getYouTubeAccessToken(youtubeClientId, youtubeClientSecret, youtubeRefreshToken);

    // Schedule for next hour (can be customized)
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + 1);

    const response = await fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          title: title || `GEOVA Live Mentor - Scheduled Session`,
          description: description || 'Scheduled AI-powered geospatial technology mentoring with GEOVA',
          scheduledStartTime: scheduledTime.toISOString(),
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
        contentDetails: {
          enableAutoStart: false,
          enableAutoStop: false,
          enableDvr: true,
          recordFromStart: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('YouTube scheduled stream error:', error);
      throw new Error(`Failed to create scheduled stream: ${error}`);
    }

    const broadcast = await response.json();

    return new Response(JSON.stringify({
      success: true,
      broadcastId: broadcast.id,
      scheduledTime: scheduledTime.toISOString(),
      watchUrl: `https://www.youtube.com/watch?v=${broadcast.id}`,
      message: 'Scheduled YouTube stream created successfully!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating scheduled stream:', error);
    throw error;
  }
}

async function getYouTubeAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
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
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('YouTube token refresh error:', error);
    throw new Error(`Failed to refresh YouTube access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}