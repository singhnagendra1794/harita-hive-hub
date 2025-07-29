import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Pause, 
  Square, 
  Youtube, 
  Tv, 
  Radio,
  Settings,
  Users,
  User,
  Eye,
  Upload,
  FileVideo,
  Calendar,
  Clock,
  Zap,
  Plus
} from 'lucide-react';

interface LiveSession {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'live' | 'ended';
  sessionType: 'private' | 'group';
  participants: number;
  youtubeUrl?: string;
  rtmpKey?: string;
  startedAt?: string;
  endedAt?: string;
}

export const SuperAdminLiveControls: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [activeSessions, setActiveSessions] = useState<LiveSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  // Form state for new session
  const [newSessionForm, setNewSessionForm] = useState({
    title: '',
    description: '',
    sessionType: 'group' as 'private' | 'group',
    enableYoutube: false,
    enableRecording: true,
    enableAvatar: true,
    scheduledTime: ''
  });

  // OBS/YouTube settings
  const [obsSettings, setObsSettings] = useState({
    rtmpEndpoint: '',
    streamKey: '',
    connected: false
  });

  const [youtubeSettings, setYoutubeSettings] = useState({
    channelId: '',
    apiConnected: false,
    autoSync: true
  });

  useEffect(() => {
    loadActiveSessions();
    loadSettings();
  }, []);

  const loadActiveSessions = async () => {
    try {
      // Load active GEOVA sessions
      // In production, this would query the database
      const mockSessions: LiveSession[] = [
        {
          id: '1',
          title: 'GEOVA Daily GIS Basics',
          description: 'Introduction to QGIS for beginners',
          status: 'live',
          sessionType: 'group',
          participants: 12,
          youtubeUrl: 'https://youtube.com/watch?v=example1',
          startedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Advanced Spatial Analysis',
          description: 'Machine learning with geospatial data',
          status: 'scheduled',
          sessionType: 'group',
          participants: 0,
        }
      ];
      setActiveSessions(mockSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadSettings = async () => {
    try {
      // Load OBS and YouTube settings
      // These would be stored in the database or environment
      setObsSettings({
        rtmpEndpoint: 'rtmp://a.rtmp.youtube.com/live2',
        streamKey: 'YOUR_STREAM_KEY',
        connected: false
      });

      setYoutubeSettings({
        channelId: 'HaritaHive',
        apiConnected: true,
        autoSync: true
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const createNewSession = async () => {
    try {
      setIsCreatingSession(true);

      const sessionData = {
        ...newSessionForm,
        id: crypto.randomUUID(),
        status: newSessionForm.scheduledTime ? 'scheduled' : 'live',
        participants: 0,
        createdAt: new Date().toISOString()
      };

      // Create session via edge function
      const { data, error } = await supabase.functions.invoke('geova-live-session', {
        body: {
          action: 'create',
          sessionType: sessionData.sessionType,
          contextPage: 'admin-created',
          config: {
            sessionType: sessionData.sessionType,
            voiceEnabled: true,
            avatarEnabled: sessionData.enableAvatar,
            whiteboardEnabled: true,
            recordingEnabled: sessionData.enableRecording,
            youtubeStreamEnabled: sessionData.enableYoutube
          }
        }
      });

      if (error) throw error;

      // If YouTube is enabled, create stream
      if (sessionData.enableYoutube) {
        await createYouTubeStream(data.session.id, sessionData.title, sessionData.description);
      }

      setActiveSessions(prev => [...prev, data.session]);
      
      // Reset form
      setNewSessionForm({
        title: '',
        description: '',
        sessionType: 'group',
        enableYoutube: false,
        enableRecording: true,
        enableAvatar: true,
        scheduledTime: ''
      });

      toast({
        title: "Session Created",
        description: `GEOVA ${sessionData.sessionType} session created successfully!`,
      });

    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create GEOVA session",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  const createYouTubeStream = async (sessionId: string, title: string, description: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('geova-youtube-stream', {
        body: {
          action: 'start',
          sessionId,
          title,
          description
        }
      });

      if (error) throw error;

      toast({
        title: "YouTube Stream Created",
        description: "Live stream is ready on YouTube!",
      });

      return data;
    } catch (error) {
      console.error('Error creating YouTube stream:', error);
      toast({
        title: "YouTube Error",
        description: "Failed to create YouTube stream",
        variant: "destructive",
      });
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      const session = activeSessions.find(s => s.id === sessionId);
      if (!session) return;

      // Start the session
      const { error } = await supabase.functions.invoke('geova-live-session', {
        body: {
          action: 'start',
          sessionId
        }
      });

      if (error) throw error;

      // Update session status
      setActiveSessions(prev => 
        prev.map(s => 
          s.id === sessionId 
            ? { ...s, status: 'live', startedAt: new Date().toISOString() }
            : s
        )
      );

      toast({
        title: "Session Started",
        description: `${session.title} is now live!`,
      });

    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Start Failed",
        description: "Failed to start session",
        variant: "destructive",
      });
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      const session = activeSessions.find(s => s.id === sessionId);
      if (!session) return;

      // End the session
      const { error } = await supabase.functions.invoke('geova-live-session', {
        body: {
          action: 'end',
          sessionId
        }
      });

      if (error) throw error;

      // If YouTube stream exists, end it
      if (session.youtubeUrl) {
        await supabase.functions.invoke('geova-youtube-stream', {
          body: {
            action: 'stop',
            streamId: sessionId
          }
        });
      }

      // Update session status
      setActiveSessions(prev => 
        prev.map(s => 
          s.id === sessionId 
            ? { ...s, status: 'ended', endedAt: new Date().toISOString() }
            : s
        )
      );

      toast({
        title: "Session Ended",
        description: `${session.title} has been stopped`,
      });

    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "End Failed",
        description: "Failed to end session",
        variant: "destructive",
      });
    }
  };

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-500 animate-pulse"><Radio className="w-3 h-3 mr-1" />Live</Badge>;
      case 'scheduled':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case 'ended':
        return <Badge variant="outline"><Square className="w-3 h-3 mr-1" />Ended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GEOVA Live Controls</h1>
          <p className="text-muted-foreground">Manage AI mentor sessions, YouTube streams, and OBS integration</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Zap className="w-3 h-3" />
            Super Admin
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="w-5 h-5" />
                Active GEOVA Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tv className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active sessions</p>
                </div>
              ) : (
                activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{session.title}</h3>
                        {getSessionStatusBadge(session.status)}
                        <Badge variant="outline">{session.sessionType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{session.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {session.participants} participants
                        </span>
                        {session.youtubeUrl && (
                          <span className="flex items-center gap-1">
                            <Youtube className="w-3 h-3" />
                            YouTube Live
                          </span>
                        )}
                        {session.startedAt && (
                          <span>Started: {new Date(session.startedAt).toLocaleTimeString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.status === 'scheduled' && (
                        <Button onClick={() => startSession(session.id)} size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {session.status === 'live' && (
                        <Button onClick={() => endSession(session.id)} variant="destructive" size="sm">
                          <Square className="w-4 h-4" />
                        </Button>
                      )}
                      {session.youtubeUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={session.youtubeUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* YouTube & OBS Integration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Youtube className="w-5 h-5" />
                  YouTube Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Connection</span>
                  <Badge variant={youtubeSettings.apiConnected ? "default" : "destructive"}>
                    {youtubeSettings.apiConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-sync Sessions</span>
                  <Switch
                    checked={youtubeSettings.autoSync}
                    onCheckedChange={(checked) => 
                      setYoutubeSettings(prev => ({ ...prev, autoSync: checked }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Channel</label>
                  <Input 
                    value={youtubeSettings.channelId}
                    onChange={(e) => 
                      setYoutubeSettings(prev => ({ ...prev, channelId: e.target.value }))
                    }
                    placeholder="Channel ID"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="w-5 h-5" />
                  OBS Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">OBS Connection</span>
                  <Badge variant={obsSettings.connected ? "default" : "secondary"}>
                    {obsSettings.connected ? "Connected" : "Ready"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">RTMP Endpoint</label>
                  <Input 
                    value={obsSettings.rtmpEndpoint}
                    onChange={(e) => 
                      setObsSettings(prev => ({ ...prev, rtmpEndpoint: e.target.value }))
                    }
                    placeholder="rtmp://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stream Key</label>
                  <Input 
                    value={obsSettings.streamKey}
                    onChange={(e) => 
                      setObsSettings(prev => ({ ...prev, streamKey: e.target.value }))
                    }
                    placeholder="Stream key"
                    type="password"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create New Session */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                  value={newSessionForm.title}
                  onChange={(e) => 
                    setNewSessionForm(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="GEOVA Session Title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  value={newSessionForm.description}
                  onChange={(e) => 
                    setNewSessionForm(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Session description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Session Type</label>
                <div className="flex gap-2">
                  <Button
                    variant={newSessionForm.sessionType === 'private' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewSessionForm(prev => ({ ...prev, sessionType: 'private' }))}
                  >
                    <User className="w-4 h-4 mr-1" />
                    Private
                  </Button>
                  <Button
                    variant={newSessionForm.sessionType === 'group' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewSessionForm(prev => ({ ...prev, sessionType: 'group' }))}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Group
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable YouTube Stream</span>
                  <Switch
                    checked={newSessionForm.enableYoutube}
                    onCheckedChange={(checked) => 
                      setNewSessionForm(prev => ({ ...prev, enableYoutube: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable Recording</span>
                  <Switch
                    checked={newSessionForm.enableRecording}
                    onCheckedChange={(checked) => 
                      setNewSessionForm(prev => ({ ...prev, enableRecording: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable AI Avatar</span>
                  <Switch
                    checked={newSessionForm.enableAvatar}
                    onCheckedChange={(checked) => 
                      setNewSessionForm(prev => ({ ...prev, enableAvatar: checked }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule (Optional)</label>
                <Input 
                  type="datetime-local"
                  value={newSessionForm.scheduledTime}
                  onChange={(e) => 
                    setNewSessionForm(prev => ({ ...prev, scheduledTime: e.target.value }))
                  }
                />
              </div>

              <Button 
                onClick={createNewSession}
                disabled={!newSessionForm.title || isCreatingSession}
                className="w-full"
              >
                {isCreatingSession ? "Creating..." : "Create Session"}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                Upload Recording
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileVideo className="w-4 h-4 mr-2" />
                Manage Recordings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Sessions
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Stream Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};