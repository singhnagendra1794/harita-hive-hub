import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MessageCircle, 
  Video, 
  Share2, 
  Edit, 
  Eye, 
  Clock, 
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  UserPlus,
  Crown,
  Shield,
  Globe,
  Lock,
  Zap,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CollaborationHubProps {
  projectId: string;
}

const CollaborationHub: React.FC<CollaborationHubProps> = ({ projectId }) => {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  // Mock data
  useEffect(() => {
    const mockUsers = [
      {
        id: '1',
        name: 'Alex Chen',
        avatar: '',
        role: 'Project Lead',
        status: 'online',
        lastSeen: 'now',
        permissions: ['edit', 'share', 'admin']
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        avatar: '',
        role: 'GIS Analyst',
        status: 'online',
        lastSeen: '2 minutes ago',
        permissions: ['edit', 'comment']
      },
      {
        id: '3',
        name: 'Mike Rodriguez',
        avatar: '',
        role: 'Developer',
        status: 'away',
        lastSeen: '15 minutes ago',
        permissions: ['view', 'comment']
      },
      {
        id: '4',
        name: 'Emma Wilson',
        avatar: '',
        role: 'Data Scientist',
        status: 'offline',
        lastSeen: '2 hours ago',
        permissions: ['edit', 'share']
      }
    ];

    const mockMessages = [
      {
        id: '1',
        user: 'Alex Chen',
        message: 'Updated the basemap layer with new satellite imagery',
        timestamp: '10:30 AM',
        type: 'activity'
      },
      {
        id: '2',
        user: 'Sarah Johnson',
        message: 'The new data analysis looks great! Can we add more visualization options?',
        timestamp: '10:25 AM',
        type: 'message'
      },
      {
        id: '3',
        user: 'Mike Rodriguez',
        message: 'Added real-time data streaming capabilities',
        timestamp: '10:20 AM',
        type: 'activity'
      }
    ];

    setActiveUsers(mockUsers);
    setChatMessages(mockMessages);
  }, []);

  const permissions = [
    { id: 'view', name: 'View Only', icon: Eye, description: 'Can view maps and data' },
    { id: 'comment', name: 'Comment', icon: MessageCircle, description: 'Can add comments and discussions' },
    { id: 'edit', name: 'Edit', icon: Edit, description: 'Can modify maps and data' },
    { id: 'share', name: 'Share', icon: Share2, description: 'Can share project with others' },
    { id: 'admin', name: 'Admin', icon: Crown, description: 'Full project control' }
  ];

  const activityTypes = [
    { type: 'edit', icon: Edit, color: 'text-blue-500' },
    { type: 'comment', icon: MessageCircle, color: 'text-green-500' },
    { type: 'share', icon: Share2, color: 'text-orange-500' },
    { type: 'view', icon: Eye, color: 'text-gray-500' }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        user: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'message'
      };
      setChatMessages(prev => [message, ...prev]);
      setNewMessage('');
    }
  };

  const handleInviteUser = () => {
    toast({
      title: "Invitation Sent",
      description: "User invitation has been sent successfully.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPermissionIcon = (permissions: string[]) => {
    if (permissions.includes('admin')) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (permissions.includes('edit')) return <Edit className="h-4 w-4 text-blue-500" />;
    if (permissions.includes('comment')) return <MessageCircle className="h-4 w-4 text-green-500" />;
    return <Eye className="h-4 w-4 text-gray-500" />;
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
                <CardTitle>Collaboration Hub</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time collaboration and team coordination
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                {activeUsers.filter(u => u.status === 'online').length} Online
              </Badge>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Users
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="chat">Chat & Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
        </TabsList>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Team Members</CardTitle>
                  <Button size="sm" variant="outline" onClick={handleInviteUser}>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          {getPermissionIcon(user.permissions)}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                        <p className="text-xs text-muted-foreground">{user.lastSeen}</p>
                      </div>
                    </div>
                    <Badge variant={user.status === 'online' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Video className="h-4 w-4" />
                  Start Video Conference
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Screen
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Bell className="h-4 w-4" />
                  Send Notification
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Chat & Activity Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64 border rounded-lg p-3 overflow-y-auto space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{msg.user}</span>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm bg-muted p-2 rounded">{msg.message}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>Send</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chatMessages.filter(msg => msg.type === 'activity').map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-2 border rounded">
                      <div className="mt-1">
                        <Edit className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure access levels and permissions for team members
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map((permission) => {
                  const IconComponent = permission.icon;
                  return (
                    <div key={permission.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <span className="font-medium">{permission.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{permission.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Collaboration Sessions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time editing and shared workspaces
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Sessions</h3>
                <p className="text-muted-foreground mb-4">
                  Start a live collaboration session to work together in real-time
                </p>
                <Button className="gap-2">
                  <Video className="h-4 w-4" />
                  Start Live Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationHub;