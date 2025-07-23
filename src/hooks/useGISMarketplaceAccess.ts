import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface GISMarketplaceSubscription {
  id: string;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  amount_paid: number;
  currency: string;
}

export const useGISMarketplaceAccess = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<GISMarketplaceSubscription | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAccess();
    } else {
      setHasAccess(false);
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const checkAccess = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's subscription
      const { data: subscription, error } = await supabase
        .from('gis_marketplace_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setHasAccess(false);
        return;
      }

      if (!subscription) {
        setHasAccess(false);
        setSubscription(null);
        return;
      }

      setSubscription(subscription);

      // Check if subscription is active and not expired
      const now = new Date();
      const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;
      const isActive = subscription.status === 'active' && (!expiresAt || expiresAt > now);

      setHasAccess(isActive);

    } catch (error) {
      console.error('Error checking GIS marketplace access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!subscription?.expires_at) return null;
    
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return 'no_subscription';
    
    if (subscription.status === 'expired') return 'expired';
    
    const daysRemaining = getDaysRemaining();
    if (daysRemaining === null) return subscription.status;
    if (daysRemaining === 0) return 'expired';
    if (daysRemaining <= 7) return 'expiring_soon';
    
    return subscription.status;
  };

  return {
    subscription,
    hasAccess,
    loading,
    checkAccess,
    getDaysRemaining,
    getSubscriptionStatus
  };
};