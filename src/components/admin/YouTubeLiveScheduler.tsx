import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Play, Square, Settings, Trash2, ExternalLink, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface YouTubeLiveSchedule {
  id: string;
  title: string;
  description: string;
  scheduled_time: string;
  status: string;
  youtube_broadcast_id: string;
  youtube_stream_id: string;
  stream_url: string;
  stream_key: string;
  thumbnail_url: string;
  actual_start_time?: string;
  actual_end_time?: string;
  created_at: string;
  created_by?: string;
  obs_configured?: boolean;
  obs_auto_start?: boolean;
  obs_scene_name?: string;
  privacy_status?: string;
  updated_at?: string;
}

const YouTubeLiveScheduler = () => {
  const [schedules, setSchedules] = useState<YouTubeLiveSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isOAuthConnected, setIsOAuthConnected] = useState(false);
  const [connectingOAuth, setConnectingOAuth] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '',
    thumbnailFile: null as File | null,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules();
    checkOAuthStatus();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_live_schedule')
        .select('*')
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setSchedules((data as any[])?.map(item => ({
        ...item,
        scheduled_time: item.scheduled_time || item.created_at
      })) || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load YouTube Live schedules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkOAuthStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_oauth_tokens')
        .select('access_token, expires_at')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.access_token) {
        // Check if token is still valid
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        
        if (expiresAt > now) {
          setIsOAuthConnected(true);
        } else {
          // Token expired, try to refresh
          await refreshYouTubeToken();
        }
      }
    } catch (error) {
      console.error('Error checking OAuth status:', error);
      setIsOAuthConnected(false);
    }
  };

  const connectYouTubeAccount = async () => {
    setConnectingOAuth(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-oauth', {
        body: { action: 'get_auth_url' }
      });

      if (error) throw error;

      // Open OAuth URL in new window
      const authWindow = window.open(data.data.authUrl, '_blank', 'width=500,height=600');
      
      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          checkOAuthStatus();
          setConnectingOAuth(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Error connecting YouTube account:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect YouTube account',
        variant: 'destructive',
      });
      setConnectingOAuth(false);
    }
  };

  const refreshYouTubeToken = async () => {
    try {
      const { error } = await supabase.functions.invoke('youtube-oauth', {
        body: {
          action: 'refresh_token',
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;
      setIsOAuthConnected(true);
    } catch (error) {
      console.error('Error refreshing token:', error);
      setIsOAuthConnected(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!selectedDate || !formData.time || !formData.title) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      // Combine date and time
      const [hours, minutes] = formData.time.split(':');
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Upload thumbnail if provided
      let thumbnailUrl = '';
      if (formData.thumbnailFile) {
        const fileExt = formData.thumbnailFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('youtube-thumbnails')
          .upload(fileName, formData.thumbnailFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('youtube-thumbnails')
          .getPublicUrl(fileName);
        
        thumbnailUrl = publicUrl;
      }

      // Get access token
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data: tokenData, error: tokenError } = await supabase
        .from('youtube_oauth_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .single();

      if (tokenError || !tokenData?.access_token) {
        throw new Error('YouTube account not connected');
      }

      // Call YouTube Live Manager edge function
      const { data, error } = await supabase.functions.invoke('youtube-live-manager', {
        body: {
          action: 'create_live_stream',
          title: formData.title,
          description: formData.description,
          scheduledTime: scheduledDateTime.toISOString(),
          thumbnailUrl,
          userId,
          accessToken: tokenData.access_token,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'YouTube Live stream scheduled successfully',
      });

      // Reset form
      setFormData({ title: '', description: '', time: '', thumbnailFile: null });
      setSelectedDate(undefined);
      setShowForm(false);
      
      // Refresh schedules
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule YouTube Live stream',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleStartStream = async (schedule: YouTubeLiveSchedule) => {
    try {
      const { error } = await supabase.functions.invoke('youtube-live-manager', {
        body: {
          action: 'start_live_stream',
          scheduleId: schedule.id,
          userId: (await supabase.auth.getUser()).data.user?.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Live stream started',
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: 'Error',
        description: 'Failed to start live stream',
        variant: 'destructive',
      });
    }
  };

  const handleEndStream = async (schedule: YouTubeLiveSchedule) => {
    try {
      const { error } = await supabase.functions.invoke('youtube-live-manager', {
        body: {
          action: 'end_live_stream',
          scheduleId: schedule.id,
          userId: (await supabase.auth.getUser()).data.user?.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Live stream ended',
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error ending stream:', error);
      toast({
        title: 'Error',
        description: 'Failed to end live stream',
        variant: 'destructive',
      });
    }
  };

  const handleConfigureOBS = async (schedule: YouTubeLiveSchedule) => {
    try {
      const { error } = await supabase.functions.invoke('obs-websocket-manager', {
        body: {
          action: 'configure_obs',
          scheduleId: schedule.id,
          streamUrl: schedule.stream_url,
          streamKey: schedule.stream_key,
          sceneTemplate: 'HaritaHive Live',
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'OBS configured successfully',
      });
    } catch (error) {
      console.error('Error configuring OBS:', error);
      toast({
        title: 'Warning',
        description: 'OBS configuration failed - please configure manually',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'live': return 'bg-red-500/20 text-red-400';
      case 'ended': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create Schedule Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            YouTube Live Scheduler
            <Button 
              onClick={() => setShowForm(!showForm)}
              disabled={!isOAuthConnected}
            >
              {showForm ? 'Cancel' : 'Schedule New Live'}
            </Button>
          </CardTitle>
        </CardHeader>
        {!isOAuthConnected && (
          <CardContent className="bg-muted/50 border rounded-lg mb-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Connect your YouTube account to schedule live streams
              </p>
              <Button 
                onClick={connectYouTubeAccount} 
                disabled={connectingOAuth}
                variant="default"
              >
                {connectingOAuth ? 'Connecting...' : 'Connect YouTube Account'}
              </Button>
            </div>
          </CardContent>
        )}
        
        {showForm && isOAuthConnected && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter live stream title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time (IST) *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter live stream description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, thumbnailFile: e.target.files?.[0] || null })}
                />
              </div>
            </div>

            <Button 
              onClick={handleCreateSchedule} 
              disabled={creating || !isOAuthConnected}
              className="w-full"
            >
              {creating ? 'Creating...' : 'Schedule Live Stream'}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Scheduled Streams */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Live Streams</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No live streams scheduled</p>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{schedule.title}</h3>
                        <Badge className={getStatusColor(schedule.status)}>
                          {schedule.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {schedule.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDateTime(schedule.scheduled_time)}
                        </span>
                        {schedule.actual_start_time && (
                          <span>Started: {formatDateTime(schedule.actual_start_time)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {schedule.status === 'scheduled' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfigureOBS(schedule)}
                            variant="outline"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStartStream(schedule)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {schedule.status === 'live' && (
                        <Button
                          size="sm"
                          onClick={() => handleEndStream(schedule)}
                          variant="destructive"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${schedule.youtube_broadcast_id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeLiveScheduler;