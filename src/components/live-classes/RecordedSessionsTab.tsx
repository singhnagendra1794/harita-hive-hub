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

      // Fetch YouTube sessions that are recordings
      const { data: youtubeRecordings, error: youtubeError } = await supabase
        .from('youtube_sessions')
        .select('*')
        .eq('session_type', 'recording')
        .eq('is_active', true)
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

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

      // Process YouTube session recordings
      if (youtubeRecordings && !youtubeError) {
        youtubeRecordings.forEach(recording => {
          allRecordings.push({
            id: recording.id,
            title: recording.title,
            description: recording.description || '',
            stream_key: recording.id,
            start_time: recording.created_at,
            end_time: recording.created_at,
            recording_url: recording.youtube_embed_url,
            course_title: 'YouTube Recording',
            duration_minutes: 90, // Default duration for YouTube recordings
            viewer_count: 0
          });
        });
      }

      // Featured recordings in order (Day 1, Day 2, etc.)
      const featuredRecording1 = {
        id: 'geospatial-intro-day1',
        title: 'Day 1: Intro to Geospatial Tech',
        description: 'Get started with fundamental concepts of GIS, remote sensing, and spatial analysis.',
        stream_key: 'intro-geospatial-day1',
        start_time: '2024-08-06T00:00:00Z', // 6th August
        end_time: '2024-08-06T01:30:00Z',
        recording_url: 'https://www.youtube.com/embed/r3qDz5iYnRY?si=DN105w-XPex8SKN3',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 90,
        viewer_count: 1250
      };

      const featuredRecording2 = {
        id: 'gis-vector-data-types',
        title: 'Day 2: GIS Concept & Data Types: Vector Data',
        description: 'Learn about vector data types in GIS including points, lines, and polygons with practical examples.',
        stream_key: 'gis-vector-data-types',
        start_time: '2024-08-07T00:00:00Z', // 7th August
        end_time: '2024-08-07T01:15:00Z',
        recording_url: 'https://www.youtube.com/embed/1K3_Vlx1YIY?si=AjyvPXYfLo4M0S1x',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 75,
        viewer_count: 892
      };

      const featuredRecording3 = {
        id: 'gos-raster-data-types',
        title: 'Day 3: GIS Concept & Data Types: Raster Data',
        description: 'Understand raster data types in GIS including grids and imagery, with practical examples.',
        stream_key: 'gos-raster-data-types',
        start_time: '2024-08-08T00:00:00Z', // 8th August
        end_time: '2024-08-08T01:20:00Z',
        recording_url: 'https://www.youtube.com/embed/_xCZIvx456Y?si=IfF1CCjrBZU4fTmA',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 80,
        viewer_count: 0
      };

      const featuredRecording4 = {
        id: 'coordinate-systems-gcs-pcs',
        title: 'Day 4: Coordinate Systems in GIS: GCS vs PCS, Projections & Reprojection in QGIS',
        description: 'Deep dive into GCS vs PCS, projections, and reprojection workflows in QGIS.',
        stream_key: 'coordinate-systems-gcs-pcs',
        start_time: '2024-08-09T00:00:00Z', // 9th August
        end_time: '2024-08-09T01:30:00Z',
        recording_url: 'https://www.youtube.com/embed/pG9CdDrXQd4?si=_UCtOLuvkft7NNcP',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 90,
        viewer_count: 0
      };

      const featuredRecording5 = {
        id: 'cartography-class',
        title: 'Day 5: Cartography',
        description: 'Master the art and science of cartography - creating meaningful maps that communicate spatial information effectively.',
        stream_key: 'cartography-class',
        start_time: '2024-08-14T00:00:00Z', // 14th August
        end_time: '2024-08-14T01:30:00Z',
        recording_url: 'https://www.youtube.com/embed/SsIWMLKUi_I?si=as4tLV2A51ufYCTt',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 90,
        viewer_count: 0
      };

      const featuredRecording6 = {
        id: 'remote-sensing-theoretical',
        title: 'Day 6: Remote Sensing - A Theoretical Class',
        description: 'Comprehensive theoretical foundation of remote sensing principles, sensors, and applications in geospatial analysis.',
        stream_key: 'remote-sensing-theoretical',
        start_time: '2024-08-15T00:00:00Z', // 15th August
        end_time: '2024-08-15T01:30:00Z',
        recording_url: 'https://www.youtube.com/embed/zVqAqkUWZ3I?si=QwnO4yR4rzXXa3Oz',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 90,
        viewer_count: 0
      };

      const featuredRecording7 = {
        id: 'satellite-sensors-data-processing',
        title: 'Day 7: Introduction to Satellite Sensors and Data Processing',
        description: 'Learn about different satellite sensors, data acquisition, and processing workflows.',
        stream_key: 'satellite-sensors-data-processing',
        start_time: '2024-08-16T00:00:00Z', // 16th August
        end_time: '2024-08-16T01:30:00Z',
        recording_url: 'https://www.youtube.com/embed/e2hBwSvhbt0?si=_TWi7-Wmidg-wYuL',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 90,
        viewer_count: 0
      };

      const featuredRecording8 = {
        id: 'gnss-field-data-collection',
        title: 'Day 8: GNSS, Field Data Collection - A Practical Guide',
        description: 'Comprehensive guide to Global Navigation Satellite Systems and field data collection techniques.',
        stream_key: 'gnss-field-data-collection',
        start_time: '2024-08-17T00:00:00Z', // 17th August
        end_time: '2024-08-17T01:30:00Z',
        recording_url: 'https://www.youtube.com/embed/GNBD5jHmx-g?si=iKhHd2xLv2RBbyEQ',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 90,
        viewer_count: 0
      };

      const featuredRecording9 = {
        id: 'day-9-recording',
        title: 'Day 9: Advanced GIS Concepts',
        description: 'Exploring advanced GIS concepts and spatial analysis techniques.',
        stream_key: 'day-9-recording',
        start_time: '2024-08-18T00:00:00Z', // 18th August
        end_time: '2024-08-18T01:30:00Z',
        recording_url: 'https://www.youtube.com/embed/placeholder1',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 90,
        viewer_count: 0
      };

      const featuredRecording10 = {
        id: 'day-10-recording',
        title: 'Day 10: Spatial Database Management',
        description: 'Understanding spatial databases and database management for GIS applications.',
        stream_key: 'day-10-recording',
        start_time: '2024-08-19T00:00:00Z', // 19th August
        end_time: '2024-08-19T01:30:00Z',
        recording_url: 'https://www.youtube.com/embed/placeholder2',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 90,
        viewer_count: 0
      };

      const featuredRecording11 = {
        id: 'day-11-recording',
        title: 'Day 11: Python for GIS Automation',
        description: 'Introduction to Python programming for GIS automation and scripting.',
        stream_key: 'day-11-recording',
        start_time: '2024-08-20T00:00:00Z', // 20th August
        end_time: '2024-08-20T01:30:00Z',
        recording_url: 'https://www.youtube.com/embed/placeholder3',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 90,
        viewer_count: 0
      };

      const featuredRecording12 = {
        id: 'vector-ops-python-day12',
        title: 'Day 12: Vector Ops in Python: Sets of rules, syntax, function, variables etc',
        description: 'Comprehensive guide to vector operations in Python, covering sets of rules, syntax, functions, and variables.',
        stream_key: 'vector-ops-python-day12',
        start_time: '2024-08-21T00:00:00Z', // 21st August
        end_time: '2024-08-21T01:30:00Z',
        recording_url: 'https://www.youtube.com/embed/rgS8o1HCgOw?si=urak36CY_tU17Qvi',
        course_title: 'Geospatial Technology Fundamentals',
        duration_minutes: 90,
        viewer_count: 0
      };

      // Add recordings in sequential order (Day 1, Day 2, etc.)
      allRecordings = [featuredRecording1, featuredRecording2, featuredRecording3, featuredRecording4, featuredRecording5, featuredRecording6, featuredRecording7, featuredRecording8, featuredRecording9, featuredRecording10, featuredRecording11, featuredRecording12, ...allRecordings];

      // Remove other video links and sections - only keep featured recordings
      allRecordings = allRecordings.filter(recording => 
        recording.title.startsWith('Day ')
      );

      console.log('[RecordedSessionsTab] Loaded recordings:', {
        total: allRecordings.length,
        titles: allRecordings.map(r => r.title).slice(0, 10)
      });
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

    // Enhanced sorting: prioritize "Day N" titles by numeric order
    const getDay = (title: string): number | null => {
      const match = title.match(/Day\s*(\d+)/i);
      return match ? parseInt(match[1], 10) : null;
    };

    filtered = [...filtered].sort((a, b) => {
      const dayA = getDay(a.title);
      const dayB = getDay(b.title);
      
      // Both have day numbers - sort by day number
      if (dayA !== null && dayB !== null) {
        return dayA - dayB;
      }
      
      // Only A has day number - A comes first
      if (dayA !== null && dayB === null) {
        return -1;
      }
      
      // Only B has day number - B comes first
      if (dayA === null && dayB !== null) {
        return 1;
      }
      
      // Neither has day number - sort by date
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });

    setFilteredRecordings(filtered);
    console.log('[RecordedSessionsTab] Recordings sorted:', {
      searchTerm, 
      courseFilter, 
      count: filtered.length,
      dayTitles: filtered.filter(r => getDay(r.title) !== null).map(r => r.title)
    });
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
      day: 'numeric',
      month: 'long'
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
        <div className="space-y-6">
          {filteredRecordings.map((recording) => (
            <Card key={recording.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Title */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-primary">
                      {recording.title}
                    </h3>
                    {!user && (
                      <Lock className="h-4 w-4 text-muted-foreground ml-2" />
                    )}
                  </div>
                  
                  {/* Description */}
                  {recording.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Description:</p>
                      <p className="text-sm text-foreground">
                        {recording.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Date */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Date:</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">{formatDate(recording.start_time)}</span>
                    </div>
                  </div>
                  
                  {/* Duration */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Duration:</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">{formatDuration(recording.duration_minutes)}</span>
                    </div>
                  </div>
                  
                  {/* Link */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Link:</p>
                    <Button
                      onClick={() => handleWatchRecording(recording)}
                      className="w-full sm:w-auto"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {user ? 'Watch Recording' : 'Preview Recording'}
                    </Button>
                    {!user && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Sign in to watch full recordings
                      </p>
                    )}
                  </div>
                </div>
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