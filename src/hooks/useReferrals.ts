
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Referral {
  id: string;
  referrer_id: string;
  referee_id?: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  reward_granted: boolean;
  completed_at?: string;
  created_at: string;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [userReferralCode, setUserReferralCode] = useState<string>('');
  const [stats, setStats] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingRewards: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferrals();
      generateReferralCode();
    }
  }, [user]);

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map(referral => ({
        ...referral,
        status: referral.status as Referral['status']
      }));
      
      setReferrals(typedData);
      
      const completed = typedData.filter(r => r.status === 'completed').length;
      const pending = typedData.filter(r => r.status === 'completed' && !r.reward_granted).length;
      
      setStats({
        totalReferrals: typedData.length,
        completedReferrals: completed,
        pendingRewards: pending
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    if (!user) return;

    try {
      // Check if user already has a referral code
      const { data: existing } = await supabase
        .from('user_referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .limit(1)
        .single();

      if (existing) {
        setUserReferralCode(existing.referral_code);
        return;
      }

      // Generate new code using the database function
      const { data, error } = await supabase
        .rpc('generate_referral_code', { user_id: user.id });

      if (error) throw error;

      const referralCode = data;
      
      // Create referral record
      await supabase
        .from('user_referrals')
        .insert({
          referrer_id: user.id,
          referral_code: referralCode
        });

      setUserReferralCode(referralCode);
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  };

  const shareReferral = async (method: 'copy' | 'email' | 'social') => {
    if (!userReferralCode) return;

    const referralUrl = `${window.location.origin}?ref=${userReferralCode}`;
    
    switch (method) {
      case 'copy':
        await navigator.clipboard.writeText(referralUrl);
        break;
      case 'email':
        const emailSubject = 'Join me on this amazing GIS learning platform!';
        const emailBody = `I've been learning GIS skills on this fantastic platform and thought you'd love it too! Use my referral link to get started: ${referralUrl}`;
        window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
        break;
      case 'social':
        const shareText = `Check out this amazing GIS learning platform! ${referralUrl}`;
        if (navigator.share) {
          await navigator.share({
            title: 'GIS Learning Platform',
            text: shareText,
            url: referralUrl
          });
        } else {
          await navigator.clipboard.writeText(shareText);
        }
        break;
    }
  };

  return {
    referrals,
    userReferralCode,
    stats,
    loading,
    shareReferral,
    refetch: fetchReferrals
  };
};
