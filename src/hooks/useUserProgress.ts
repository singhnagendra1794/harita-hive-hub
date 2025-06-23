
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProgress {
  content_type: string;
  content_id: string;
  progress_percentage: number;
  completed_at: string | null;
  time_spent: number;
  last_accessed: string;
}

interface UserEngagement {
  engagement_score: number;
  total_time_spent: number;
  content_created: number;
  content_consumed: number;
  streak_days: number;
  last_activity: string;
}

export const useUserProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [engagement, setEngagement] = useState<UserEngagement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProgress();
      fetchUserEngagement();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('last_accessed', { ascending: false });

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEngagement = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_engagement')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setEngagement(data);
    } catch (error) {
      console.error('Error fetching user engagement:', error);
    }
  };

  const getProgressByType = (contentType: string) => {
    return progress.filter(p => p.content_type === contentType);
  };

  const getCompletedContent = () => {
    return progress.filter(p => p.progress_percentage >= 100);
  };

  const getTotalTimeSpent = () => {
    return progress.reduce((total, p) => total + p.time_spent, 0);
  };

  return {
    progress,
    engagement,
    loading,
    getProgressByType,
    getCompletedContent,
    getTotalTimeSpent,
    refetch: fetchUserProgress,
  };
};
