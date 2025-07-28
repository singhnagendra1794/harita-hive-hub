import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Users, Radio, Bot, RefreshCw, Lock, Clock, Play, BookOpen } from "lucide-react";

import { GEOVALiveClassroom } from '@/components/geova/GEOVALiveClassroom';
import { ScreenProtection } from '@/components/security/ScreenProtection';
import { UserWatermark } from '@/components/security/UserWatermark';
import SecureYouTubePlayer from '@/components/youtube/SecureYouTubePlayer';
import { LiveClassCard } from './LiveClassCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useLiveClassAccess } from '@/hooks/useLiveClassAccess';

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
  thumbnail_url?: string;
  viewer_count: number;
  is_geova?: boolean;
  is_free_access?: boolean;
  day_number?: number;
  custom_day_label?: string;
  is_youtube_session?: boolean;
  access_tier?: 'free' | 'professional' | 'enterprise';
  course_name?: string;
  course_day?: number;
}

interface GEOVASession {
  isLive: boolean;
  activeSession?: any;
  todaySchedule?: any;
}

// Helper functions for viewer count management
const incrementViewerCount = async (streamId: string) => {
  try {
    const { error } = await supabase.rpc('increment_viewer_count', { 
      stream_id: streamId 
    });
    if (error) console.error('Error incrementing viewer count:', error);
  } catch (error) {
    console.error('Error incrementing viewer count:', error);
  }
};

const decrementViewerCount = async (streamId: string) => {
  try {
    const { error } = await supabase.rpc('decrement_viewer_count', { 
      stream_id: streamId 
    });
    if (error) console.error('Error decrementing viewer count:', error);
  } catch (error) {
    console.error('Error decrementing viewer count:', error);
  }
};

