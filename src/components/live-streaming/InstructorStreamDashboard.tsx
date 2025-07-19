import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, 
  Settings, 
  Users, 
  Activity, 
  Key, 
  Server, 
  Youtube, 
  Monitor,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface StreamSettings {
  id?: string;
  default_stream_type: 'youtube' | 'obs' | 'hybrid';
  youtube_channel_id: string;
  obs_stream_key: string;
  stream_quality: 'SD' | 'HD' | '4K';
  enable_chat: boolean;
  enable_recording: boolean;
  backup_recording: boolean;
}

interface LiveClass {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  class_status: 'upcoming' | 'live' | 'ended' | 'recorded';
  stream_key: string | null;
  stream_server_url: string;
  youtube_video_id: string;
  viewer_count: number;
  chat_enabled: boolean;
  stream_type: 'youtube' | 'obs' | 'hybrid';
}

export const InstructorStreamDashboard: React.FC = () => {
  const { user } = useAuth();
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    default_stream_type: 'youtube',
    youtube_channel_id: '',
    obs_stream_key: '',
    stream_quality: 'HD',
    enable_chat: true,
    enable_recording: true,
    backup_recording: true,
  });
  const [activeClasses, setActiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'offline' | 'connecting' | 'live'>('offline');

  useEffect(() => {
    if (user) {
      fetchStreamSettings();
      fetchActiveClasses();
    }
  }, [user]);

  const fetchStreamSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('instructor_stream_settings')
        .select('*')
        .eq('instructor_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStreamSettings(data as StreamSettings);
      }
    } catch (error) {
      console.error('Error fetching stream settings:', error);
      toast({
        title: "Error",
        description: "Failed to load stream settings",
        variant: "destructive",
      });
    }
  };

  const fetchActiveClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .eq('created_by', user?.id)
        .in('class_status', ['upcoming', 'live'])
        .order('starts_at', { ascending: true });

      if (error) throw error;
      setActiveClasses((data || []) as LiveClass[]);
    } catch (error) {
      console.error('Error fetching active classes:', error);
      toast({
        title: "Error",
        description: "Failed to load active classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStreamSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('instructor_stream_settings')
        .upsert({
          ...streamSettings,
          instructor_id: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stream settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving stream settings:', error);
      toast({
        title: "Error",
        description: "Failed to save stream settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const startStream = async (classId: string) => {
    try {
      const response = await fetch('/functions/v1/stream-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'start',
          liveClassId: classId,
        }),
      });

      if (!response.ok) throw new Error('Failed to start stream');

      setStreamStatus('live');
      fetchActiveClasses();
      
      toast({
        title: "Stream Started",
        description: "Your live stream is now active",
      });
    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Error",
        description: "Failed to start stream",
        variant: "destructive",
      });
    }
  };

  const stopStream = async (classId: string) => {
    try {
      const response = await fetch('/functions/v1/stream-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'stop',
          liveClassId: classId,
        }),
      });

      if (!response.ok) throw new Error('Failed to stop stream');

      setStreamStatus('offline');
      fetchActiveClasses();
      
      toast({
        title: "Stream Stopped",
        description: "Your live stream has been ended",
      });
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast({
        title: "Error",
        description: "Failed to stop stream",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your live streaming settings and classes</p>
        </div>
        <Badge variant={streamStatus === 'live' ? 'destructive' : 'outline'}>
          {streamStatus === 'live' ? '🔴 LIVE' : '⚫ OFFLINE'}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="obs-guide">OBS Setup</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Active Classes
              </CardTitle>
              <CardDescription>
                Manage your upcoming and live classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeClasses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active classes. Create a new class to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {activeClasses.map((liveClass) => (
                    <div key={liveClass.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{liveClass.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={liveClass.class_status === 'live' ? 'destructive' : 'outline'}>
                            {liveClass.class_status}
                          </Badge>
                          <Badge variant="secondary">{liveClass.stream_type}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{liveClass.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {liveClass.viewer_count} viewers
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            {new Date(liveClass.starts_at).toLocaleTimeString()}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {liveClass.class_status === 'upcoming' && (
                            <Button
                              size="sm"
                              onClick={() => startStream(liveClass.id)}
                            >
                              Start Stream
                            </Button>
                          )}
                          {liveClass.class_status === 'live' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => stopStream(liveClass.id)}
                            >
                              Stop Stream
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Stream Settings
              </CardTitle>
              <CardDescription>
                Configure your default streaming preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stream-type">Default Stream Type</Label>
                  <select
                    id="stream-type"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={streamSettings.default_stream_type}
                    onChange={(e) => setStreamSettings(prev => ({
                      ...prev,
                      default_stream_type: e.target.value as 'youtube' | 'obs' | 'hybrid'
                    }))}
                  >
                    <option value="youtube">YouTube Live</option>
                    <option value="obs">OBS Studio</option>
                    <option value="hybrid">Hybrid (YouTube + OBS)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="youtube-channel">YouTube Channel ID</Label>
                  <Input
                    id="youtube-channel"
                    value={streamSettings.youtube_channel_id}
                    onChange={(e) => setStreamSettings(prev => ({
                      ...prev,
                      youtube_channel_id: e.target.value
                    }))}
                    placeholder="Enter your YouTube channel ID"
                  />
                </div>

                <div>
                  <Label htmlFor="obs-key">OBS Stream Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="obs-key"
                      type="password"
                      value={streamSettings.obs_stream_key}
                      onChange={(e) => setStreamSettings(prev => ({
                        ...prev,
                        obs_stream_key: e.target.value
                      }))}
                      placeholder="Enter your stream key"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(streamSettings.obs_stream_key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="quality">Stream Quality</Label>
                  <select
                    id="quality"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={streamSettings.stream_quality}
                    onChange={(e) => setStreamSettings(prev => ({
                      ...prev,
                      stream_quality: e.target.value as 'SD' | 'HD' | '4K'
                    }))}
                  >
                    <option value="SD">Standard Definition (480p)</option>
                    <option value="HD">High Definition (1080p)</option>
                    <option value="4K">Ultra HD (4K)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-chat">Enable Chat</Label>
                    <Switch
                      id="enable-chat"
                      checked={streamSettings.enable_chat}
                      onCheckedChange={(checked) => setStreamSettings(prev => ({
                        ...prev,
                        enable_chat: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-recording">Enable Recording</Label>
                    <Switch
                      id="enable-recording"
                      checked={streamSettings.enable_recording}
                      onCheckedChange={(checked) => setStreamSettings(prev => ({
                        ...prev,
                        enable_recording: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="backup-recording">Backup Recording</Label>
                    <Switch
                      id="backup-recording"
                      checked={streamSettings.backup_recording}
                      onCheckedChange={(checked) => setStreamSettings(prev => ({
                        ...prev,
                        backup_recording: checked
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={saveStreamSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="obs-guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                OBS Studio Setup Guide
              </CardTitle>
              <CardDescription>
                Step-by-step instructions to set up OBS Studio for live streaming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Make sure you have OBS Studio installed. Download it from{' '}
                  <a href="https://obsproject.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    obsproject.com
                  </a>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">Step 1: Configure Stream Settings</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    In OBS, go to Settings → Stream and configure the following:
                  </p>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="space-y-1 font-mono text-sm">
                      <div><strong>Service:</strong> Custom</div>
                      <div className="flex items-center gap-2">
                        <strong>Server:</strong> 
                        <code className="bg-background px-2 py-1 rounded">rtmp://a.rtmp.youtube.com/live2/</code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard('rtmp://a.rtmp.youtube.com/live2/')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Stream Key:</strong> 
                        <code className="bg-background px-2 py-1 rounded">
                          {streamSettings.obs_stream_key || 'Configure in Settings tab'}
                        </code>
                        {streamSettings.obs_stream_key && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(streamSettings.obs_stream_key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">Step 2: Output Settings</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Go to Settings → Output and set:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Output Mode: Advanced</li>
                    <li>Encoder: x264 or Hardware (NVENC/AMD)</li>
                    <li>Bitrate: 4500-6000 for HD, 2500-4000 for SD</li>
                    <li>Keyframe Interval: 2</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">Step 3: Video Settings</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Go to Settings → Video and configure:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Base Resolution: 1920x1080 (for HD) or 1280x720 (for SD)</li>
                    <li>Output Resolution: Same as base</li>
                    <li>FPS: 30 or 60</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">Step 4: Audio Settings</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Go to Settings → Audio and set:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Sample Rate: 48 kHz</li>
                    <li>Channels: Stereo</li>
                    <li>Desktop Audio: Default</li>
                    <li>Mic/Auxiliary Audio: Your microphone</li>
                  </ul>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Once configured, click "Start Streaming" in OBS when you're ready to go live.
                    The stream will automatically appear in your class viewer.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Stream Analytics
              </CardTitle>
              <CardDescription>
                View your streaming performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Analytics data will be displayed here once you start streaming.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstructorStreamDashboard;