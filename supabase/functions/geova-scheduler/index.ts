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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('GEOVA Scheduler triggered');
    
    // Get current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istNow = new Date(now.getTime() + istOffset);
    const todayIST = istNow.toISOString().split('T')[0];
    
    console.log(`Checking for sessions on ${todayIST}`);

    // Check if there's a scheduled session for today that should be starting
    const { data: schedules, error: scheduleError } = await supabase
      .from('geova_teaching_schedule')
      .select('*')
      .eq('scheduled_date', todayIST)
      .eq('status', 'scheduled');

    if (scheduleError) {
      console.error('Error fetching schedules:', scheduleError);
      throw scheduleError;
    }

    if (!schedules || schedules.length === 0) {
      console.log('No scheduled sessions for today');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No sessions scheduled for today' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const todaySchedule = schedules[0];
    console.log(`Found session: Day ${todaySchedule.day_number} - ${todaySchedule.topic_title}`);

    // Check if it's time to start (5:00 AM IST = 23:30 UTC previous day or 23:30 UTC same day depending on date)
    const sessionDateTime = new Date(`${todaySchedule.scheduled_date}T${todaySchedule.scheduled_time}`);
    const sessionTimeIST = new Date(sessionDateTime.getTime() + istOffset);
    
    // Allow starting 5 minutes before or after scheduled time
    const timeDiff = Math.abs(istNow.getTime() - sessionTimeIST.getTime());
    const fiveMinutes = 5 * 60 * 1000;

    if (timeDiff <= fiveMinutes) {
      console.log('Starting GEOVA session automatically');
      
      // Create live class session
      const { data: liveClass, error: liveClassError } = await supabase
        .from('live_classes')
        .insert({
          title: `GEOVA Live: ${todaySchedule.topic_title}`,
          description: `Day ${todaySchedule.day_number}: ${todaySchedule.topic_description}`,
          course_title: 'Geospatial Technology Unlocked',
          start_time: istNow.toISOString(),
          end_time: new Date(istNow.getTime() + todaySchedule.duration_minutes * 60000).toISOString(),
          status: 'live',
          stream_key: `geova_day_${todaySchedule.day_number}`,
          viewer_count: 0,
          created_by: null // GEOVA is the instructor
        })
        .select()
        .single();

      if (liveClassError) {
        console.error('Error creating live class:', liveClassError);
        throw liveClassError;
      }

      // Update schedule status
      const { error: updateError } = await supabase
        .from('geova_teaching_schedule')
        .update({
          status: 'live',
          session_id: liveClass.id
        })
        .eq('id', todaySchedule.id);

      if (updateError) {
        console.error('Error updating schedule:', updateError);
        throw updateError;
      }

      // Send notifications to enrolled students
      await sendStudentNotifications(todaySchedule);

      console.log(`GEOVA session started successfully: ${liveClass.id}`);

      return new Response(JSON.stringify({
        success: true,
        message: 'GEOVA session started',
        session: liveClass,
        schedule: todaySchedule
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      console.log(`Session not ready to start. Time difference: ${timeDiff}ms`);
      return new Response(JSON.stringify({
        success: true,
        message: 'Session scheduled but not time to start yet',
        timeDiff: timeDiff,
        scheduledTime: sessionTimeIST.toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in GEOVA scheduler:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendStudentNotifications(schedule: any) {
  try {
    console.log('Sending notifications to enrolled students');
    
    // Get all users enrolled in the Geospatial Technology Unlocked course
    const { data: enrolledUsers, error } = await supabase
      .from('profiles')
      .select('id, full_name, enrolled_courses')
      .contains('enrolled_courses', ['Geospatial Technology Unlocked']);

    if (error) {
      console.error('Error fetching enrolled users:', error);
      return;
    }

    if (!enrolledUsers || enrolledUsers.length === 0) {
      console.log('No enrolled users found');
      return;
    }

    console.log(`Found ${enrolledUsers.length} enrolled students`);

    // Create in-app notifications for each enrolled user
    const notifications = enrolledUsers.map(user => ({
      user_id: user.id,
      type: 'live_class',
      title: '🤖 GEOVA Live Session Starting Now!',
      message: `Day ${schedule.day_number}: ${schedule.topic_title} is starting now. Join the live session!`,
      related_content_id: schedule.id,
      created_at: new Date().toISOString()
    }));

    const { error: notificationError } = await supabase
      .from('community_notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error sending notifications:', notificationError);
    } else {
      console.log(`Sent notifications to ${enrolledUsers.length} students`);
    }

    // Here you could also integrate with email service like Resend
    // or push notifications service for mobile apps

  } catch (error) {
    console.error('Error sending student notifications:', error);
  }
}