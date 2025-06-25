
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Pin, Reply } from 'lucide-react';
import { useDiscussions } from '@/hooks/useDiscussions';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface DiscussionThreadProps {
  contentType: string;
  contentId: string;
  className?: string;
}

export const DiscussionThread: React.FC<DiscussionThreadProps> = ({
  contentType,
  contentId,
  className = ''
}) => {
  const { user } = useAuth();
  const { discussions, loading, createDiscussion, toggleLike } = useDiscussions(contentType, contentId);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to join the discussion.</p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    await createDiscussion(newComment);
    setNewComment('');
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    await createDiscussion(replyContent, parentId);
    setReplyContent('');
    setReplyingTo(null);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-12 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Discussion ({discussions.length})</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Share your thoughts or ask a question..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              Post Comment
            </Button>
          </div>

          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div key={discussion.id} className="space-y-3">
                <Card className={discussion.is_pinned ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={discussion.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {discussion.profiles?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {discussion.profiles?.full_name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                          </span>
                          {discussion.is_pinned && (
                            <Pin className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {discussion.content}
                        </p>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(discussion.id)}
                            className={`text-xs ${discussion.user_has_liked ? 'text-red-500' : ''}`}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${discussion.user_has_liked ? 'fill-current' : ''}`} />
                            {discussion.likes_count}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(discussion.id)}
                            className="text-xs"
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Replies */}
                {discussion.replies && discussion.replies.length > 0 && (
                  <div className="ml-8 space-y-2">
                    {discussion.replies.map((reply) => (
                      <Card key={reply.id} className="bg-muted/50">
                        <CardContent className="p-3">
                          <div className="flex space-x-3">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={reply.profiles?.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {reply.profiles?.full_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {reply.profiles?.full_name || 'Anonymous'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {reply.content}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleLike(reply.id)}
                                className={`text-xs ${reply.user_has_liked ? 'text-red-500' : ''}`}
                              >
                                <Heart className={`h-3 w-3 mr-1 ${reply.user_has_liked ? 'fill-current' : ''}`} />
                                {reply.likes_count}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === discussion.id && (
                  <div className="ml-8 space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(discussion.id)}
                        disabled={!replyContent.trim()}
                      >
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
