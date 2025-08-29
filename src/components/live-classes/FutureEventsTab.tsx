import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ExternalLink, Users, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number; // minutes
  meetingLink?: string;
  type: 'webinar' | 'workshop' | 'course' | 'zoom_meeting';
  instructor?: string;
  capacity?: number;
  registered?: number;
  timezone: string;
  isToday?: boolean;
}

const FutureEventsTab = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load upcoming events - this would typically come from your backend
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      setLoading(true);
      
      // Get upcoming live classes from database
      const { data: upcomingClasses, error: classError } = await supabase
        .from('live_classes')
        .select('*')
        .in('status', ['scheduled'])
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      // Get GEOVA teaching schedule
      const { data: geovaSchedule, error: geovaError } = await supabase
        .from('geova_teaching_schedule')
        .select('*')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true })
        .limit(5);

      // Get Zoom meetings
      const { data: zoomMeetings, error: zoomError } = await supabase
        .from('zoom_meetings')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      const events: UpcomingEvent[] = [];
      const today = new Date().toDateString();
      
      // Process live classes
      if (upcomingClasses && !classError) {
        upcomingClasses.forEach(liveClass => {
          const startDate = new Date(liveClass.start_time);
          const isToday = startDate.toDateString() === today;
          events.push({
            id: liveClass.id,
            title: liveClass.title,
            description: liveClass.description || 'Live interactive class from HaritaHive Studio',
            date: startDate.toISOString().split('T')[0],
            time: startDate.toTimeString().split(' ')[0].substring(0, 5),
            duration: liveClass.duration_minutes || 90,
            type: liveClass.instructor === 'GEOVA AI' ? 'course' : 'webinar',
            instructor: liveClass.instructor || 'Expert Instructor',
            meetingLink: liveClass.youtube_url || undefined,
            timezone: 'IST',
            isToday
          });
        });
      }
      
      // Process GEOVA sessions
      if (geovaSchedule && !geovaError) {
        geovaSchedule.forEach(session => {
          const eventDate = new Date(session.scheduled_date);
          const isToday = eventDate.toDateString() === today;
          events.push({
            id: `geova-${session.id}`,
            title: `Day ${session.day_number}: ${session.topic_title}`,
            description: session.topic_description || 'Interactive AI-powered learning session',
            date: session.scheduled_date,
            time: session.scheduled_time || '05:00',
            duration: session.duration_minutes || 90,
            type: 'course',
            instructor: 'GEOVA AI Mentor',
            timezone: 'IST',
            isToday
          });
        });
      }

      // Process Zoom meetings
      if (zoomMeetings && !zoomError) {
        zoomMeetings.forEach(meeting => {
          const startDate = new Date(meeting.start_time);
          const isToday = startDate.toDateString() === today;
          events.push({
            id: meeting.id,
            title: meeting.topic,
            description: meeting.description || 'Zoom meeting session',
            date: startDate.toISOString().split('T')[0],
            time: startDate.toTimeString().split(' ')[0].substring(0, 5),
            duration: meeting.duration || 60,
            type: 'zoom_meeting',
            instructor: 'HaritaHive Team',
            meetingLink: meeting.join_url,
            timezone: 'IST',
            isToday
          });
        });
      }

      // Sort events by date and time
      events.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}:00`);
        const dateB = new Date(`${b.date}T${b.time}:00`);
        return dateA.getTime() - dateB.getTime();
      });

      setEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load upcoming events');
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatEventTime = (timeStr: string, timezone: string) => {
    const [hours, minutes] = timeStr.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ` ${timezone}`;
  };

  const getTimeUntilEvent = (dateStr: string, timeStr: string) => {
    const eventDate = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    const diffMs = eventDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Event started';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} away`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} away`;
    return 'Starting soon';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'webinar':
        return <Video className="h-4 w-4" />;
      case 'workshop':
        return <Users className="h-4 w-4" />;
      case 'course':
        return <Calendar className="h-4 w-4" />;
      case 'zoom_meeting':
        return <Video className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'webinar':
        return <Badge variant="secondary">Free Webinar</Badge>;
      case 'workshop':
        return <Badge variant="outline">Workshop</Badge>;
      case 'course':
        return <Badge variant="default">Course</Badge>;
      case 'zoom_meeting':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Zoom Meeting</Badge>;
      default:
        return <Badge variant="outline">Event</Badge>;
    }
  };

  const handleJoinEvent = (event: UpcomingEvent) => {
    // If it's today's event, redirect to Live Now tab
    if (event.isToday) {
      // Trigger tab change by dispatching a custom event
      window.dispatchEvent(new CustomEvent('switchToLiveNow'));
      toast.success(`Redirecting to Live Now for today's ${event.title}`);
      return;
    }

    if (event.meetingLink) {
      window.open(event.meetingLink, '_blank');
      toast.success(`Opening ${event.title}`);
    } else {
      toast.error('No meeting link available for this event');
    }
  };

  const addToCalendar = (event: UpcomingEvent) => {
    const startDate = new Date(`${event.date}T${event.time}:00`);
    const endDate = new Date(startDate.getTime() + event.duration * 60000);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Upcoming Webinars and Live Events</h3>
        <p className="text-muted-foreground">
          Join expert-led sessions and expand your geospatial knowledge
        </p>
      </div>

      {events.length > 0 ? (
        <div className="space-y-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getEventTypeIcon(event.type)}
                      {getEventTypeBadge(event.type)}
                      {event.capacity && event.registered && (
                        <Badge variant="outline" className="text-xs">
                          {event.registered}/{event.capacity} registered
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                    <p className="text-muted-foreground text-sm mb-3">
                      {event.description}
                    </p>
                    {event.instructor && (
                      <p className="text-sm font-medium text-primary">
                        Instructor: {event.instructor}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right sm:min-w-[200px]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-end gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatEventDate(event.date)}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {formatEventTime(event.time, event.timezone)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getTimeUntilEvent(event.date, event.time)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.duration} minutes
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleJoinEvent(event)}
                    className="flex-1 sm:flex-none"
                    variant={event.isToday ? "default" : "outline"}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {event.isToday ? 'Go to Live Now' : (event.meetingLink ? 'Join Event' : 'Event Info')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => addToCalendar(event)}
                    className="flex-1 sm:flex-none"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
            <p className="text-muted-foreground">
              Check back soon for new webinars and workshops!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FutureEventsTab;