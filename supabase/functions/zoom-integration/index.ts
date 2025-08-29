import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ZoomMeetingRequest {
  topic: string;
  description?: string;
  start_time: string;
  duration: number;
  access_tier?: string;
  recording_enabled?: boolean;
  waiting_room?: boolean;
}

interface ZoomMeetingResponse {
  id: string;
  topic: string;
  start_url: string;
  join_url: string;
  password: string;
  start_time: string;
  duration: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { 'Authorization': req.headers.get('Authorization') || '' }
        }
      }
    )

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, ...payload } = await req.json()

    switch (action) {
      case 'create_meeting':
        return await createZoomMeeting(supabase, user.id, payload)
      case 'get_meetings':
        return await getZoomMeetings(supabase, user.id)
      case 'join_meeting':
        return await joinMeeting(supabase, user.id, payload.meeting_id)
      case 'get_recordings':
        return await getRecordings(supabase, payload.meeting_id)
      case 'update_meeting_status':
        return await updateMeetingStatus(supabase, payload.meeting_id, payload.status)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Zoom integration error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function getZoomAccessToken(): Promise<string> {
  const clientId = Deno.env.get('ZOOM_CLIENT_ID')
  const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET')
  const accountId = Deno.env.get('ZOOM_ACCOUNT_ID')

  if (!clientId || !clientSecret || !accountId) {
    throw new Error('Missing Zoom credentials')
  }

  const auth = btoa(`${clientId}:${clientSecret}`)
  
  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=account_credentials&account_id=${accountId}`,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Zoom OAuth error:', errorText)
    throw new Error(`Failed to get Zoom access token: ${response.status}`)
  }

  const data: ZoomTokenResponse = await response.json()
  return data.access_token
}

async function createZoomMeeting(supabase: any, userId: string, meetingData: ZoomMeetingRequest) {
  try {
    // Check if user has permission to create meetings (admin or super admin)
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (rolesError) {
      console.error('Role fetch error:', rolesError)
    }
    
    // Check if user is super admin by email (contact@haritahive.com)
    const { data: userData } = await supabase.auth.getUser()
    const isSuperAdmin = userData.user?.email === 'contact@haritahive.com'
    
    const isAdmin = Array.isArray(roles) && roles.some((r: any) => r.role === 'admin' || r.role === 'super_admin')
    
    if (!isAdmin && !isSuperAdmin) {
      throw new Error('Only administrators can create meetings')
    }

    const accessToken = await getZoomAccessToken()

    const zoomMeetingData = {
      topic: meetingData.topic,
      type: 2, // Scheduled meeting
      start_time: meetingData.start_time,
      duration: meetingData.duration,
      timezone: 'UTC',
      password: generateMeetingPassword(),
      settings: {
        host_video: true,
        participant_video: true,
        cn_meeting: false,
        in_meeting: false,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 2,
        audio: 'both',
        auto_recording: meetingData.recording_enabled ? 'cloud' : 'none',
        waiting_room: meetingData.waiting_room ?? true,
      }
    }

    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zoomMeetingData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Zoom meeting creation error:', errorText)
      throw new Error(`Failed to create Zoom meeting: ${response.status}`)
    }

    const zoomMeeting: ZoomMeetingResponse = await response.json()

    // Save meeting to database
    const { data: dbMeeting, error: dbError } = await supabase
      .from('zoom_meetings')
      .insert({
        zoom_meeting_id: zoomMeeting.id,
        host_user_id: userId,
        topic: zoomMeeting.topic,
        description: meetingData.description,
        start_time: zoomMeeting.start_time,
        duration: zoomMeeting.duration,
        password: zoomMeeting.password,
        join_url: zoomMeeting.join_url,
        start_url: zoomMeeting.start_url,
        access_tier: meetingData.access_tier || 'free',
        recording_enabled: meetingData.recording_enabled ?? true,
        waiting_room: meetingData.waiting_room ?? true,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save meeting to database')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        meeting: dbMeeting,
        zoom_meeting: zoomMeeting 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Create meeting error:', error)
    throw error
  }
}

async function getZoomMeetings(supabase: any, userId: string) {
  try {
    const { data: meetings, error } = await supabase
      .from('zoom_meetings')
      .select(`
        *,
        zoom_meeting_participants(count)
      `)
      .order('start_time', { ascending: true })

    if (error) {
      throw new Error('Failed to fetch meetings')
    }

    return new Response(
      JSON.stringify({ success: true, meetings }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Get meetings error:', error)
    throw error
  }
}

async function joinMeeting(supabase: any, userId: string, meetingId: string) {
  try {
    // Check if meeting exists and user has access
    const { data: meeting, error: meetingError } = await supabase
      .from('zoom_meetings')
      .select('*')
      .eq('id', meetingId)
      .single()

    if (meetingError || !meeting) {
      throw new Error('Meeting not found')
    }

    // Check access permissions
    if (meeting.access_tier === 'premium') {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('subscription_tier, status')
        .eq('user_id', userId)
        .single()

      if (!subscription || subscription.subscription_tier === 'free' || subscription.status !== 'active') {
        throw new Error('Premium access required')
      }
    }

    // Register participant (ignore duplicates)
    const { error: participantError } = await supabase
      .from('zoom_meeting_participants')
      .upsert({
        meeting_id: meetingId,
        user_id: userId,
      }, { onConflict: 'meeting_id,user_id', ignoreDuplicates: true })


    if (participantError) {
      console.error('Participant registration error:', participantError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        join_url: meeting.join_url,
        meeting_id: meeting.zoom_meeting_id,
        password: meeting.password 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Join meeting error:', error)
    throw error
  }
}

async function getRecordings(supabase: any, meetingId: string) {
  try {
    const { data: recordings, error } = await supabase
      .from('zoom_recordings')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('recording_start', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch recordings')
    }

    return new Response(
      JSON.stringify({ success: true, recordings }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Get recordings error:', error)
    throw error
  }
}

async function updateMeetingStatus(supabase: any, meetingId: string, status: string) {
  try {
    const { data: meeting, error } = await supabase
      .from('zoom_meetings')
      .update({ status })
      .eq('id', meetingId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update meeting status')
    }

    return new Response(
      JSON.stringify({ success: true, meeting }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Update status error:', error)
    throw error
  }
}

function generateMeetingPassword(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}