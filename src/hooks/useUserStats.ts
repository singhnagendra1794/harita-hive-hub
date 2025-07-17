import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  course_count: number;
  projects_completed: number;
  community_posts: number;
  spatial_analyses: number;
}

interface UserPlan {
  plan: string;
  subscription_tier: string;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch profile stats and plan
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('course_count, projects_completed, community_posts, spatial_analyses, plan')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile stats:', profileError);
        // Initialize with zeros if profile doesn't exist
        setStats({
          course_count: 0,
          projects_completed: 0,
          community_posts: 0,
          spatial_analyses: 0
        });
      } else {
        setStats({
          course_count: profileData.course_count || 0,
          projects_completed: profileData.projects_completed || 0,
          community_posts: profileData.community_posts || 0,
          spatial_analyses: profileData.spatial_analyses || 0
        });
      }

      // Fetch subscription info
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
      }

      setPlan({
        plan: profileData?.plan || 'free',
        subscription_tier: subscriptionData?.subscription_tier || 'free'
      });

    } catch (error) {
      console.error('Error in fetchUserStats:', error);
      setError('Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    await fetchUserStats();
  };

  const refreshSession = async () => {
    try {
      await supabase.auth.refreshSession();
      await fetchUserStats();
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  return {
    stats,
    plan,
    loading,
    error,
    refreshStats,
    refreshSession
  };
};