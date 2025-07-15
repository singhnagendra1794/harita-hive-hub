import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, Video, Edit, Trash2, Plus, ExternalLink, Play, Square, Copy, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  video_url: string;
  youtube_video_id: string;
  starts_at: string;
  ends_at: string | null;
  is_live: boolean;
  access_tier: string;
  thumbnail_url: string | null;
  instructor: string;
  created_at: string;
  stream_key?: string;
  stream_url?: string;
  stream_type?: string;
  rtmp_endpoint?: string;
}

const LiveClassManager = () => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [obsModal, setObsModal] = useState({ open: false, liveClass: null as LiveClass | null });
  const [streamStatus, setStreamStatus] = useState<{ [key: string]: any }>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    starts_at: '',
    ends_at: '',
    is_live: true,
    access_tier: 'pro',
    thumbnail_url: '',
    stream_type: 'youtube'
  });

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .order('starts_at', { ascending: false });

      if (error) throw error;
      setLiveClasses(data || []);
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

  const extractVideoId = (url: string): string => {
    // Extract YouTube video ID from various URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return url; // Return as-is if no pattern matches
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.starts_at) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      let classData: any = {
        title: formData.title,
        description: formData.description,
        starts_at: formData.starts_at,
        ends_at: formData.ends_at || null,
        is_live: formData.is_live,
        access_tier: formData.access_tier,
        thumbnail_url: formData.thumbnail_url,
        stream_type: formData.stream_type
      };

      if (formData.stream_type === 'youtube' && formData.video_url) {
        const videoId = extractVideoId(formData.video_url);
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        classData = {
          ...classData,
          youtube_video_id: videoId,
          video_url: embedUrl
        };
      }

      if (editingClass) {
        const { error } = await supabase
          .from('live_classes')
          .update(classData)
          .eq('id', editingClass.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Live class updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('live_classes')
          .insert([classData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Live class created successfully",
        });
      }

      setFormData({
        title: '',
        description: '',
        video_url: '',
        starts_at: '',
        ends_at: '',
        is_live: true,
        access_tier: 'pro',
        thumbnail_url: '',
        stream_type: 'youtube'
      });
      setIsCreating(false);
      setEditingClass(null);
      fetchLiveClasses();
    } catch (error) {
      console.error('Error saving live class:', error);
      toast({
        title: "Error",
        description: "Failed to save live class",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (liveClass: LiveClass) => {
    setFormData({
      title: liveClass.title,
      description: liveClass.description || '',
      video_url: liveClass.youtube_video_id ? `https://youtube.com/watch?v=${liveClass.youtube_video_id}` : '',
      starts_at: new Date(liveClass.starts_at).toISOString().slice(0, 16),
      ends_at: liveClass.ends_at ? new Date(liveClass.ends_at).toISOString().slice(0, 16) : '',
      is_live: liveClass.is_live,
      access_tier: liveClass.access_tier,
      thumbnail_url: liveClass.thumbnail_url || '',
      stream_type: liveClass.stream_type || 'youtube'
    });
    setEditingClass(liveClass);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this live class?')) return;

    try {
      const { error } = await supabase
        .from('live_classes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Live class deleted successfully",
      });
      fetchLiveClasses();
    } catch (error) {
      console.error('Error deleting live class:', error);
      toast({
        title: "Error",
        description: "Failed to delete live class",
        variant: "destructive",
      });
    }
  };

  const isLive = (startsAt: string, endsAt: string | null, isLiveFlag: boolean) => {
    const now = new Date();
    const start = new Date(startsAt);
    const end = endsAt ? new Date(endsAt) : null;
    
    return isLiveFlag && now >= start && (!end || now <= end);
  };

  const handleOBSStream = async (liveClass: LiveClass, action: 'start' | 'stop') => {
    try {
      const { data, error } = await supabase.functions.invoke('stream-management', {
        body: {
          action,
          liveClassId: liveClass.id
        }
      });

      if (error) throw error;

      if (action === 'start') {
        setObsModal({ open: true, liveClass });
        setStreamStatus(prev => ({ ...prev, [liveClass.id]: data }));
        
        toast({
          title: "Stream Started",
          description: "OBS stream session is ready. Use the provided stream key in OBS.",
        });
      } else {
        setStreamStatus(prev => ({ ...prev, [liveClass.id]: null }));
        
        toast({
          title: "Stream Stopped",
          description: "OBS stream session has been ended.",
        });
      }

      fetchLiveClasses(); // Refresh data
    } catch (error) {
      console.error('Error managing OBS stream:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} stream: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Class Manager</h2>
          <p className="text-muted-foreground">Manage YouTube Live streaming and OBS integration</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Live Class
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingClass ? 'Edit' : 'Create'} Live Class</CardTitle>
            <CardDescription>
              Set up a live streaming session using YouTube or OBS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Class Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Advanced QGIS Techniques"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="access_tier">Access Tier</Label>
                  <select
                    id="access_tier"
                    value={formData.access_tier}
                    onChange={(e) => setFormData({ ...formData, access_tier: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                </div>
                
                <div>
                  <Label htmlFor="stream_type">Stream Type</Label>
                  <select
                    id="stream_type"
                    value={formData.stream_type}
                    onChange={(e) => setFormData({ ...formData, stream_type: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="youtube">YouTube Live</option>
                    <option value="obs">OBS Studio</option>
                  </select>
                </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Learn advanced spatial analysis techniques..."
                  rows={3}
                />
              </div>

              {formData.stream_type === 'youtube' && (
                <div>
                  <Label htmlFor="video_url">YouTube Video URL/ID *</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=VIDEO_ID or just VIDEO_ID"
                    required={formData.stream_type === 'youtube'}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="starts_at">Start Time *</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ends_at">End Time (Optional)</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail_url">Thumbnail URL (Optional)</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_live"
                  checked={formData.is_live}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_live: checked })}
                />
                <Label htmlFor="is_live">Currently Live</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingClass ? 'Update' : 'Create'} Class
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setEditingClass(null);
                    setFormData({
                      title: '',
                      description: '',
                      video_url: '',
                      starts_at: '',
                      ends_at: '',
                      is_live: true,
                      access_tier: 'pro',
                      thumbnail_url: '',
                      stream_type: 'youtube'
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {liveClasses.map((liveClass) => (
          <Card key={liveClass.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{liveClass.title}</h3>
                    {isLive(liveClass.starts_at, liveClass.ends_at, liveClass.is_live) && (
                      <Badge variant="destructive" className="animate-pulse">
                        🔴 LIVE
                      </Badge>
                    )}
                    <Badge variant="outline">{liveClass.access_tier}</Badge>
                    <Badge variant="secondary">{liveClass.stream_type || 'youtube'}</Badge>
                  </div>
                  
                  {liveClass.description && (
                    <p className="text-muted-foreground mb-3">{liveClass.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(liveClass.starts_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(liveClass.starts_at).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      {liveClass.instructor}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {liveClass.stream_type === 'obs' && (
                    <>
                      <Button
                        variant={streamStatus[liveClass.id] ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleOBSStream(liveClass, streamStatus[liveClass.id] ? 'stop' : 'start')}
                      >
                        {streamStatus[liveClass.id] ? (
                          <>
                            <Square className="h-4 w-4 mr-1" />
                            Stop Stream
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Start Stream
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setObsModal({ open: true, liveClass })}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/live-classes/${liveClass.id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(liveClass)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(liveClass.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {liveClasses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Live Classes</h3>
              <p className="text-muted-foreground mb-4">
                Create your first live streaming session using YouTube or OBS
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Live Class
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* OBS Stream Modal */}
      <Dialog open={obsModal.open} onOpenChange={(open) => setObsModal({ open, liveClass: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>OBS Stream Configuration</DialogTitle>
            <DialogDescription>
              Use these settings in OBS Studio to start streaming
            </DialogDescription>
          </DialogHeader>

          {obsModal.liveClass && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Stream Server</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={obsModal.liveClass.rtmp_endpoint || "Generate stream key first"} 
                    readOnly 
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(obsModal.liveClass.rtmp_endpoint || "", "RTMP Endpoint")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Stream Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={obsModal.liveClass.stream_key || "Generate stream key first"} 
                    readOnly 
                    type="password"
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(obsModal.liveClass.stream_key || "", "Stream Key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">OBS Setup Instructions:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                  <li>Open OBS Studio</li>
                  <li>Go to Settings → Stream</li>
                  <li>Set Service to "Custom"</li>
                  <li>Copy the Server URL above</li>
                  <li>Copy the Stream Key above</li>
                  <li>Click "Start Streaming"</li>
                </ol>
              </div>

              {!streamStatus[obsModal.liveClass.id] && (
                <Button
                  className="w-full"
                  onClick={() => {
                    handleOBSStream(obsModal.liveClass, 'start');
                    setObsModal({ open: false, liveClass: null });
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Generate Stream Key & Start Session
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveClassManager;