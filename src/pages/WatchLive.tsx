import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Users, Clock, Play, Loader2 } from 'lucide-react';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  stream_url?: string;
  created_at: string;
  profiles: {
    full_name?: string;
    avatar_url?: string;
  } | null;
}

const WatchLive: React.FC = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

  useEffect(() => {
    loadActiveStreams();
    
    // Set up real-time updates for live streams
    const subscription = supabase
      .channel('live-streams-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_streams',
          filter: 'is_live=eq.true'
        },
        () => {
          loadActiveStreams();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadActiveStreams = async () => {
    try {
      const response = await supabase.functions.invoke('get-active-streams');
      
      if (response.error) throw response.error;
      
      setStreams(response.data.streams || []);
    } catch (error) {
      console.error('Error loading streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const watchStream = (stream: LiveStream) => {
    setSelectedStream(stream);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading live streams...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
            Watch Live
          </h1>
          <p className="text-xl text-muted-foreground">
            Join live streams from the Harita Hive community
          </p>
        </div>

        {selectedStream ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedStream(null)}
              >
                ← Back to streams
              </Button>
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Video Player */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      {selectedStream.stream_url ? (
                        <video
                          className="w-full h-full"
                          controls
                          autoPlay
                          muted
                          src={selectedStream.stream_url}
                        >
                          <source src={selectedStream.stream_url} type="application/x-mpegURL" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Stream starting soon...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Stream Info */}
                <Card className="mt-4">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{selectedStream.title}</h2>
                    {selectedStream.description && (
                      <p className="text-muted-foreground mb-4">{selectedStream.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={selectedStream.profiles?.avatar_url} />
                          <AvatarFallback>
                            {getInitials(selectedStream.profiles?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {selectedStream.profiles?.full_name || 'Anonymous User'}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Started {formatDistanceToNow(new Date(selectedStream.created_at))} ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat/Side Panel */}
              <div className="lg:col-span-1">
                <Card className="h-[600px]">
                  <CardHeader>
                    <CardTitle className="text-lg">Live Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Chat feature coming soon!</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {streams.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No live streams right now</h3>
                  <p className="text-muted-foreground mb-4">
                    Check back later or start your own stream!
                  </p>
                  <Button onClick={() => window.location.href = '/go-live'}>
                    Start Streaming
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {streams.map((stream) => (
                  <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative">
                        <Play className="w-12 h-12 text-primary" />
                        <Badge 
                          variant="destructive" 
                          className="absolute top-3 left-3 animate-pulse"
                        >
                          LIVE
                        </Badge>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {stream.title}
                        </h3>
                        {stream.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {stream.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={stream.profiles?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {getInitials(stream.profiles?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {stream.profiles?.full_name || 'Anonymous'}
                            </span>
                          </div>
                          
                          <Button 
                            size="sm" 
                            onClick={() => watchStream(stream)}
                          >
                            Watch
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(stream.created_at))} ago
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WatchLive;