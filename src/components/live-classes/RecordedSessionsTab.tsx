import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Clock, Calendar, Search, Filter, Eye, Lock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface RecordedSession {
  id: string;
  title: string;
  description?: string;
  stream_key: string;
  start_time: string;
  end_time?: string;
  recording_url?: string;
  course_title?: string;
  duration_minutes?: number;
  viewer_count: number;
}

const RecordedSessionsTab = () => {
  const [recordings, setRecordings] = useState<RecordedSession[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<RecordedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchRecordings();
  }, []);

  useEffect(() => {
    filterRecordings();
  }, [recordings, searchTerm, courseFilter]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      
      // Fetch real class recordings from database
      const { data: classRecordings, error: classError } = await supabase
        .from('class_recordings')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch YouTube recordings from live classes that ended
      const { data: liveClassRecordings, error: liveError } = await supabase
        .from('live_classes')
        .select('*')
        .eq('status', 'ended')
        .not('recording_url', 'is', null)
        .order('actual_end_time', { ascending: false });

      let allRecordings: RecordedSession[] = [];

      // Process class recordings
      if (classRecordings && !classError) {
        classRecordings.forEach(recording => {
          allRecordings.push({
            id: recording.id,
            title: recording.title,
            description: recording.description || '',
            stream_key: recording.id,
            start_time: recording.created_at,
            end_time: recording.created_at,
            recording_url: recording.youtube_url || recording.aws_url || recording.cloudfront_url,
            course_title: 'HaritaHive Live Session',
            duration_minutes: recording.duration_seconds ? Math.round(recording.duration_seconds / 60) : 90,
            viewer_count: recording.view_count || 0
          });
        });
      }

      // Process live class recordings
      if (liveClassRecordings && !liveError) {
        liveClassRecordings.forEach(recording => {
          allRecordings.push({
            id: recording.id,
            title: recording.title,
            description: recording.description || '',
            stream_key: recording.stream_key || '',
            start_time: recording.actual_start_time || recording.start_time,
            end_time: recording.actual_end_time || recording.end_time,
            recording_url: recording.recording_url || recording.youtube_url,
            course_title: recording.course_title || 'Live Class',
            duration_minutes: recording.duration_minutes || 90,
            viewer_count: recording.viewer_count || 0
          });
        });
      }

      // If no recordings found, show example from YouTube
      if (allRecordings.length === 0) {
        allRecordings = [{
          id: 'sample-1',
          title: 'Introduction to Geospatial Technology',
          description: 'Get started with fundamental concepts of GIS, remote sensing, and spatial analysis.',
          stream_key: 'intro-geospatial',
          start_time: '2024-07-25T05:00:00Z',
          end_time: '2024-07-25T06:30:00Z',
          recording_url: 'https://www.youtube.com/embed/bYKq_fsgYPo?si=7dWVWNRwG8K7z5pB',
          course_title: 'Geospatial Technology Unlocked',
          duration_minutes: 90,
          viewer_count: 342
        }];
      }

      setRecordings(allRecordings);
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load recordings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRecordings = () => {
    let filtered = recordings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(recording =>
        recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recording.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recording.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(recording => 
        recording.course_title === courseFilter
      );
    }

    setFilteredRecordings(filtered);
  };

  const handleWatchRecording = (recording: RecordedSession) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to watch full recordings.",
        variant: "destructive",
      });
      return;
    }

    // Open YouTube video directly
    window.open(recording.recording_url!, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Unknown duration';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getUniqueCourses = () => {
    const courses = recordings
      .map(r => r.course_title)
      .filter(Boolean)
      .filter((course, index, self) => self.indexOf(course) === index);
    return courses;
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
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recordings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {getUniqueCourses().map(course => (
              <SelectItem key={course} value={course!}>
                {course}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredRecordings.length} recording{filteredRecordings.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Recordings Grid */}
      {filteredRecordings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecordings.map((recording) => (
            <Card key={recording.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {recording.course_title && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {recording.course_title}
                      </Badge>
                    )}
                    <CardTitle className="text-lg line-clamp-2">
                      {recording.title}
                    </CardTitle>
                  </div>
                  {!user && (
                    <Lock className="h-4 w-4 text-muted-foreground ml-2" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(recording.start_time)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(recording.duration_minutes)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {recording.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {recording.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {recording.viewer_count || 0} views
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleWatchRecording(recording)}
                    className="group-hover:scale-105 transition-transform"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {user ? 'Watch' : 'Preview'}
                  </Button>
                </div>

                {!user && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Sign in to watch full recordings
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Play className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Recordings Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || courseFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Recordings will appear here after live sessions end.'
              }
            </p>
            {(searchTerm || courseFilter !== 'all') && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setCourseFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecordedSessionsTab;