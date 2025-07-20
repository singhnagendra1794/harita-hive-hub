import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Users, Clock, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StreamSession {
  id: string;
  title: string;
  description: string;
  status: 'preparing' | 'live' | 'ended';
  viewer_count: number;
  started_at: string;
  ended_at?: string;
  stream_keys?: {
    stream_key: string;
  };
}

export const StreamStatusIndicator: React.FC = () => {
  const { user } = useAuth();
  const [activeStreams, setActiveStreams] = useState<StreamSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveStreams();
    
    // Set up real-time subscription for stream updates
    const channel = supabase
      .channel('stream-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stream_sessions'
        },
        () => {
          fetchActiveStreams();
        }
      )
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveStreams, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchActiveStreams = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stream-management', {
        body: { action: 'get_active_streams' }
      });

      if (error) throw error;
      
      setActiveStreams(data.streams || []);
    } catch (error) {
      console.error('Error fetching active streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinStream = (sessionId: string) => {
    // Update viewer count when someone joins
    supabase.functions.invoke('stream-management', {
      body: { 
        action: 'update_viewer_count', 
        sessionId 
      }
    });

    // Navigate to stream viewer
    window.location.href = `/live-classes/${sessionId}`;
  };

  const openStreamViewer = (streamKey: string) => {
    const viewerUrl = `https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/rtmp-streaming-server/view/${streamKey}`;
    window.open(viewerUrl, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading streams...</p>
        </CardContent>
      </Card>
    );
  }

  if (activeStreams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Live Streams
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Live Streams</h3>
          <p className="text-muted-foreground mb-4">
            No instructors are currently streaming live
          </p>
          <Badge variant="outline">All Streams Offline</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Live Streams
          <Badge variant="destructive" className="animate-pulse">
            {activeStreams.length} LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeStreams.map((stream) => (
          <div
            key={stream.id}
            className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium">{stream.title}</h4>
                {stream.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {stream.description}
                  </p>
                )}
              </div>
              <Badge variant="destructive" className="animate-pulse">
                🔴 LIVE
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {stream.viewer_count} watching
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Started {new Date(stream.started_at).toLocaleTimeString()}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => joinStream(stream.id)}
                className="flex-1"
              >
                <Video className="h-3 w-3 mr-1" />
                Join Stream
              </Button>
              {stream.stream_keys?.stream_key && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openStreamViewer(stream.stream_keys.stream_key)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StreamStatusIndicator;