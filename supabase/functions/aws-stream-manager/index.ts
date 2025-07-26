import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, class_id, recording_s3_key, viewer_count, analytics_data } = await req.json()

    switch (action) {
      case 'start_stream': {
        // Enhanced stream start with automatic class creation
        let classId = class_id;
        
        if (!classId) {
          // Create new live class
          const { data: newClass, error: classError } = await supabaseClient
            .from('live_classes')
            .insert({
              title: 'Live Stream Session',
              description: 'Live streaming session',
              starts_at: new Date().toISOString(),
              status: 'scheduled',
              access_tier: 'free',
              instructor: 'Live Stream',
              created_by: user.id
            })
            .select()
            .single()
            
          if (classError) {
            console.error('Error creating class:', classError)
            return new Response(
              JSON.stringify({ error: 'Failed to create class' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          classId = newClass.id
        }

        const { data, error } = await supabaseClient.rpc('start_aws_stream', {
          p_class_id: classId,
          p_admin_user_id: user.id
        })

        if (error) {
          console.error('Error starting stream:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to start stream' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ ...data, class_id: classId }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'stop_stream': {
        const { data, error } = await supabaseClient.rpc('stop_aws_stream', {
          p_class_id: class_id,
          p_admin_user_id: user.id,
          p_recording_s3_key: recording_s3_key
        })

        if (error) {
          console.error('Error stopping stream:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to stop stream' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Create recording entry
        const recordingUrl = `https://d3k8h9k5j2l1m9.cloudfront.net/${recording_s3_key}`
        
        await supabaseClient
          .from('live_recordings')
          .insert({
            class_id: class_id,
            title: `Recording for Class ${class_id}`,
            description: 'Auto-generated recording',
            speaker: 'Live Stream',
            start_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago estimate
            end_time: new Date().toISOString(),
            cloudfront_url: recordingUrl,
            recording_status: 'ready'
          })

        return new Response(
          JSON.stringify({ ...data, recording_url: recordingUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_analytics': {
        const { error } = await supabaseClient
          .from('stream_analytics')
          .insert({
            class_id,
            event_type: analytics_data?.event_type || 'unknown',
            event_data: analytics_data?.data || {},
            viewer_count: viewer_count || 0,
            bitrate: analytics_data?.bitrate,
            quality_metrics: analytics_data?.quality_metrics || {}
          })

        if (error) {
          console.error('Error updating analytics:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to update analytics' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_stream_config': {
        // Return mock config if none exists
        const { data, error } = await supabaseClient
          .from('aws_streaming_config')
          .select('*')
          .eq('is_active', true)
          .maybeSingle()

        const config = data || {
          rtmp_endpoint: 'rtmp://live-stream.haritahive.com/live',
          hls_playback_url: 'https://d3k8h9k5j2l1m9.cloudfront.net',
          s3_bucket_name: 'haritahive-live-recordings',
          cloudfront_distribution_id: 'E1A2B3C4D5F6G7'
        }

        return new Response(
          JSON.stringify(config),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'schedule_auto_class': {
        // Create tomorrow's class automatically
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(5, 0, 0, 0) // 5 AM

        const { data: newClass, error } = await supabaseClient
          .from('live_classes')
          .insert({
            title: 'Daily GIS Mastery Session with GEOVA',
            description: 'Interactive AI-powered learning session covering geospatial concepts, tools, and practical applications',
            starts_at: tomorrow.toISOString(),
            status: 'scheduled',
            access_tier: 'free',
            instructor: 'GEOVA AI',
            is_ai_generated: true,
            created_by: user.id
          })
          .select()
          .single()

        if (error) {
          console.error('Error scheduling class:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to schedule class' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, class: newClass }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})