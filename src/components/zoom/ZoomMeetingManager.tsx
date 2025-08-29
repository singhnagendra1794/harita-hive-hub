import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Video, Settings, Plus, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

interface ZoomMeeting {
  id: string;
  zoom_meeting_id: string;
  topic: string;
  description: string;
  start_time: string;
  duration: number;
  join_url: string;
  start_url: string;
  password: string;
  status: string;
  access_tier: string;
  recording_enabled: boolean;
  waiting_room: boolean;
  created_at: string;
}

interface CreateMeetingData {
  topic: string;
  description: string;
  start_time: string;
  duration: number;
  access_tier: string;
  recording_enabled: boolean;
  waiting_room: boolean;
}

export function ZoomMeetingManager() {
  const [meetings, setMeetings] = useState<ZoomMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateMeetingData>({
    topic: '',
    description: '',
    start_time: '',
    duration: 60,
    access_tier: 'free',
    recording_enabled: true,
    waiting_room: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to view meetings",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('zoom-integration', {
        body: { action: 'get_meetings' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        setMeetings(response.data.meetings || []);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch meetings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async () => {
    if (!formData.topic || !formData.start_time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const response = await supabase.functions.invoke('zoom-integration', {
        body: { 
          action: 'create_meeting',
          ...formData,
          start_time: new Date(formData.start_time).toISOString()
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        toast({
          title: "Meeting created",
          description: `Successfully created meeting: ${formData.topic}`,
        });
        setIsDialogOpen(false);
        setFormData({
          topic: '',
          description: '',
          start_time: '',
          duration: 60,
          access_tier: 'free',
          recording_enabled: true,
          waiting_room: true,
        });
        fetchMeetings();
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create meeting",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const joinMeeting = async (meetingId: string) => {
    try {
      const response = await supabase.functions.invoke('zoom-integration', {
        body: { 
          action: 'join_meeting',
          meeting_id: meetingId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        window.open(response.data.join_url, '_blank');
        toast({
          title: "Joining meeting",
          description: "Opening Zoom meeting in new window",
        });
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join meeting",
        variant: "destructive"
      });
    }
  };

  const syncMeetings = async () => {
    setSyncing(true);
    try {
      const response = await supabase.functions.invoke('zoom-integration', {
        body: { action: 'sync_meetings' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        toast({
          title: "Meetings synced",
          description: response.data.message,
        });
        fetchMeetings();
      }
    } catch (error) {
      console.error('Error syncing meetings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sync meetings",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  const isLive = (meeting: ZoomMeeting) => {
    const now = new Date();
    const start = new Date(meeting.start_time);
    const end = new Date(start.getTime() + meeting.duration * 60000);
    return now >= start && now <= end && meeting.status !== 'ended';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Zoom Meetings</h2>
          <p className="text-muted-foreground">Manage and join live classes via Zoom</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncMeetings} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from Zoom'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Zoom Meeting</DialogTitle>
                <DialogDescription>
                  Schedule a new Zoom meeting for your class
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Meeting Topic *</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="Enter meeting topic"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Meeting description (optional)"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start Time *</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      min="15"
                      max="480"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="access_tier">Access Level</Label>
                  <Select value={formData.access_tier} onValueChange={(value) => setFormData({ ...formData, access_tier: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free Access</SelectItem>
                      <SelectItem value="premium">Premium Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="recording">Enable Recording</Label>
                  <Switch
                    id="recording"
                    checked={formData.recording_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, recording_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="waiting_room">Waiting Room</Label>
                  <Switch
                    id="waiting_room"
                    checked={formData.waiting_room}
                    onCheckedChange={(checked) => setFormData({ ...formData, waiting_room: checked })}
                  />
                </div>

                <Button 
                  onClick={createMeeting} 
                  disabled={creating}
                  className="w-full"
                >
                  {creating ? 'Creating...' : 'Create Meeting'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No meetings scheduled</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first Zoom meeting to get started with live classes
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Meeting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{meeting.topic}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(meeting.status)} text-white`}
                    >
                      {isLive(meeting) ? 'Live' : meeting.status}
                    </Badge>
                    {meeting.access_tier === 'premium' && (
                      <Badge variant="outline">Premium</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isLive(meeting) && (
                      <Button onClick={() => joinMeeting(meeting.id)}>
                        <Video className="h-4 w-4 mr-2" />
                        Join Live
                      </Button>
                    )}
                    {isUpcoming(meeting.start_time) && !isLive(meeting) && (
                      <Button variant="outline" onClick={() => joinMeeting(meeting.id)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </div>
                {meeting.description && (
                  <CardDescription>{meeting.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(parseISO(meeting.start_time), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{format(parseISO(meeting.start_time), 'HH:mm')} ({meeting.duration}m)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>ID: {meeting.zoom_meeting_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Password: {meeting.password}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  {meeting.recording_enabled && <Badge variant="outline">Recording</Badge>}
                  {meeting.waiting_room && <Badge variant="outline">Waiting Room</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}