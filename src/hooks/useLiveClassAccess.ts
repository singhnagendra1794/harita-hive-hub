import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';

export const useLiveClassAccess = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [hasLiveClassAccess, setHasLiveClassAccess] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasLiveClassAccess(false);
        setEnrollmentCount(0);
        setLoading(false);
        return;
      }

      try {
        // Check if user has live class access via database function
        const { data: accessData, error: accessError } = await supabase
          .rpc('user_has_live_class_access', { p_user_id: user.id });

        if (accessError) {
          console.error('Error checking live class access:', accessError);
        }

        // Get enrollment count
        const { data: countData, error: countError } = await supabase
          .rpc('get_user_enrollment_count', { p_user_id: user.id });

        if (countError) {
          console.error('Error getting enrollment count:', countError);
        }

        setHasLiveClassAccess(!!accessData);
        setEnrollmentCount(countData || 0);
      } catch (error) {
        console.error('Error in live class access check:', error);
        // Fallback to premium access check
        setHasLiveClassAccess(hasAccess('pro'));
        setEnrollmentCount(0);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, hasAccess]);

  return {
    hasLiveClassAccess,
    enrollmentCount,
    loading
  };
};