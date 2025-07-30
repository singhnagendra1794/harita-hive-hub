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

    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID');

    if (!youtubeApiKey || !channelId) {
      throw new Error('YouTube API credentials not configured');
    }

    // Get OAuth token for authenticated requests
    const { data: tokens, error: tokenError } = await supabase
      .from('youtube_oauth_tokens')
      .select('access_token, refresh_token, expires_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (tokenError) {
      console.log('⚠️ No OAuth tokens found, using API key only:', tokenError.message);
    }
    
    const accessToken = tokens?.access_token;
    console.log(`🔑 OAuth token available: ${!!accessToken}`);

    await syncUpcomingStreams(youtubeApiKey, channelId, accessToken, supabase);
    await checkLiveStatus(youtubeApiKey, channelId, accessToken, supabase);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'YouTube sync completed',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('YouTube Auto Sync Error:', error);
    
    // Failover mode - try direct embed detection
    await failoverLiveDetection();
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      failover: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function syncUpcomingStreams(apiKey: string, channelId: string, accessToken: string | null, supabase: any) {
  try {
    console.log(`🔍 Fetching upcoming streams for channel: ${channelId}`);
    
    let response;
    
    if (accessToken) {
      console.log('🔑 Using OAuth token for liveBroadcasts API');
      // Use OAuth token for liveBroadcasts API (includes unlisted streams)
      response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails&broadcastStatus=upcoming&maxResults=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );
    } else {
      console.log('🗝️ Using API key for public search API');
      // Fallback to public search API with API key
      response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=upcoming&type=video&key=${apiKey}&maxResults=10`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`YouTube API Error ${response.status}: ${errorText}`);
      
      // If OAuth failed, try public API as fallback
      if (accessToken && response.status === 401) {
        console.log('🔄 OAuth failed, trying public search API...');
        response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=upcoming&type=video&key=${apiKey}&maxResults=10`
        );
        
        if (!response.ok) {
          const fallbackError = await response.text();
          throw new Error(`YouTube API error: ${response.status} - ${fallbackError}`);
        }
      } else {
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log(`📊 Found ${data.items?.length || 0} upcoming streams`);
    
    for (const item of data.items || []) {
      // Handle both search API and liveBroadcasts API response formats
      const videoId = item.id?.videoId || item.id;
      const snippet = item.snippet;
      
      if (!videoId) {
        console.log('⚠️ Skipping item without video ID');
        continue;
      }
      
      // Get detailed video information including live streaming details
      let detailResponse;
      
      if (accessToken) {
        detailResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }
        );
      } else {
        detailResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}&key=${apiKey}`
        );
      }
      
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        const video = detailData.items?.[0];
        
        if (video?.liveStreamingDetails?.scheduledStartTime) {
          // Get super admin user ID for created_by field
          const { data: adminUserId } = await supabase.rpc('get_super_admin_user_id');
          
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
            updated_at: new Date().toISOString(),
            created_by: adminUserId || null
          };

          // Insert or update stream
          const { error } = await supabase
            .from('live_classes')
            .upsert(streamData, { 
              onConflict: 'stream_key',
              ignoreDuplicates: false 
            });

          if (error) {
            console.error(`❌ Error upserting stream ${videoId}:`, error);
          } else {
            console.log(`✅ Synced upcoming stream: ${video.snippet.title}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error syncing upcoming streams:', error);
    throw error;
  }
}

async function checkLiveStatus(apiKey: string, channelId: string, accessToken: string | null, supabase: any) {
  try {
    console.log('🔴 Checking for currently live streams...');
    
    let response;
    
    if (accessToken) {
      console.log('🔑 Using OAuth for live broadcasts check');
      // Check for currently live broadcasts using OAuth
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
      console.log('🗝️ Using API key for live search');
      // Fallback to search API with API key
      response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}&maxResults=10`
      );
    }

    if (!response.ok) {
      console.log(`Live status API error: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log(`🔴 Found ${data.items?.length || 0} live streams`);
    
    // Update database for live streams
    for (const broadcast of data.items || []) {
      const videoId = broadcast.id?.videoId || broadcast.id;
      
      if (videoId) {
        const updateData = {
          status: 'live' as const,
          started_at: new Date().toISOString(),
          viewer_count: broadcast.statistics?.concurrentViewers || 0,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('live_classes')
          .update(updateData)
          .eq('stream_key', videoId);

        if (error) {
          console.error('Error updating live status:', error);
        } else {
          console.log(`✅ Updated live status for: ${broadcast.snippet?.title || videoId}`);
        }
      }
    }

    // Check for completed broadcasts
    let completedResponse;
    
    if (accessToken) {
      completedResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails&broadcastStatus=complete&maxResults=5`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );
    } else {
      // Can't check completed broadcasts without OAuth
      return;
    }

    if (completedResponse.ok) {
      const completedData = await completedResponse.json();
      
      for (const broadcast of completedData.items || []) {
        const { error } = await supabase
          .from('live_classes')
          .update({
            status: 'completed' as const,
            ended_at: new Date().toISOString(),
            youtube_url: `https://www.youtube.com/watch?v=${broadcast.id}`,
            updated_at: new Date().toISOString()
          })
          .eq('stream_key', broadcast.id);

        if (!error) {
          console.log(`✅ Marked as completed: ${broadcast.snippet?.title || broadcast.id}`);
        }
      }
    }

  } catch (error) {
    console.error('Error checking live status:', error);
    throw error;
  }
}

async function failoverLiveDetection() {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current scheduled streams
    const { data: scheduledStreams } = await supabase
      .from('live_classes')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_start_time', new Date(Date.now() - 3600000).toISOString()) // Within last hour
      .lte('scheduled_start_time', new Date(Date.now() + 1800000).toISOString()); // Within next 30 minutes

    if (scheduledStreams && scheduledStreams.length > 0) {
      for (const stream of scheduledStreams) {
        // Try to detect if embed is live by checking availability
        try {
          const embedCheck = await fetch(stream.embed_url, { 
            method: 'HEAD'
          });
          
          if (embedCheck.ok) {
            // Assume it's live if we're close to scheduled time
            const now = new Date();
            const scheduledTime = new Date(stream.scheduled_start_time);
            const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
            
            if (timeDiff < 1800000) { // Within 30 minutes
              await supabase
                .from('live_classes')
                .update({
                  status: 'live',
                  actual_start_time: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('id', stream.id);
              
              console.log(`Failover: Marked as live - ${stream.title}`);
            }
          }
        } catch (embedError) {
          console.log('Embed check failed, stream likely not live yet');
        }
      }
    }

  } catch (error) {
    console.error('Failover detection error:', error);
  }
}