import Layout from '@/components/Layout';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Video, Calendar, Clock, Users, Play, AlertCircle, Settings, Monitor, Copy, Plus, Eye } from "lucide-react";
import { LiveVideoPlayer } from '@/components/LiveVideoPlayer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  stream_key: string;
  status: 'live' | 'ended';
  start_time: string;
  end_time: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const LiveClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchLiveClasses();
    // Refresh every 10 seconds
    const interval = setInterval(fetchLiveClasses, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const response = await supabase.functions.invoke('get-live-classes');
      if (response.error) throw response.error;
      setLiveClasses(response.data || []);
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

  const handleCreateStream = async () => {
    if (!user || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stream title",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate stream key
      const { data: keyResponse, error: keyError } = await supabase.functions.invoke('generate-stream-key');
      if (keyError) throw keyError;

      // Create live class
      const { data, error } = await supabase
        .from('live_classes')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          stream_key: keyResponse.stream_key,
          created_by: user.id,
          start_time: new Date().toISOString(),
          status: 'ended' // Created but not started yet
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stream created successfully! You can now start streaming."
      });

      setFormData({ title: '', description: '' });
      setShowCreateForm(false);
      fetchLiveClasses();
    } catch (error) {
      console.error('Error creating stream:', error);
      toast({
        title: "Error",
        description: "Failed to create stream",
        variant: "destructive"
      });
    }
  };

  const handleStartLive = async (classId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('start-live', {
        body: { classId }
      });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Stream started successfully! You can now stream via OBS."
      });
      fetchLiveClasses();
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
      const { data, error } = await supabase.functions.invoke('end-live', {
        body: { classId }
      });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Stream ended successfully!"
      });
      fetchLiveClasses();
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

  const isLive = (liveClass: LiveClass) => {
    return liveClass.status === 'live';
  };

  const isUpcoming = (liveClass: LiveClass) => {
    const now = new Date();
    const start = new Date(liveClass.start_time);
    return start > now && liveClass.status === 'ended';
  };

  const isRecorded = (liveClass: LiveClass) => {
    const now = new Date();
    const start = new Date(liveClass.start_time);
    return start <= now && liveClass.status === 'ended';
  };

  const currentLiveClass = liveClasses.find(cls => isLive(cls));
  const upcomingClasses = liveClasses.filter(cls => isUpcoming(cls));
  const pastClasses = liveClasses.filter(cls => isRecorded(cls));

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Live Classes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join interactive live sessions with expert instructors
          </p>
        </div>

        {/* Live Stream Section */}
        {currentLiveClass ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Video className="h-6 w-6" />
              🔴 Live Now
            </h2>
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{currentLiveClass.title}</CardTitle>
                    <CardDescription>{currentLiveClass.description}</CardDescription>
                  </div>
                  <Badge variant="destructive" className="animate-pulse">🔴 LIVE</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg mb-4">
                  <LiveVideoPlayer
                    src={`https://stream.haritahive.com/hls/${currentLiveClass.stream_key}.m3u8`}
                    title={currentLiveClass.title}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Started at {new Date(currentLiveClass.start_time).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Live Stream
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
                  No classes are currently live. Check back soon!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Stream Section (for authenticated users) */}
        {user && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create Live Stream</h2>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                <Plus className="h-4 w-4 mr-2" />
                New Stream
              </Button>
            </div>

            {showCreateForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Stream</CardTitle>
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
                    <Button onClick={handleCreateStream}>
                      Create Stream
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
        )}

        {/* Stream Management for User's Streams */}
        {user && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Your Streams</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {liveClasses
                  .filter(cls => cls.created_by === user.id)
                  .map((liveClass) => (
                    <Card key={liveClass.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{liveClass.title}</h3>
                              {isLive(liveClass) && (
                                <Badge variant="destructive" className="animate-pulse">
                                  🔴 LIVE
                                </Badge>
                              )}
                              <Badge variant="outline">{liveClass.status}</Badge>
                            </div>
                            {liveClass.description && (
                              <p className="text-muted-foreground mb-3">{liveClass.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(liveClass.start_time).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(liveClass.start_time).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(`rtmp://stream.haritahive.com/live`, 'RTMP Server')}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              RTMP
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(liveClass.stream_key, 'Stream Key')}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Key
                            </Button>
                            {isLive(liveClass) ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleEndLive(liveClass.id)}
                              >
                                End Live
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleStartLive(liveClass.id)}
                              >
                                Start Live
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/live-classes/${liveClass.id}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* OBS Setup Instructions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">OBS Setup Instructions</h2>
          <Card>
            <CardHeader>
              <CardTitle>How to Stream with OBS Studio</CardTitle>
              <CardDescription>
                Follow these steps to start streaming to our platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
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
                    <div className="text-sm text-muted-foreground space-y-1">
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

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="font-medium text-sm">💡 Pro Tips:</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Use 1080p@30fps for best quality/performance balance</li>
                  <li>• Check your internet upload speed (recommend 5+ Mbps)</li>
                  <li>• Your stream will be automatically recorded</li>
                  <li>• Students can watch at: https://haritahive.com/live-classes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Past Streams */}
        {pastClasses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Play className="h-6 w-6" />
              Past Streams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastClasses.map((liveClass) => (
                <Card key={liveClass.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{liveClass.title}</CardTitle>
                    <CardDescription>{liveClass.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(liveClass.start_time).toLocaleDateString()}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/live-classes/${liveClass.id}`)}
                      >
                        View Recording
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LiveClasses;