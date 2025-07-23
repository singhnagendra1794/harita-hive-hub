import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { action, recordingId, data } = await req.json();
    console.log(`GEOVA Recording Manager - Action: ${action}`);

    switch (action) {
      case 'start_recording': {
        const { dayNumber } = data;
        
        // Update recording status to 'recording'
        const { data: recording, error } = await supabase
          .from('geova_recordings')
          .update({ 
            recording_status: 'recording',
            recording_url: `https://recordings.haritahive.com/geova/${dayNumber}.m3u8`
          })
          .eq('day_number', dayNumber)
          .select()
          .single();

        if (error) throw error;

        console.log(`Started recording for Day ${dayNumber}`);
        return new Response(JSON.stringify({ success: true, recording }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'end_recording': {
        const { dayNumber, duration, fileSize } = data;
        
        // Update recording status to 'processing'
        const { data: recording, error } = await supabase
          .from('geova_recordings')
          .update({ 
            recording_status: 'processing',
            duration_seconds: duration || 5400,
            file_size_bytes: fileSize,
            mp4_url: `https://recordings.haritahive.com/geova/${dayNumber}.mp4`,
            hls_url: `https://recordings.haritahive.com/geova/${dayNumber}.m3u8`
          })
          .eq('day_number', dayNumber)
          .select()
          .single();

        if (error) throw error;

        // Generate thumbnail after a delay
        setTimeout(async () => {
          await generateThumbnail(supabase, recording.id, dayNumber);
        }, 5000);

        console.log(`Ended recording for Day ${dayNumber}`);
        return new Response(JSON.stringify({ success: true, recording }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'complete_processing': {
        const { dayNumber } = data;
        
        // Update recording status to 'completed'
        const { data: recording, error } = await supabase
          .from('geova_recordings')
          .update({ recording_status: 'completed' })
          .eq('day_number', dayNumber)
          .select()
          .single();

        if (error) throw error;

        console.log(`Completed processing for Day ${dayNumber}`);
        return new Response(JSON.stringify({ success: true, recording }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_recordings': {
        const { data: recordings, error } = await supabase
          .from('geova_recordings')
          .select('*')
          .order('day_number', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ recordings }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'bookmark_recording': {
        const { userId, notes } = data;
        
        const { data: bookmark, error } = await supabase
          .from('student_recording_bookmarks')
          .upsert({ 
            user_id: userId,
            recording_id: recordingId,
            notes: notes || null
          })
          .select()
          .single();

        if (error) throw error;

        // Track analytics
        await supabase.rpc('track_recording_view', {
          p_recording_id: recordingId,
          p_user_id: userId,
          p_event_type: 'bookmark_add'
        });

        return new Response(JSON.stringify({ success: true, bookmark }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'remove_bookmark': {
        const { userId } = data;
        
        const { error } = await supabase
          .from('student_recording_bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('recording_id', recordingId);

        if (error) throw error;

        // Track analytics
        await supabase.rpc('track_recording_view', {
          p_recording_id: recordingId,
          p_user_id: userId,
          p_event_type: 'bookmark_remove'
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'track_view': {
        const { userId, eventType, timestampSeconds } = data;
        
        await supabase.rpc('track_recording_view', {
          p_recording_id: recordingId,
          p_user_id: userId,
          p_event_type: eventType,
          p_timestamp_seconds: timestampSeconds
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in GEOVA Recording Manager:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateThumbnail(supabase: any, recordingId: string, dayNumber: number) {
  try {
    // Simulate thumbnail generation from the first 10 seconds
    const thumbnailUrl = `https://recordings.haritahive.com/geova/thumbnails/${dayNumber}.jpg`;
    
    await supabase
      .from('geova_recordings')
      .update({ thumbnail_url: thumbnailUrl })
      .eq('id', recordingId);
    
    console.log(`Generated thumbnail for Day ${dayNumber}`);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
  }
}