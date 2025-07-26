import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Download, Clock, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Recording {
  id: string;
  title: string;
  description: string;
  speaker: string;
  start_time: string;
  end_time: string;
  recording_status: string;
  cloudfront_url: string;
  duration_seconds: number;
  file_size_bytes: number;
  created_at: string;
}

const StreamRecordings: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadRecordings();
    }
  }, [user]);

  const loadRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('live_recordings')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
    } catch (error) {
      console.error('Failed to load recordings:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load recordings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown';
    const gb = bytes / (1024 * 1024 * 1024);
    const mb = bytes / (1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
  };

  const handleWatch = (recording: Recording) => {
    if (recording.recording_status !== 'ready' || !recording.cloudfront_url) {
      toast({
        title: "Recording Not Ready",
        description: "This recording is still being processed or has failed.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to watch page with recording URL
    window.open(`/watch-recording?url=${encodeURIComponent(recording.cloudfront_url)}&title=${encodeURIComponent(recording.title)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Recordings Yet</h3>
            <p>Stream recordings will appear here after live sessions end.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recordings.map((recording) => (
        <Card key={recording.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{recording.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {recording.description}
                </p>
              </div>
              <Badge 
                variant={
                  recording.recording_status === 'ready' ? 'default' :
                  recording.recording_status === 'processing' ? 'secondary' : 'destructive'
                }
              >
                {recording.recording_status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{recording.speaker}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(recording.start_time).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDuration(recording.duration_seconds)}</span>
              </div>
              
              <div className="text-muted-foreground">
                {formatFileSize(recording.file_size_bytes)}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleWatch(recording)}
                disabled={recording.recording_status !== 'ready'}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Watch Recording
              </Button>
              
              {recording.recording_status === 'ready' && recording.cloudfront_url && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(recording.cloudfront_url, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Direct Link
                </Button>
              )}
            </div>

            {recording.recording_status === 'processing' && (
              <div className="text-sm text-muted-foreground">
                🔄 Recording is being processed and will be available shortly...
              </div>
            )}
            
            {recording.recording_status === 'failed' && (
              <div className="text-sm text-destructive">
                ⚠️ Recording processing failed. Please contact support.
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StreamRecordings;