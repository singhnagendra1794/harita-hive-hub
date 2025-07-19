import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MessageSquare, 
  Plus, 
  Send, 
  Eye, 
  Edit,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CollaborationPanelProps {
  projectId: string;
  currentUser?: any;
}

export const CollaborationPanel = ({ projectId, currentUser }: CollaborationPanelProps) => {
  const [comments, setComments] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    fetchCollaborators();
    setupRealtimeSubscription();
  }, [projectId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('webgis_comments')
        .select(`
          *,
          user_id,
          profiles!inner(full_name, first_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('webgis_shared_projects')
        .select(`
          *,
          profiles!inner(full_name, first_name, plan)
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webgis_comments',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          setComments(prev => [payload.new as any, ...prev]);
        }
      )
      .on(
        'presence',
        { event: 'sync' },
        () => {
          const state = channel.presenceState();
          const users = Object.keys(state);
          setOnlineUsers(users);
        }
      )
      .subscribe();

    // Track user presence
    if (currentUser) {
      channel.track({
        user_id: currentUser.id,
        user_name: currentUser.full_name || currentUser.email
      });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    try {
      const { error } = await supabase
        .from('webgis_comments')
        .insert({
          project_id: projectId,
          user_id: currentUser.id,
          content: newComment,
          comment_type: 'general'
        });

      if (error) throw error;

      setNewComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully.'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleShareProject = async () => {
    if (!shareEmail.trim()) return;

    try {
      const { error } = await supabase
        .from('webgis_shared_projects')
        .insert({
          project_id: projectId,
          shared_by: currentUser?.id,
          user_id: '', // Would need to lookup by email
          permission_level: 'view'
        });

      if (error) throw error;

      setShareEmail('');
      toast({
        title: 'Project shared',
        description: `Invitation sent to ${shareEmail}`
      });
      fetchCollaborators();
    } catch (error) {
      console.error('Error sharing project:', error);
      toast({
        title: 'Error',
        description: 'Failed to share project. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const copyProjectLink = () => {
    const projectUrl = `${window.location.origin}/dashboard/${projectId}`;
    navigator.clipboard.writeText(projectUrl);
    toast({
      title: 'Link copied',
      description: 'Project link has been copied to clipboard.'
    });
  };

  return (
    <div className="space-y-4 h-full overflow-auto">
      {/* Online Collaborators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Collaborators ({onlineUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {onlineUsers.map((userId, index) => (
              <div key={userId} className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">U{index + 1}</AvatarFallback>
                </Avatar>
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <p className="text-xs text-muted-foreground">No active collaborators</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Share Project */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Share Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="text-sm"
            />
            <Button size="sm" onClick={handleShareProject}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyProjectLink}
            className="w-full"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Project Link
          </Button>

          {collaborators.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium">Current Collaborators:</p>
              {collaborators.map((collab) => (
                <div key={collab.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {collab.profiles?.first_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{collab.profiles?.full_name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {collab.permission_level === 'edit' ? <Edit className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add Comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="text-sm h-20"
            />
            <Button 
              size="sm" 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>

          <Separator />

          {/* Comments List */}
          <div className="space-y-3 max-h-60 overflow-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {comment.profiles?.first_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">
                    {comment.profiles?.full_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground ml-7">
                  {comment.content}
                </p>
              </div>
            ))}
            
            {comments.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No comments yet. Start the conversation!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};