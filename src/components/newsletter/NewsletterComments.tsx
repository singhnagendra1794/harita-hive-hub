import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Reply, Heart, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  author?: {
    full_name: string;
    email: string;
  };
  replies?: Comment[];
}

interface NewsletterCommentsProps {
  postId: string;
  onCommentAdded?: () => void;
}

export const NewsletterComments: React.FC<NewsletterCommentsProps> = ({ 
  postId, 
  onCommentAdded 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      const { data: commentsData, error } = await supabase
        .from('newsletter_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get author information for each comment
      const commentsWithAuthors = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: authorData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', comment.user_id)
            .single();

          const { data: userEmail } = await supabase.auth.admin.getUserById(comment.user_id);

          return {
            ...comment,
            author: {
              full_name: authorData?.full_name || userEmail?.user?.email?.split('@')[0] || 'Anonymous',
              email: userEmail?.user?.email || ''
            }
          };
        })
      );

      // Organize comments into a tree structure
      const topLevelComments = commentsWithAuthors.filter(c => !c.parent_id);
      const commentTree = topLevelComments.map(comment => ({
        ...comment,
        replies: commentsWithAuthors.filter(c => c.parent_id === comment.id)
      }));

      setComments(commentTree);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('newsletter_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId || null
        });

      if (error) throw error;

      // Clear form
      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }

      // Refresh comments
      await fetchComments();
      onCommentAdded?.();

      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ 
    comment, 
    isReply = false 
  }) => (
    <div className={`space-y-3 ${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {comment.author?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-sm">{comment.author?.full_name || 'Anonymous'}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
          
          {!isReply && (
            <div className="flex items-center space-x-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="h-6 px-2 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>
          )}
          
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px]"
              />
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmitComment(replyContent, comment.id)}
                  disabled={submitting || !replyContent.trim()}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4 pt-4 border-t">
        <div className="animate-pulse space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="rounded-full bg-muted h-8 w-8"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-24"></div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* New Comment Form */}
      {user && (
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user.email?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px]"
              />
              <Button
                onClick={() => handleSubmitComment(newComment)}
                disabled={submitting || !newComment.trim()}
                size="sm"
              >
                <Send className="h-3 w-3 mr-1" />
                {submitting ? 'Posting...' : 'Comment'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};