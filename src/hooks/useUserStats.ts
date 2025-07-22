import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  course_count: number;
  projects_completed: number;
  community_posts: number;
  spatial_analyses: number;
  enrolled_courses_count: number;
}

interface UserPlan {
  plan: string;
  subscription_tier: string;
  status?: string;
  expires_at?: string | null;
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

      // Use the safe function that automatically handles professional emails
      const { data, error } = await supabase.rpc('get_user_stats_safe', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching user stats:', error);
        setError('Failed to fetch user statistics');
        return;
      }

      if (data && data.length > 0) {
        const userStatsData = data[0] as any; // Cast to any since types haven't been regenerated
        
        // Set real-time stats
        setStats({
          course_count: userStatsData.course_count || 0,
          projects_completed: userStatsData.projects_completed || 0,
          community_posts: userStatsData.community_posts || 0,
          spatial_analyses: userStatsData.spatial_analyses || 0,
          enrolled_courses_count: userStatsData.enrolled_courses_count || 0
        });

        // Use subscription_tier as primary source
        const actualSubscriptionTier = userStatsData.subscription_tier || 'free';
        
        // Map subscription tiers to display names
        let displayPlan = userStatsData.plan || 'free';
        if (actualSubscriptionTier === 'pro') {
          displayPlan = 'professional';
        } else if (actualSubscriptionTier === 'enterprise') {
          displayPlan = 'enterprise';
        } else if (actualSubscriptionTier === 'premium') {
          displayPlan = 'premium';
        }

        setPlan({
          plan: displayPlan,
          subscription_tier: actualSubscriptionTier,
          status: 'active',
          expires_at: null
        });
      } else {
        // Fallback: create a default user entry
        await createDefaultUserEntry();
      }

    } catch (error) {
      console.error('Error in fetchUserStats:', error);
      setError('Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultUserEntry = async () => {
    if (!user) return;

    try {
      // Check if user has professional email
      const isProEmail = user.email && [
        'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
        'mukherjeejayita14@gmail.com', 'tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
        'nareshkumar.tamada@gmail.com', 'geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
        'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
        'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
        'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
        'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
        'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
        'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'anshumanavasthi1411@gmail.com',
        'sruthythulasi2017@gmail.com', 'nagendrasingh1794@gmail.com', 'maneetsethi954@gmail.com',
        'tharun.ravichandran@gmail.com', 'nikhilbt650@gmail.com', 'vanditaujwal8@gmail.com',
        'dhiman.kashyap24@gmail.com', 'ankushrathod96@gmail.com', 'singhnagendrageotech@gmail.com'
      ].includes(user.email.toLowerCase());

      // Create default stats
      setStats({
        course_count: 0,
        projects_completed: 0,
        community_posts: 0,
        spatial_analyses: 0,
        enrolled_courses_count: isProEmail ? 1 : 0
      });

      const tier = isProEmail ? 'pro' : 'free';
      const planName = isProEmail ? 'professional' : 'free';

      setPlan({
        plan: planName,
        subscription_tier: tier,
        status: 'active',
        expires_at: null
      });

    } catch (error) {
      console.error('Error creating default user entry:', error);
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