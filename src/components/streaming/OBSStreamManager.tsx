import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Copy, Play, Square, Settings, Monitor, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StreamKey {
  id: string;
  stream_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StreamSession {
  id: string;
  title: string;
  description: string;
  status: string;
  viewer_count: number;
  rtmp_endpoint: string;
  started_at: string;
  ended_at?: string;
}

export const OBSStreamManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [streamKey, setStreamKey] = useState<StreamKey | null>(null);
  const [currentSession, setCurrentSession] = useState<StreamSession | null>(null);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Working RTMP Server URLs (choose one based on your preference)
  const RTMP_SERVERS = {
    youtube: 'rtmp://a.rtmp.youtube.com/live2/',
    twitch: 'rtmp://live.twitch.tv/app/',
    facebook: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    local: 'rtmp://localhost:1935/live/',
    custom: 'rtmp://streaming.mux.com/live/' // Example cloud RTMP service
  };
  
  // Use YouTube Live as default (most reliable)
  const RTMP_SERVER_URL = RTMP_SERVERS.youtube;

  // Check if user is super admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email === 'contact@haritahive.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (user && isAdmin) {
      loadStreamKey();
      loadCurrentSession();
    }
  }, [user, isAdmin]);

  const loadStreamKey = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('stream_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading stream key:', error);
        return;
      }

      setStreamKey(data);
    } catch (error) {
      console.error('Error loading stream key:', error);
    }
  };

  const loadCurrentSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('stream_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'live')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading current session:', error);
        return;
      }

      setCurrentSession(data);
    } catch (error) {
      console.error('Error loading current session:', error);
    }
  };

  const generateStreamKey = async () => {
    if (!user) return;

    setIsGeneratingKey(true);
    try {
      const { data, error } = await supabase.rpc('generate_stream_key', {
        p_user_id: user.id
      });

      if (error) throw error;

      await loadStreamKey();
      toast({
        title: "Stream Key Generated",
        description: "Your new stream key has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating stream key:', error);
      toast({
        title: "Error",
        description: "Failed to generate stream key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const notifyUsersOfLiveStream = async (title: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-live-notifications', {
        body: { 
          streamTitle: title,
          streamUrl: 'https://haritahive.com/live-classes'
        }
      });
      
      if (error) {
        console.error('Error sending notifications:', error);
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const startStream = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('start_stream_session', {
        p_user_id: user.id,
        p_title: streamTitle || 'Live Stream',
        p_description: streamDescription
      });

      if (error) throw error;

      // Send notifications to all users
      await notifyUsersOfLiveStream(streamTitle || 'Live Stream');

      await loadCurrentSession();
      toast({
        title: "Stream Session Started",
        description: "Your stream is ready and users have been notified!",
      });

      // Redirect to live classes page after 2 seconds
      setTimeout(() => {
        window.open('https://haritahive.com/live-classes', '_blank');
      }, 2000);

    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Error",
        description: "Failed to start stream session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const endStream = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_stream_status', {
        p_session_id: currentSession.id,
        p_status: 'ended'
      });

      if (error) throw error;

      setCurrentSession(null);
      toast({
        title: "Stream Ended",
        description: "Your stream session has been ended successfully.",
      });
    } catch (error) {
      console.error('Error ending stream:', error);
      toast({
        title: "Error",
        description: "Failed to end stream session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please log in to access streaming features.</p>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            Live streaming is only available for administrators.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stream Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Stream Key Management
          </CardTitle>
          <CardDescription>
            Generate and manage your unique stream key for OBS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {streamKey ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="stream-key">Your Stream Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="stream-key"
                    value={streamKey.stream_key}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(streamKey.stream_key, 'Stream Key')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={generateStreamKey}
                disabled={isGeneratingKey}
              >
                {isGeneratingKey ? 'Generating...' : 'Regenerate Key'}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No stream key found</p>
              <Button onClick={generateStreamKey} disabled={isGeneratingKey}>
                {isGeneratingKey ? 'Generating...' : 'Generate Stream Key'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* OBS Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            OBS Studio Setup
          </CardTitle>
          <CardDescription>
            Configure OBS Studio to stream to our server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Follow these steps to configure OBS Studio for streaming to our platform
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label>1. RTMP Server URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={RTMP_SERVER_URL}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(RTMP_SERVER_URL, 'RTMP Server URL')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>2. Stream Key</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={streamKey?.stream_key || 'Generate stream key first'}
                  readOnly
                  className="font-mono"
                  disabled={!streamKey}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(streamKey?.stream_key || '', 'Stream Key')}
                  disabled={!streamKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Open OBS Studio</li>
              <li>Go to Settings → Stream</li>
              <li>Select "Custom..." as Service</li>
              <li>Copy the RTMP Server URL above</li>
              <li>Copy your Stream Key above</li>
              <li>Click "OK" to save settings</li>
              <li>Click "Start Streaming" when ready</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Stream Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Stream Session
          </CardTitle>
          <CardDescription>
            Start and manage your live streaming session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentSession ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{currentSession.title}</h4>
                  <p className="text-sm text-muted-foreground">{currentSession.description}</p>
                </div>
                <Badge variant="default" className="bg-red-500">
                  🔴 LIVE
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Viewers</Label>
                  <p className="font-mono">{currentSession.viewer_count}</p>
                </div>
                <div>
                  <Label>Started</Label>
                  <p className="font-mono">{new Date(currentSession.started_at).toLocaleTimeString()}</p>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={endStream}
                disabled={loading}
                className="w-full"
              >
                <Square className="h-4 w-4 mr-2" />
                {loading ? 'Ending...' : 'End Stream'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stream-title">Stream Title</Label>
                <Input
                  id="stream-title"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Enter your stream title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream-description">Description (Optional)</Label>
                <Input
                  id="stream-description"
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value)}
                  placeholder="Describe your stream"
                />
              </div>

              <Button
                onClick={startStream}
                disabled={loading || !streamKey}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Starting...' : 'Start Stream Session'}
              </Button>

              {!streamKey && (
                <p className="text-sm text-muted-foreground text-center">
                  Generate a stream key first to start streaming
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OBSStreamManager;