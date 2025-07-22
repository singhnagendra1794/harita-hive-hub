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

    const body = await req.json()
    const { action, stream_key, app, name } = body

    console.log('RTMP Webhook received:', { action, stream_key, app, name })

    if (!stream_key) {
      return new Response(
        JSON.stringify({ error: 'Missing stream_key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find the user and session for this stream key
    const { data: streamKeyData, error: keyError } = await supabaseClient
      .from('stream_keys')
      .select('user_id')
      .eq('stream_key', stream_key)
      .eq('is_active', true)
      .single()

    if (keyError || !streamKeyData) {
      console.error('Stream key not found:', keyError)
      return new Response(
        JSON.stringify({ error: 'Invalid stream key' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = streamKeyData.user_id

    if (action === 'publish') {
      // Stream started - update session to live
      const { data: session, error: updateError } = await supabaseClient
        .from('stream_sessions')
        .update({
          status: 'live',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'preparing')
        .select()
        .single()

      if (updateError) {
        console.error('Error updating session to live:', updateError)
      } else {
        console.log('Session updated to live:', session)
        
        // Send live notifications
        await supabaseClient.functions.invoke('send-live-notifications', {
          body: {
            stream_id: session.id,
            stream_title: session.title,
            instructor_id: userId
          }
        })
      }

    } else if (action === 'unpublish') {
      // Stream ended - update session to ended
      const { data: session, error: updateError } = await supabaseClient
        .from('stream_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'live')
        .select()
        .single()

      if (updateError) {
        console.error('Error updating session to ended:', updateError)
      } else {
        console.log('Session updated to ended:', session)
      }
    }

    return new Response(
      JSON.stringify({ success: true, action: action }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('RTMP Webhook Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})