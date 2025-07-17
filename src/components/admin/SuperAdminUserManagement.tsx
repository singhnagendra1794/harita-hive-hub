import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Search, Filter, UserCog, Shield, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserData {
  id: string;
  email?: string;
  created_at: string;
  full_name: string | null;
  roles: AppRole[];
  subscription_tier: string;
  subscription_status: string;
}

type FilterType = 'all' | 'free' | 'pro' | 'enterprise' | 'admin' | 'user';

export const SuperAdminUserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    pro: 0,
    enterprise: 0,
    admins: 0
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at');

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch user subscriptions
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('user_id, subscription_tier, status');

      if (subscriptionsError) throw subscriptionsError;

      // Transform the data to match our interface
      const combinedUsers: UserData[] = profiles?.map(profile => {
        const userRoleRecords = userRoles?.filter(ur => ur.user_id === profile.id) || [];
        const roles = userRoleRecords.map(ur => ur.role);
        const subscription = subscriptions?.find(s => s.user_id === profile.id);
        
        return {
          id: profile.id,
          email: `user-${profile.id.slice(0, 8)}@example.com`, // Placeholder since email isn't accessible
          created_at: profile.created_at,
          full_name: profile.full_name,
          roles,
          subscription_tier: subscription?.subscription_tier || 'free',
          subscription_status: subscription?.status || 'active'
        };
      }) || [];

      setUsers(combinedUsers);
      
      // Calculate stats
      const newStats = {
        total: combinedUsers.length,
        free: combinedUsers.filter(u => u.subscription_tier === 'free').length,
        pro: combinedUsers.filter(u => u.subscription_tier === 'pro').length,
        enterprise: combinedUsers.filter(u => u.subscription_tier === 'enterprise').length,
        admins: combinedUsers.filter(u => u.roles.includes('admin') || u.roles.includes('super_admin')).length
      };
      setStats(newStats);

    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    switch (filter) {
      case 'free':
        filtered = filtered.filter(user => user.subscription_tier === 'free');
        break;
      case 'pro':
        filtered = filtered.filter(user => user.subscription_tier === 'pro');
        break;
      case 'enterprise':
        filtered = filtered.filter(user => user.subscription_tier === 'enterprise');
        break;
      case 'admin':
        filtered = filtered.filter(user => user.roles.includes('admin') || user.roles.includes('super_admin'));
        break;
      case 'user':
        filtered = filtered.filter(user => !user.roles.includes('admin') && !user.roles.includes('super_admin'));
        break;
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filter]);

  const updateUserRole = async (userId: string, newRole: AppRole, action: 'grant' | 'revoke') => {
    try {
      const oldRoles = users.find(u => u.id === userId)?.roles || [];
      
      if (action === 'grant') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
        
        if (error) throw error;
        
        // Log the action
        await supabase.rpc('log_admin_action', {
          p_target_user_id: userId,
          p_action: `grant_role_${newRole}`,
          p_old_value: { roles: oldRoles },
          p_new_value: { roles: [...oldRoles, newRole] }
        });
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', newRole);
        
        if (error) throw error;
        
        // Log the action
        await supabase.rpc('log_admin_action', {
          p_target_user_id: userId,
          p_action: `revoke_role_${newRole}`,
          p_old_value: { roles: oldRoles },
          p_new_value: { roles: oldRoles.filter(r => r !== newRole) }
        });
      }

      toast({
        title: 'Success',
        description: `Role ${action === 'grant' ? 'granted' : 'revoked'} successfully`
      });
      
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    }
  };

  const updateUserSubscription = async (userId: string, newTier: string) => {
    try {
      const oldTier = users.find(u => u.id === userId)?.subscription_tier;
      
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          subscription_tier: newTier,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: newTier !== 'free' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null
        });

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_admin_action', {
        p_target_user_id: userId,
        p_action: 'change_subscription',
        p_old_value: { subscription_tier: oldTier },
        p_new_value: { subscription_tier: newTier }
      });

      toast({
        title: 'Success',
        description: `Subscription updated to ${newTier}`
      });
      
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive'
      });
    }
  };

  const getBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'pro': return 'default';
      case 'enterprise': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Users</CardTitle>
            <Badge variant="outline">Free</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.free}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
            <Badge>Pro</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pro}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise</CardTitle>
            <Badge variant="secondary">Enterprise</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enterprise}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="free">Free Users</SelectItem>
                  <SelectItem value="pro">Pro Users</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="user">Regular Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.length > 0 ? (
                          user.roles.map(role => (
                            <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">user</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(user.subscription_tier)}>
                        {user.subscription_tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserCog className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!user.roles.includes('admin') && (
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin', 'grant')}>
                              Grant Admin Role
                            </DropdownMenuItem>
                          )}
                          {user.roles.includes('admin') && (
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin', 'revoke')}>
                              Revoke Admin Role
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => updateUserSubscription(user.id, 'free')}>
                            Set Free Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserSubscription(user.id, 'pro')}>
                            Set Pro Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserSubscription(user.id, 'enterprise')}>
                            Set Enterprise Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};