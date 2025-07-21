import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Users, Play, Eye } from "lucide-react";
import { LiveVideoPlayer } from '@/components/LiveVideoPlayer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  stream_key: string;
  status: 'live' | 'ended';
  start_time: string;
  end_time: string | null;
  created_by: string;
  thumbnail_url: string | null;
  recording_url: string | null;
  viewer_count: number;
  created_at: string;
  updated_at: string;
  hls_url?: string;
  is_live?: boolean;
  has_ended?: boolean;
  duration_minutes?: number | null;
}

const LiveClasses = () => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [currentLive, setCurrentLive] = useState<LiveClass | null>(null);
  const [pastClasses, setPastClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveClasses();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveClasses, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const response = await supabase.functions.invoke('get-live-classes');
      if (response.error) throw response.error;
      
      const data = response.data;
      setLiveClasses(data?.live_classes || []);
      setCurrentLive(data?.current_live || null);
      setPastClasses(data?.past_classes || []);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch live classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoError = (error: any) => {
    console.error('Video player error:', error);
    setPlayerError('Failed to load video stream. The stream may not be active yet.');
  };

  const handleVideoLoad = () => {
    setPlayerError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Live Classes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join interactive live sessions with expert instructors and access recorded content
          </p>
        </div>

        {/* Current Live Stream Section */}
        {currentLive ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Video className="h-6 w-6" />
              🔴 Live Now
            </h2>
            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{currentLive.title}</CardTitle>
                    {currentLive.description && (
                      <CardDescription className="mt-2">{currentLive.description}</CardDescription>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="animate-pulse mb-2">
                      🔴 LIVE
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {currentLive.viewer_count || 0} viewers
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg mb-4 overflow-hidden">
                  {playerError ? (
                    <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                      <div className="text-center">
                        <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">Stream Loading...</p>
                        <p className="text-sm text-gray-400">{playerError}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => {
                            setPlayerError(null);
                            fetchLiveClasses();
                          }}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <LiveVideoPlayer
                      src={currentLive.hls_url || `https://stream.haritahive.com/hls/${currentLive.stream_key}.m3u8`}
                      title={currentLive.title}
                      className="w-full h-full"
                      onError={handleVideoError}
                      onLoad={handleVideoLoad}
                    />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Started at {formatTime(currentLive.start_time)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(currentLive.start_time)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Video className="h-6 w-6" />
              Live Stream
            </h2>
            <Card>
              <CardContent className="p-12 text-center">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Live Stream</h3>
                <p className="text-muted-foreground">
                  No classes are currently live. Check back soon or browse our recorded sessions below!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Past Classes Section */}
        {pastClasses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Play className="h-6 w-6" />
              Recorded Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastClasses.map((liveClass) => (
                <Card key={liveClass.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-video bg-gray-900 rounded-lg mb-3 overflow-hidden relative">
                      {liveClass.thumbnail_url ? (
                        <img 
                          src={liveClass.thumbnail_url} 
                          alt={liveClass.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{liveClass.title}</CardTitle>
                    {liveClass.description && (
                      <CardDescription>{liveClass.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(liveClass.start_time)}
                      </div>
                      {liveClass.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {liveClass.duration_minutes}m
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        if (liveClass.recording_url) {
                          window.open(liveClass.recording_url, '_blank');
                        } else {
                          toast({
                            title: "Recording Not Available",
                            description: "This recording is still being processed.",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Recording
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {pastClasses.length === 0 && !currentLive && (
          <div className="text-center py-12">
            <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Classes Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              There are no live or recorded classes available at the moment. 
              Check back soon for exciting new content!
            </p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={fetchLiveClasses}
            disabled={loading}
          >
            <Eye className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default LiveClasses;