const LiveNowTab = () => {
  const { user } = useAuth();
  const { hasAccess, loading: premiumLoading } = usePremiumAccess();
  const { hasLiveClassAccess, enrollmentCount } = useLiveClassAccess();
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [geovaSession, setGeovaSession] = useState<GEOVASession | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [hasEnrollment, setHasEnrollment] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState<number | null>(null);
  const [countdownText, setCountdownText] = useState<string>('');
  const [isViewing, setIsViewing] = useState(false);

  // Track when user starts/stops viewing
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isViewing && currentStream) {
        decrementViewerCount(currentStream.id);
      }
    };

    const handleVisibilityChange = () => {
      if (currentStream) {
        if (document.hidden && isViewing) {
          decrementViewerCount(currentStream.id);
          setIsViewing(false);
        } else if (!document.hidden && !isViewing) {
          incrementViewerCount(currentStream.id);
          setIsViewing(true);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (isViewing && currentStream) {
        decrementViewerCount(currentStream.id);
      }
    };
  }, [isViewing, currentStream]);

  // Real-time viewer count updates
  useEffect(() => {
    if (!currentStream) return;

    const channel = supabase
      .channel('viewer-count-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_classes',
          filter: `id=eq.${currentStream.id}`
        },
        (payload) => {
          if (payload.new.viewer_count !== undefined) {
            setCurrentStream(prev => prev ? {
              ...prev,
              viewer_count: payload.new.viewer_count
            } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentStream?.id]);

  useEffect(() => {
    const fetchLiveClass = async () => {
      try {
        setLoading(true)
        
        // Get live classes from database - prioritize course-based automation
        const { data: liveClasses, error } = await supabase
          .from('live_classes')
          .select('*')
          .in('status', ['live', 'scheduled'])
          .order('starts_at', { ascending: true })
        
        if (error) {
          console.error('Error fetching live classes:', error)
          throw error
        }
        
        if (liveClasses && liveClasses.length > 0) {
          const now = new Date()
          
          // Find the most relevant stream to show
          let bestStream = null
          
          for (const stream of liveClasses) {
            const startTime = new Date(stream.starts_at)
            const endTime = stream.end_time ? new Date(stream.end_time) : new Date(startTime.getTime() + 90 * 60 * 1000)
            const timeDiff = startTime.getTime() - now.getTime()
            
            // Show if currently live
            if (stream.status === 'live' && now >= startTime && now <= endTime) {
              bestStream = stream
              break
            }
            
            // Show if starting within 30 minutes
            if (stream.status === 'scheduled' && timeDiff <= 30 * 60 * 1000 && timeDiff >= -5 * 60 * 1000) {
              bestStream = stream
              break
            }
          }
          
          if (bestStream) {
            const startTime = new Date(bestStream.starts_at)
            const now = new Date()
            const isCurrentlyLive = bestStream.status === 'live' || 
              (now >= startTime && now <= new Date(startTime.getTime() + 90 * 60 * 1000))
            
            setCurrentStream({
              id: bestStream.id,
              title: bestStream.title,
              description: bestStream.description || '',
              stream_key: bestStream.stream_key || '',
              start_time: bestStream.starts_at,
              status: isCurrentlyLive ? 'live' : 'scheduled',
              youtube_url: bestStream.embed_url || bestStream.youtube_url,
              thumbnail_url: bestStream.thumbnail_url,
              viewer_count: bestStream.viewer_count || 0,
              is_geova: bestStream.instructor === 'GEOVA AI',
              is_free_access: bestStream.access_tier !== 'professional',
              course_name: bestStream.course_name,
              course_day: bestStream.course_day,
              access_tier: bestStream.access_tier as 'free' | 'professional' | 'enterprise'
            })
            
            // Set countdown if not yet started
            if (!isCurrentlyLive) {
              const timeDiff = startTime.getTime() - now.getTime()
              setTimeUntilStart(timeDiff)
              const minutes = Math.ceil(timeDiff / (1000 * 60))
              setCountdownText(`Live class starts in ${minutes} minute${minutes !== 1 ? 's' : ''}`)
            } else {
              setTimeUntilStart(null)
              setCountdownText('')
            }
            
            setLoading(false)
            return
          }
        }
        
        // Fallback to existing logic if no database streams found
        checkForLiveStreams()
      } catch (error) {
        console.error('Error fetching live class:', error)
        // Fallback to existing logic
        checkForLiveStreams()
      } finally {
        setLoading(false)
      }
    }

    if (!premiumLoading) {
      fetchLiveClass()
    }
    
    // Reduced polling interval - check every 30 seconds instead of rapid refresh
    const interval = setInterval(() => {
      if (!premiumLoading) {
        fetchLiveClass()
      }
    }, 30000) // 30 seconds fixed interval
    
    return () => clearInterval(interval)
  }, [premiumLoading, currentStream?.status])

  // Auto-sync with YouTube API every 2 minutes
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        await supabase.functions.invoke('youtube-live-manager', {
          body: { action: 'sync_upcoming_streams' }
        });
        console.log('Auto-synced with YouTube API');
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(syncInterval);
  }, []);

  const checkForLiveStreams = async () => {
    try {
      setLoading(true);
      
      console.log('Checking for live streams...');
      
      // First check YouTube automated streams via edge function
      const { data: streamResponse, error: streamError } = await supabase.functions.invoke('youtube-live-manager', {
        body: { action: 'get_active_stream' }
      });

      if (!streamError && streamResponse?.stream) {
        const youtubeStream = streamResponse.stream;
        console.log('Found YouTube automated stream:', youtubeStream);
        
        // Check if stream should be live (within 5 minutes of start time)
        const startTime = new Date(youtubeStream.scheduled_start_time);
        const now = new Date();
        const timeDiff = now.getTime() - startTime.getTime();
        const isWithinLiveWindow = timeDiff >= -300000 && timeDiff <= 3600000; // -5 min to +1 hour

        setCurrentStream({
          id: youtubeStream.id,
          title: youtubeStream.title,
          description: youtubeStream.description || '',
          stream_key: youtubeStream.youtube_stream_key || '',
          start_time: youtubeStream.scheduled_start_time,
          status: youtubeStream.status as 'scheduled' | 'live',
          youtube_url: youtubeStream.youtube_broadcast_id ? 
            `https://www.youtube-nocookie.com/embed/${youtubeStream.youtube_broadcast_id}?autoplay=${youtubeStream.status === 'live' ? 1 : 0}&modestbranding=1&rel=0&disablekb=1&controls=1` : 
            undefined,
          thumbnail_url: youtubeStream.thumbnail_url,
          viewer_count: 0,
          is_geova: false,
          is_free_access: true
        });
        setPlayerError(null);
        setLoading(false);
        return;
      }
      
      // Check for active OBS live stream
      const { data: activeStreams, error: streamsError } = await supabase
        .from('live_classes')
        .select('*')
        .eq('status', 'live')
        .order('start_time', { ascending: false })
        .limit(1);

      console.log('Active OBS streams from DB:', activeStreams, 'Error:', streamsError);

      if (activeStreams && activeStreams.length > 0) {
        const stream = activeStreams[0];
        console.log('Found active OBS live stream:', stream);
        const streamData = {
          id: stream.id,
          title: stream.title,
          description: stream.description,
          stream_key: stream.stream_key,
          status: 'live' as const,
          start_time: stream.start_time,
          hls_url: stream.hls_manifest_url || `https://uphgdwrwaizomnyuwfwr.supabase.co/storage/v1/object/public/live-streams/${stream.stream_key}/index.m3u8`,
          viewer_count: stream.viewer_count || 0,
          is_geova: stream.is_ai_generated || false,
          is_free_access: true
        };
        setCurrentStream(streamData);
        setPlayerError(null);
        setLoading(false);
        
        // Start tracking viewer for this stream
        if (!isViewing) {
          incrementViewerCount(stream.id);
          setIsViewing(true);
        }
        return;
      }

      console.log('No OBS live streams currently active, checking YouTube sessions...');
      
      // Check for active YouTube live sessions
      const { data: youtubeSessions, error: youtubeError } = await supabase
        .from('youtube_sessions')
        .select('*')
        .eq('session_type', 'live')
        .eq('status', 'live')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(1);

      if (youtubeSessions && youtubeSessions.length > 0) {
        const session = youtubeSessions[0];
        console.log('Found active YouTube session:', session);
        
        setCurrentStream({
          id: session.id,
          title: session.title,
          description: session.description,
          stream_key: session.id,
          status: 'live' as const,
          start_time: session.started_at || session.created_at,
          youtube_url: session.youtube_embed_url,
          viewer_count: 0,
          is_geova: false,
          is_free_access: session.access_tier === 'free',
          is_youtube_session: true,
          access_tier: session.access_tier as 'free' | 'professional' | 'enterprise'
        });
        setPlayerError(null);
        setLoading(false);
        return;
      }

      // No live streams found - show no stream message
      setCurrentStream(null);
      setPlayerError(null);
      setLoading(false);
      
      // Check GEOVA AI session only if no live streams found
      const { data: geovaData } = await supabase.functions.invoke('geova-session-manager', {
        body: { action: 'status' }
      });
      
      if (geovaData) {
        setGeovaSession(geovaData);
        if (geovaData.isLive) {
          const geovaStreamData = {
            id: 'geova-live',
            title: `GEOVA AI Teaching - Day ${geovaData.activeSession?.day_number || 'N/A'}`,
            description: geovaData.activeSession?.topic_title || 'Live AI-powered geospatial education',
            stream_key: 'default_stream_key',
            status: 'live' as const,
            start_time: geovaData.activeSession?.started_at || new Date().toISOString(),
            viewer_count: geovaData.activeSession?.viewer_count || 0,
            is_geova: true,
            is_free_access: true
          };
          setCurrentStream(geovaStreamData);
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
              viewer_count: stream.viewer_count || 0,
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
      
      // No streams found
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

  const handleRefresh = async () => {
    setPlayerError(null);
    setLastRefresh(Date.now());
    
    // Trigger manual sync with YouTube API
    try {
      await supabase.functions.invoke('youtube-live-manager', {
        body: { action: 'manual_refresh' }
      });
      console.log('Manual YouTube sync completed');
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
    
    await checkForLiveStreams();
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
                ) : !currentStream.is_free_access && user && !hasLiveClassAccess ? (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                    <div className="text-center">
                      <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Enrollment Required</p>
                      <p className="text-sm text-gray-400 mb-4">
                        You need to be enrolled in this course to watch. Professional Plan users are automatically enrolled.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/pricing'}
                        >
                          Upgrade to Professional
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRefresh}
                        >
                          Refresh
                        </Button>
                      </div>
                      {enrollmentCount > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          You have {enrollmentCount} enrollment{enrollmentCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ) : currentStream.is_youtube_session && currentStream.youtube_url ? (
                  <SecureYouTubePlayer
                    embedUrl={currentStream.youtube_url}
                    title={currentStream.title}
                    description={currentStream.description}
                    accessTier={currentStream.access_tier || 'professional'}
                  />
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