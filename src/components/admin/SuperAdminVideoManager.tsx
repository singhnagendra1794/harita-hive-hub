import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Video, 
  Youtube, 
  Upload, 
  Save, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Download,
  Radio,
  Home,
  Lock,
  Unlock,
  Play,
  Settings
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  embed_url: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  is_free: boolean;
  is_home_featured: boolean;
  platform: 'youtube' | 'aws' | 'obs';
  stream_server_url?: string;
  stream_key?: string;
  status: 'scheduled' | 'live' | 'ended';
  viewer_count: number;
  created_at: string;
}

interface ClassRecording {
  id: string;
  title: string;
  description?: string;
  youtube_url?: string;
  aws_url?: string;
  cloudfront_url?: string;
  thumbnail_url?: string;
  file_size_bytes?: number;
  duration_seconds?: number;
  view_count: number;
  download_count: number;
  is_public: boolean;
  created_at: string;
}

const SuperAdminVideoManager = () => {
  const { user } = useAuth();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [recordings, setRecordings] = useState<ClassRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStream, setEditingStream] = useState<LiveStream | null>(null);
  const [editingRecording, setEditingRecording] = useState<ClassRecording | null>(null);
  
  const [streamForm, setStreamForm] = useState({
    title: '',
    description: '',
    embed_url: '',
    start_time: '',
    duration_minutes: 90,
    is_free: false,
    is_home_featured: false,
    platform: 'youtube' as 'youtube' | 'aws' | 'obs',
    stream_server_url: '',
    stream_key: ''
  });

  const [recordingForm, setRecordingForm] = useState({
    title: '',
    description: '',
    youtube_url: '',
    aws_url: '',
    thumbnail_url: '',
    is_public: true,
    upload_type: 'youtube' as 'youtube' | 'aws'
  });

  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch live streams
      const { data: streamsData, error: streamsError } = await supabase
        .from('live_streams')
        .select('*')
        .order('start_time', { ascending: false });

      if (streamsError) throw streamsError;
      setLiveStreams((streamsData || []).map(stream => ({
        ...stream,
        platform: stream.platform as 'youtube' | 'aws' | 'obs',
        status: stream.status as 'scheduled' | 'live' | 'ended',
        description: stream.description || undefined,
        end_time: stream.end_time || undefined,
        duration_minutes: stream.duration_minutes || 90,
        viewer_count: stream.viewer_count || 0
      })));

      // Fetch recordings
      const { data: recordingsData, error: recordingsError } = await supabase
        .from('class_recordings')
        .select('*')
        .order('created_at', { ascending: false });

      if (recordingsError) throw recordingsError;
      setRecordings(recordingsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch video data');
    } finally {
      setLoading(false);
    }
  };

  const handleStreamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const streamData = {
        ...streamForm,
        start_time: new Date(streamForm.start_time).toISOString(),
        end_time: streamForm.start_time ? 
          new Date(new Date(streamForm.start_time).getTime() + streamForm.duration_minutes * 60000).toISOString() : 
          null,
        created_by: user.id
      };

      if (editingStream) {
        const { error } = await supabase
          .from('live_streams')
          .update(streamData)
          .eq('id', editingStream.id);

        if (error) throw error;
        toast.success('Live stream updated successfully!');
      } else {
        const { error } = await supabase
          .from('live_streams')
          .insert([streamData]);

        if (error) throw error;
        toast.success('Live stream created successfully!');
      }

      resetStreamForm();
      fetchData();
    } catch (error) {
      console.error('Error saving live stream:', error);
      toast.error('Failed to save live stream');
    }
  };

  const handleRecordingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      let recordingData: any = {
        title: recordingForm.title,
        description: recordingForm.description,
        thumbnail_url: recordingForm.thumbnail_url,
        is_public: recordingForm.is_public,
        created_by: user.id
      };

      if (recordingForm.upload_type === 'youtube') {
        recordingData.youtube_url = recordingForm.youtube_url;
      } else if (recordingForm.upload_type === 'aws') {
        // For AWS uploads, we'd need to implement S3 upload logic here
        if (uploadFile) {
          // This would typically involve:
          // 1. Getting a signed URL for S3 upload
          // 2. Uploading the file to S3
          // 3. Getting the CloudFront URL
          toast.info('AWS S3 upload functionality would be implemented here');
          return;
        } else {
          recordingData.aws_url = recordingForm.aws_url;
        }
      }

      if (editingRecording) {
        const { error } = await supabase
          .from('class_recordings')
          .update(recordingData)
          .eq('id', editingRecording.id);

        if (error) throw error;
        toast.success('Recording updated successfully!');
      } else {
        const { error } = await supabase
          .from('class_recordings')
          .insert([recordingData]);

        if (error) throw error;
        toast.success('Recording saved successfully!');
      }

      resetRecordingForm();
      fetchData();
    } catch (error) {
      console.error('Error saving recording:', error);
      toast.error('Failed to save recording');
    }
  };

  const handleDeleteStream = async (id: string) => {
    if (!confirm('Are you sure you want to delete this live stream?')) return;

    try {
      const { error } = await supabase
        .from('live_streams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Live stream deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting stream:', error);
      toast.error('Failed to delete live stream');
    }
  };

  const handleDeleteRecording = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return;

    try {
      const { error } = await supabase
        .from('class_recordings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Recording deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
    }
  };

  const resetStreamForm = () => {
    setStreamForm({
      title: '',
      description: '',
      embed_url: '',
      start_time: '',
      duration_minutes: 90,
      is_free: false,
      is_home_featured: false,
      platform: 'youtube',
      stream_server_url: '',
      stream_key: ''
    });
    setEditingStream(null);
  };

  const resetRecordingForm = () => {
    setRecordingForm({
      title: '',
      description: '',
      youtube_url: '',
      aws_url: '',
      thumbnail_url: '',
      is_public: true,
      upload_type: 'youtube'
    });
    setEditingRecording(null);
    setUploadFile(null);
  };

  const editStream = (stream: LiveStream) => {
    setEditingStream(stream);
    setStreamForm({
      title: stream.title,
      description: stream.description || '',
      embed_url: stream.embed_url,
      start_time: new Date(stream.start_time).toISOString().slice(0, 16),
      duration_minutes: stream.duration_minutes,
      is_free: stream.is_free,
      is_home_featured: stream.is_home_featured,
      platform: stream.platform,
      stream_server_url: stream.stream_server_url || '',
      stream_key: stream.stream_key || ''
    });
  };

  const editRecording = (recording: ClassRecording) => {
    setEditingRecording(recording);
    setRecordingForm({
      title: recording.title,
      description: recording.description || '',
      youtube_url: recording.youtube_url || '',
      aws_url: recording.aws_url || '',
      thumbnail_url: recording.thumbnail_url || '',
      is_public: recording.is_public,
      upload_type: recording.youtube_url ? 'youtube' : 'aws'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live': return <Badge variant="destructive"><Radio className="h-3 w-3 mr-1" />LIVE</Badge>;
      case 'scheduled': return <Badge variant="default">Scheduled</Badge>;
      case 'ended': return <Badge variant="secondary">Ended</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Super Admin Video Manager</h1>
        <Badge variant="outline" className="text-red-600">
          <Settings className="h-3 w-3 mr-1" />
          Admin Only
        </Badge>
      </div>

      <Tabs defaultValue="live-streams" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="live-streams">Live Streams</TabsTrigger>
          <TabsTrigger value="recordings">Class Recordings</TabsTrigger>
        </TabsList>

        <TabsContent value="live-streams" className="space-y-6">
          {/* Live Stream Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingStream ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingStream ? 'Edit Live Stream' : 'Create New Live Stream'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStreamSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Stream Title</Label>
                    <Input
                      id="title"
                      value={streamForm.title}
                      onChange={(e) => setStreamForm({ ...streamForm, title: e.target.value })}
                      placeholder="e.g., Advanced GIS Analysis"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select 
                      value={streamForm.platform} 
                      onValueChange={(value: any) => setStreamForm({ ...streamForm, platform: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube Live</SelectItem>
                        <SelectItem value="aws">AWS MediaLive</SelectItem>
                        <SelectItem value="obs">OBS Streaming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="embed_url">
                    {streamForm.platform === 'youtube' ? 'YouTube Embed URL' : 'Stream URL'}
                  </Label>
                  <Input
                    id="embed_url"
                    value={streamForm.embed_url}
                    onChange={(e) => setStreamForm({ ...streamForm, embed_url: e.target.value })}
                    placeholder={streamForm.platform === 'youtube' 
                      ? "https://www.youtube.com/embed/VIDEO_ID?autoplay=1&modestbranding=1"
                      : "Stream URL or embed code"
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={streamForm.start_time}
                      onChange={(e) => setStreamForm({ ...streamForm, start_time: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={streamForm.duration_minutes}
                      onChange={(e) => setStreamForm({ ...streamForm, duration_minutes: parseInt(e.target.value) })}
                      min="30"
                      max="300"
                      required
                    />
                  </div>
                </div>

                {(streamForm.platform === 'obs' || streamForm.platform === 'aws') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stream_server_url">Stream Server URL</Label>
                      <Input
                        id="stream_server_url"
                        value={streamForm.stream_server_url}
                        onChange={(e) => setStreamForm({ ...streamForm, stream_server_url: e.target.value })}
                        placeholder="rtmp://a.rtmp.youtube.com/live2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stream_key">Stream Key</Label>
                      <Input
                        id="stream_key"
                        value={streamForm.stream_key}
                        onChange={(e) => setStreamForm({ ...streamForm, stream_key: e.target.value })}
                        placeholder="Your stream key"
                        type="password"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={streamForm.description}
                    onChange={(e) => setStreamForm({ ...streamForm, description: e.target.value })}
                    placeholder="Describe what will be covered in this live stream..."
                    rows={3}
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_free"
                      checked={streamForm.is_free}
                      onCheckedChange={(checked) => setStreamForm({ ...streamForm, is_free: !!checked })}
                    />
                    <Label htmlFor="is_free" className="flex items-center gap-2">
                      {streamForm.is_free ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      Free for all users
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_home_featured"
                      checked={streamForm.is_home_featured}
                      onCheckedChange={(checked) => setStreamForm({ ...streamForm, is_home_featured: !!checked })}
                    />
                    <Label htmlFor="is_home_featured" className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Display on Home Page
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingStream ? 'Update Stream' : 'Create Stream'}
                  </Button>
                  {editingStream && (
                    <Button type="button" variant="outline" onClick={resetStreamForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Live Streams List */}
          <Card>
            <CardHeader>
              <CardTitle>Live Streams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveStreams.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No live streams created yet. Create your first one above!
                  </p>
                ) : (
                  liveStreams.map((stream) => (
                    <div key={stream.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{stream.title}</h3>
                            {getStatusBadge(stream.status)}
                            <Badge variant="outline">
                              <Youtube className="h-3 w-3 mr-1" />
                              {stream.platform}
                            </Badge>
                            {stream.is_free && (
                              <Badge variant="outline" className="text-green-600">
                                <Unlock className="h-3 w-3 mr-1" />
                                Free
                              </Badge>
                            )}
                            {stream.is_home_featured && (
                              <Badge variant="outline" className="text-blue-600">
                                <Home className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          
                          {stream.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {stream.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Play className="h-4 w-4" />
                              {formatDateTime(stream.start_time)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {stream.viewer_count} viewers
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editStream(stream)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStream(stream.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recordings" className="space-y-6">
          {/* Recording Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingRecording ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingRecording ? 'Edit Recording' : 'Add New Recording'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecordingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rec_title">Recording Title</Label>
                    <Input
                      id="rec_title"
                      value={recordingForm.title}
                      onChange={(e) => setRecordingForm({ ...recordingForm, title: e.target.value })}
                      placeholder="e.g., GIS Analysis Session Recording"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="upload_type">Upload Type</Label>
                    <Select 
                      value={recordingForm.upload_type} 
                      onValueChange={(value: any) => setRecordingForm({ ...recordingForm, upload_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube Recording</SelectItem>
                        <SelectItem value="aws">AWS S3 Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {recordingForm.upload_type === 'youtube' ? (
                  <div className="space-y-2">
                    <Label htmlFor="youtube_url">YouTube Recording URL</Label>
                    <Input
                      id="youtube_url"
                      value={recordingForm.youtube_url}
                      onChange={(e) => setRecordingForm({ ...recordingForm, youtube_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                      required={recordingForm.upload_type === 'youtube'}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file_upload">Upload Video File (MP4, max 2GB)</Label>
                      <Input
                        id="file_upload"
                        type="file"
                        accept="video/mp4"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="aws_url">Or AWS/CloudFront URL</Label>
                      <Input
                        id="aws_url"
                        value={recordingForm.aws_url}
                        onChange={(e) => setRecordingForm({ ...recordingForm, aws_url: e.target.value })}
                        placeholder="https://d123456789.cloudfront.net/recording.mp4"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                    <Input
                      id="thumbnail_url"
                      value={recordingForm.thumbnail_url}
                      onChange={(e) => setRecordingForm({ ...recordingForm, thumbnail_url: e.target.value })}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="is_public"
                      checked={recordingForm.is_public}
                      onCheckedChange={(checked) => setRecordingForm({ ...recordingForm, is_public: !!checked })}
                    />
                    <Label htmlFor="is_public" className="flex items-center gap-2">
                      {recordingForm.is_public ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      Public Access
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rec_description">Description</Label>
                  <Textarea
                    id="rec_description"
                    value={recordingForm.description}
                    onChange={(e) => setRecordingForm({ ...recordingForm, description: e.target.value })}
                    placeholder="Describe the content of this recording..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingRecording ? 'Update Recording' : 'Save Recording'}
                  </Button>
                  {editingRecording && (
                    <Button type="button" variant="outline" onClick={resetRecordingForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Recordings List */}
          <Card>
            <CardHeader>
              <CardTitle>Class Recordings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recordings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No recordings uploaded yet. Add your first one above!
                  </p>
                ) : (
                  recordings.map((recording) => (
                    <div key={recording.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{recording.title}</h3>
                            <Badge variant="outline">
                              <Video className="h-3 w-3 mr-1" />
                              Recording
                            </Badge>
                            {recording.youtube_url && (
                              <Badge variant="outline" className="text-red-600">
                                <Youtube className="h-3 w-3 mr-1" />
                                YouTube
                              </Badge>
                            )}
                            {recording.aws_url && (
                              <Badge variant="outline" className="text-blue-600">
                                <Upload className="h-3 w-3 mr-1" />
                                AWS
                              </Badge>
                            )}
                            {recording.is_public && (
                              <Badge variant="outline" className="text-green-600">
                                <Unlock className="h-3 w-3 mr-1" />
                                Public
                              </Badge>
                            )}
                          </div>
                          
                          {recording.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {recording.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {recording.view_count} views
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              {recording.download_count} downloads
                            </div>
                            <div>
                              Created: {formatDateTime(recording.created_at)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editRecording(recording)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRecording(recording.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminVideoManager;