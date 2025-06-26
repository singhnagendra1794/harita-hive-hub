
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBetaSignup = () => {
  const [loading, setLoading] = useState(false);

  const signupForBeta = async (email: string, fullName: string, referralSource?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('beta_waitlist')
        .insert({
          email,
          full_name: fullName,
          referral_source: referralSource,
          signup_data: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || null
          }
        });

      if (error) throw error;

      // Track the beta signup in analytics
      await supabase
        .from('beta_analytics')
        .insert({
          metric_name: 'beta_signups',
          metric_value: 1,
          metric_data: {
            email,
            full_name: fullName,
            referral_source: referralSource
          }
        });

      return { success: true };
    } catch (error) {
      console.error('Beta signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkBetaStatus = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('beta_waitlist')
        .select('status, created_at, invited_at')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Beta status check error:', error);
      return null;
    }
  };

  return {
    signupForBeta,
    checkBetaStatus,
    loading
  };
};
