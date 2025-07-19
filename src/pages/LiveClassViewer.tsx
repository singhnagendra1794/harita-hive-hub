import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SubscriptionRoute from '@/components/SubscriptionRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, Users, AlertCircle, ExternalLink, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import CountdownTimer from '@/components/live-streaming/CountdownTimer';
import ClassQAWidget from '@/components/live-streaming/ClassQAWidget';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  video_url: string;
  youtube_video_id: string;
  starts_at: string;
  ends_at: string | null;
  is_live: boolean;
  access_tier: string;
  thumbnail_url: string | null;
  instructor: string;
  created_at: string;
  stream_key?: string;
  stream_server_url?: string;
  recording_url?: string;
  class_status: 'upcoming' | 'live' | 'ended' | 'recorded';
  viewer_count: number;
  chat_enabled: boolean;
  stream_type: 'youtube' | 'obs' | 'hybrid';
}

const LiveClassViewer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchLiveClass(id);
      checkRegistrationStatus(id);
    }
  }, [id, user]);

  const fetchLiveClass = async (classId: string) => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Live class not found');
        } else {
          throw error;
        }
        return;
      }

      setLiveClass(data as LiveClass);
      setIsInstructor(data.created_by === user?.id);
      
      // Track attendance if registered and class is live
      if (data.class_status === 'live' && isRegistered) {
        trackAttendance(data.id, 'join');
      }
    } catch (error) {
      console.error('Error fetching live class:', error);
      setError('Failed to load live class');
      toast({
        title: "Error",
        description: "Failed to load live class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isLive = (startsAt: string, endsAt: string | null, isLiveFlag: boolean) => {
    const now = new Date();
    const start = new Date(startsAt);
    const end = endsAt ? new Date(endsAt) : null;
    
    return isLiveFlag && now >= start && (!end || now <= end);
  };

  const isUpcoming = (startsAt: string) => {
    return new Date(startsAt) > new Date();
  };

  const checkRegistrationStatus = async (classId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('class_registrations')
        .select('*')
        .eq('class_id', classId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setIsRegistered(!!data);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const trackAttendance = async (classId: string, action: 'join' | 'leave') => {
    if (!user) return;

    try {
      await supabase.rpc('track_class_attendance', {
        p_class_id: classId,
        p_user_id: user.id,
        p_action: action
      });
    } catch (error) {
      console.error('Error tracking attendance:', error);
    }
  };

  const registerForClass = async () => {
    if (!user || !liveClass) return;

    try {
      const { error } = await supabase
        .from('class_registrations')
        .insert([{
          class_id: liveClass.id,
          user_id: user.id,
        }]);

      if (error) throw error;

      setIsRegistered(true);
      toast({
        title: "Registered",
        description: "You've been registered for this class",
      });
    } catch (error) {
      console.error('Error registering for class:', error);
      toast({
        title: "Error",
        description: "Failed to register for class",
        variant: "destructive",
      });
    }
  };

  const getTimeUntilStart = (startsAt: string) => {
    const now = new Date();
    const start = new Date(startsAt);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStreamPlayer = () => {
    if (!liveClass) return null;

    const streamType = liveClass.stream_type || 'youtube';
    const classIsLive = liveClass.class_status === 'live';
    const classIsUpcoming = liveClass.class_status === 'upcoming';

    // Show recording if available
    if (liveClass.class_status === 'recorded' && liveClass.recording_url) {
      return (
        <div className="aspect-video">
          <iframe
            src={liveClass.recording_url}
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${liveClass.title} - Recording`}
          />
        </div>
      );
    }

    if (streamType === 'youtube' && liveClass.youtube_video_id) {
      return (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${liveClass.youtube_video_id}${classIsLive ? '?autoplay=1&modestbranding=1&rel=0' : '?modestbranding=1&rel=0'}`}
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={liveClass.title}
          />
        </div>
      );
    }

    if (streamType === 'obs' && liveClass.stream_key) {
      return (
        <div className="aspect-video">
          {classIsLive ? (
            <div className="w-full h-full rounded-lg bg-black flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg mb-2">🔴 Live OBS Stream</p>
                <p className="text-sm opacity-75">
                  Instructor is streaming via OBS Studio
                </p>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">OBS Stream Not Active</p>
                <p className="text-sm opacity-75">
                  {classIsUpcoming 
                    ? "Stream will start when the instructor goes live" 
                    : "This stream has ended"}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-16 w-16 mx-auto mb-4" />
          <p className="text-lg mb-2">Stream Configuration Error</p>
          <p className="text-sm">No valid stream source configured</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !liveClass) {
    return (
      <Layout>
        <div className="container py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Class Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error || "The live class you're looking for doesn't exist."}
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const requiredTier = liveClass.access_tier as 'free' | 'premium' | 'pro' | 'enterprise';
  const classIsLive = liveClass.class_status === 'live';
  const classIsUpcoming = liveClass.class_status === 'upcoming';
  const classIsRecorded = liveClass.class_status === 'recorded';
  const timeUntilStart = getTimeUntilStart(liveClass.starts_at);

  return (
    <SubscriptionRoute requiredTier={requiredTier}>
      <Layout>
        <div className="container py-8">
          <div className="max-w-7xl mx-auto">
            {/* Countdown Timer for Upcoming Classes */}
            {classIsUpcoming && timeUntilStart && (
              <div className="mb-6">
                <CountdownTimer
                  startTime={liveClass.starts_at}
                  title={liveClass.title}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Class Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <CardTitle className="text-2xl">{liveClass.title}</CardTitle>
                          {classIsLive && (
                            <Badge variant="destructive" className="animate-pulse">
                              🔴 LIVE
                            </Badge>
                          )}
                          {classIsUpcoming && (
                            <Badge variant="outline">
                              Upcoming
                            </Badge>
                          )}
                          {classIsRecorded && (
                            <Badge variant="secondary">
                              Recorded
                            </Badge>
                          )}
                          <Badge variant="secondary">{liveClass.access_tier}</Badge>
                          <Badge variant="outline">{liveClass.stream_type}</Badge>
                        </div>
                        {liveClass.description && (
                          <CardDescription className="text-base">
                            {liveClass.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(liveClass.starts_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(liveClass.starts_at).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        {liveClass.instructor}
                      </div>
                      {classIsLive && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Users className="h-4 w-4" />
                          {liveClass.viewer_count} watching
                        </div>
                      )}
                    </div>
                    
                    {/* Registration Button */}
                    {!isRegistered && !isInstructor && (
                      <div className="pt-4">
                        <Button onClick={registerForClass}>
                          Register for Class
                        </Button>
                      </div>
                    )}
                    
                    {isRegistered && !isInstructor && (
                      <div className="pt-4">
                        <Badge variant="outline" className="text-green-600">
                          ✓ Registered
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                </Card>

                {/* Video Player */}
                <Card>
                  <CardContent className="p-0">
                    {!classIsUpcoming ? (
                      getStreamPlayer()
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Class Hasn't Started Yet</h3>
                          <p className="text-muted-foreground">
                            {timeUntilStart ? `Starts in ${timeUntilStart}` : 'Starting soon...'}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Class Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Class Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Instructor</h4>
                        <p className="text-muted-foreground">{liveClass.instructor}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Stream Type</h4>
                        <Badge variant="outline">{liveClass.stream_type}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Access Level</h4>
                        <Badge variant="outline">{liveClass.access_tier}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Status</h4>
                        <Badge variant={classIsLive ? 'destructive' : classIsRecorded ? 'secondary' : 'outline'}>
                          {liveClass.class_status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Start Time</h4>
                        <p className="text-muted-foreground">
                          {new Date(liveClass.starts_at).toLocaleString()}
                        </p>
                      </div>
                      {liveClass.ends_at && (
                        <div>
                          <h4 className="font-medium mb-1">End Time</h4>
                          <p className="text-muted-foreground">
                            {new Date(liveClass.ends_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Recording Notice</h4>
                      <p className="text-sm text-muted-foreground">
                        {classIsRecorded 
                          ? "This class has been recorded and is available for replay."
                          : classIsLive
                            ? "This class is being recorded and will be available for playback after the session ends."
                            : "This class will be recorded for later viewing."
                        } All recordings are stored securely and accessible only to registered students.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4 flex-wrap">
                      {liveClass.stream_type === 'youtube' && liveClass.youtube_video_id && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(`https://youtube.com/watch?v=${liveClass.youtube_video_id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in YouTube
                        </Button>
                      )}
                      {classIsRecorded && liveClass.recording_url && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(liveClass.recording_url!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Watch Full Recording
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Q&A Widget */}
                {liveClass.chat_enabled && (
                  <ClassQAWidget
                    classId={liveClass.id}
                    isInstructor={isInstructor}
                    isRegistered={isRegistered}
                  />
                )}

                {/* Class Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Class Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Viewers</span>
                      <span className="font-medium">{liveClass.viewer_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Registration Status</span>
                      <Badge variant={isRegistered ? 'secondary' : 'outline'}>
                        {isRegistered ? 'Registered' : 'Not Registered'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Chat Enabled</span>
                      <Badge variant={liveClass.chat_enabled ? 'secondary' : 'outline'}>
                        {liveClass.chat_enabled ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </SubscriptionRoute>
  );
};

export default LiveClassViewer;