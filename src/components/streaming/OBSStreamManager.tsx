import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Copy, Play, Square, Settings, Monitor, Key, Users, Video, Eye } from 'lucide-react';
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

  // RTMP streaming server URL - AWS EC2 RTMP server
  const RTMP_SERVER_URL = 'rtmp://stream.haritahive.com/live';

  // Check if user is super admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email === 'contact@haritahive.com' || user?.email === 'nagendrasingh1794@gmail.com') {
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

  // Auto-create scheduled stream session when component loads if none exists
  useEffect(() => {
    const createInitialStreamSession = async () => {
      if (!user || !streamKey || !isAdmin) return;
      
      // Check if there's already a scheduled or live session
      const { data: existingSession } = await supabase
        .from('live_classes')
        .select('*')
        .eq('created_by', user.id)
        .in('status', ['scheduled', 'live'])
        .single();
        
      if (!existingSession) {
        // Create a default scheduled session that's ready for streaming
        const { error: liveClassError } = await supabase
          .from('live_classes')
          .insert({
            title: 'Live Stream Session',
            course_title: 'Live Stream Session',
            description: 'Ready to stream - will go live when OBS starts streaming',
            stream_key: streamKey.stream_key,
            status: 'scheduled',
            start_time: new Date().toISOString(),
            created_by: user.id,
            viewer_count: 0
          });
          
        if (liveClassError) {
          console.error('Error creating initial stream session:', liveClassError);
        }
      }
    };
    
    createInitialStreamSession();
  }, [user, streamKey, isAdmin]);

  const endStream = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      // Update live_classes status to 'ended' and set recording URL
      const { error: liveClassError } = await supabase
        .from('live_classes')
        .update({
          status: 'ended',
          end_time: new Date().toISOString(),
          recording_url: `https://stream.haritahive.com/recordings/${streamKey?.stream_key}.mp4`
        })
        .eq('stream_key', streamKey?.stream_key)
        .eq('status', 'live');

      if (liveClassError) console.warn('Live class update warning:', liveClassError);

      // Also update stream session for backward compatibility
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
              <Label>RTMP Server URL</Label>
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
              <Label>Stream Key</Label>
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
              <li>Server: Copy the RTMP Server URL from above</li>
              <li>Stream Key: Copy your Stream Key from above</li>
              <li>Set Output → Video Bitrate to 2500-3500 kbps</li>
              <li>Set Output → Video Resolution to 1280x720</li>
              <li>Click "OK" to save settings</li>
              <li>Click "Start Streaming" to go live!</li>
            </ol>
            
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended Settings:</strong> For best quality, use 1280x720 resolution, 2500-3500 kbps bitrate, 
                and AAC audio codec. The Harita Hive server supports direct RTMP streaming with automatic recording 
                and real-time viewer analytics.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Stream Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Stream Status
          </CardTitle>
          <CardDescription>
            Your streaming session is automatically managed by OBS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Video className="h-4 w-4" />
            <AlertDescription>
              <strong>Ready to Stream!</strong> Just open OBS, configure with the settings above, and click "Start Streaming". 
              The system will automatically detect when you go live and update your stream status.
            </AlertDescription>
          </Alert>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Video className="h-4 w-4" />
              How it Works
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Configure OBS with the RTMP settings above</li>
              <li>Click "Start Streaming" in OBS to go live</li>
              <li>System automatically detects your stream and updates status</li>
              <li>Viewers can watch live at /live-classes</li>
              <li>Click "Stop Streaming" in OBS to end - recording is saved automatically</li>
            </ol>
          </div>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => window.open('/live-classes', '_blank')}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Live Classes Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OBSStreamManager;