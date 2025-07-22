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

    const { stream_key, status, viewer_count } = await req.json()

    if (!stream_key || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: stream_key, status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update stream session status
    const { data: session, error: updateError } = await supabaseClient
      .from('stream_sessions')
      .update({
        status: status,
        viewer_count: viewer_count || 0,
        updated_at: new Date().toISOString(),
        ...(status === 'live' && { started_at: new Date().toISOString() }),
        ...(status === 'ended' && { ended_at: new Date().toISOString() }),
      })
      .eq('user_id', user.id)
      .eq('status', status === 'live' ? 'preparing' : 'live')
      .select()
      .single()

    if (updateError) {
      console.error('Error updating stream status:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update stream status', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send notifications when going live
    if (status === 'live') {
      // Trigger live notification function
      await supabaseClient.functions.invoke('send-live-notifications', {
        body: {
          stream_id: session.id,
          stream_title: session.title,
          instructor_id: user.id
        }
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: session,
        status: status,
        message: `Stream ${status} successfully`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})