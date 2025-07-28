import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Video, 
  Calendar,
  Users,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface YouTubeSession {
  id: string;
  title: string;
  description: string;
  youtube_embed_url: string;
  session_type: 'live' | 'recording';
  status: 'scheduled' | 'live' | 'ended' | 'archived';
  scheduled_date: string;
  started_at?: string;
  ended_at?: string;
  order_index: number;
  access_tier: 'free' | 'professional' | 'enterprise';
  is_active: boolean;
  created_at: string;
}

const YouTubeSessionManager = () => {
  const [sessions, setSessions] = useState<YouTubeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState<YouTubeSession | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_embed_url: '',
    session_type: 'live' as 'live' | 'recording',
    status: 'scheduled' as 'scheduled' | 'live' | 'ended' | 'archived',
    scheduled_date: '',
    access_tier: 'professional' as 'free' | 'professional' | 'enterprise'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_sessions')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      setSessions((data || []) as YouTubeSession[]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch YouTube sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanYouTubeUrl = (url: string): string => {
    // Extract video ID and create a clean embed URL
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?modestbranding=1&rel=0&controls=1&showinfo=0&iv_load_policy=3&disablekb=1`;
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const cleanedUrl = cleanYouTubeUrl(formData.youtube_embed_url);
      const sessionData = {
        ...formData,
        youtube_embed_url: cleanedUrl,
        order_index: sessions.length
      };

      let result;
      if (editingSession) {
        result = await supabase
          .from('youtube_sessions')
          .update(sessionData)
          .eq('id', editingSession.id);
      } else {
        result = await supabase
          .from('youtube_sessions')
          .insert([sessionData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Session ${editingSession ? 'updated' : 'created'} successfully`
      });

      setShowAddDialog(false);
      setEditingSession(null);
      setFormData({
        title: '',
        description: '',
        youtube_embed_url: '',
        session_type: 'live',
        status: 'scheduled',
        scheduled_date: '',
        access_tier: 'professional'
      });
      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Error",
        description: "Failed to save session",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('youtube_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session deleted successfully"
      });
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (sessionId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('youtube_sessions')
        .update({ is_active: !isActive })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Session ${!isActive ? 'activated' : 'deactivated'} successfully`
      });
      fetchSessions();
    } catch (error) {
      console.error('Error toggling session:', error);
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive"
      });
    }
  };

  const handleMoveToRecording = async (sessionId: string) => {
    try {
      const { error } = await supabase.rpc('move_live_to_recording', { 
        p_session_id: sessionId 
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session moved to recordings successfully"
      });
      fetchSessions();
    } catch (error) {
      console.error('Error moving session:', error);
      toast({
        title: "Error",
        description: "Failed to move session to recordings",
        variant: "destructive"
      });
    }
  };

  const handleReorder = async (sessionId: string, direction: 'up' | 'down') => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const newIndex = direction === 'up' ? session.order_index - 1 : session.order_index + 1;
    
    try {
      const { error } = await supabase.rpc('update_session_order', {
        p_session_id: sessionId,
        p_new_order: newIndex
      });

      if (error) throw error;

      fetchSessions();
    } catch (error) {
      console.error('Error reordering session:', error);
      toast({
        title: "Error",
        description: "Failed to reorder session",
        variant: "destructive"
      });
    }
  };

  const startEdit = (session: YouTubeSession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description,
      youtube_embed_url: session.youtube_embed_url,
      session_type: session.session_type,
      status: session.status,
      scheduled_date: session.scheduled_date ? new Date(session.scheduled_date).toISOString().slice(0, 16) : '',
      access_tier: session.access_tier
    });
    setShowAddDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500 text-white';
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'ended': return 'bg-gray-500 text-white';
      case 'archived': return 'bg-gray-300 text-gray-700';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'live' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>YouTube Live & Recording Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                YouTube Live & Recording Manager
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage YouTube live streams and recordings for professional users
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingSession ? 'Edit' : 'Add'} YouTube Session</DialogTitle>
                  <DialogDescription>
                    Configure a YouTube live stream or recording session
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Session title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="session_type">Type</Label>
                      <Select 
                        value={formData.session_type} 
                        onValueChange={(value: 'live' | 'recording') => 
                          setFormData({...formData, session_type: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="live">Live Stream</SelectItem>
                          <SelectItem value="recording">Recording</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="youtube_embed_url">YouTube URL</Label>
                    <Input
                      id="youtube_embed_url"
                      value={formData.youtube_embed_url}
                      onChange={(e) => setFormData({...formData, youtube_embed_url: e.target.value})}
                      placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste any YouTube URL - it will be automatically converted to a secure embed
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Session description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: any) => setFormData({...formData, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                          <SelectItem value="ended">Ended</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="access_tier">Access Tier</Label>
                      <Select 
                        value={formData.access_tier} 
                        onValueChange={(value: any) => setFormData({...formData, access_tier: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="scheduled_date">Scheduled Date</Label>
                      <Input
                        id="scheduled_date"
                        type="datetime-local"
                        value={formData.scheduled_date}
                        onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      {editingSession ? 'Update' : 'Create'} Session
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No YouTube sessions</h3>
              <p className="text-muted-foreground">Get started by adding your first YouTube session</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className={session.is_active ? '' : 'opacity-50'}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{session.title}</h3>
                          <Badge className={getTypeColor(session.session_type)}>
                            {session.session_type}
                          </Badge>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                          <Badge variant="outline">
                            {session.access_tier}
                          </Badge>
                          {!session.is_active && (
                            <Badge variant="secondary">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </Badge>
                          )}
                        </div>
                        {session.description && (
                          <p className="text-sm text-muted-foreground mb-2">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {session.scheduled_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(session.scheduled_date).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Order: {session.order_index}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(session.id, session.is_active)}
                        >
                          {session.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(session.id, 'up')}
                          disabled={session.order_index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(session.id, 'down')}
                          disabled={session.order_index === sessions.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        {session.session_type === 'live' && session.status === 'live' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMoveToRecording(session.id)}
                          >
                            End Live
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(session)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(session.youtube_embed_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeSessionManager;