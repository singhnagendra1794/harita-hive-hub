import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Youtube, Save, Plus, Pencil, Trash2, Unlock, Lock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LiveClass {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  youtube_url?: string;
  status: 'scheduled' | 'live' | 'ended';
  stream_key: string;
  viewer_count: number;
}

const YouTubeLiveManager = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    duration_minutes: 90,
    youtube_url: '',
    is_free_access: false,
    day_number: null as number | null,
    custom_day_label: ''
  });

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      toast.error('Failed to fetch live classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    
    try {
      const classData = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: formData.start_time ? 
          new Date(new Date(formData.start_time).getTime() + formData.duration_minutes * 60000).toISOString() : 
          null,
        status: 'scheduled' as const,
        created_by: user.id,
        stream_key: Math.random().toString(36).substring(2, 18)
      };

      if (editingClass) {
        const { error } = await supabase
          .from('live_classes')
          .update(classData)
          .eq('id', editingClass.id);

        if (error) throw error;
        toast.success('Live class updated successfully!');
      } else {
        const { error } = await supabase
          .from('live_classes')
          .insert([classData]);

        if (error) throw error;
        toast.success('Live class created successfully!');
      }

      setFormData({
        title: '',
        description: '',
        start_time: '',
        duration_minutes: 90,
        youtube_url: '',
        is_free_access: false,
        day_number: null,
        custom_day_label: ''
      });
      setEditingClass(null);
      fetchLiveClasses();
    } catch (error) {
      console.error('Error saving live class:', error);
      toast.error('Failed to save live class');
    }
  };

  const handleEdit = (liveClass: LiveClass) => {
    setEditingClass(liveClass);
    setFormData({
      title: liveClass.title,
      description: liveClass.description || '',
      start_time: new Date(liveClass.start_time).toISOString().slice(0, 16),
      duration_minutes: liveClass.duration_minutes || 90,
      youtube_url: liveClass.youtube_url || '',
      is_free_access: (liveClass as any).is_free_access || false,
      day_number: (liveClass as any).day_number || null,
      custom_day_label: (liveClass as any).custom_day_label || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this live class?')) return;

    try {
      const { error } = await supabase
        .from('live_classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Live class deleted successfully!');
      fetchLiveClasses();
    } catch (error) {
      console.error('Error deleting live class:', error);
      toast.error('Failed to delete live class');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_time: '',
      duration_minutes: 90,
      youtube_url: '',
      is_free_access: false,
      day_number: null,
      custom_day_label: ''
    });
    setEditingClass(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'destructive';
      case 'scheduled': return 'default';
      case 'ended': return 'secondary';
      default: return 'default';
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
      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingClass ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingClass ? 'Edit Live Class' : 'Schedule New Live Class'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Class Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Advanced GIS Analysis"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  min="30"
                  max="300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="day_number">Day Number</Label>
                <Input
                  id="day_number"
                  type="number"
                  value={formData.day_number || ''}
                  onChange={(e) => setFormData({ ...formData, day_number: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="e.g., 1, 2, 3..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_day_label">Custom Day Label</Label>
                <Input
                  id="custom_day_label"
                  value={formData.custom_day_label}
                  onChange={(e) => setFormData({ ...formData, custom_day_label: e.target.value })}
                  placeholder="e.g., Day -1, Day 1, Week 1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube Live Embed URL</Label>
              <Input
                id="youtube_url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&modestbranding=1&controls=1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what will be covered in this live class..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_free_access"
                checked={formData.is_free_access}
                onCheckedChange={(checked) => setFormData({ ...formData, is_free_access: !!checked })}
              />
              <Label htmlFor="is_free_access" className="flex items-center gap-2">
                {formData.is_free_access ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                Free Access (No enrollment required)
              </Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {editingClass ? 'Update Class' : 'Schedule Class'}
              </Button>
              {editingClass && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Live Classes List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Live Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No live classes scheduled yet. Create your first one above!
              </p>
            ) : (
              classes.map((liveClass) => (
                <div key={liveClass.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{liveClass.title}</h3>
                        <Badge variant={getStatusColor(liveClass.status)}>
                          {liveClass.status.toUpperCase()}
                        </Badge>
                        {liveClass.youtube_url && (
                          <Badge variant="outline" className="text-red-600">
                            <Youtube className="h-3 w-3 mr-1" />
                            YouTube Live
                          </Badge>
                        )}
                        {(liveClass as any).is_free_access && (
                          <Badge variant="outline" className="text-green-600">
                            <Unlock className="h-3 w-3 mr-1" />
                            Free Access
                          </Badge>
                        )}
                        {(liveClass as any).custom_day_label && (
                          <Badge variant="secondary">
                            {(liveClass as any).custom_day_label}
                          </Badge>
                        )}
                      </div>
                      
                      {liveClass.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {liveClass.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDateTime(liveClass.start_time)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {liveClass.duration_minutes || 90} minutes
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(liveClass)}
                      >
                        <Pencil className="h-4 w-4" />
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
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeLiveManager;