import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface SessionRequest {
  action: 'start' | 'end' | 'status' | 'schedule';
  scheduleId?: string;
  sessionData?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, scheduleId, sessionData }: SessionRequest = await req.json();
    console.log('GEOVA Session Manager - Action:', action);

    switch (action) {
      case 'start':
        return await startLiveSession(scheduleId!);
      case 'end':
        return await endLiveSession(scheduleId!);
      case 'status':
        return await getSessionStatus();
      case 'schedule':
        return await getUpcomingSchedule();
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in GEOVA session manager:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function startLiveSession(scheduleId: string) {
  console.log('Starting GEOVA live session:', scheduleId);

  // Get schedule details
  const { data: schedule, error: scheduleError } = await supabase
    .from('geova_teaching_schedule')
    .select('*')
    .eq('id', scheduleId)
    .single();

  if (scheduleError || !schedule) {
    throw new Error('Schedule not found');
  }

  // Create live class session
  const { data: liveClass, error: liveClassError } = await supabase
    .from('live_classes')
    .insert({
      title: `GEOVA Live: ${schedule.topic_title}`,
      description: schedule.topic_description,
      course_title: 'Geospatial Technology Unlocked',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + schedule.duration_minutes * 60000).toISOString(),
      status: 'live',
      stream_key: `geova_${scheduleId}`,
      viewer_count: 0,
      created_by: null // GEOVA is the instructor
    })
    .select()
    .single();

  if (liveClassError) {
    throw new Error('Failed to create live class');
  }

  // Update schedule status
  await supabase
    .from('geova_teaching_schedule')
    .update({
      status: 'live',
      session_id: liveClass.id
    })
    .eq('id', scheduleId);

  // Notify enrolled students
  await notifyEnrolledStudents(schedule);

  console.log('GEOVA live session started:', liveClass.id);

  return new Response(JSON.stringify({
    success: true,
    session: liveClass,
    schedule: schedule
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function endLiveSession(scheduleId: string) {
  console.log('Ending GEOVA live session:', scheduleId);

  // Get schedule and session details
  const { data: schedule, error: scheduleError } = await supabase
    .from('geova_teaching_schedule')
    .select('*, session_id')
    .eq('id', scheduleId)
    .single();

  if (scheduleError || !schedule) {
    throw new Error('Schedule not found');
  }

  if (schedule.session_id) {
    // Update live class status
    await supabase
      .from('live_classes')
      .update({
        status: 'ended',
        end_time: new Date().toISOString()
      })
      .eq('id', schedule.session_id);
  }

  // Update schedule status
  await supabase
    .from('geova_teaching_schedule')
    .update({
      status: 'completed'
    })
    .eq('id', scheduleId);

  console.log('GEOVA live session ended');

  return new Response(JSON.stringify({
    success: true,
    message: 'Session ended successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getSessionStatus() {
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's schedule
  const { data: todaySchedule, error: scheduleError } = await supabase
    .from('geova_teaching_schedule')
    .select('*')
    .eq('scheduled_date', today)
    .single();

  if (scheduleError) {
    return new Response(JSON.stringify({
      isLive: false,
      nextSession: null,
      todaySchedule: null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check if there's an active live session
  const { data: activeSession } = await supabase
    .from('live_classes')
    .select('*')
    .eq('id', todaySchedule.session_id)
    .eq('status', 'live')
    .single();

  // Get next upcoming session
  const { data: nextSessions } = await supabase
    .from('geova_teaching_schedule')
    .select('*')
    .gt('scheduled_date', today)
    .eq('status', 'scheduled')
    .order('scheduled_date', { ascending: true })
    .limit(1);

  return new Response(JSON.stringify({
    isLive: !!activeSession,
    activeSession: activeSession,
    todaySchedule: todaySchedule,
    nextSession: nextSessions?.[0] || null
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getUpcomingSchedule() {
  const { data: schedule, error } = await supabase
    .from('geova_teaching_schedule')
    .select('*')
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })
    .limit(7); // Next 7 days

  if (error) {
    throw new Error('Failed to fetch schedule');
  }

  return new Response(JSON.stringify({
    success: true,
    schedule: schedule
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function notifyEnrolledStudents(schedule: any) {
  // This would integrate with your notification system
  // For now, we'll just log
  console.log(`Notifying students about GEOVA live session: ${schedule.topic_title}`);
  
  // In a full implementation, you would:
  // 1. Get all enrolled students for the course
  // 2. Send email notifications
  // 3. Create in-app notifications
  // 4. Maybe send SMS for urgent sessions
}