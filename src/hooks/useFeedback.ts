
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ContentFeedback {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  feedback_type: 'thumbs_up' | 'thumbs_down' | 'helpful' | 'not_helpful';
  comment?: string;
  created_at: string;
}

export const useFeedback = (contentType: string, contentId: string) => {
  const { user } = useAuth();
  const [userFeedback, setUserFeedback] = useState<ContentFeedback | null>(null);
  const [feedbackStats, setFeedbackStats] = useState({
    thumbs_up: 0,
    thumbs_down: 0,
    helpful: 0,
    not_helpful: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserFeedback();
    }
    fetchFeedbackStats();
  }, [user, contentType, contentId]);

  const fetchUserFeedback = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('content_feedback')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserFeedback(data);
    } catch (error) {
      console.error('Error fetching user feedback:', error);
    }
  };

  const fetchFeedbackStats = async () => {
    try {
      const { data, error } = await supabase
        .from('content_feedback')
        .select('feedback_type')
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      if (error) throw error;

      const stats = { thumbs_up: 0, thumbs_down: 0, helpful: 0, not_helpful: 0 };
      data?.forEach(feedback => {
        stats[feedback.feedback_type as keyof typeof stats]++;
      });
      
      setFeedbackStats(stats);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    }
  };

  const submitFeedback = async (feedbackType: ContentFeedback['feedback_type'], comment?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_feedback')
        .upsert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          feedback_type: feedbackType,
          comment: comment || null,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      setUserFeedback(data);
      fetchFeedbackStats();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    userFeedback,
    feedbackStats,
    loading,
    submitFeedback
  };
};
