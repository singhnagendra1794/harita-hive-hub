import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Users, Radio, Bot, RefreshCw, Lock, Clock } from "lucide-react";

import { GEOVALiveClassroom } from '@/components/geova/GEOVALiveClassroom';
import { ScreenProtection } from '@/components/security/ScreenProtection';
import { UserWatermark } from '@/components/security/UserWatermark';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  stream_key: string;
  status: 'live' | 'scheduled';
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  hls_url?: string;
  youtube_url?: string;
  viewer_count: number;
  is_geova?: boolean;
  is_free_access?: boolean;
  day_number?: number;
  custom_day_label?: string;
}

interface GEOVASession {
  isLive: boolean;
  activeSession?: any;
  todaySchedule?: any;
}

const LiveNowTab = () => {
  const { user } = useAuth();
  const { hasAccess, loading: premiumLoading } = usePremiumAccess();
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [geovaSession, setGeovaSession] = useState<GEOVASession | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [hasEnrollment, setHasEnrollment] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState<number | null>(null);
  const [countdownText, setCountdownText] = useState<string>('');

  useEffect(() => {
    if (!premiumLoading) {
      checkForLiveStreams();
    }
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (!premiumLoading) {
        checkForLiveStreams();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [premiumLoading]);

  const checkForLiveStreams = async () => {
    try {
      setLoading(true);
      
      // Static live stream using YouTube title and description
      setCurrentStream({
        id: 'current-live-session',
        title: 'Geospatial Technology Unlocked - Day 1 Intro to Geospatial Tech',
        description: 'Introduction to Geospatial Technology - Learn the fundamentals of GIS, mapping, and spatial analysis',
        stream_key: 'live-session',
        status: 'live',
        start_time: new Date().toISOString(),
        youtube_url: 'https://www.youtube.com/embed/v7NtlDXzki8?si=8dX6B8WjZQhQkOaI',
        viewer_count: Math.floor(Math.random() * 100) + 50,
        is_geova: true,
        is_free_access: true
      });
      setLoading(false);
      return;
      
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
            stream_key: 'default_stream_key',
            status: 'live',
            start_time: geovaData.activeSession?.started_at || new Date().toISOString(),
            viewer_count: Math.floor(Math.random() * 50) + 20,
            is_geova: true
          });
          setLoading(false);
          return;
        }
      }

      // Check for scheduled live YouTube streams
      const now = new Date();
      const tenMinutesBuffer = 10 * 60 * 1000; // 10 minutes in milliseconds
      
      const { data: liveStreams } = await supabase
        .from('live_classes')
        .select('*')
        .eq('status', 'scheduled')
        .not('youtube_url', 'is', null)
        .order('start_time', { ascending: false });

      if (liveStreams && liveStreams.length > 0) {
        // Find the best stream to show
        for (const stream of liveStreams) {
          const startTime = new Date(stream.start_time);
          const endTime = stream.end_time ? new Date(stream.end_time) : 
            new Date(startTime.getTime() + (stream.duration_minutes || 90) * 60000);
          
          const timeUntilStart = startTime.getTime() - now.getTime();
          const isWithinBuffer = timeUntilStart <= tenMinutesBuffer && timeUntilStart >= -tenMinutesBuffer;
          const isCurrentlyLive = now >= startTime && now <= endTime;
          
          // Show stream if it's live or starting within 10 minutes
          if (isCurrentlyLive || isWithinBuffer) {
            // Check enrollment only if it's not a free access stream
            let hasValidAccess = true;
            if (!stream.is_free_access && user) {
              const { data: enrollment } = await supabase
                .from('class_enrollments')
                .select('*')
                .eq('user_id', user.id)
                .eq('class_id', stream.id)
                .maybeSingle();
              
              setHasEnrollment(!!enrollment);
              hasValidAccess = !!enrollment;
            } else if (stream.is_free_access) {
              setHasEnrollment(true); // Free access means everyone is "enrolled"
            }

            // Set countdown if not yet started
            if (timeUntilStart > 0) {
              setTimeUntilStart(timeUntilStart);
              const minutes = Math.ceil(timeUntilStart / (1000 * 60));
              setCountdownText(`Live class will begin in ${minutes} minute${minutes !== 1 ? 's' : ''}. Please wait...`);
            } else {
              setTimeUntilStart(null);
              setCountdownText('');
            }

            setCurrentStream({
              id: stream.id,
              title: stream.custom_day_label ? `${stream.custom_day_label}: ${stream.title.replace(/^Day \d+:\s*/, '')}` : stream.title,
              description: stream.description,
              stream_key: stream.stream_key,
              status: isCurrentlyLive ? 'live' : 'scheduled',
              start_time: stream.start_time,
              end_time: stream.end_time,
              duration_minutes: stream.duration_minutes,
              youtube_url: stream.youtube_url,
              viewer_count: Math.floor(Math.random() * 100) + 30,
              is_geova: false,
              is_free_access: stream.is_free_access,
              day_number: stream.day_number,
              custom_day_label: stream.custom_day_label
            });
            setLoading(false);
            return;
          }
        }
      }
      
      setCurrentStream(null);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error checking live streams:', error);
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
    checkForLiveStreams();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
      {currentStream ? (
        <Card className="border-red-200 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="destructive" className="animate-pulse">
                    <Radio className="h-3 w-3 mr-1" />
                    LIVE NOW
                  </Badge>
                  {currentStream.is_geova ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      <Bot className="h-3 w-3 mr-1" />
                      AI Mentor
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      Expert Instructor
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl mb-2">{currentStream.title}</CardTitle>
                <p className="text-muted-foreground mb-3">
                  Streaming directly from HaritaHive Studio
                </p>
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
                  Started at {formatTime(currentStream.start_time)}
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
{currentStream.is_geova && geovaSession?.activeSession ? (
                  <GEOVALiveClassroom 
                    sessionId={geovaSession.activeSession.id}
                    onSessionEnd={() => {
                      setCurrentStream(null);
                      setGeovaSession(null);
                      checkForLiveStreams();
                    }}
                  />
                ) : timeUntilStart && timeUntilStart > 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                    <div className="text-center">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Class Starting Soon</p>
                      <p className="text-sm text-gray-400 mb-4">{countdownText}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRefresh}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                ) : !user && !currentStream.is_free_access ? (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                    <div className="text-center">
                      <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Login Required</p>
                      <p className="text-sm text-gray-400 mb-4">Please log in to watch live classes</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = '/auth'}
                      >
                        Login
                      </Button>
                    </div>
                  </div>
                ) : !currentStream.is_free_access && user && !hasAccess('pro') && !hasEnrollment ? (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                    <div className="text-center">
                      <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Professional Access Required</p>
                      <p className="text-sm text-gray-400 mb-4">
                        {currentStream.day_number && currentStream.day_number > 1 ? 
                          'Access from Day 2 requires enrollment or Professional plan' : 
                          'Live classes are available for Professional plan users'
                        }
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = '/pricing'}
                      >
                        Upgrade to Professional
                      </Button>
                    </div>
                  </div>
                ) : !currentStream.is_free_access && user && !hasEnrollment ? (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                    <div className="text-center">
                      <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Enrollment Required</p>
                      <p className="text-sm text-gray-400 mb-4">You need to be enrolled in this course to watch</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRefresh}
                      >
                        Check Enrollment
                      </Button>
                    </div>
                  </div>
                ) : currentStream.youtube_url ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={currentStream.youtube_url}
                    title="Harita Hive Live Class"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                    style={{ 
                      pointerEvents: 'auto',
                      userSelect: 'none'
                    }}
                    onError={() => setPlayerError('YouTube video failed to load')}
                    onLoad={() => setPlayerError(null)}
                  />
                ) : playerError ? (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                    <div className="text-center">
                      <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Video Not Available</p>
                      <p className="text-sm text-gray-400 mb-4">{playerError}</p>
                      {currentStream.youtube_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(currentStream.youtube_url?.replace('embed/', 'watch?v=').split('?')[0], '_blank')}
                          className="mb-2"
                        >
                          Watch on YouTube
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRefresh}
                      >
                        Retry Connection
                      </Button>
                    </div>
                  </div>
                ) : (
                  <video
                    src={currentStream.hls_url || 'https://d3k8h9k5j2l1m9.cloudfront.net/live/index.m3u8'}
                    autoPlay
                    controls
                    muted
                    playsInline
                    controlsList="nodownload"
                    className="w-full h-full object-cover"
                    onError={handleVideoError}
                    onLoadedMetadata={handleVideoLoad}
                    style={{ 
                      pointerEvents: 'auto',
                      userSelect: 'none'
                    }}
                  />
                )}
              </div>
            </ScreenProtection>
          </CardContent>
        </Card>
      ) : (
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

export default LiveNowTab;