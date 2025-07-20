
import Layout from '@/components/Layout';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Users, Play, AlertCircle, Settings, Monitor } from "lucide-react";
import LiveStreamPlayer from '@/components/streaming/LiveStreamPlayer';
import StreamStatusIndicator from '@/components/streaming/StreamStatusIndicator';
import { supabase } from '@/integrations/supabase/client';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { toast } from '@/hooks/use-toast';

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
  class_status: 'upcoming' | 'live' | 'ended' | 'recorded';
  viewer_count: number;
  stream_type: 'youtube' | 'obs' | 'hybrid';
  recording_url: string | null;
}

const LiveClasses = () => {
  const navigate = useNavigate();
  const { hasAccess } = usePremiumAccess();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .order('starts_at', { ascending: false });

      if (error) throw error;
      setLiveClasses((data || []) as LiveClass[]);
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

  const isLive = (liveClass: LiveClass) => {
    return liveClass.class_status === 'live';
  };

  const isUpcoming = (liveClass: LiveClass) => {
    return liveClass.class_status === 'upcoming';
  };

  const isRecorded = (liveClass: LiveClass) => {
    return liveClass.class_status === 'recorded';
  };

  const handleJoinClass = (liveClass: LiveClass) => {
    const requiredTier = liveClass.access_tier as 'free' | 'premium' | 'pro' | 'enterprise';
    
    if (!hasAccess(requiredTier)) {
      toast({
        title: "Upgrade Required",
        description: `Upgrade to ${requiredTier} or Enterprise to access live sessions`,
        variant: "destructive",
      });
      navigate('/premium-upgrade');
      return;
    }

    navigate(`/live-classes/${liveClass.id}`);
  };

  const upcomingClasses = liveClasses.filter(cls => isUpcoming(cls) || isLive(cls));
  const pastClasses = liveClasses.filter(cls => isRecorded(cls) || cls.class_status === 'ended');

  return (
    <Layout>
    <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Live Classes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join interactive live sessions with expert instructors and fellow learners
          </p>
        </div>

        {/* Upcoming Classes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Upcoming Classes
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : upcomingClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingClasses.map((liveClass) => (
                <Card key={liveClass.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{liveClass.title}</CardTitle>
                      <div className="flex gap-2">
                        {isLive(liveClass) && (
                          <Badge variant="destructive" className="animate-pulse">
                            🔴 LIVE
                          </Badge>
                        )}
                        <Badge variant="outline">{liveClass.access_tier}</Badge>
                        <Badge variant="secondary">{liveClass.stream_type}</Badge>
                      </div>
                    </div>
                    <CardDescription>{liveClass.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(liveClass.starts_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(liveClass.starts_at).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          {liveClass.instructor}
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleJoinClass(liveClass)}
                      >
                        {isLive(liveClass) ? 'Join Live Class' : isUpcoming(liveClass) ? 'Register & Join' : 'View Class'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Classes</h3>
                <p className="text-muted-foreground">
                  Live classes will appear here when scheduled
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past Classes (Recordings) */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Play className="h-6 w-6" />
            Recorded Classes
          </h2>
          {pastClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastClasses.map((liveClass) => (
                <Card key={liveClass.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{liveClass.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {isRecorded(liveClass) ? 'Recorded' : 'Ended'}
                        </Badge>
                        <Badge variant="outline">{liveClass.access_tier}</Badge>
                        <Badge variant="outline">{liveClass.stream_type}</Badge>
                      </div>
                    </div>
                    <CardDescription>{liveClass.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(liveClass.starts_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          {liveClass.instructor}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleJoinClass(liveClass)}
                      >
                        {isRecorded(liveClass) ? 'Watch Recording' : 'View Class'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Recorded Classes</h3>
                <p className="text-muted-foreground">
                  Past live sessions will appear here for replay
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Stream Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Video className="h-6 w-6" />
            Live Stream
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LiveStreamPlayer
                title="Live Class Stream"
                instructor="Nagendra Singh"
                className="w-full"
              />
            </div>
            <div className="space-y-4">
              <StreamStatusIndicator />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/streaming'}>
                    <Settings className="h-4 w-4 mr-2" />
                    Streaming Dashboard
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin'}>
                    <Monitor className="h-4 w-4 mr-2" />
                    Manage Classes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Integration Info */}
        <div className="mt-12 p-6 bg-accent/10 rounded-lg border border-accent/20">
          <h3 className="text-lg font-semibold mb-2">🎥 Professional Streaming Platform</h3>
          <p className="text-muted-foreground mb-4">
            Stream directly from OBS Studio to our platform with HD quality, automatic recording, and real-time viewer analytics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              <span>OBS Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Real-time Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              <span>Auto Recording</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              <span>Analytics Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LiveClasses;
