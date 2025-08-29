import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, Users, ExternalLink } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

interface TodayEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  duration: number;
  type: 'live_class' | 'zoom_meeting' | 'geova_session';
  join_url?: string;
  status: 'upcoming' | 'live' | 'ended';
}

const TodaysSchedule = () => {
  const { user } = useAuth();
  const [todaysEvents, setTodaysEvents] = useState<TodayEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaysEvents();
  }, []);

  const loadTodaysEvents = async () => {
    try {
      setLoading(true);
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Get today's live classes
      const { data: liveClasses, error: liveError } = await supabase
        .from('live_classes')
        .select('*')
        .gte('starts_at', todayStart.toISOString())
        .lt('starts_at', todayEnd.toISOString())
        .order('starts_at', { ascending: true });

      // Get today's Zoom meetings
      const { data: zoomMeetings, error: zoomError } = await supabase
        .from('zoom_meetings')
        .select('*')
        .gte('start_time', todayStart.toISOString())
        .lt('start_time', todayEnd.toISOString())
        .order('start_time', { ascending: true });

      // Get today's GEOVA sessions
      const { data: geovaSessions, error: geovaError } = await supabase
        .from('geova_teaching_schedule')
        .select('*')
        .eq('scheduled_date', today.toISOString().split('T')[0])
        .order('scheduled_time', { ascending: true });

      const events: TodayEvent[] = [];
      const now = new Date();

      // Process live classes
      if (liveClasses && !liveError) {
        liveClasses.forEach(liveClass => {
          const startTime = new Date(liveClass.starts_at);
          const endTime = new Date(startTime.getTime() + (liveClass.duration_minutes || 90) * 60000);
          
          let status: 'upcoming' | 'live' | 'ended' = 'upcoming';
          if (now >= startTime && now <= endTime) {
            status = 'live';
          } else if (now > endTime) {
            status = 'ended';
          }

          events.push({
            id: liveClass.id,
            title: liveClass.title,
            description: liveClass.description,
            start_time: liveClass.starts_at,
            duration: liveClass.duration_minutes || 90,
            type: 'live_class',
            join_url: liveClass.youtube_url || liveClass.embed_url,
            status
          });
        });
      }

      // Process Zoom meetings
      if (zoomMeetings && !zoomError) {
        zoomMeetings.forEach(meeting => {
          const startTime = new Date(meeting.start_time);
          const endTime = new Date(startTime.getTime() + (meeting.duration || 60) * 60000);
          
          let status: 'upcoming' | 'live' | 'ended' = 'upcoming';
          if (now >= startTime && now <= endTime) {
            status = 'live';
          } else if (now > endTime) {
            status = 'ended';
          }

          events.push({
            id: meeting.id,
            title: meeting.topic,
            description: meeting.description,
            start_time: meeting.start_time,
            duration: meeting.duration || 60,
            type: 'zoom_meeting',
            join_url: meeting.join_url,
            status
          });
        });
      }

      // Process GEOVA sessions
      if (geovaSessions && !geovaError) {
        geovaSessions.forEach(session => {
          const sessionDate = new Date(`${session.scheduled_date}T${session.scheduled_time || '05:00'}:00`);
          const endTime = new Date(sessionDate.getTime() + (session.duration_minutes || 90) * 60000);
          
          let status: 'upcoming' | 'live' | 'ended' = 'upcoming';
          if (now >= sessionDate && now <= endTime) {
            status = 'live';
          } else if (now > endTime) {
            status = 'ended';
          }

          events.push({
            id: session.id,
            title: `Day ${session.day_number}: ${session.topic_title}`,
            description: session.topic_description,
            start_time: sessionDate.toISOString(),
            duration: session.duration_minutes || 90,
            type: 'geova_session',
            join_url: undefined, // GEOVA sessions don't have direct join URLs
            status
          });
        });
      }

      // Sort events by start time
      events.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      setTodaysEvents(events);
    } catch (error) {
      console.error('Error loading today\'s events:', error);
      toast.error('Failed to load today\'s schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = (event: TodayEvent) => {
    if (!event.join_url) {
      toast.error('No meeting link available');
      return;
    }

    if (event.status === 'upcoming') {
      toast.info('This event hasn\'t started yet');
      return;
    }

    window.open(event.join_url, '_blank');
    toast.success(`Opening ${event.title}`);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge variant="destructive" className="animate-pulse">LIVE</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      case 'ended':
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'zoom_meeting':
        return <Video className="h-4 w-4" />;
      case 'live_class':
        return <Video className="h-4 w-4" />;
      case 'geova_session':
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (todaysEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events scheduled for today</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todaysEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getTypeIcon(event.type)}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{event.title}</h4>
                    {getStatusBadge(event.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(event.start_time)}
                    </div>
                    <span>{event.duration} min</span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1 max-w-md">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {event.status === 'live' && (
                  <Button
                    size="sm"
                    onClick={() => handleJoinEvent(event)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Join Live
                  </Button>
                )}
                {event.status === 'upcoming' && event.join_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleJoinEvent(event)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysSchedule;