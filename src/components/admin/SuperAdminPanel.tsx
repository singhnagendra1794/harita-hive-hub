import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Database, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  roles: string[];
}

const SuperAdminPanel = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      // Fetch users from profiles and auth tables
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

      if (profileError) throw profileError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        email: 'Protected', // We can't directly access auth.users email from frontend
        roles: userRoles?.filter(role => role.user_id === profile.id).map(role => role.role) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const ensureSuperAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .rpc('ensure_super_admin');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Super admin role ensured for contact@haritahive.com",
      });
      
      fetchAllUsers();
    } catch (error) {
      console.error('Error ensuring super admin:', error);
      toast({
        title: "Error",
        description: "Failed to ensure super admin role",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Super Admin Panel</h2>
          <p className="text-muted-foreground">Full administrative access to HaritaHive platform</p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          <Shield className="w-4 h-4 mr-2" />
          Super Admin
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.roles.includes('admin') || user.roles.includes('super_admin')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Access</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-600 font-medium">Full Access</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Control</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-600 font-medium">Enabled</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Super Admin Actions</CardTitle>
          <CardDescription>
            Critical administrative functions for platform management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={ensureSuperAdminRole}
            variant="outline"
            className="w-full md:w-auto"
          >
            <Shield className="w-4 h-4 mr-2" />
            Ensure Super Admin Role
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Note:</strong> As super admin, you have:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Full read/write access to all user data</li>
              <li>Ability to manage all payment transactions</li>
              <li>Complete control over user roles and permissions</li>
              <li>Access to all administrative functions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Overview of all platform users and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.slice(0, 10).map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                  <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {user.roles.map(role => (
                    <Badge key={role} variant={role === 'super_admin' ? 'destructive' : 'secondary'}>
                      {role}
                    </Badge>
                  ))}
                  {user.roles.length === 0 && (
                    <Badge variant="outline">user</Badge>
                  )}
                </div>
              </div>
            ))}
            {users.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing first 10 users. Total: {users.length}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminPanel;