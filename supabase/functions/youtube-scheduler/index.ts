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

    const { action } = await req.json();
    
    console.log(`🗓️ YouTube Scheduler: ${action}`);

    switch (action) {
      case 'create_weekly_streams':
        return await createWeeklyStreams(supabase);
      case 'create_single_stream':
        return await createSingleStream(supabase, await req.json());
      case 'manual_sync':
        return await manualSync(supabase);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('YouTube Scheduler Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createWeeklyStreams(supabase: any) {
  try {
    console.log('📅 Creating weekly YouTube streams...');
    
    // Get OAuth token
    const { data: tokenData } = await supabase
      .from('youtube_oauth_tokens')
      .select('access_token, expires_at')
      .gt('expires_at', new Date(Date.now() + 5 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!tokenData?.access_token) {
      throw new Error('No valid OAuth token found. Please reconnect YouTube account.');
    }

    // Get next week's schedule from database
    const result = await supabase.rpc('create_weekly_youtube_streams');
    
    if (result.error) {
      throw new Error(`Failed to create schedule: ${result.error.message}`);
    }

    console.log('📋 Schedule created:', result.data);
    
    // Now create actual YouTube broadcasts for each scheduled stream
    const { data: scheduledStreams } = await supabase
      .from('youtube_stream_schedule')
      .select('*')
      .is('youtube_broadcast_id', null)
      .eq('status', 'scheduled')
      .order('scheduled_datetime');

    const createdStreams = [];
    const errors = [];

    for (const stream of scheduledStreams || []) {
      try {
        const broadcastResult = await createYouTubeBroadcast(
          tokenData.access_token,
          stream.stream_title,
          stream.stream_description,
          stream.scheduled_datetime
        );

        if (broadcastResult.success) {
          // Update the schedule with YouTube broadcast ID
          await supabase
            .from('youtube_stream_schedule')
            .update({
              youtube_broadcast_id: broadcastResult.broadcastId,
              youtube_stream_key: broadcastResult.streamKey
            })
            .eq('id', stream.id);

          // Create entry in live_classes
          await supabase
            .from('live_classes')
            .upsert({
              stream_key: broadcastResult.broadcastId,
              title: stream.stream_title,
              description: stream.stream_description,
              starts_at: stream.scheduled_datetime,
              status: 'scheduled',
              youtube_url: `https://www.youtube.com/watch?v=${broadcastResult.broadcastId}`,
              embed_url: `https://www.youtube-nocookie.com/embed/${broadcastResult.broadcastId}?autoplay=0&modestbranding=1&rel=0&controls=1`,
              access_tier: 'professional',
              instructor: 'HaritaHive Team',
              viewer_count: 0
            }, {
              onConflict: 'stream_key'
            });

          createdStreams.push({
            title: stream.stream_title,
            broadcastId: broadcastResult.broadcastId,
            streamKey: broadcastResult.streamKey,
            scheduledTime: stream.scheduled_datetime
          });

          console.log(`✅ Created YouTube broadcast: ${stream.stream_title}`);
        } else {
          errors.push(`Failed to create ${stream.stream_title}: ${broadcastResult.error}`);
        }
      } catch (streamError) {
        errors.push(`Error creating ${stream.stream_title}: ${streamError.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Created ${createdStreams.length} YouTube broadcasts`,
      createdStreams,
      errors,
      persistentStreamKey: createdStreams[0]?.streamKey || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Weekly streams creation error:', error);
    throw error;
  }
}

async function createYouTubeBroadcast(accessToken: string, title: string, description: string, scheduledTime: string) {
  try {
    // Create live stream first
    const streamResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snippet: {
            title: `${title} - Stream`
          },
          cdn: {
            frameRate: 'variable',
            ingestionType: 'rtmp',
            resolution: 'variable'
          }
        })
      }
    );

    if (!streamResponse.ok) {
      const error = await streamResponse.text();
      return { success: false, error: `Stream creation failed: ${error}` };
    }

    const streamData = await streamResponse.json();
    const streamId = streamData.id;
    const streamKey = streamData.cdn.ingestionInfo.streamName;

    // Create live broadcast
    const broadcastResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snippet: {
            title: title,
            description: description,
            scheduledStartTime: scheduledTime
          },
          status: {
            privacyStatus: 'unlisted',
            selfDeclaredMadeForKids: false
          },
          contentDetails: {
            enableAutoStart: true,
            enableAutoStop: true,
            latencyPreference: 'ultraLow'
          }
        })
      }
    );

    if (!broadcastResponse.ok) {
      const error = await broadcastResponse.text();
      return { success: false, error: `Broadcast creation failed: ${error}` };
    }

    const broadcastData = await broadcastResponse.json();
    const broadcastId = broadcastData.id;

    // Bind stream to broadcast
    const bindResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?part=id&id=${broadcastId}&streamId=${streamId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!bindResponse.ok) {
      const error = await bindResponse.text();
      return { success: false, error: `Stream binding failed: ${error}` };
    }

    return {
      success: true,
      broadcastId,
      streamId,
      streamKey
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createSingleStream(supabase: any, data: any) {
  try {
    const { title, description, scheduledTime } = data;
    
    // Get OAuth token
    const { data: tokenData } = await supabase
      .from('youtube_oauth_tokens')
      .select('access_token')
      .gt('expires_at', new Date(Date.now() + 5 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!tokenData?.access_token) {
      throw new Error('No valid OAuth token found');
    }

    const result = await createYouTubeBroadcast(
      tokenData.access_token,
      title,
      description,
      scheduledTime
    );

    if (result.success) {
      // Create entry in live_classes
      await supabase
        .from('live_classes')
        .insert({
          stream_key: result.broadcastId,
          title,
          description,
          starts_at: scheduledTime,
          status: 'scheduled',
          youtube_url: `https://www.youtube.com/watch?v=${result.broadcastId}`,
          embed_url: `https://www.youtube-nocookie.com/embed/${result.broadcastId}?autoplay=0&modestbranding=1&rel=0&controls=1`,
          access_tier: 'professional',
          instructor: 'HaritaHive Team',
          viewer_count: 0
        });

      return new Response(JSON.stringify({
        success: true,
        message: 'Single stream created successfully',
        broadcastId: result.broadcastId,
        streamKey: result.streamKey
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    throw error;
  }
}

async function manualSync(supabase: any) {
  try {
    console.log('🔄 Manual sync triggered...');
    
    // Invoke enhanced sync function
    const { data, error } = await supabase.functions.invoke('enhanced-youtube-sync');
    
    if (error) {
      throw new Error(`Sync failed: ${error.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Manual sync completed',
      syncResult: data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    throw error;
  }
}