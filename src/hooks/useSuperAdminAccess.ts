import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSuperAdminAccess = () => {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSuperAdminAccess = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Add a small delay to ensure user is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data, error } = await supabase.rpc('is_super_admin_secure');
        if (error) {
          console.error('RPC error:', error);
          throw error;
        }
        console.log('Super admin check result:', data);
        setIsSuperAdmin(data === true);
      } catch (error) {
        console.error('Error checking super admin access:', error);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdminAccess();
  }, [user]);

  return { isSuperAdmin, loading };
};