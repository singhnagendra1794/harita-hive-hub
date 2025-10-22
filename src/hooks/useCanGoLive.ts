import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCanGoLive = () => {
  const { user } = useAuth();
  const [canGoLive, setCanGoLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCanGoLive = async () => {
      if (!user) {
        setCanGoLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('can_user_go_live', {
          p_user_id: user.id
        });

        if (error) {
          console.error('Error checking go live permission:', error);
          setCanGoLive(false);
        } else {
          setCanGoLive(data === true);
        }
      } catch (error) {
        console.error('Error checking go live permission:', error);
        setCanGoLive(false);
      } finally {
        setLoading(false);
      }
    };

    checkCanGoLive();
  }, [user]);

  return { canGoLive, loading };
};
