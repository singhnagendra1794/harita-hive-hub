
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';

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

// Manually whitelisted Professional users (temporary grant)
const MANUAL_PRO_PRO_USERS = new Set<string>([
  'bhumip107@gmail.com',
  'kondojukushi10@gmail.com',
  'adityapipil35@gmail.com',
  'mukherjeejayita14@gmail.com',
  'tanishkatyagi7500@gmail.com',
  'kamakshiiit@gmail.com',
  'nareshkumar.tamada@gmail.com',
  'geospatialshekhar@gmail.com',
  'ps.priyankasingh26996@gmail.com',
  'madhubalapriya2@gmail.com',
  'munmund66@gmail.com',
  'sujansapkota27@gmail.com',
  'sanjanaharidasan@gmail.com',
  'ajays301298@gmail.com',
  'jeevanleo2310@gmail.com',
  'geoaiguru@gmail.com',
  'rashidmsdian@gmail.com',
  'bharath.viswakarma@gmail.com',
  'shaliniazh@gmail.com',
  'sg17122004@gmail.com',
  'veenapoovukal@gmail.com',
  'asadullahm031@gmail.com',
  'moumitadas19996@gmail.com',
  'javvad.rizvi@gmail.com',
  'mandadi.jyothi123@gmail.com',
  'udaypbrn@gmail.com'
].map(e => e.toLowerCase()));

export const usePremiumAccess = () => {
  const { user } = useAuth();
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAccess = async () => {
      if (!user || rolesLoading) {
        setLoading(true);
        return;
      }

      try {
        // Super admin check - hardcoded email bypass
        if (user.email === 'contact@haritahive.com') {
          console.log('Super admin detected - granting full access');
          setSubscription({
            id: 'super-admin',
            user_id: user.id,
            subscription_tier: 'enterprise',
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: null,
            payment_method: 'admin',
            stripe_customer_id: null,
            stripe_subscription_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setHasPremiumAccess(true);
          setLoading(false);
          return;
        }

        // Whitelisted professional emails bypass DB subscription checks
        const emailLc = user.email?.toLowerCase();
        if (emailLc && MANUAL_PRO_PRO_USERS.has(emailLc)) {
          console.log('Whitelisted professional user detected - granting Pro access');
          const now = new Date();
          const expires = new Date(now);
          expires.setFullYear(now.getFullYear() + 1);
          setSubscription({
            id: 'manual-pro',
            user_id: user.id,
            subscription_tier: 'pro',
            status: 'active',
            started_at: now.toISOString(),
            expires_at: expires.toISOString(),
            payment_method: 'manual',
            stripe_customer_id: null,
            stripe_subscription_id: null,
            created_at: now.toISOString(),
            updated_at: now.toISOString()
          });
          setHasPremiumAccess(true);
          setLoading(false);
          return;
        }

        await fetchUserSubscription();
      } catch (error) {
        console.error('Error initializing premium access:', error);
        setSubscription(null);
        setHasPremiumAccess(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAccess();
  }, [user, rolesLoading]);

  // Update premium access whenever subscription or roles change
  useEffect(() => {
    checkPremiumAccess();
  }, [subscription, isSuperAdmin]);

  const fetchUserSubscription = async () => {
    if (!user) return;

    try {
      // Force premium access function to run - this will create/update subscription if needed
      const { data: premiumCheck, error: premiumError } = await supabase.rpc('user_has_premium_access', {
        p_user_id: user.id
      });

      if (premiumError) {
        console.error('Error checking premium access:', premiumError);
      }

      // Now fetch the subscription data
      const { data, error } = await supabase.rpc('get_user_subscription_safe', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching user subscription:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const subscriptionData = data[0];
        setSubscription({
          ...subscriptionData,
          subscription_tier: subscriptionData.subscription_tier as 'free' | 'premium' | 'pro' | 'enterprise',
          status: subscriptionData.status as 'active' | 'cancelled' | 'expired' | 'trial'
        });
      } else {
        // This shouldn't happen anymore with the updated backend function
        console.warn('No subscription data found even after premium access check');
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

  const createDefaultSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          subscription_tier: 'free',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setSubscription({
        ...data,
        subscription_tier: data.subscription_tier as 'free' | 'premium' | 'pro' | 'enterprise',
        status: data.status as 'active' | 'cancelled' | 'expired' | 'trial'
      });
    } catch (error) {
      console.error('Error creating default subscription:', error);
    }
  };

  const checkPremiumAccess = () => {
    if (!user) {
      setHasPremiumAccess(false);
      return;
    }

    // Super admin users (hardcoded email) have access to everything
    if (user.email === 'contact@haritahive.com') {
      setHasPremiumAccess(true);
      return;
    }

    // Super admin users (role-based) have access to everything
    if (isSuperAdmin()) {
      setHasPremiumAccess(true);
      return;
    }

    // Manual whitelist check
    if (user.email && MANUAL_PRO_PRO_USERS.has(user.email.toLowerCase())) {
      setHasPremiumAccess(true);
      return;
    }

    if (!subscription) {
      setHasPremiumAccess(false);
      return;
    }

    // Check if user has pro or enterprise subscription
    const hasProOrEnterprise = subscription.subscription_tier === 'pro' || subscription.subscription_tier === 'enterprise';
    const isActive = subscription.status === 'active' && 
      (subscription.expires_at === null || new Date(subscription.expires_at) > new Date());
    
    setHasPremiumAccess(hasProOrEnterprise && isActive);
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
    if (!user) return requiredTier === 'free';
    
    // Super admin users (hardcoded email) have access to everything
    if (user.email === 'contact@haritahive.com') {
      
      return true;
    }
    
    // Super admin users (role-based) have access to everything
    if (isSuperAdmin()) return true;
    
    // Manual whitelist check
    if (user.email && MANUAL_PRO_PRO_USERS.has(user.email.toLowerCase())) return true;
    
    if (!subscription) return requiredTier === 'free';
    
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

  const canAccessEnterpriseDataIntegration = (): boolean => {
    return hasAccess('enterprise');
  };

  const canAccessIoTProcessing = (): boolean => {
    return hasAccess('enterprise');
  };

  const canAccessAdvancedGeoAI = (): boolean => {
    return hasAccess('enterprise');
  };

  const canAccessComplianceToolkit = (): boolean => {
    return hasAccess('enterprise');
  };

  const canAccessSpatialRiskAnalysis = (): boolean => {
    return hasAccess('enterprise');
  };

  const canAccessDeveloperPortal = (): boolean => {
    return hasAccess('enterprise');
  };

  const canAccessWhiteLabeling = (): boolean => {
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
    canAccessEnterpriseDataIntegration,
    canAccessIoTProcessing,
    canAccessAdvancedGeoAI,
    canAccessComplianceToolkit,
    canAccessSpatialRiskAnalysis,
    canAccessDeveloperPortal,
    canAccessWhiteLabeling,
    hasTrialAccess,
    refetch: () => {
      fetchUserSubscription();
      checkPremiumAccess();
    }
  };
};
