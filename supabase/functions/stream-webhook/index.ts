import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StreamWebhookEvent {
  action: 'stream_started' | 'stream_ended' | 'viewer_update'
  stream_key: string
  viewer_count?: number
  timestamp: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const event: StreamWebhookEvent = await req.json()
    console.log('Stream webhook event:', event)

    // Find the stream session by stream key
    const { data: streamKey, error: keyError } = await supabaseClient
      .from('stream_keys')
      .select('user_id')
      .eq('stream_key', event.stream_key)
      .single()

    if (keyError || !streamKey) {
      console.error('Stream key not found:', event.stream_key)
      return new Response(
        JSON.stringify({ error: 'Stream key not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (event.action === 'stream_started') {
      // Update stream sessions to live status
      const { error: updateError } = await supabaseClient
        .from('stream_sessions')
        .update({ 
          status: 'live',
          started_at: new Date().toISOString()
        })
        .eq('user_id', streamKey.user_id)
        .eq('status', 'preparing')

      if (updateError) {
        console.error('Error updating stream status:', updateError)
      }

      // Notify premium users about the live stream
      await notifyPremiumUsers(supabaseClient, streamKey.user_id)

    } else if (event.action === 'stream_ended') {
      // Update stream sessions to ended status
      const { error: updateError } = await supabaseClient
        .from('stream_sessions')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('user_id', streamKey.user_id)
        .eq('status', 'live')

      if (updateError) {
        console.error('Error updating stream status:', updateError)
      }

    } else if (event.action === 'viewer_update') {
      // Update viewer count
      const { error: updateError } = await supabaseClient
        .from('stream_sessions')
        .update({ 
          viewer_count: event.viewer_count || 0
        })
        .eq('user_id', streamKey.user_id)
        .eq('status', 'live')

      if (updateError) {
        console.error('Error updating viewer count:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function notifyPremiumUsers(supabase: any, streamerId: string) {
  try {
    // Get premium users
    const { data: premiumUsers, error } = await supabase
      .from('user_subscriptions')
      .select('user_id, profiles!inner(full_name)')
      .in('subscription_tier', ['pro', 'premium', 'enterprise'])
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching premium users:', error)
      return
    }

    // Get streamer info
    const { data: streamer } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', streamerId)
      .single()

    const streamerName = streamer?.full_name || 'Instructor'

    // Create notifications for premium users
    const notifications = premiumUsers.map((user: any) => ({
      user_id: user.user_id,
      type: 'live_stream_started',
      title: '🔴 Live Stream Started!',
      message: `${streamerName} has started a live stream. Join now!`,
      related_user_id: streamerId,
      related_content_id: streamerId
    }))

    if (notifications.length > 0) {
      await supabase
        .from('community_notifications')
        .insert(notifications)
    }

  } catch (error) {
    console.error('Error notifying premium users:', error)
  }
}