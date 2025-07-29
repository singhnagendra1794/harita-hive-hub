import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Play, Download, Eye, Clock, Tag, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Recording {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  views_count: number;
  difficulty_level: string;
  tags: string[];
  topics_covered: string[];
  created_at: string;
  session_id?: string;
  is_public: boolean;
  file_size_bytes?: number;
}

export function GEOVARecordingsManager() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, [filter, selectedTopic]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      
      // Use the existing geova_recordings table structure
      const { data, error } = await supabase
        .from('geova_recordings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((record: any) => ({
        id: record.id,
        title: record.title || `GEOVA Session ${record.day_number || 'Recording'}`,
        description: record.auto_generated_description || 'GEOVA AI mentoring session',
        video_url: record.mp4_url || record.hls_url,
        thumbnail_url: record.thumbnail_url || '',
        duration_seconds: record.duration_seconds || 0,
        views_count: record.views_count || 0,
        difficulty_level: 'beginner', // Default for now
        tags: [], // Default empty array
        topics_covered: [],
        created_at: record.created_at,
        session_id: record.id,
        is_public: true,
        file_size_bytes: record.file_size_bytes
      }));

      setRecordings(transformedData);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (recordingId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.rpc('track_recording_view', {
          p_recording_id: recordingId,
          p_user_id: user.id,
          p_event_type: 'view_start'
        });
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const allTopics = Array.from(
    new Set(recordings.flatMap(r => r.topics_covered))
  ).filter(Boolean);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <div className="flex gap-2 flex-wrap">
                {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
                  <Button
                    key={level}
                    variant={filter === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(level as any)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {allTopics.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Topics</label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={!selectedTopic ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTopic(null)}
                  >
                    All Topics
                  </Button>
                  {allTopics.map(topic => (
                    <Button
                      key={topic}
                      variant={selectedTopic === topic ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTopic(topic)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recordings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map(recording => (
          <Card key={recording.id} className="group hover:shadow-lg transition-shadow">
            <div className="relative">
              {recording.thumbnail_url ? (
                <img
                  src={recording.thumbnail_url}
                  alt={recording.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                  <Play className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(recording.duration_seconds)}
              </div>
            </div>

            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg leading-tight line-clamp-2">
                  {recording.title}
                </CardTitle>
                <Badge className={getDifficultyColor(recording.difficulty_level)}>
                  {recording.difficulty_level}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {recording.description}
              </p>

              {recording.topics_covered.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {recording.topics_covered.slice(0, 3).map(topic => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {topic}
                      </Badge>
                    ))}
                    {recording.topics_covered.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{recording.topics_covered.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {recording.views_count} views
                </div>
                <div>
                  {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    trackView(recording.id);
                    window.open(recording.video_url, '_blank');
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(recording.video_url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recordings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recordings found</h3>
            <p className="text-muted-foreground">
              {filter !== 'all' || selectedTopic
                ? 'Try adjusting your filters to see more recordings.'
                : 'GEOVA recordings will appear here once they are available.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}