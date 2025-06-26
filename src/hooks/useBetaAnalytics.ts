
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BetaMetrics {
  betaSignups: number;
  signupGrowth: number;
  premiumConversions: number;
  dailyActiveUsers: number;
  totalReferrals: number;
  completedReferrals: number;
  avgSessionDuration: number;
  contentCreated: number;
  communityPosts: number;
}

interface SignupTrend {
  date: string;
  signups: number;
}

interface ReferralData {
  topReferrers: Array<{
    name: string;
    email: string;
    referrals: number;
  }>;
  statusBreakdown: Array<{
    name: string;
    value: number;
  }>;
}

interface ContentShare {
  content: string;
  shares: number;
}

export const useBetaAnalytics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<BetaMetrics>({
    betaSignups: 0,
    signupGrowth: 0,
    premiumConversions: 0,
    dailyActiveUsers: 0,
    totalReferrals: 0,
    completedReferrals: 0,
    avgSessionDuration: 0,
    contentCreated: 0,
    communityPosts: 0
  });
  const [signupTrends, setSignupTrends] = useState<SignupTrend[]>([]);
  const [referralData, setReferralData] = useState<ReferralData>({
    topReferrers: [],
    statusBreakdown: []
  });
  const [contentShares, setContentShares] = useState<ContentShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch beta signups
      const { data: betaData } = await supabase
        .from('beta_waitlist')
        .select('*');

      // Fetch referrals
      const { data: referralMetrics } = await supabase
        .from('user_referrals')
        .select('*');

      // Fetch content shares
      const { data: shareData } = await supabase
        .from('content_shares')
        .select('*');

      // Fetch user analytics for engagement
      const { data: analyticsData } = await supabase
        .from('user_analytics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Process beta signups
      const totalSignups = betaData?.length || 0;
      const weekAgoSignups = betaData?.filter(signup => 
        new Date(signup.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;
      const growthRate = totalSignups > 0 ? Math.round((weekAgoSignups / totalSignups) * 100) : 0;

      // Process referrals
      const totalReferrals = referralMetrics?.length || 0;
      const completedReferrals = referralMetrics?.filter(r => r.status === 'completed').length || 0;

      // Generate mock data for demonstration
      const mockSignupTrends: SignupTrend[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockSignupTrends.push({
          date: date.toLocaleDateString(),
          signups: Math.floor(Math.random() * 20) + 5
        });
      }

      const mockReferralData: ReferralData = {
        topReferrers: [
          { name: 'John Doe', email: 'john@example.com', referrals: 12 },
          { name: 'Jane Smith', email: 'jane@example.com', referrals: 8 },
          { name: 'Bob Johnson', email: 'bob@example.com', referrals: 6 },
          { name: 'Alice Brown', email: 'alice@example.com', referrals: 4 },
          { name: 'Mike Wilson', email: 'mike@example.com', referrals: 3 }
        ],
        statusBreakdown: [
          { name: 'Completed', value: completedReferrals },
          { name: 'Pending', value: totalReferrals - completedReferrals },
          { name: 'Expired', value: Math.floor(totalReferrals * 0.1) }
        ]
      };

      const mockContentShares: ContentShare[] = [
        { content: 'GIS Basics Tutorial', shares: 45 },
        { content: 'Python for Geospatial', shares: 38 },
        { content: 'QGIS Project Guide', shares: 32 },
        { content: 'Remote Sensing 101', shares: 28 },
        { content: 'Spatial Analysis Tips', shares: 24 }
      ];

      setMetrics({
        betaSignups: totalSignups,
        signupGrowth: growthRate,
        premiumConversions: Math.floor(totalSignups * 0.15), // 15% mock conversion
        dailyActiveUsers: Math.floor(totalSignups * 0.3), // 30% mock DAU
        totalReferrals,
        completedReferrals,
        avgSessionDuration: 12, // Mock average
        contentCreated: shareData?.length || 0,
        communityPosts: analyticsData?.filter(a => a.event_type === 'content_interaction').length || 0
      });

      setSignupTrends(mockSignupTrends);
      setReferralData(mockReferralData);
      setContentShares(mockContentShares);

    } catch (error) {
      console.error('Error fetching beta analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordMetric = async (metricName: string, value: number, data?: any) => {
    try {
      await supabase
        .from('beta_analytics')
        .insert({
          metric_name: metricName,
          metric_value: value,
          metric_data: data || {}
        });
    } catch (error) {
      console.error('Error recording metric:', error);
    }
  };

  return {
    metrics,
    signupTrends,
    referralData,
    contentShares,
    loading,
    recordMetric,
    refetch: fetchAnalytics
  };
};
