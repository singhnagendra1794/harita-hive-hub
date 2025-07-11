
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserSubscription {
  id: string;
  user_id: string;
  subscription_tier: 'free' | 'premium' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  started_at: string;
  expires_at: string | null;
  payment_method: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

interface PremiumContent {
  content_type: string;
  content_id: string;
  is_premium: boolean;
  premium_tier: 'basic' | 'pro' | 'enterprise';
}

export const usePremiumAccess = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAccess = async () => {
      if (!user) {
        setSubscription(null);
        setHasPremiumAccess(false);
        setLoading(false);
        return;
      }

      try {
        // Validate user session first
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error || !currentUser) {
          console.log('User session invalid in usePremiumAccess');
          setSubscription(null);
          setHasPremiumAccess(false);
          setLoading(false);
          return;
        }

        await Promise.all([fetchUserSubscription(), checkPremiumAccess()]);
      } catch (error) {
        console.error('Error initializing premium access:', error);
        setSubscription(null);
        setHasPremiumAccess(false);
        setLoading(false);
      }
    };

    initializeAccess();
  }, [user]);

  const fetchUserSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSubscription({
          ...data,
          subscription_tier: data.subscription_tier as 'free' | 'premium' | 'pro' | 'enterprise',
          status: data.status as 'active' | 'cancelled' | 'expired' | 'trial'
        });
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

  const checkPremiumAccess = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('user_has_premium_access', { p_user_id: user.id });

      if (error) throw error;
      setHasPremiumAccess(data || false);
    } catch (error) {
      console.error('Error checking premium access:', error);
      setHasPremiumAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const checkContentAccess = async (contentType: string, contentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // First check if content is premium
      const { data: premiumData, error: premiumError } = await supabase
        .from('premium_content')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .single();

      if (premiumError && premiumError.code !== 'PGRST116') throw premiumError;

      // If content is not marked as premium, allow access
      if (!premiumData || !premiumData.is_premium) {
        return true;
      }

      // If content is premium, check user's access level
      return hasPremiumAccess;
    } catch (error) {
      console.error('Error checking content access:', error);
      return false;
    }
  };

  const upgradeSubscription = async (tier: 'premium' | 'pro' | 'enterprise') => {
    if (!user) return;

    try {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year subscription

      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_tier: tier,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setSubscription({
        ...data,
        subscription_tier: data.subscription_tier as 'free' | 'premium' | 'pro' | 'enterprise',
        status: data.status as 'active' | 'cancelled' | 'expired' | 'trial'
      });
      setHasPremiumAccess(true);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  const cancelSubscription = async () => {
    if (!user || !subscription) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setSubscription({
        ...data,
        subscription_tier: data.subscription_tier as 'free' | 'premium' | 'pro' | 'enterprise',
        status: data.status as 'active' | 'cancelled' | 'expired' | 'trial'
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const markContentAsPremium = async (
    contentType: string,
    contentId: string,
    tier: 'basic' | 'pro' | 'enterprise' = 'basic'
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('premium_content')
        .upsert({
          content_type: contentType,
          content_id: contentId,
          is_premium: true,
          premium_tier: tier,
          created_by: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking content as premium:', error);
    }
  };

  const hasAccess = (requiredTier: 'free' | 'premium' | 'pro' | 'enterprise' = 'premium'): boolean => {
    if (!user || !subscription) return requiredTier === 'free';
    
    const tierHierarchy = {
      'free': 0,
      'premium': 1,
      'pro': 2,
      'enterprise': 3
    };
    
    const userTierLevel = tierHierarchy[subscription.subscription_tier] || 0;
    const requiredLevel = tierHierarchy[requiredTier];
    
    // Check if subscription is active and not expired
    const isActive = subscription.status === 'active' && 
      (subscription.expires_at === null || new Date(subscription.expires_at) > new Date());
    
    return userTierLevel >= requiredLevel && (requiredTier === 'free' || isActive);
  };

  const canAccessLearnSection = (): boolean => {
    return hasAccess('pro');
  };

  const canAccessGeoAILab = (): boolean => {
    return hasAccess('pro');
  };

  const canAccessWebGISBuilder = (): boolean => {
    return hasAccess('pro');
  };

  const canAccessGeoProcessingLab = (): boolean => {
    return hasAccess('pro');
  };

  const canAccessPluginMarketplace = (): boolean => {
    return hasAccess('pro');
  };

  const canAccessQGISIntegration = (): boolean => {
    return hasAccess('pro');
  };

  const canPostJobs = (): boolean => {
    return hasAccess('pro');
  };

  const getJobPostingLimit = (): number => {
    if (!hasAccess('pro')) return 0;
    if (hasAccess('enterprise')) return -1; // Unlimited
    return 5; // Professional plan limit
  };

  const canAccessAdvancedDashboard = (): boolean => {
    return hasAccess('enterprise');
  };

  const canAccessAPI = (): boolean => {
    return hasAccess('enterprise');
  };

  const hasTrialAccess = (feature: 'qgis' | 'dashboard'): boolean => {
    // For now, return true for free users to allow 1-day trial
    // In a real implementation, you'd check trial start dates and limits
    return !hasAccess('premium');
  };

  return {
    subscription,
    hasPremiumAccess,
    loading,
    checkContentAccess,
    upgradeSubscription,
    cancelSubscription,
    markContentAsPremium,
    hasAccess,
    canAccessLearnSection,
    canAccessGeoAILab,
    canAccessWebGISBuilder,
    canAccessGeoProcessingLab,
    canAccessPluginMarketplace,
    canAccessQGISIntegration,
    canPostJobs,
    getJobPostingLimit,
    canAccessAdvancedDashboard,
    canAccessAPI,
    hasTrialAccess,
    refetch: () => {
      fetchUserSubscription();
      checkPremiumAccess();
    }
  };
};
