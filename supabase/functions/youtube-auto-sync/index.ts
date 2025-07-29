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

    await syncUpcomingStreams(youtubeApiKey, channelId, supabase);
    await checkLiveStatus(youtubeApiKey, channelId, supabase);
    
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

async function syncUpcomingStreams(apiKey: string, channelId: string, supabase: any) {
  try {
    // Fetch upcoming live broadcasts
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails&broadcastStatus=upcoming&channelId=${channelId}&key=${apiKey}`
    );

    if (!response.ok) throw new Error('Failed to fetch upcoming streams');

    const data = await response.json();
    
    for (const broadcast of data.items) {
      const streamData = {
        youtube_id: broadcast.id,
        title: broadcast.snippet.title,
        description: broadcast.snippet.description,
        thumbnail_url: broadcast.snippet.thumbnails?.maxres?.url || broadcast.snippet.thumbnails?.high?.url,
        scheduled_start_time: broadcast.snippet.scheduledStartTime,
        status: 'scheduled',
        youtube_url: `https://www.youtube.com/watch?v=${broadcast.id}`,
        embed_url: `https://www.youtube-nocookie.com/embed/${broadcast.id}?modestbranding=1&rel=0`,
        auto_imported: true,
        updated_at: new Date().toISOString()
      };

      // Insert or update stream
      const { error } = await supabase
        .from('live_classes')
        .upsert(streamData, { 
          onConflict: 'youtube_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error upserting stream:', error);
      } else {
        console.log(`Synced upcoming stream: ${broadcast.snippet.title}`);
      }
    }

  } catch (error) {
    console.error('Error syncing upcoming streams:', error);
    throw error;
  }
}

async function checkLiveStatus(apiKey: string, channelId: string, supabase: any) {
  try {
    // Check for currently live broadcasts
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails&broadcastStatus=live&channelId=${channelId}&key=${apiKey}`
    );

    if (!response.ok) throw new Error('Failed to check live status');

    const data = await response.json();
    
    // Update database for live streams
    for (const broadcast of data.items) {
      const { error } = await supabase
        .from('live_classes')
        .update({
          status: 'live',
          actual_start_time: new Date().toISOString(),
          viewer_count: broadcast.statistics?.concurrentViewers || 0,
          updated_at: new Date().toISOString()
        })
        .eq('youtube_id', broadcast.id);

      if (error) {
        console.error('Error updating live status:', error);
      } else {
        console.log(`Updated live status for: ${broadcast.snippet.title}`);
      }
    }

    // Check for completed broadcasts
    const completedResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails&broadcastStatus=complete&channelId=${channelId}&key=${apiKey}&maxResults=5`
    );

    if (completedResponse.ok) {
      const completedData = await completedResponse.json();
      
      for (const broadcast of completedData.items) {
        const { error } = await supabase
          .from('live_classes')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
            recording_url: `https://www.youtube.com/watch?v=${broadcast.id}`,
            updated_at: new Date().toISOString()
          })
          .eq('youtube_id', broadcast.id);

        if (!error) {
          console.log(`Marked as completed: ${broadcast.snippet.title}`);
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