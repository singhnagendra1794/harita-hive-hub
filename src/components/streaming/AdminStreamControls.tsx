import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Play, 
  Square, 
  Settings, 
  Calendar,
  Bot,
  AlertTriangle,
  Monitor
} from 'lucide-react';

interface LiveClass {
  id: string;
  title: string;
  instructor?: string;
  status: 'live' | 'ended' | 'scheduled' | 'preparing';
  viewer_count: number;
  is_ai_generated: boolean;
  start_time: string;
  hls_manifest_url?: string;
}

interface StreamConfig {
  id: string;
  rtmp_endpoint: string;
  hls_playback_url: string;
  s3_bucket_name: string;
  is_active: boolean;
}

const AdminStreamControls = () => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [streamConfig, setStreamConfig] = useState<StreamConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [geovaSchedule, setGeovaSchedule] = useState({
    title: '',
    description: '',
    time: '05:00:00'
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLiveClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .in('status', ['live', 'scheduled'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match our interface
      const mappedClasses: LiveClass[] = (data || []).map(cls => ({
        id: cls.id,
        title: cls.title,
        instructor: 'Expert Instructor', // Default since field doesn't exist
        status: cls.status as 'live' | 'ended' | 'scheduled' | 'preparing',
        viewer_count: cls.viewer_count || 0,
        is_ai_generated: cls.is_ai_generated || false,
        start_time: cls.start_time || new Date().toISOString(),
        hls_manifest_url: cls.hls_manifest_url
      }));
      
      setLiveClasses(mappedClasses);
    } catch (error) {
      console.error('Error fetching live classes:', error);
    }
  };

  const fetchStreamConfig = async () => {
    try {
      const { data } = await supabase.functions.invoke('aws-stream-manager', {
        body: { action: 'get_stream_config' }
      });
      
      if (data && !data.error) {
        setStreamConfig(data);
      }
    } catch (error) {
      console.error('Error fetching stream config:', error);
    }
  };

  const startStream = async (classId: string) => {
    try {
      setLoading(true);
      const { data } = await supabase.functions.invoke('aws-stream-manager', {
        body: { 
          action: 'start_stream',
          class_id: classId
        }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Stream Started",
        description: `Stream started successfully. RTMP: ${data.rtmp_endpoint}`,
      });

      fetchLiveClasses();
    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Error",
        description: "Failed to start stream",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stopStream = async (classId: string) => {
    try {
      setLoading(true);
      const { data } = await supabase.functions.invoke('aws-stream-manager', {
        body: { 
          action: 'stop_stream',
          class_id: classId,
          recording_s3_key: `recordings/${classId}-${Date.now()}.mp4`
        }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Stream Stopped",
        description: "Stream ended and recording saved",
      });

      fetchLiveClasses();
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast({
        title: "Error",
        description: "Failed to stop stream",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGeovaClass = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.functions.invoke('geova-automation', {
        body: { action: 'create_daily_class' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "GEOVA Class Created",
        description: "AI class scheduled successfully",
      });

      fetchLiveClasses();
    } catch (error) {
      console.error('Error creating GEOVA class:', error);
      toast({
        title: "Error",
        description: "Failed to create GEOVA class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGeovaSchedule = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.functions.invoke('geova-automation', {
        body: { 
          action: 'update_schedule',
          schedule_data: {
            title: geovaSchedule.title,
            description: geovaSchedule.description,
            time: geovaSchedule.time,
            curriculum: {
              topics: ['GIS Fundamentals', 'Remote Sensing', 'Spatial Analysis'],
              duration_minutes: 120,
              interaction_enabled: true
            }
          }
        }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Schedule Updated",
        description: "GEOVA schedule updated successfully",
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLiveClasses();
      fetchStreamConfig();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('live-classes-admin')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'live_classes' },
          () => fetchLiveClasses()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* AWS Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AWS Streaming Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {streamConfig ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default">Active</Badge>
                <span className="text-sm text-muted-foreground">
                  S3 Bucket: {streamConfig.s3_bucket_name}
                </span>
              </div>
              <div className="text-sm">
                <p><strong>RTMP:</strong> {streamConfig.rtmp_endpoint}</p>
                <p><strong>HLS:</strong> {streamConfig.hls_playback_url}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              <span>No AWS streaming configuration found. Please set up AWS MediaLive.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Streams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Streams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liveClasses.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {cls.is_ai_generated && (
                    <Bot className="h-4 w-4 text-blue-500" />
                  )}
                  <div>
                    <h3 className="font-medium">{cls.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cls.instructor} • {cls.viewer_count || 0} viewers
                    </p>
                  </div>
                  <Badge variant={
                    cls.status === 'live' ? 'default' :
                    cls.status === 'scheduled' ? 'secondary' : 'outline'
                  }>
                    {cls.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {cls.status === 'scheduled' && (
                    <Button
                      onClick={() => startStream(cls.id)}
                      disabled={loading}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}
                  {cls.status === 'live' && (
                    <Button
                      onClick={() => stopStream(cls.id)}
                      disabled={loading}
                      variant="destructive"
                      size="sm"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {liveClasses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No active streams found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GEOVA Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            GEOVA AI Classes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="geova-title">Class Title</Label>
              <Input
                id="geova-title"
                value={geovaSchedule.title}
                onChange={(e) => setGeovaSchedule({...geovaSchedule, title: e.target.value})}
                placeholder="Daily GEOVA AI Class"
              />
              
              <Label htmlFor="geova-time">Scheduled Time (IST)</Label>
              <Input
                id="geova-time"
                type="time"
                value={geovaSchedule.time}
                onChange={(e) => setGeovaSchedule({...geovaSchedule, time: e.target.value})}
              />
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="geova-description">Description</Label>
              <Textarea
                id="geova-description"
                value={geovaSchedule.description}
                onChange={(e) => setGeovaSchedule({...geovaSchedule, description: e.target.value})}
                placeholder="AI-powered geospatial technology learning session"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={createGeovaClass}
              disabled={loading}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Create Today's Class
            </Button>
            <Button
              onClick={updateGeovaSchedule}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Update Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStreamControls;