import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useMissingQueryNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Check for high-priority missing queries that need attention
    const checkHighPriorityQueries = async () => {
      try {
        const { data: adminRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const isAdmin = adminRoles?.some(role => role.role === 'admin');
        if (!isAdmin) return;

        // Get queries with high request counts that are still pending
        const { data: queries } = await supabase
          .from('missing_search_queries')
          .select('*')
          .eq('status', 'pending')
          .gte('times_requested', 5)
          .order('times_requested', { ascending: false });

        if (queries && queries.length > 0) {
          // Create notification for admin
          const topQuery = queries[0];
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'high_priority_missing_query',
            title: 'High Priority Search Request',
            message: `The search query "${topQuery.query}" has been requested ${topQuery.times_requested} times without results. Consider creating content for this topic.`,
            data: {
              query_id: topQuery.id,
              query: topQuery.query,
              times_requested: topQuery.times_requested
            }
          });
        }
      } catch (error) {
        console.error('Error checking high-priority queries:', error);
      }
    };

    // Check immediately and then every hour
    checkHighPriorityQueries();
    const interval = setInterval(checkHighPriorityQueries, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [user]);

  return null;
};