import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { streamTitle, streamUrl } = await req.json()

    // Get all users to notify
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      throw usersError
    }

    // Create notifications for all users
    const notifications = users.users.map(user => ({
      user_id: user.id,
      type: 'live_stream',
      title: 'Live Stream Started!',
      message: `${streamTitle} is now live. Join now!`,
      related_content_id: streamUrl,
      read: false
    }))

    // Insert notifications
    const { error: notificationError } = await supabase
      .from('community_notifications')
      .insert(notifications)

    if (notificationError) {
      console.error('Error creating notifications:', notificationError)
    }

    // You could also integrate with external services here:
    // - Email notifications
    // - Push notifications
    // - Discord/Slack webhooks
    // - SMS notifications

    console.log(`Sent notifications to ${users.users.length} users for stream: ${streamTitle}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: users.users.length,
        message: 'Notifications sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error sending notifications:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notifications',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})