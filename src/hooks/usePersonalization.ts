
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPreferences {
  id: string;
  user_id: string;
  preferred_topics: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  learning_style: 'visual' | 'hands-on' | 'theoretical' | 'mixed';
  notification_frequency: 'daily' | 'weekly' | 'monthly';
  language_preference: string;
  created_at: string;
  updated_at: string;
}

interface UserInteraction {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  interaction_type: string;
  metadata: Record<string, any>;
  created_at: string;
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
      
      if (data) {
        setPreferences({
          ...data,
          difficulty_level: data.difficulty_level as 'beginner' | 'intermediate' | 'advanced',
          learning_style: data.learning_style as 'visual' | 'hands-on' | 'theoretical' | 'mixed',
          notification_frequency: data.notification_frequency as 'daily' | 'weekly' | 'monthly',
          preferred_topics: data.preferred_topics || []
        });
      }
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
        .limit(50);

      if (error) throw error;
      
      setRecentInteractions(
        (data || []).map(item => ({
          ...item,
          metadata: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : (item.metadata || {})
        }))
      );
    } catch (error) {
      console.error('Error fetching recent interactions:', error);
    } finally {
      setLoading(false);
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

  const dismissRecommendation = async (contentType: string, contentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('content_recommendations')
        .update({ dismissed: true })
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      if (error) throw error;

      // Remove from local state
      setRecommendations(prev => 
        prev.filter(rec => !(rec.content_type === contentType && rec.content_id === contentId))
      );
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  const updatePreferences = async (updatedPreferences: Partial<UserPreferences>) => {
    if (!user || !preferences) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setPreferences({
        ...data,
        difficulty_level: data.difficulty_level as 'beginner' | 'intermediate' | 'advanced',
        learning_style: data.learning_style as 'visual' | 'hands-on' | 'theoretical' | 'mixed',
        notification_frequency: data.notification_frequency as 'daily' | 'weekly' | 'monthly',
        preferred_topics: data.preferred_topics || []
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const getRecentlyViewed = (contentType?: string, limit: number = 10) => {
    let filtered = recentInteractions.filter(
      interaction => interaction.interaction_type === 'view'
    );

    if (contentType) {
      filtered = filtered.filter(interaction => interaction.content_type === contentType);
    }

    return filtered.slice(0, limit);
  };

  const getBookmarkedContent = (contentType?: string, limit: number = 10) => {
    let filtered = recentInteractions.filter(
      interaction => interaction.interaction_type === 'bookmark'
    );

    if (contentType) {
      filtered = filtered.filter(interaction => interaction.content_type === contentType);
    }

    return filtered.slice(0, limit);
  };

  const getLikedContent = (contentType?: string, limit: number = 10) => {
    let filtered = recentInteractions.filter(
      interaction => interaction.interaction_type === 'like'
    );

    if (contentType) {
      filtered = filtered.filter(interaction => interaction.content_type === contentType);
    }

    return filtered.slice(0, limit);
  };

  return {
    preferences,
    recentInteractions,
    recommendations,
    loading,
    trackInteraction,
    dismissRecommendation,
    updatePreferences,
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
