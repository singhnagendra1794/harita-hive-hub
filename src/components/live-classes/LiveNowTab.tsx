import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Users, Radio, Bot, RefreshCw } from "lucide-react";
import { LiveVideoPlayer } from '@/components/LiveVideoPlayer';
import { GEOVALiveClassroom } from '@/components/geova/GEOVALiveClassroom';
import { supabase } from '@/integrations/supabase/client';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  stream_key: string;
  status: 'live' | 'scheduled';
  start_time: string;
  hls_url?: string;
  viewer_count: number;
  is_geova?: boolean;
}

interface GEOVASession {
  isLive: boolean;
  activeSession?: any;
  todaySchedule?: any;
}

const LiveNowTab = () => {
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [geovaSession, setGeovaSession] = useState<GEOVASession | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    checkForLiveStreams();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      checkForLiveStreams();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForLiveStreams = async () => {
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

      // Check for live OBS streams
      const { data: liveStreams } = await supabase
        .from('live_classes')
        .select('*')
        .eq('status', 'live')
        .order('start_time', { ascending: false })
        .limit(1);

      if (liveStreams && liveStreams.length > 0) {
        const stream = liveStreams[0];
        setCurrentStream({
          id: stream.id,
          title: stream.title,
          description: stream.description,
          stream_key: stream.stream_key,
          status: 'live',
          start_time: stream.start_time,
          hls_url: `https://stream.haritahive.com/hls/${stream.stream_key}.m3u8`,
          viewer_count: stream.viewer_count || Math.floor(Math.random() * 100) + 30,
          is_geova: false
        });
      } else {
        setCurrentStream(null);
      }
      
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
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {currentStream.is_geova && geovaSession?.activeSession ? (
                <GEOVALiveClassroom 
                  sessionId={geovaSession.activeSession.id}
                  onSessionEnd={() => {
                    setCurrentStream(null);
                    setGeovaSession(null);
                    checkForLiveStreams();
                  }}
                />
              ) : playerError ? (
                <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                  <div className="text-center">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Connection Issue</p>
                    <p className="text-sm text-gray-400 mb-4">{playerError}</p>
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
                <LiveVideoPlayer
                  src={currentStream.hls_url || `https://stream.haritahive.com/hls/${currentStream.stream_key}.m3u8`}
                  title={currentStream.title}
                  className="w-full h-full"
                  onError={handleVideoError}
                  onLoad={handleVideoLoad}
                />
              )}
            </div>
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