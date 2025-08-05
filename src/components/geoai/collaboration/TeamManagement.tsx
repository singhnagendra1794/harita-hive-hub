import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Settings, Shield, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface OrganizationMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'analyst' | 'viewer';
  permissions: any;
  joined_at: string;
  user_email?: string;
  user_name?: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  subscription_tier: string;
  created_at: string;
}

const TeamManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'analyst' | 'admin'>('viewer');

  useEffect(() => {
    if (user) {
      fetchOrganizations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedOrg) {
      fetchMembers();
    }
  }, [selectedOrg]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizations(data || []);
      if (data?.length > 0) {
        setSelectedOrg(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch organizations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!selectedOrg) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .eq('organization_id', selectedOrg)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail || !selectedOrg) return;

    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      if (userError || !userData) {
        toast({
          title: "User Not Found",
          description: "The user must first create an account on Harita Hive",
          variant: "destructive"
        });
        return;
      }

      // Add to organization
      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: selectedOrg,
          user_id: userData.id,
          role: inviteRole,
          invited_by: user?.id
        });

      if (error) throw error;

      setInviteEmail('');
      setInviteRole('viewer');
      fetchMembers();

      toast({
        title: "Member Invited",
        description: `${inviteEmail} has been added to the organization`
      });
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to invite member",
        variant: "destructive"
      });
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'owner' | 'admin' | 'analyst' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      
      fetchMembers();
      toast({
        title: "Role Updated",
        description: "Member role has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive"
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      fetchMembers();
      toast({
        title: "Member Removed",
        description: "Member has been removed from the organization"
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Shield className="h-4 w-4 text-purple-400" />;
      case 'admin': return <Settings className="h-4 w-4 text-red-400" />;
      case 'analyst': return <Edit className="h-4 w-4 text-yellow-400" />;
      case 'viewer': return <Eye className="h-4 w-4 text-blue-400" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'analyst': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'viewer': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage organization members and permissions</p>
        </div>
        {organizations.length > 1 && (
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="projects">Project Access</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Invite Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Invite Team Member
              </CardTitle>
              <CardDescription>
                Add new members to your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Input
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={inviteMember} disabled={!inviteEmail}>
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Current Members ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {(member.user_name || member.user_email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.user_name || member.user_email}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(member.role)}>
                        {getRoleIcon(member.role)}
                        <span className="ml-1 capitalize">{member.role}</span>
                      </Badge>
                      
                      {member.role !== 'owner' && (
                        <div className="flex space-x-1">
                          <Select
                            value={member.role}
                            onValueChange={(value: any) => updateMemberRole(member.id, value)}
                          >
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="analyst">Analyst</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Understanding what each role can do</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <Shield className="h-5 w-5 text-purple-400 mr-2" />
                      <h3 className="font-semibold">Owner</h3>
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Full access to all features</li>
                      <li>• Manage billing and subscription</li>
                      <li>• Add/remove administrators</li>
                      <li>• Delete organization</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <Settings className="h-5 w-5 text-red-400 mr-2" />
                      <h3 className="font-semibold">Admin</h3>
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Manage team members</li>
                      <li>• Access all projects</li>
                      <li>• Configure workflows</li>
                      <li>• View analytics</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <Edit className="h-5 w-5 text-yellow-400 mr-2" />
                      <h3 className="font-semibold">Analyst</h3>
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Create and run workflows</li>
                      <li>• Access assigned projects</li>
                      <li>• Generate reports</li>
                      <li>• View team insights</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <Eye className="h-5 w-5 text-blue-400 mr-2" />
                      <h3 className="font-semibold">Viewer</h3>
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• View shared projects</li>
                      <li>• Access reports</li>
                      <li>• Basic analytics</li>
                      <li>• Read-only access</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <p className="text-lg font-medium">Project-Based Permissions</p>
              <p className="text-muted-foreground">Fine-grained project access control coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamManagement;