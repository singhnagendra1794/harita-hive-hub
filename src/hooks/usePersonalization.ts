
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserInteraction {
  id: string;
  content_type: string;
  content_id: string;
  interaction_type: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface UserPreferences {
  id: string;
  preferred_topics: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  learning_style: 'visual' | 'hands-on' | 'theoretical' | 'mixed';
  notification_frequency: 'daily' | 'weekly' | 'monthly';
  language_preference: string;
}

interface ContentRecommendation {
  content_type: string;
  content_id: string;
  score: number;
  reason: string;
}

export const usePersonalization = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [recentInteractions, setRecentInteractions] = useState<UserInteraction[]>([]);
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPreferences();
      fetchRecentInteractions();
      fetchRecommendations();
    }
  }, [user]);

  const fetchUserPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const fetchRecentInteractions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentInteractions(data || []);
    } catch (error) {
      console.error('Error fetching recent interactions:', error);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_recommendations', { p_user_id: user.id, p_limit: 10 });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackInteraction = async (
    contentType: string,
    contentId: string,
    interactionType: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('track_user_interaction', {
        p_user_id: user.id,
        p_content_type: contentType,
        p_content_id: contentId,
        p_interaction_type: interactionType,
        p_metadata: metadata
      });

      // Refresh recent interactions
      fetchRecentInteractions();
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user || !preferences) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ ...newPreferences, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const dismissRecommendation = async (contentType: string, contentId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('content_recommendations')
        .update({ dismissed: true })
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      // Refresh recommendations
      fetchRecommendations();
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  const getRecentlyViewed = () => {
    return recentInteractions
      .filter(interaction => interaction.interaction_type === 'view')
      .slice(0, 5);
  };

  const getBookmarkedContent = () => {
    return recentInteractions
      .filter(interaction => interaction.interaction_type === 'bookmark');
  };

  const getLikedContent = () => {
    return recentInteractions
      .filter(interaction => interaction.interaction_type === 'like');
  };

  return {
    preferences,
    recentInteractions,
    recommendations,
    loading,
    trackInteraction,
    updatePreferences,
    dismissRecommendation,
    getRecentlyViewed,
    getBookmarkedContent,
    getLikedContent,
    refetch: () => {
      fetchUserPreferences();
      fetchRecentInteractions();
      fetchRecommendations();
    }
  };
};
