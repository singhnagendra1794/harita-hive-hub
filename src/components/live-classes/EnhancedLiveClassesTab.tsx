import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  Users, 
  Radio, 
  Bot, 
  RefreshCw, 
  Lock, 
  Clock,
  Play,
  Download,
  Eye,
  Calendar,
  Youtube,
  ExternalLink
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { GEOVALiveClassroom } from '@/components/geova/GEOVALiveClassroom';
import { ScreenProtection } from '@/components/security/ScreenProtection';
import { UserWatermark } from '@/components/security/UserWatermark';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  embed_url: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  is_free: boolean;
  is_home_featured: boolean;
  platform: 'youtube' | 'aws' | 'obs';
  status: 'scheduled' | 'live' | 'ended';
  viewer_count: number;
}

interface ClassRecording {
  id: string;
  title: string;
  description?: string;
  youtube_url?: string;
  aws_url?: string;
  cloudfront_url?: string;
  thumbnail_url?: string;
  view_count: number;
  download_count: number;
  is_public: boolean;
  created_at: string;
}

interface GEOVASession {
  isLive: boolean;
  activeSession?: any;
  todaySchedule?: any;
}

const EnhancedLiveClassesTab = () => {
  const { user } = useAuth();
  const { hasAccess, loading: premiumLoading } = usePremiumAccess();
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [upcomingStreams, setUpcomingStreams] = useState<LiveStream[]>([]);
  const [recordings, setRecordings] = useState<ClassRecording[]>([]);
  const [geovaSession, setGeovaSession] = useState<GEOVASession | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    if (!premiumLoading) {
      fetchData();
    }
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (!premiumLoading) {
        fetchData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [premiumLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Check GEOVA AI session
      const { data: geovaData } = await supabase.functions.invoke('geova-session-manager', {
        body: { action: 'status' }
      });
      
      if (geovaData) {
        setGeovaSession(geovaData);
        if (geovaData.isLive) {
          setCurrentStream({
            id: 'geova-live',
            title: `GEOVA AI Teaching - Day ${geovaData.activeSession?.day_number || 'N/A'}`,
            description: geovaData.activeSession?.topic_title || 'Live AI-powered geospatial education',
            embed_url: '',
            start_time: geovaData.activeSession?.started_at || new Date().toISOString(),
            duration_minutes: 90,
            is_free: true,
            is_home_featured: true,
            platform: 'youtube',
            status: 'live',
            viewer_count: Math.floor(Math.random() * 50) + 20
          });
          setLoading(false);
          return;
        }
      }

      // Fetch live streams
      const now = new Date();
      const tenMinutesBuffer = 10 * 60 * 1000;
      
      const { data: liveStreams } = await supabase
        .from('live_streams')
        .select('*')
        .order('start_time', { ascending: false });

      if (liveStreams) {
        // Find current live stream
        const activeStream = liveStreams.find(stream => {
          const startTime = new Date(stream.start_time);
          const endTime = stream.end_time ? new Date(stream.end_time) : 
            new Date(startTime.getTime() + stream.duration_minutes * 60000);
          const timeUntilStart = startTime.getTime() - now.getTime();
          const isWithinBuffer = timeUntilStart <= tenMinutesBuffer && timeUntilStart >= -tenMinutesBuffer;
          const isCurrentlyLive = now >= startTime && now <= endTime;
          
          return isCurrentlyLive || isWithinBuffer;
        });

        if (activeStream) {
          setCurrentStream({
            ...activeStream,
            platform: activeStream.platform as 'youtube' | 'aws' | 'obs',
            status: now >= new Date(activeStream.start_time) ? 'live' : 'scheduled',
            description: activeStream.description || undefined,
            end_time: activeStream.end_time || undefined,
            duration_minutes: activeStream.duration_minutes || 90,
            viewer_count: activeStream.viewer_count || 0
          });
        } else {
          setCurrentStream(null);
        }

        // Set upcoming streams
        const upcoming = liveStreams.filter(stream => {
          const startTime = new Date(stream.start_time);
          return startTime > now && stream.status === 'scheduled';
        }).slice(0, 5).map(stream => ({
          ...stream,
          platform: stream.platform as 'youtube' | 'aws' | 'obs',
          status: stream.status as 'scheduled' | 'live' | 'ended',
          description: stream.description || undefined,
          end_time: stream.end_time || undefined,
          duration_minutes: stream.duration_minutes || 90,
          viewer_count: stream.viewer_count || 0
        }));
        setUpcomingStreams(upcoming);
      }

      // Fetch recordings
      const { data: recordingsData } = await supabase
        .from('class_recordings')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recordingsData) {
        setRecordings(recordingsData);
      }

      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoError = (error: any) => {
    console.error('Video player error:', error);
    setPlayerError('Stream temporarily unavailable. The instructor may be reconnecting.');
  };

  const handleVideoLoad = () => {
    setPlayerError(null);
  };

  const handleRefresh = () => {
    setPlayerError(null);
    fetchData();
  };

  const incrementViewCount = async (recordingId: string) => {
    try {
      const { error } = await supabase
        .from('class_recordings')
        .update({ view_count: recordings.find(r => r.id === recordingId)?.view_count + 1 || 1 })
        .eq('id', recordingId);
      
      if (!error) {
        setRecordings(prev => prev.map(r => 
          r.id === recordingId ? { ...r, view_count: r.view_count + 1 } : r
        ));
      }
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canAccessStream = (stream: LiveStream) => {
    if (stream.is_free) return true;
    if (!user) return false;
    return hasAccess('pro');
  };

  const renderVideoPlayer = (recording: ClassRecording) => {
    if (recording.youtube_url) {
      const videoId = recording.youtube_url.includes('youtube.com/watch?v=') 
        ? recording.youtube_url.split('v=')[1]?.split('&')[0]
        : recording.youtube_url.split('/').pop();
      
      return (
        <iframe
          width="100%"
          height="200"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={recording.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg"
          onLoad={() => incrementViewCount(recording.id)}
        />
      );
    } else if (recording.aws_url || recording.cloudfront_url) {
      return (
        <video
          width="100%"
          height="200"
          controls
          className="rounded-lg"
          onPlay={() => incrementViewCount(recording.id)}
        >
          <source src={recording.cloudfront_url || recording.aws_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    
    return (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <Video className="h-12 w-12 text-gray-400" />
      </div>
    );
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
      {/* Current Live Stream */}
      {currentStream && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="destructive" className="animate-pulse">
                    <Radio className="h-3 w-3 mr-1" />
                    {currentStream.status === 'live' ? 'LIVE NOW' : 'STARTING SOON'}
                  </Badge>
                  {currentStream.id === 'geova-live' ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      <Bot className="h-3 w-3 mr-1" />
                      AI Mentor
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      Expert Instructor
                    </Badge>
                  )}
                  {currentStream.is_free && (
                    <Badge variant="outline" className="text-green-600">
                      Free Access
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl mb-2">{currentStream.title}</CardTitle>
                {currentStream.description && (
                  <p className="text-sm text-muted-foreground">{currentStream.description}</p>
                )}
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold">{currentStream.viewer_count}</span>
                  <span className="text-muted-foreground">watching</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentStream.status === 'live' ? 'Started' : 'Starts'} at {formatTime(currentStream.start_time)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <ScreenProtection enabled={true}>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <UserWatermark />
                {currentStream.id === 'geova-live' && geovaSession?.activeSession ? (
                  <GEOVALiveClassroom 
                    sessionId={geovaSession.activeSession.id}
                    onSessionEnd={() => {
                      setCurrentStream(null);
                      setGeovaSession(null);
                      fetchData();
                    }}
                  />
                ) : !canAccessStream(currentStream) ? (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                    <div className="text-center">
                      <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">
                        {!user ? 'Login Required' : 'Professional Access Required'}
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        {!user ? 'Please log in to watch live classes' : 'Upgrade to Professional plan to access live classes'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = !user ? '/auth' : '/pricing'}
                      >
                        {!user ? 'Login' : 'Upgrade to Professional'}
                      </Button>
                    </div>
                  </div>
                ) : currentStream.embed_url ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={currentStream.embed_url}
                    title="Live Class"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                    onError={handleVideoError}
                    onLoad={handleVideoLoad}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                    <div className="text-center">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Live class will begin shortly</p>
                      <p className="text-sm text-gray-400">Please wait...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScreenProtection>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Live Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingStreams.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No upcoming live classes scheduled.
                  </p>
                ) : (
                  upcomingStreams.map((stream) => (
                    <div key={stream.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{stream.title}</h3>
                            <Badge variant="outline">
                              <Calendar className="h-3 w-3 mr-1" />
                              Scheduled
                            </Badge>
                            {stream.is_free && (
                              <Badge variant="outline" className="text-green-600">
                                Free Access
                              </Badge>
                            )}
                          </div>
                          
                          {stream.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {stream.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDate(stream.start_time)} at {formatTime(stream.start_time)}
                            </div>
                            <div>Duration: {stream.duration_minutes} min</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recordings">
          <Card>
            <CardHeader>
              <CardTitle>Class Recordings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recordings.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No recordings available yet.</p>
                  </div>
                ) : (
                  recordings.map((recording) => (
                    <div key={recording.id} className="space-y-3">
                      <div className="aspect-video">
                        {renderVideoPlayer(recording)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{recording.title}</h3>
                          <Badge variant="outline">
                            <Video className="h-3 w-3 mr-1" />
                            Recording
                          </Badge>
                          {recording.youtube_url && (
                            <Badge variant="outline" className="text-red-600">
                              <Youtube className="h-3 w-3 mr-1" />
                              YouTube
                            </Badge>
                          )}
                        </div>
                        
                        {recording.description && (
                          <p className="text-sm text-muted-foreground">
                            {recording.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {recording.view_count} views
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {recording.download_count} downloads
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {recording.youtube_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(recording.youtube_url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                YouTube
                              </Button>
                            )}
                            {(recording.aws_url || recording.cloudfront_url) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = recording.cloudfront_url || recording.aws_url || '';
                                  link.download = `${recording.title}.mp4`;
                                  link.click();
                                  // Update download count
                                  supabase
                                    .from('class_recordings')
                                    .update({ download_count: recording.download_count + 1 })
                                    .eq('id', recording.id);
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Weekly schedule view coming soon. Check the upcoming tab for next classes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!currentStream && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Live Stream Active</h3>
            <p className="text-muted-foreground mb-4">
              We automatically detect when instructors start streaming. Check back soon or view our scheduled events!
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for Streams
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Last checked: {new Date(lastRefresh).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedLiveClassesTab;