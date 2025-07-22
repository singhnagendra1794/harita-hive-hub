import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Video, 
  Plus, 
  Copy, 
  Play, 
  Square, 
  Eye, 
  Settings, 
  Monitor,
  Users,
  Calendar,
  Clock,
  ExternalLink
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  rtmp_url?: string;
  hls_url?: string;
  is_live?: boolean;
  has_ended?: boolean;
  can_start?: boolean;
  duration_minutes?: number | null;
  obs_setup?: {
    server: string;
    stream_key: string;
    recommended_settings: {
      video_bitrate: string;
      audio_bitrate: string;
      resolution: string;
      fps: number;
      encoder: string;
    };
  };
}

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is super admin
  useEffect(() => {
    if (user && user.email !== 'contact@haritahive.com') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);
  const [mySessions, setMySessions] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMySessions();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMySessions, 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchMySessions = async () => {
    try {
      const response = await supabase.functions.invoke('get-instructor-streams');
      if (response.error) throw response.error;
      
      const data = response.data;
      setMySessions(data?.my_sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStream = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stream title",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stream', {
        body: {
          title: formData.title.trim(),
          description: formData.description.trim()
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stream created successfully! Use the RTMP server and stream key in OBS to start streaming."
      });

      setFormData({ title: '', description: '' });
      setShowCreateForm(false);
      fetchMySessions();
    } catch (error) {
      console.error('Error creating stream:', error);
      toast({
        title: "Error",
        description: "Failed to create stream",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleStartLive = async (classId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('start-live-stream', {
        body: { class_id: classId }
      });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Stream started successfully! You can now stream via OBS."
      });
      fetchMySessions();
    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Error",
        description: "Failed to start stream",
        variant: "destructive"
      });
    }
  };

  const handleEndLive = async (classId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('end-stream-session', {
        body: { class_id: classId }
      });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Stream ended successfully!"
      });
      fetchMySessions();
    } catch (error) {
      console.error('Error ending stream:', error);
      toast({
        title: "Error",
        description: "Failed to end stream",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard!`
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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
      <div className="container py-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const activeSessions = mySessions.filter(s => s.status === 'live');
  const readyToStart = mySessions.filter(s => s.status === 'ended' && !s.end_time);
  const endedSessions = mySessions.filter(s => s.status === 'ended' && s.end_time);

  return (
    <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your live streaming sessions and connect with your audience
          </p>
        </div>

        {/* Create New Stream Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Create New Stream</h2>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Stream
            </Button>
          </div>

          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Live Stream</CardTitle>
                <CardDescription>
                  Set up a new live streaming session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Stream Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter your stream title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what you'll be streaming about"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateStream} disabled={creating}>
                    {creating ? 'Creating...' : 'Create Stream'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Video className="h-5 w-5 text-red-500" />
              Live Now
            </h2>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <Card key={session.id} className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{session.title}</h3>
                          <Badge variant="destructive" className="animate-pulse">
                            🔴 LIVE
                          </Badge>
                        </div>
                        {session.description && (
                          <p className="text-muted-foreground mb-3">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {session.viewer_count || 0} viewers
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Started at {formatTime(session.start_time)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/live-classes`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEndLive(session.id)}
                        >
                          <Square className="h-4 w-4 mr-1" />
                          End Stream
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Ready to Start Sessions */}
        {readyToStart.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Ready to Start</h2>
            <div className="space-y-4">
              {readyToStart.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                        {session.description && (
                          <p className="text-muted-foreground mb-3">{session.description}</p>
                        )}
                        
                        {/* OBS Setup Instructions */}
                        <div className="bg-muted/50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            OBS Setup - Paste these into OBS to go live
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">RTMP Server:</span>
                              <div className="flex items-center gap-2">
                                <code className="bg-background px-2 py-1 rounded text-xs">
                                   rtmp://stream.haritahive.com/live
                                </code>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard('rtmp://stream.haritahive.com/live', 'RTMP Server')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Stream Key:</span>
                              <div className="flex items-center gap-2">
                                <code className="bg-background px-2 py-1 rounded text-xs">
                                  {session.stream_key}
                                </code>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(session.stream_key, 'Stream Key')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                              <p className="text-blue-700 dark:text-blue-300 text-xs font-medium">
                                📋 Instructions: Paste these into OBS to start streaming
                              </p>
                              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                                Settings → Stream → Service: Custom → Server + Stream Key
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created {formatDate(session.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStartLive(session.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Live
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Sessions */}
        {endedSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Past Sessions</h2>
            <div className="space-y-4">
              {endedSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                        {session.description && (
                          <p className="text-muted-foreground mb-3">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(session.start_time)}
                          </div>
                          {session.duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {session.duration_minutes}m
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.recording_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(session.recording_url!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Recording
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* OBS Setup Guide */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">OBS Setup Guide</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                How to Stream with OBS Studio
              </CardTitle>
              <CardDescription>
                Follow these steps to start streaming to HaritaHive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Create a Stream</p>
                    <p className="text-sm text-muted-foreground">
                      Click "New Stream" above to generate your unique stream key
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Configure OBS</p>
                    <div className="text-sm text-muted-foreground space-y-1 mt-1">
                      <p>• Open OBS Studio → Settings → Stream</p>
                      <p>• Service: Custom...</p>
                      <p>• Server: <code className="bg-muted px-1 py-0.5 rounded">rtmp://stream.haritahive.com/live</code></p>
                      <p>• Stream Key: Copy from your stream above</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Start Streaming</p>
                    <p className="text-sm text-muted-foreground">
                      Click "Start Live" in your stream card, then "Start Streaming" in OBS
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-medium text-sm mb-2">💡 Recommended Settings:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Resolution: 1920x1080 (1080p)</li>
                  <li>• FPS: 30</li>
                  <li>• Video Bitrate: 2500 Kbps</li>
                  <li>• Audio Bitrate: 160 Kbps</li>
                  <li>• Encoder: x264</li>
                  <li>• Check your internet upload speed (recommend 5+ Mbps)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {mySessions.length === 0 && (
          <div className="text-center py-12">
            <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Streams Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create your first live stream to start engaging with your audience. 
              It only takes a few clicks to get started!
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Stream
            </Button>
          </div>
        )}
    </div>
  );
};

export default InstructorDashboard;