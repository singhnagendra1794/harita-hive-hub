import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Youtube, 
  Plus, 
  Play, 
  Square, 
  Trash2, 
  RefreshCw, 
  Calendar,
  Clock,
  Users,
  Link
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface YouTubeLiveStream {
  id: string;
  title: string;
  description?: string;
  scheduled_start_time: string;
  status: 'scheduled' | 'live' | 'ended';
  youtube_broadcast_id?: string;
  youtube_stream_key?: string;
  rtmp_url?: string;
  ingestion_url?: string;
  viewer_count?: number;
  actual_start_time?: string;
  actual_end_time?: string;
  recording_available?: boolean;
  thumbnail_url?: string;
}

export const YouTubeLiveManager = () => {
  const [streams, setStreams] = useState<YouTubeLiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newStream, setNewStream] = useState({
    title: '',
    description: '',
    scheduled_start_time: ''
  });

  useEffect(() => {
    fetchStreams();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_live_schedule')
        .select('*')
        .order('scheduled_start_time', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Map the data to ensure proper types
      const mappedStreams: YouTubeLiveStream[] = (data || []).map(stream => ({
        id: stream.id,
        title: stream.title,
        description: stream.description,
        scheduled_start_time: stream.scheduled_start_time,
        status: stream.status as 'scheduled' | 'live' | 'ended',
        youtube_broadcast_id: stream.youtube_broadcast_id,
        youtube_stream_key: stream.youtube_stream_id, // Note: using youtube_stream_id from DB
        rtmp_url: 'rtmp://a.rtmp.youtube.com/live2',
        ingestion_url: 'rtmp://a.rtmp.youtube.com/live2',
        viewer_count: 0, // This would be fetched from YouTube API
        actual_start_time: stream.actual_start_time,
        actual_end_time: stream.actual_end_time,
        recording_available: stream.recording_available,
        thumbnail_url: stream.thumbnail_url
      }));
      
      setStreams(mappedStreams);
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast.error('Failed to fetch YouTube streams');
    } finally {
      setLoading(false);
    }
  };

  const createLiveStream = async () => {
    if (!newStream.title || !newStream.scheduled_start_time) {
      toast.error('Title and scheduled time are required');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-live-manager', {
        body: {
          action: 'create_live_stream',
          title: newStream.title,
          description: newStream.description,
          scheduled_start_time: newStream.scheduled_start_time
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('YouTube Live stream created successfully');
      setNewStream({ title: '', description: '', scheduled_start_time: '' });
      fetchStreams();
    } catch (error) {
      console.error('Error creating stream:', error);
      toast.error('Failed to create YouTube Live stream');
    } finally {
      setCreating(false);
    }
  };

  const startLiveStream = async (streamId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('youtube-live-manager', {
        body: {
          action: 'start_live_stream',
          schedule_id: streamId
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('YouTube Live stream started');
      fetchStreams();
    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Failed to start YouTube Live stream');
    }
  };

  const endLiveStream = async (streamId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('youtube-live-manager', {
        body: {
          action: 'end_live_stream',
          schedule_id: streamId
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('YouTube Live stream ended');
      fetchStreams();
    } catch (error) {
      console.error('Error ending stream:', error);
      toast.error('Failed to end YouTube Live stream');
    }
  };

  const deleteStream = async (streamId: string) => {
    if (!confirm('Are you sure you want to delete this stream?')) return;

    try {
      const { error } = await supabase
        .from('youtube_live_schedule')
        .delete()
        .eq('id', streamId);

      if (error) throw error;

      toast.success('Stream deleted successfully');
      fetchStreams();
    } catch (error) {
      console.error('Error deleting stream:', error);
      toast.error('Failed to delete stream');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'destructive';
      case 'scheduled': return 'secondary';
      case 'ended': return 'outline';
      default: return 'outline';
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy - hh:mm a');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Stream */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            Create YouTube Live Stream
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newStream.title}
                onChange={(e) => setNewStream(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Live GEOVA Session - Day 1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Scheduled Start Time</label>
              <Input
                type="datetime-local"
                value={newStream.scheduled_start_time}
                onChange={(e) => setNewStream(prev => ({ ...prev, scheduled_start_time: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={newStream.description}
              onChange={(e) => setNewStream(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Interactive AI-powered learning session covering geospatial concepts and tools"
              rows={3}
            />
          </div>
          <Button 
            onClick={createLiveStream} 
            disabled={creating || !newStream.title || !newStream.scheduled_start_time}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {creating ? 'Creating...' : 'Create YouTube Live Stream'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Streams */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>YouTube Live Streams</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchStreams}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {streams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No YouTube Live streams found
            </div>
          ) : (
            <div className="space-y-4">
              {streams.map((stream) => (
                <div key={stream.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{stream.title}</h3>
                        <Badge variant={getStatusColor(stream.status)}>
                          {stream.status.toUpperCase()}
                        </Badge>
                      </div>
                      {stream.description && (
                        <p className="text-sm text-muted-foreground mb-2">{stream.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDateTime(stream.scheduled_start_time)}
                        </div>
                        {stream.viewer_count !== undefined && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {stream.viewer_count} viewers
                          </div>
                        )}
                        {stream.actual_start_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Started: {format(new Date(stream.actual_start_time), 'hh:mm a')}
                          </div>
                        )}
                      </div>
                      {stream.youtube_stream_key && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                          <strong>RTMP URL:</strong> {stream.rtmp_url}<br/>
                          <strong>Stream Key:</strong> {stream.youtube_stream_key}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {stream.status === 'scheduled' && (
                        <Button
                          size="sm"
                          onClick={() => startLiveStream(stream.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Go Live
                        </Button>
                      )}
                      
                      {stream.status === 'live' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => endLiveStream(stream.id)}
                        >
                          <Square className="h-4 w-4 mr-1" />
                          End Stream
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteStream(stream.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {stream.thumbnail_url && (
                    <img 
                      src={stream.thumbnail_url} 
                      alt="Stream thumbnail"
                      className="w-32 h-18 object-cover rounded"
                    />
                  )}
                  
                  {stream.recording_available && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Link className="h-4 w-4" />
                      Recording available
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
