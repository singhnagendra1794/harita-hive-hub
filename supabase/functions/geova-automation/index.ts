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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, schedule_data } = await req.json()

    switch (action) {
      case 'create_daily_class': {
        // Create GEOVA class for today
        const { data: class_id, error } = await supabaseClient.rpc('create_geova_daily_class')

        if (error) {
          console.error('Error creating GEOVA class:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to create daily GEOVA class' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Created GEOVA class with ID:', class_id)

        // Auto-start stream if configured
        const now = new Date()
        const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}))
        const currentHour = istTime.getHours()

        if (currentHour === 5) { // 5 AM IST
          try {
            const { data: streamData, error: streamError } = await supabaseClient.rpc('start_aws_stream', {
              p_class_id: class_id,
              p_admin_user_id: class_id // Use class_id as placeholder for automated sessions
            })

            if (streamError) {
              console.error('Error auto-starting stream:', streamError)
            } else {
              console.log('Auto-started stream for GEOVA class:', streamData)
            }
          } catch (error) {
            console.error('Failed to auto-start stream:', error)
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            class_id,
            message: 'GEOVA daily class created successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_schedule': {
        const { error } = await supabaseClient
          .from('geova_class_schedule')
          .update({
            class_title: schedule_data.title,
            class_description: schedule_data.description,
            scheduled_time: schedule_data.time,
            curriculum_data: schedule_data.curriculum,
            updated_at: new Date().toISOString()
          })
          .eq('is_active', true)

        if (error) {
          console.error('Error updating schedule:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to update GEOVA schedule' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Schedule updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_schedule': {
        const { data, error } = await supabaseClient
          .from('geova_class_schedule')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.error('Error getting schedule:', error)
          return new Response(
            JSON.stringify({ error: 'No active schedule found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'check_stream_health': {
        // Check if current streams are healthy
        const { data: liveClasses, error } = await supabaseClient
          .from('live_classes')
          .select(`
            *,
            aws_streaming_config(*)
          `)
          .eq('status', 'live')
          .eq('is_ai_generated', true)

        if (error) {
          console.error('Error checking stream health:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to check stream health' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const healthReport = {
          total_active_streams: liveClasses.length,
          streams: liveClasses.map(cls => ({
            class_id: cls.id,
            title: cls.title,
            started_at: cls.start_time,
            viewer_count: cls.viewer_count || 0,
            status: 'healthy' // In real implementation, check actual stream health
          }))
        }

        return new Response(
          JSON.stringify(healthReport),
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
    console.error('Error in GEOVA automation:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})