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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🚀 Enhanced YouTube Auto Sync Started...');

    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID') || 'UCeVMHGaJ2NPU_jdUlXqbnwA';

    if (!youtubeApiKey) {
      throw new Error('YouTube API key not configured');
    }

    // Get OAuth token
    const { data: tokenData } = await supabase
      .from('youtube_oauth_tokens')
      .select('access_token, expires_at')
      .gt('expires_at', new Date(Date.now() + 5 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const accessToken = tokenData?.access_token;
    console.log('🔑 OAuth token available:', !!accessToken);

    // Enhanced live status check - IMMEDIATE detection
    await checkLiveStatusEnhanced(youtubeApiKey, channelId, accessToken, supabase);
    
    // Sync upcoming streams
    await syncUpcomingStreamsEnhanced(youtubeApiKey, channelId, accessToken, supabase);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Enhanced YouTube sync completed',
      timestamp: new Date().toISOString(),
      hasOAuth: !!accessToken
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhanced YouTube Sync Error:', error);
    
    // Log API error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.rpc('log_youtube_api_error', {
        p_endpoint: 'enhanced-youtube-sync',
        p_method: 'GET',
        p_status_code: 500,
        p_error_message: error.message,
        p_response_data: { error: error.message }
      });
    } catch (logError) {
      console.error('Failed to log API error:', logError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkLiveStatusEnhanced(apiKey: string, channelId: string, accessToken: string | null, supabase: any) {
  try {
    console.log('🔴 Enhanced live status check starting...');
    
    let response;
    
    if (accessToken) {
      // Use liveBroadcasts API for immediate detection
      response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,statistics&broadcastStatus=active&maxResults=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );
    } else {
      // Fallback to search API
      response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}&maxResults=10`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Live status API error: ${response.status} - ${errorText}`);
      
      await supabase.rpc('log_youtube_api_error', {
        p_endpoint: 'liveBroadcasts',
        p_method: 'GET',
        p_status_code: response.status,
        p_error_message: errorText
      });
      return;
    }

    const data = await response.json();
    console.log(`🔴 Found ${data.items?.length || 0} live broadcasts`);
    
    // Process each live broadcast
    for (const broadcast of data.items || []) {
      const videoId = broadcast.id?.videoId || broadcast.id;
      
      if (!videoId) continue;
      
      // Check if broadcast is truly live (no actualEndTime)
      const isTrulyLive = accessToken ? 
        (broadcast.status?.lifeCycleStatus === 'live' && broadcast.status?.broadcastStatus === 'live') :
        true; // Search API only returns live streams
      
      if (isTrulyLive) {
        console.log(`🔴 Processing live stream: ${videoId}`);
        
        // Get detailed video info
        const detailResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,statistics&id=${videoId}${accessToken ? '' : `&key=${apiKey}`}`,
          accessToken ? {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          } : {}
        );
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          const video = detailData.items?.[0];
          
          if (video && !video.liveStreamingDetails?.actualEndTime) {
            // Stream is truly live - update database IMMEDIATELY
            const updateData = {
              stream_key: videoId,
              current_live_video_id: videoId,
              title: video.snippet?.title || 'Live Stream',
              description: video.snippet?.description || 'Live streaming session',
              thumbnail_url: video.snippet?.thumbnails?.maxres?.url || video.snippet?.thumbnails?.high?.url,
              youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
              embed_url: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&controls=1`,
              status: 'live' as const,
              started_at: video.liveStreamingDetails?.actualStartTime || new Date().toISOString(),
              viewer_count: parseInt(video.statistics?.concurrentViewers || '0'),
              access_tier: 'professional',
              instructor: 'HaritaHive Team',
              updated_at: new Date().toISOString()
            };

            const { error } = await supabase
              .from('live_classes')
              .upsert(updateData, { 
                onConflict: 'stream_key'
              });

            if (error) {
              console.error('Error updating live status:', error);
            } else {
              console.log(`✅ LIVE NOW: ${video.snippet?.title || videoId}`);
            }
          }
        }
      }
    }
    
    // Check for streams that ended (mark as completed)
    const { data: currentLive } = await supabase
      .from('live_classes')
      .select('stream_key, current_live_video_id')
      .eq('status', 'live');
    
    if (currentLive) {
      const liveVideoIds = data.items?.map(b => b.id?.videoId || b.id) || [];
      
      for (const stream of currentLive) {
        if (!liveVideoIds.includes(stream.stream_key)) {
          // Stream ended - move to completed
          await supabase
            .from('live_classes')
            .update({
              status: 'completed' as const,
              current_live_video_id: null,
              ended_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('stream_key', stream.stream_key);
          
          console.log(`✅ Stream completed: ${stream.stream_key}`);
        }
      }
    }

  } catch (error) {
    console.error('Enhanced live status check error:', error);
    throw error;
  }
}

async function syncUpcomingStreamsEnhanced(apiKey: string, channelId: string, accessToken: string | null, supabase: any) {
  try {
    console.log('📅 Syncing upcoming streams...');
    
    let response;
    
    if (accessToken) {
      response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails&broadcastStatus=upcoming&maxResults=20`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );
    } else {
      response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=upcoming&type=video&key=${apiKey}&maxResults=20`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upcoming streams API error: ${response.status} - ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log(`📅 Found ${data.items?.length || 0} upcoming streams`);
    
    for (const item of data.items || []) {
      const videoId = item.id?.videoId || item.id;
      
      if (!videoId) continue;
      
      // Get detailed video information
      const detailResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}${accessToken ? '' : `&key=${apiKey}`}`,
        accessToken ? {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        } : {}
      );
      
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        const video = detailData.items?.[0];
        
        if (video?.liveStreamingDetails?.scheduledStartTime) {
          const streamData = {
            stream_key: videoId,
            title: video.snippet.title,
            description: video.snippet.description || 'Live streaming session',
            thumbnail_url: video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url,
            starts_at: video.liveStreamingDetails.scheduledStartTime,
            status: 'scheduled' as const,
            youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
            embed_url: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&controls=1`,
            access_tier: 'professional',
            instructor: 'HaritaHive Team',
            viewer_count: 0,
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('live_classes')
            .upsert(streamData, { 
              onConflict: 'stream_key',
              ignoreDuplicates: false 
            });

          if (error) {
            console.error(`Error upserting upcoming stream ${videoId}:`, error);
          } else {
            console.log(`✅ Synced upcoming: ${video.snippet.title}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('Enhanced upcoming streams sync error:', error);
    throw error;
  }
}