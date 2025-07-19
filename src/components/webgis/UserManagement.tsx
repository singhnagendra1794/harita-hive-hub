import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Settings, Shield, Clock, Activity, Mail, Phone } from 'lucide-react';

interface UserManagementProps {
  projectId: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ projectId }) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const users = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Owner',
      status: 'active',
      lastActive: '2 minutes ago',
      avatar: '/placeholder.svg',
      permissions: {
        view: true,
        edit: true,
        delete: true,
        export: true,
        admin: true
      },
      joinedAt: '2024-01-15',
      activityScore: 95
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'Editor',
      status: 'active',
      lastActive: '15 minutes ago',
      avatar: '/placeholder.svg',
      permissions: {
        view: true,
        edit: true,
        delete: false,
        export: true,
        admin: false
      },
      joinedAt: '2024-02-01',
      activityScore: 87
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      role: 'Viewer',
      status: 'active',
      lastActive: '2 hours ago',
      avatar: '/placeholder.svg',
      permissions: {
        view: true,
        edit: false,
        delete: false,
        export: false,
        admin: false
      },
      joinedAt: '2024-02-10',
      activityScore: 72
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@partner.com',
      role: 'Guest',
      status: 'invited',
      lastActive: 'Never',
      avatar: '/placeholder.svg',
      permissions: {
        view: true,
        edit: false,
        delete: false,
        export: false,
        admin: false
      },
      joinedAt: '2024-02-15',
      activityScore: 0
    }
  ];

  const roles = [
    {
      name: 'Owner',
      description: 'Full access including user management',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    },
    {
      name: 'Editor',
      description: 'Can view and edit all content',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      name: 'Viewer',
      description: 'Can view content only',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    {
      name: 'Guest',
      description: 'Limited access to specific content',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  ];

  const getRoleColor = (role: string) => {
    const roleData = roles.find(r => r.name === role);
    return roleData?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'invited': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInviteUser = () => {
    setShowInviteDialog(false);
    // Handle invite logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>User Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage team access and permissions
                </p>
              </div>
            </div>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="user@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.slice(1).map((role) => (
                          <SelectItem key={role.name} value={role.name.toLowerCase()}>
                            <div className="flex flex-col">
                              <span>{role.name}</span>
                              <span className="text-xs text-muted-foreground">{role.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Optional Message</Label>
                    <Input id="message" placeholder="Welcome to our WebGIS project!" />
                  </div>
                  <Button onClick={handleInviteUser} className="w-full">
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{user.name}</h4>
                      <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {user.lastActive}
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {user.activityScore}% active
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  {user.role !== 'Owner' && (
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Role</th>
                  <th className="text-center p-3">View</th>
                  <th className="text-center p-3">Edit</th>
                  <th className="text-center p-3">Delete</th>
                  <th className="text-center p-3">Export</th>
                  <th className="text-center p-3">Admin</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => {
                  const sampleUser = users.find(u => u.role === role.name);
                  const permissions = sampleUser?.permissions || {
                    view: false, edit: false, delete: false, export: false, admin: false
                  };
                  
                  return (
                    <tr key={role.name} className="border-b">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <div className={`w-4 h-4 rounded-full mx-auto ${permissions.view ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </td>
                      <td className="text-center p-3">
                        <div className={`w-4 h-4 rounded-full mx-auto ${permissions.edit ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </td>
                      <td className="text-center p-3">
                        <div className={`w-4 h-4 rounded-full mx-auto ${permissions.delete ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </td>
                      <td className="text-center p-3">
                        <div className={`w-4 h-4 rounded-full mx-auto ${permissions.export ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </td>
                      <td className="text-center p-3">
                        <div className={`w-4 h-4 rounded-full mx-auto ${permissions.admin ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details & Permissions</DialogTitle>
            </DialogHeader>
            {(() => {
              const user = users.find(u => u.id === selectedUser);
              if (!user) return null;
              
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Joined Date</Label>
                      <p className="text-sm text-muted-foreground">{user.joinedAt}</p>
                    </div>
                    <div>
                      <Label>Last Active</Label>
                      <p className="text-sm text-muted-foreground">{user.lastActive}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Permissions</h4>
                    <div className="space-y-3">
                      {Object.entries(user.permissions).map(([permission, granted]) => (
                        <div key={permission} className="flex items-center justify-between">
                          <Label className="capitalize">{permission}</Label>
                          <Switch checked={granted} disabled={user.role === 'Owner'} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedUser(null)}>
                      Cancel
                    </Button>
                    <Button>Save Changes</Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;