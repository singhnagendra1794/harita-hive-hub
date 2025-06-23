
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  session_id?: string;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = async (event: AnalyticsEvent) => {
    if (!user) return;

    try {
      await supabase.from('user_analytics').insert({
        user_id: user.id,
        event_type: event.event_type,
        event_data: event.event_data || {},
        session_id: event.session_id || generateSessionId(),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackPageView = (page: string) => {
    trackEvent({
      event_type: 'page_view',
      event_data: { page, timestamp: new Date().toISOString() }
    });
  };

  const trackContentInteraction = (contentType: string, contentId: string, action: string) => {
    trackEvent({
      event_type: 'content_interaction',
      event_data: { contentType, contentId, action }
    });
  };

  const trackUserProgress = async (contentType: string, contentId: string, progressPercentage: number, timeSpent: number = 0) => {
    if (!user) return;

    try {
      await supabase.from('user_progress').upsert({
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        progress_percentage: progressPercentage,
        time_spent: timeSpent,
        last_accessed: new Date().toISOString(),
        ...(progressPercentage >= 100 && { completed_at: new Date().toISOString() })
      });
    } catch (error) {
      console.error('Progress tracking error:', error);
    }
  };

  return {
    trackEvent,
    trackPageView,
    trackContentInteraction,
    trackUserProgress,
  };
};

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
};
