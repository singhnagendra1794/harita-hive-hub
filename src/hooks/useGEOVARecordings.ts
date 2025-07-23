import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GEOVARecording {
  id: string;
  day_number: number;
  topic_title: string;
  topic_description: string;
  recording_date: string;
  recording_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  recording_status: string;
  hls_url: string;
  mp4_url: string;
  auto_generated_description: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface RecordingBookmark {
  id: string;
  recording_id: string;
  user_id: string;
  notes: string;
  bookmarked_at: string;
}

export interface NextClassInfo {
  next_class_date: string;
  next_class_time: string;
  next_class_topic: string;
  minutes_until_next: number;
}

export const useGEOVARecordings = () => {
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<GEOVARecording[]>([]);
  const [bookmarks, setBookmarks] = useState<RecordingBookmark[]>([]);
  const [nextClassInfo, setNextClassInfo] = useState<NextClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check user access and enrollment
  const checkAccess = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Check if user has premium access and is enrolled in the course
      const { data: profile } = await supabase
        .from('profiles')
        .select('enrolled_courses')
        .eq('id', currentUser.id)
        .single();

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('subscription_tier, status')
        .eq('user_id', currentUser.id)
        .single();

      const hasEnrollment = profile?.enrolled_courses?.includes('Geospatial Technology Unlocked');
      const hasPremium = subscription?.subscription_tier === 'pro' && subscription?.status === 'active';

      setHasAccess(hasEnrollment && hasPremium);
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch GEOVA recordings
  const fetchRecordings = useCallback(async () => {
    if (!hasAccess) return;

    try {
      const { data, error } = await supabase
        .from('geova_recordings')
        .select('*')
        .order('day_number', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast({
        title: "Error",
        description: "Failed to load recordings",
        variant: "destructive",
      });
    }
  }, [hasAccess, toast]);

  // Fetch user bookmarks
  const fetchBookmarks = useCallback(async () => {
    if (!user || !hasAccess) return;

    try {
      const { data, error } = await supabase
        .from('student_recording_bookmarks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  }, [user, hasAccess]);

  // Fetch next class information
  const fetchNextClassInfo = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_geova_class_time');
      if (error) throw error;
      
      if (data && data.length > 0) {
        setNextClassInfo(data[0]);
      }
    } catch (error) {
      console.error('Error fetching next class info:', error);
    }
  }, []);

  // Toggle bookmark for a recording
  const toggleBookmark = useCallback(async (recordingId: string, notes?: string) => {
    if (!user) return false;

    const existingBookmark = bookmarks.find(b => b.recording_id === recordingId);

    try {
      if (existingBookmark) {
        const { error } = await supabase.functions.invoke('geova-recording-manager', {
          body: {
            action: 'remove_bookmark',
            recordingId,
            data: { userId: user.id }
          }
        });

        if (error) throw error;

        setBookmarks(prev => prev.filter(b => b.id !== existingBookmark.id));
        toast({
          title: "Bookmark removed",
          description: "Recording removed from bookmarks",
        });
        return false;
      } else {
        const { data, error } = await supabase.functions.invoke('geova-recording-manager', {
          body: {
            action: 'bookmark_recording',
            recordingId,
            data: { userId: user.id, notes }
          }
        });

        if (error) throw error;

        if (data?.bookmark) {
          setBookmarks(prev => [...prev, data.bookmark]);
          toast({
            title: "Bookmark added",
            description: "Recording added to bookmarks",
          });
          return true;
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
    return false;
  }, [user, bookmarks, toast]);

  // Track video view
  const trackView = useCallback(async (recordingId: string, eventType: string = 'view_start', timestampSeconds?: number) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('geova-recording-manager', {
        body: {
          action: 'track_view',
          recordingId,
          data: {
            userId: user.id,
            eventType,
            timestampSeconds
          }
        }
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [user]);

  // Ask a question about a recording
  const askQuestion = useCallback(async (recordingId: string, question: string, timestampSeconds?: number) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('geova-qa-assistant', {
        body: {
          action: 'ask_question',
          recordingId,
          userId: user.id,
          question: question.trim(),
          timestampSeconds,
          aiResponder: 'GEOVA'
        }
      });

      if (error) throw error;

      if (data?.qaInteraction) {
        toast({
          title: "Question submitted",
          description: "GEOVA has provided an answer",
        });
        return data.qaInteraction;
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Error",
        description: "Failed to submit question",
        variant: "destructive",
      });
    }
    return null;
  }, [user, toast]);

  // Get Q&A interactions for a recording
  const getQAInteractions = useCallback(async (recordingId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('geova-qa-assistant', {
        body: {
          action: 'get_recording_qa',
          recordingId
        }
      });

      if (error) throw error;
      return data?.qaInteractions || [];
    } catch (error) {
      console.error('Error fetching Q&A interactions:', error);
      return [];
    }
  }, []);

  // Initialize hook
  useEffect(() => {
    checkAccess();
    fetchNextClassInfo();
  }, [checkAccess, fetchNextClassInfo]);

  useEffect(() => {
    if (hasAccess && user) {
      fetchRecordings();
      fetchBookmarks();
    }
  }, [hasAccess, user, fetchRecordings, fetchBookmarks]);

  // Helper functions
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatTimeUntilNext = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} minutes`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return `${days}d ${hours}h`;
    }
  };

  const isBookmarked = (recordingId: string): boolean => {
    return bookmarks.some(b => b.recording_id === recordingId);
  };

  const getCompletedRecordings = (): GEOVARecording[] => {
    return recordings.filter(r => r.recording_status === 'completed');
  };

  const getUpcomingRecordings = (): GEOVARecording[] => {
    return recordings.filter(r => r.recording_status === 'scheduled');
  };

  return {
    // State
    recordings,
    bookmarks,
    nextClassInfo,
    loading,
    hasAccess,
    user,

    // Actions
    checkAccess,
    fetchRecordings,
    fetchBookmarks,
    toggleBookmark,
    trackView,
    askQuestion,
    getQAInteractions,

    // Helpers
    formatDuration,
    formatTimeUntilNext,
    isBookmarked,
    getCompletedRecordings,
    getUpcomingRecordings,
  };
};