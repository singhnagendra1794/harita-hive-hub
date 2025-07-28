import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Shield, Users, UserCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuditLog {
  id: string;
  user_email: string;
  old_role: string;
  new_role: string;
  changed_by_email: string;
  change_reason: string;
  created_at: string;
}

const AccessManagementPanel = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const { toast } = useToast();

  // Professional emails list for bulk assignment
  const professionalEmails = [
    'bhumip107@gmail.com',
    'kondojukushi10@gmail.com',
    'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com',
    'Tanishkatyagi7500@gmail.com',
    'kamakshiiit@gmail.com',
    'Nareshkumar.tamada@gmail.com',
    'Geospatialshekhar@gmail.com',
    'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com',
    'munmund66@gmail.com',
    'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com',
    'ajays301298@gmail.com',
    'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com',
    'rashidmsdian@gmail.com',
    'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com',
    'sg17122004@gmail.com',
    'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com',
    'moumitadas19996@gmail.com',
    'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com',
    'udaypbrn@gmail.com'
  ];

  const roleOptions = [
    { value: 'user', label: 'Free User', color: 'bg-gray-500' },
    { value: 'professional', label: 'Professional', color: 'bg-blue-500' },
    { value: 'admin', label: 'Admin', color: 'bg-orange-500' },
    { value: 'super_admin', label: 'Super Admin', color: 'bg-red-500' }
  ];

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-roles', {
        body: { action: 'get_audit_logs' }
      });

      if (error) throw error;
      
      if (data.success) {
        setAuditLogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
    } finally {
      setAuditLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!searchEmail || !selectedRole) {
      toast({
        title: "Missing Information",
        description: "Please enter an email and select a role",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-roles', {
        body: {
          action: 'change_role',
          email: searchEmail,
          newRole: selectedRole,
          reason: reason || 'Manual role change via Admin Panel'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Role Updated Successfully",
          description: `${searchEmail} has been updated to ${selectedRole}. Email notification sent.`
        });
        
        // Clear form
        setSearchEmail('');
        setSelectedRole('');
        setReason('');
        
        // Refresh audit logs
        fetchAuditLogs();
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
    } finally {
      setLoading(false);
    }
  };

  const handleBulkProfessionalAssignment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-roles', {
        body: {
          action: 'bulk_assign_professional',
          emails: professionalEmails
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Bulk Assignment Complete",
          description: `${data.successful}/${data.total_processed} users successfully assigned Professional access. Email notifications sent.`
        });
        
        // Refresh audit logs
        fetchAuditLogs();
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
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = roleOptions.find(r => r.value === role) || { color: 'bg-gray-500', label: role };
    return (
      <Badge className={`${roleConfig.color} text-white`}>
        {roleConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Access Management Panel</h2>
          <p className="text-muted-foreground">Manage user roles and access levels</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Bulk Professional Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Assign Professional plan to all {professionalEmails.length} listed users
            </p>
            <Button 
              onClick={handleBulkProfessionalAssignment}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign Professional Access'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{auditLogs.length}</p>
            <p className="text-sm text-muted-foreground">Role changes tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">All role changes are logged and email notifications are sent automatically.</p>
          </CardContent>
        </Card>
      </div>

      {/* Role Management Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Individual Role Management
          </CardTitle>
          <CardDescription>
            Search for a user by email and change their access level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User Email</label>
              <Input
                placeholder="Enter user email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason (Optional)</label>
            <Input
              placeholder="Reason for role change"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button 
            onClick={handleRoleChange}
            disabled={loading || !searchEmail || !selectedRole}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating Role...
              </>
            ) : (
              'Update User Role'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Role Changes</CardTitle>
          <CardDescription>
            Audit trail of all role modifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading audit logs...</span>
            </div>
          ) : auditLogs.length === 0 ? (
            <Alert>
              <AlertDescription>
                No role changes recorded yet.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.user_email}</span>
                      <span className="text-muted-foreground">→</span>
                      {getRoleBadge(log.old_role)}
                      <span className="text-muted-foreground">to</span>
                      {getRoleBadge(log.new_role)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Changed by: {log.changed_by_email} • {log.change_reason}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessManagementPanel;