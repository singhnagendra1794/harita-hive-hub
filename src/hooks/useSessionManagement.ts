
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSessionManagement = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const validateSession = async () => {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        await logout();
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_session_valid', {
          p_user_id: user.id,
          p_session_token: sessionToken
        });

        if (error || !data) {
          toast({
            title: "Session Expired",
            description: "You have been logged in from another device.",
            variant: "destructive",
          });
          await logout();
        }
      } catch (error) {
        console.error('Session validation error:', error);
      }
    };

    // Validate session on mount and periodically
    validateSession();
    const interval = setInterval(validateSession, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, logout, toast]);

  return null;
};
