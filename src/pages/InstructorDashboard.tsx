import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Youtube, 
  Plus, 
  Calendar,
  Clock,
  ExternalLink
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface YouTubeClass {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  start_time: string | null;
  created_at: string;
  created_by: string;
}

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is super admin
  useEffect(() => {
    if (user && user.email !== 'contact@haritahive.com') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const [classes, setClasses] = useState<YouTubeClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    start_time: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchClasses();
  }, [user, navigate]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('id, title, description, youtube_url, start_time, created_at, created_by')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class title",
        variant: "destructive"
      });
      return;
    }

    if (!formData.youtube_url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive"
      });
      return;
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    if (!youtubeRegex.test(formData.youtube_url)) {
      toast({
        title: "Error",
        description: "Please enter a valid YouTube URL",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          youtube_url: formData.youtube_url.trim(),
          start_time: formData.start_time || new Date().toISOString(),
          created_by: user?.id,
          status: 'scheduled',
          stream_key: 'yt_' + Date.now() // Generate a simple key for YouTube classes
        })
        .select('id, title, description, youtube_url, start_time, created_at, created_by')
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "YouTube class created successfully!"
      });

      setFormData({ title: '', description: '', youtube_url: '', start_time: '' });
      setShowCreateForm(false);
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your YouTube classes and embed videos for students
        </p>
      </div>

      {/* Create New Class Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Create New YouTube Class</h2>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Class
          </Button>
        </div>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                Create YouTube Class
              </CardTitle>
              <CardDescription>
                Add a YouTube video to create a new class for students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Class Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your class title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">YouTube URL</label>
                <Input
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste the YouTube video URL you want to embed for students
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what students will learn in this class"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Scheduled Time (Optional)</label>
                <Input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateClass} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Class'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Classes List */}
      {classes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your YouTube Classes</h2>
          <div className="space-y-4">
            {classes.map((classItem) => {
              const videoId = extractVideoId(classItem.youtube_url);
              return (
                <Card key={classItem.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* YouTube Thumbnail */}
                      {videoId && (
                        <div className="w-48 h-28 flex-shrink-0">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                            alt={classItem.title}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              // Fallback to default thumbnail if maxres doesn't exist
                              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Class Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">{classItem.title}</h3>
                            {classItem.description && (
                              <p className="text-muted-foreground mb-3">{classItem.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Created {formatDate(classItem.created_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {classItem.start_time ? formatTime(classItem.start_time) : 'Not scheduled'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(classItem.youtube_url, '_blank')}
                            >
                              <Youtube className="h-4 w-4 mr-1 text-red-500" />
                              YouTube
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/live-classes`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Live
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions Card */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              How to Use YouTube Classes
            </CardTitle>
            <CardDescription>
              Simple steps to create engaging video classes for your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">Upload to YouTube</p>
                  <p className="text-sm text-muted-foreground">
                    Create and upload your educational content to your YouTube channel
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">Copy Video URL</p>
                  <p className="text-sm text-muted-foreground">
                    Copy the YouTube video URL from your browser or YouTube app
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">Create Class</p>
                  <p className="text-sm text-muted-foreground">
                    Use "New Class" above to add your YouTube video to the platform
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                  4
                </div>
                <div>
                  <p className="font-medium">Students Watch</p>
                  <p className="text-sm text-muted-foreground">
                    Students can now watch your embedded YouTube video in the live classes section
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <Youtube className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No YouTube Classes Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create your first YouTube class by adding a video URL. 
            Students will be able to watch your embedded videos directly on the platform.
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Class
          </Button>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;