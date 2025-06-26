
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'admin' | 'moderator' | 'beta_tester' | 'user';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  granted_at: string;
  granted_by: string | null;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRoles();
    }
  }, [user]);

  const fetchUserRoles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.some(r => r.role === role);
  };

  const grantRole = async (userId: string, role: AppRole) => {
    if (!user || !hasRole('admin')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          granted_by: user.id
        });

      if (error) throw error;
      await fetchUserRoles();
    } catch (error) {
      console.error('Error granting role:', error);
    }
  };

  const revokeRole = async (userId: string, role: AppRole) => {
    if (!user || !hasRole('admin')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      await fetchUserRoles();
    } catch (error) {
      console.error('Error revoking role:', error);
    }
  };

  return {
    roles,
    loading,
    hasRole,
    grantRole,
    revokeRole,
    refetch: fetchUserRoles
  };
};
