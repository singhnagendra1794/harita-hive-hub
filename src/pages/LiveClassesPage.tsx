import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import HLSPlayer from '@/components/HLSPlayer';
import { Play, Calendar, User, Clock, Plus } from 'lucide-react';

interface LiveSession {
  id: string;
  title: string;
  description?: string;
  instructor_name?: string;
  is_live: boolean;
  hls_url?: string;
  recorded_url?: string;
  viewer_count: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

const LiveClassesPage = () => {
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [pastSessions, setPastSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    instructor_name: ''
  });
  const { user } = useAuth();

  const fetchLiveSessions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-live-sessions');
      if (error) throw error;
      setLiveSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching live sessions:', error);
      toast.error('Failed to load live sessions');
    }
  };

  const fetchPastSessions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-past-sessions');
      if (error) throw error;
      setPastSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching past sessions:', error);
      toast.error('Failed to load past sessions');
    }
  };

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      await Promise.all([fetchLiveSessions(), fetchPastSessions()]);
      setLoading(false);
    };
    
    loadSessions();

    // Set up real-time updates for live sessions
    const interval = setInterval(fetchLiveSessions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCreateSession = async () => {
    if (!user) {
      toast.error('Please sign in to start a session');
      return;
    }

    if (!createForm.title.trim()) {
      toast.error('Please enter a session title');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('start-session', {
        body: createForm
      });

      if (error) throw error;

      toast.success('Live session started!');
      setIsCreateDialogOpen(false);
      setCreateForm({ title: '', description: '', instructor_name: '' });
      fetchLiveSessions();

      // Show OBS settings
      toast.success(
        `OBS Settings:\nServer: ${data.rtmp_url}\nStream Key: Use the generated key`,
        { duration: 10000 }
      );
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to start session');
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
    return `${diff} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Live Classes</h1>
            <p className="text-muted-foreground">
              Join live streaming sessions and watch recorded classes
            </p>
          </div>
          
          {user && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Start Live Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Live Session</DialogTitle>
                  <DialogDescription>
                    Create a new live streaming session. You'll receive OBS settings after creation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Session title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Input
                    placeholder="Your name (instructor)"
                    value={createForm.instructor_name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, instructor_name: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Session description (optional)"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Button onClick={handleCreateSession} className="w-full">
                    Start Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Live Now ({liveSessions.length})
            </TabsTrigger>
            <TabsTrigger value="recorded">
              Past Classes ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            {liveSessions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Live Sessions</h3>
                  <p className="text-muted-foreground">
                    There are no live sessions at the moment. Check back later!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {liveSessions.map((session) => (
                  <Card key={session.id} className="overflow-hidden">
                    <div className="aspect-video bg-black relative">
                      {session.hls_url && (
                        <HLSPlayer
                          src={session.hls_url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                      <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                        🔴 LIVE
                      </Badge>
                      <Badge variant="secondary" className="absolute top-2 right-2">
                        {session.viewer_count} viewers
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{session.title}</CardTitle>
                      <CardDescription className="space-y-2">
                        {session.description && (
                          <p className="line-clamp-2">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {session.instructor_name || 'Anonymous'}
                          </div>
                          {session.started_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(session.started_at)}
                            </div>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recorded" className="space-y-6">
            {pastSessions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Recorded Sessions</h3>
                  <p className="text-muted-foreground">
                    Recorded sessions will appear here after live sessions end.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastSessions.map((session) => (
                  <Card key={session.id} className="overflow-hidden">
                    <div className="aspect-video bg-black">
                      {session.recorded_url && (
                        <HLSPlayer
                          src={session.recorded_url}
                          className="w-full h-full object-cover"
                          autoPlay={false}
                          controls
                        />
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{session.title}</CardTitle>
                      <CardDescription className="space-y-2">
                        {session.description && (
                          <p className="line-clamp-2">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {session.instructor_name || 'Anonymous'}
                          </div>
                          {session.ended_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(session.ended_at).toLocaleDateString()}
                            </div>
                          )}
                          {session.started_at && session.ended_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(session.started_at, session.ended_at)}
                            </div>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full gap-2">
                        <Play className="h-4 w-4" />
                        Watch Recording
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LiveClassesPage;