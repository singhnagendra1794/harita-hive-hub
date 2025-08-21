import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Trash2,
  Send,
  MoreHorizontal,
  Calendar,
  Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdminAccess } from '@/hooks/useSuperAdminAccess';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { htmlSanitizer } from '@/lib/htmlSanitizer';
import { NewsletterComments } from './NewsletterComments';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NewsletterPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  likes_count: number;
  comments_count: number;
  user_liked?: boolean;
  author?: {
    full_name: string;
    email: string;
  };
}

interface NewsletterFeedProps {
  onPostUpdate?: () => void;
}

export const NewsletterFeed: React.FC<NewsletterFeedProps> = ({ onPostUpdate }) => {
  const { user } = useAuth();
  const { isSuperAdmin } = useSuperAdminAccess();
  const { toast } = useToast();
  const [posts, setPosts] = useState<NewsletterPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [showingComments, setShowingComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts with author information and user's like status
      const { data: postsData, error } = await supabase
        .from('newsletter_posts')
        .select(`
          *,
          newsletter_likes!left(user_id)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get author information for each post
      const postsWithAuthors = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profileData } = await supabase
            .rpc('get_user_profile_for_stream', { p_user_id: post.user_id })
            .single();

          return {
            ...post,
            user_liked: post.newsletter_likes?.some((like: any) => like.user_id === user?.id) || false,
            author: {
              full_name: profileData?.full_name || profileData?.email?.split('@')[0] || 'Anonymous',
              email: profileData?.email || ''
            }
          };
        })
      );

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load newsletter posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        // Unlike
        const { error } = await supabase
          .from('newsletter_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('newsletter_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
      }

      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                user_liked: !p.user_liked,
                likes_count: p.user_liked ? p.likes_count - 1 : p.likes_count + 1
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      setDeletingPost(postId);
      
      const { error } = await supabase
        .from('newsletter_posts')
        .update({ is_deleted: true })
        .eq('id', postId);

      if (error) throw error;

      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      
      toast({
        title: "Post Deleted",
        description: "The newsletter post has been deleted successfully",
      });

      onPostUpdate?.();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setDeletingPost(null);
      setShowDeleteDialog(false);
      setPostToDelete(null);
    }
  };

  const confirmDelete = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteDialog(true);
  };

  const toggleComments = (postId: string) => {
    setShowingComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const canDeletePost = (post: NewsletterPost) => {
    return isSuperAdmin || post.user_id === user?.id;
  };

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const toggleExpanded = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-muted h-10 w-10"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-6 bg-muted rounded w-16"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your newsletter with the community!
            </p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {post.author?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.author?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                {canDeletePost(post) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isSuperAdmin && (
                        <DropdownMenuItem 
                          onClick={() => confirmDelete(post.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                
                {post.cover_image_url && (
                  <img 
                    src={post.cover_image_url} 
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                
                <div className="prose prose-sm max-w-none">
                  {expandedPosts.has(post.id) ? (
                    <div dangerouslySetInnerHTML={{ __html: htmlSanitizer.sanitizeNewsletterHTML(post.content) }} />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: htmlSanitizer.sanitizeNewsletterHTML(truncateContent(post.content)) }} />
                  )}
                  
                  {post.content.length > 300 && (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary"
                      onClick={() => toggleExpanded(post.id)}
                    >
                      {expandedPosts.has(post.id) ? 'Show less' : 'Read more'}
                    </Button>
                  )}
                </div>
              </div>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={post.user_liked ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2"
                  >
                    <Heart className={`h-4 w-4 ${post.user_liked ? 'fill-current' : ''}`} />
                    <span>{post.likes_count}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments_count}</span>
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showingComments.has(post.id) && (
                <NewsletterComments 
                  postId={post.id} 
                  onCommentAdded={() => {
                    // Update comment count
                    setPosts(prevPosts => 
                      prevPosts.map(p => 
                        p.id === post.id 
                          ? { ...p, comments_count: p.comments_count + 1 }
                          : p
                      )
                    );
                  }}
                />
              )}
            </CardContent>
          </Card>
        ))
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Newsletter Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this newsletter post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && handleDeletePost(postToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};