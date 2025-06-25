
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Discussion {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  parent_id?: string;
  content: string;
  likes_count: number;
  is_pinned: boolean;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  user_has_liked: boolean;
  replies?: Discussion[];
}

export const useDiscussions = (contentType: string, contentId: string) => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscussions();
  }, [contentType, contentId]);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles!discussions_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .is('parent_id', null)
        .eq('is_deleted', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch replies for each discussion
      const discussionsWithReplies = await Promise.all(
        (data || []).map(async (discussion) => {
          const { data: replies } = await supabase
            .from('discussions')
            .select(`
              *,
              profiles!discussions_user_id_fkey (
                full_name,
                avatar_url
              )
            `)
            .eq('parent_id', discussion.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

          // Check if user has liked each discussion
          const userLikes = user ? await supabase
            .from('discussion_likes')
            .select('discussion_id')
            .eq('user_id', user.id)
            .in('discussion_id', [discussion.id, ...(replies || []).map(r => r.id)]) : { data: [] };

          const likedIds = new Set(userLikes.data?.map(like => like.discussion_id) || []);

          return {
            ...discussion,
            likes_count: discussion.likes_count || 0,
            is_pinned: discussion.is_pinned || false,
            user_has_liked: likedIds.has(discussion.id),
            profiles: discussion.profiles || null,
            replies: (replies || []).map(reply => ({
              ...reply,
              likes_count: reply.likes_count || 0,
              is_pinned: reply.is_pinned || false,
              user_has_liked: likedIds.has(reply.id),
              profiles: reply.profiles || null
            }))
          };
        })
      );

      setDiscussions(discussionsWithReplies);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDiscussion = async (content: string, parentId?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('discussions')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          parent_id: parentId || null,
          content: content
        });

      if (error) throw error;
      await fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const toggleLike = async (discussionId: string) => {
    if (!user) return;

    try {
      const { data: existingLike } = await supabase
        .from('discussion_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('discussion_id', discussionId)
        .single();

      if (existingLike) {
        await supabase
          .from('discussion_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        await supabase
          .from('discussion_likes')
          .insert({
            user_id: user.id,
            discussion_id: discussionId
          });
      }

      await fetchDiscussions();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return {
    discussions,
    loading,
    createDiscussion,
    toggleLike,
    refetch: fetchDiscussions
  };
};
