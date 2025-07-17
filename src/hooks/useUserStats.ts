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

      // Fetch real-time stats from actual tables
      const [
        courseEnrollments,
        communityPosts,
        spatialAnalyses,
        profileData,
        subscriptionData
      ] = await Promise.all([
        // Count course enrollments
        supabase
          .from('course_enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        
        // Count community posts (discussions)
        supabase
          .from('discussions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        
        // Count spatial analyses (geoai experiments)
        supabase
          .from('geoai_experiments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        
        // Get profile plan
        supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single(),
        
        // Get subscription info
        supabase
          .from('user_subscriptions')
          .select('subscription_tier')
          .eq('user_id', user.id)
          .single()
      ]);

      // Set real-time stats
      setStats({
        course_count: courseEnrollments.count || 0,
        projects_completed: 0, // No projects table found in schema
        community_posts: communityPosts.count || 0,
        spatial_analyses: spatialAnalyses.count || 0
      });

      if (profileData.error && profileData.error.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileData.error);
      }

      if (subscriptionData.error && subscriptionData.error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subscriptionData.error);
      }

      setPlan({
        plan: profileData.data?.plan || 'free',
        subscription_tier: subscriptionData.data?.subscription_tier || 'free'
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