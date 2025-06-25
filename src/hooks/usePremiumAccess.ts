
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
    if (user) {
      fetchUserSubscription();
      checkPremiumAccess();
    }
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

  return {
    subscription,
    hasPremiumAccess,
    loading,
    checkContentAccess,
    upgradeSubscription,
    cancelSubscription,
    markContentAsPremium,
    refetch: () => {
      fetchUserSubscription();
      checkPremiumAccess();
    }
  };
};
