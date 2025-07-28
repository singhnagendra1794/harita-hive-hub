import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RoleChangeRequest {
  email: string;
  newRole: string;
  reason?: string;
}

interface BulkAssignRequest {
  emails: string[];
}

export const useRoleManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const changeUserRole = async ({ email, newRole, reason }: RoleChangeRequest) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-roles', {
        body: {
          action: 'change_role',
          email,
          newRole,
          reason: reason || 'Manual role change via Admin Panel'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Role Updated Successfully",
          description: `${email} has been updated to ${newRole}. Email notification sent.`
        });
        return { success: true, data };
      } else {
        throw new Error(data.error || 'Role change failed');
      }
    } catch (error: any) {
      console.error('Role change error:', error);
      toast({
        title: "❌ Role Change Failed",
        description: error.message || 'Failed to update user role',
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const bulkAssignProfessional = async ({ emails }: BulkAssignRequest) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-roles', {
        body: {
          action: 'bulk_assign_professional',
          emails
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Bulk Assignment Complete",
          description: `${data.successful}/${data.total_processed} users successfully assigned Professional access. Email notifications sent.`
        });
        return { success: true, data };
      } else {
        throw new Error(data.error || 'Bulk assignment failed');
      }
    } catch (error: any) {
      console.error('Bulk assignment error:', error);
      toast({
        title: "❌ Bulk Assignment Failed",
        description: error.message || 'Failed to assign professional access',
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getAuditLogs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-roles', {
        body: { action: 'get_audit_logs' }
      });

      if (error) throw error;
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.error || 'Failed to fetch audit logs');
      }
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  return {
    loading,
    changeUserRole,
    bulkAssignProfessional,
    getAuditLogs
  };
};