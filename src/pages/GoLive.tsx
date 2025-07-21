import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, RefreshCw, Play, Square, Video, Settings } from 'lucide-react';

const GoLive: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [streamId, setStreamId] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const rtmpUrl = 'rtmp://rtmp.harita.live/live/';

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    loadUserStream();
  };

  const loadUserStream = async () => {
    const { data, error } = await supabase
      .from('live_classes')
      .select('*')
      .eq('created_by', user?.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setStreamId(data.id);
      setTitle(data.title);
      setDescription(data.description || '');
      setStreamKey(data.stream_key);
      setIsLive(data.status === 'live');
    }
  };

  const createStream = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stream title",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Use generate-stream-key edge function
      const { data: response, error: keyError } = await supabase.functions.invoke('generate-stream-key');
      
      if (keyError) throw keyError;
      
      const streamKey = response.stream_key;
      
      const { data, error } = await supabase
        .from('live_classes')
        .insert({
          title: title.trim(),
          description: description.trim(),
          stream_key: streamKey,
          created_by: user.id,
          start_time: new Date().toISOString(),
          status: 'ended' // Created but not live yet
        })
        .select()
        .single();

      if (error) throw error;

      setStreamId(data.id);
      setStreamKey(data.stream_key);
      toast({
        title: "Success",
        description: "Stream created successfully!"
      });
    } catch (error) {
      console.error('Error creating stream:', error);
      toast({
        title: "Error",
        description: "Failed to create stream",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStream = async () => {
    if (!streamId) {
      await createStream();
      return;
    }

    setLoading(true);
    try {
      const functionName = isLive ? 'end-live' : 'start-live';
      const response = await supabase.functions.invoke(functionName, {
        body: { classId: streamId }
      });

      if (response.error) throw response.error;

      setIsLive(!isLive);
      toast({
        title: "Success",
        description: `Stream ${isLive ? 'stopped' : 'started'} successfully!`
      });
    } catch (error) {
      console.error('Error toggling stream:', error);
      toast({
        title: "Error",
        description: "Failed to toggle stream",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateKey = async () => {
    if (!streamId) return;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('generate-stream-key', {
        body: { streamId }
      });

      if (response.error) throw response.error;

      setStreamKey(response.data.stream_key);
      toast({
        title: "Success",
        description: "Stream key regenerated successfully!"
      });
    } catch (error) {
      console.error('Error regenerating key:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate stream key",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard!"
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Video className="w-8 h-8" />
            Go Live
          </h1>
          <p className="text-xl text-muted-foreground">
            Start your live stream and connect with your audience
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Stream Setup */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stream Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Stream Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your stream title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you'll be streaming about"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={toggleStream}
                    disabled={loading}
                    className={isLive ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    {isLive ? (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        Stop Stream
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {streamId ? 'Start Stream' : 'Create & Start Stream'}
                      </>
                    )}
                  </Button>
                  {isLive && (
                    <Badge variant="destructive" className="animate-pulse">
                      LIVE
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stream Configuration */}
            {streamKey && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    OBS Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">RTMP Server URL</label>
                    <div className="flex items-center gap-2">
                      <Input value={rtmpUrl} readOnly className="font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(rtmpUrl)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Stream Key</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={streamKey} 
                        readOnly 
                        className="font-mono text-sm"
                        type="password"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(streamKey)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={regenerateKey}
                        disabled={loading || isLive}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Keep your stream key private. You can regenerate it if needed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* OBS Instructions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>OBS Studio Setup Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Open OBS Studio</p>
                      <p className="text-sm text-muted-foreground">
                        Make sure you have OBS Studio installed and running
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Go to Settings → Stream</p>
                      <p className="text-sm text-muted-foreground">
                        Click the Settings button in OBS, then select Stream from the left sidebar
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Configure Stream Settings</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Service: Custom...</p>
                        <p>• Server: <code className="bg-muted px-1 py-0.5 rounded">{rtmpUrl}</code></p>
                        <p>• Stream Key: Use the key provided above</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Start Streaming</p>
                      <p className="text-sm text-muted-foreground">
                        Click "Start Streaming" in OBS after clicking "Start Stream" above
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="font-medium text-sm">💡 Pro Tips:</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Use 1080p@30fps for best quality/performance balance</li>
                    <li>• Enable recording to save your stream locally</li>
                    <li>• Test your setup with a private stream first</li>
                    <li>• Check your internet upload speed (recommend 5+ Mbps)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GoLive;