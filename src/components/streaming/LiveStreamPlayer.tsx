import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Users, AlertCircle, ExternalLink, Maximize } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LiveStreamPlayerProps {
  streamKey?: string;
  sessionId?: string;
  title?: string;
  instructor?: string;
  isLive?: boolean;
  className?: string;
}

interface StreamSession {
  id: string;
  title: string;
  description: string;
  status: string;
  viewer_count: number;
  rtmp_endpoint?: string;
  hls_endpoint?: string;
  started_at?: string;
  ended_at?: string;
}

export const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({
  streamKey,
  sessionId,
  title = 'Live Stream',
  instructor = 'Instructor',
  isLive = false,
  className = ''
}) => {
  const { user } = useAuth();
  const playerRef = useRef<HTMLVideoElement>(null);
  const [session, setSession] = useState<StreamSession | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
      const interval = setInterval(fetchSessionData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('stream_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        setError('Failed to load stream session');
        return;
      }

      setSession(data);
      setViewerCount(data.viewer_count || 0);
    } catch (error) {
      console.error('Error fetching session:', error);
      setError('Failed to load stream session');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const openInNewWindow = () => {
    if (session?.hls_endpoint) {
      const viewerUrl = session.hls_endpoint.replace('/hls/', '/view/');
      window.open(viewerUrl, '_blank');
    }
  };

  const renderPlayer = () => {
    if (error) {
      return (
        <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <p className="text-lg mb-2">Stream Error</p>
            <p className="text-sm opacity-75">{error}</p>
          </div>
        </div>
      );
    }

    if (!session || session.status !== 'live') {
      return (
        <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">
              {session?.status === 'ended' ? 'Stream Ended' : 'Stream Not Active'}
            </p>
            <p className="text-sm opacity-75">
              {session?.status === 'preparing' 
                ? 'Stream is being prepared...' 
                : session?.status === 'ended'
                  ? 'This stream has ended'
                  : 'Waiting for instructor to start streaming'}
            </p>
          </div>
        </div>
      );
    }

    // For live streams, we'll show a simulated player since we can't actually stream RTMP to HLS in edge functions
    return (
      <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
        <video
          ref={playerRef}
          className="w-full h-full object-cover"
          controls
          autoPlay
          muted
          poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIHZpZXdCb3g9IjAgMCAxMjgwIDcyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIiBmaWxsPSIjMTExODI3Ii8+CjxjaXJjbGUgY3g9IjY0MCIgY3k9IjM2MCIgcj0iNDAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8cGF0aCBkPSJNNjI1IDMzNUw2NjUgMzYwTDYyNSAzODVWMzM1WiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC40Ii8+Cjwvc3ZnPgo="
        >
          {session.hls_endpoint && (
            <source src={session.hls_endpoint} type="application/x-mpegURL" />
          )}
          Your browser does not support the video tag.
        </video>

        {/* Live indicator overlay */}
        <div className="absolute top-4 left-4">
          <Badge variant="destructive" className="animate-pulse">
            🔴 LIVE
          </Badge>
        </div>

        {/* Viewer count overlay */}
        <div className="absolute top-4 right-4">
          <div className="bg-black/50 rounded-full px-3 py-1 flex items-center gap-1 text-white text-sm">
            <Users className="h-3 w-3" />
            {viewerCount}
          </div>
        </div>

        {/* Fullscreen controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={openInNewWindow}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleFullscreen}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {renderPlayer()}
        
        {/* Stream info */}
        {session && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{session.title}</h3>
                <p className="text-sm text-muted-foreground">{instructor}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={session.status === 'live' ? 'destructive' : 'outline'}>
                  {session.status}
                </Badge>
                {session.status === 'live' && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {viewerCount} watching
                  </div>
                )}
              </div>
            </div>
            
            {session.description && (
              <p className="text-sm text-muted-foreground mt-2">{session.description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveStreamPlayer;