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
    const { action, sessionType, contextPage, config, sessionId } = await req.json();
    
    console.log(`GEOVA Live Session Request: {
  action: "${action}",
  sessionType: "${sessionType}",
  contextPage: "${contextPage}"
}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'create':
        return await createSession(supabase, sessionType, contextPage, config);
      case 'end':
        return await endSession(supabase, sessionId);
      case 'get_status':
        return await getSessionStatus(supabase, sessionId);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('GEOVA Live Session Error:', error);
    return new Response(JSON.stringify({
      error: true,
      message: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createSession(supabase: any, sessionType: string, contextPage: string, config: any) {
  try {
    // Generate unique session ID
    const sessionId = crypto.randomUUID();
    
    // Generate RTMP stream key for potential YouTube streaming
    const streamKey = `geova_${sessionId}_${Date.now()}`;
    
    // Create session record
    const sessionData = {
      id: sessionId,
      title: `GEOVA Live Mentor - ${sessionType === 'private' ? 'Private Session' : 'Group Learning'}`,
      description: `AI-powered geospatial technology mentoring session with GEOVA`,
      session_type: sessionType,
      context_page: contextPage,
      status: 'starting',
      config: config,
      stream_key: streamKey,
      rtmp_endpoint: `rtmp://a.rtmp.youtube.com/live2/${streamKey}`,
      hls_endpoint: `https://haritahive.com/live/${sessionId}`,
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString()
    };

    // For now, we'll store in memory or simple tracking
    // In production, you'd store in a dedicated table
    
    // If YouTube streaming is enabled, prepare stream
    let youtubeUrl = null;
    if (config.youtubeStreamEnabled) {
      youtubeUrl = await createYouTubeStream(sessionData.title, sessionData.description);
    }

    const session = {
      ...sessionData,
      youtubeUrl,
      participants: 0
    };

    return new Response(JSON.stringify({
      success: true,
      session
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

async function endSession(supabase: any, sessionId: string) {
  try {
    // Update session status
    // In production, you'd update the database record
    
    // End any YouTube stream
    await endYouTubeStream(sessionId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Session ended successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
}

async function getSessionStatus(supabase: any, sessionId: string) {
  try {
    // In production, query the database
    // For now, return basic status
    
    return new Response(JSON.stringify({
      sessionId,
      status: 'active',
      participants: 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting session status:', error);
    throw error;
  }
}

async function createYouTubeStream(title: string, description: string): Promise<string | null> {
  try {
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!youtubeApiKey) {
      console.log('YouTube API key not configured');
      return null;
    }

    // Create YouTube live stream
    const response = await fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${youtubeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          title,
          description,
          scheduledStartTime: new Date().toISOString(),
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
      }),
    });

    if (!response.ok) {
      console.error('YouTube API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return `https://www.youtube.com/watch?v=${data.id}`;

  } catch (error) {
    console.error('Error creating YouTube stream:', error);
    return null;
  }
}

async function endYouTubeStream(sessionId: string) {
  try {
    // End YouTube stream if it exists
    console.log('Ending YouTube stream for session:', sessionId);
    // Implementation would depend on stored stream ID
  } catch (error) {
    console.error('Error ending YouTube stream:', error);
  }
}