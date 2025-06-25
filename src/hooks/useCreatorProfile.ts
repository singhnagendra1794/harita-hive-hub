
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreatorProfile {
  id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  specialties?: string[];
  social_links?: any[];
  is_verified: boolean;
  follower_count: number;
  created_at: string;
}

interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export const useCreatorProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<UserFollow[]>([]);
  const [following, setFollowing] = useState<UserFollow[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchFollowStatus();
      fetchFollowData();
    }
  }, [targetUserId]);

  const fetchProfile = async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching creator profile:', error);
    }
  };

  const fetchFollowStatus = async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const fetchFollowData = async () => {
    if (!targetUserId) return;

    try {
      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from('user_follows')
          .select(`
            *,
            profiles!user_follows_follower_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq('following_id', targetUserId),
        supabase
          .from('user_follows')
          .select(`
            *,
            profiles!user_follows_following_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq('follower_id', targetUserId)
      ]);

      setFollowers(followersRes.data || []);
      setFollowing(followingRes.data || []);
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateProfile = async (profileData: Partial<CreatorProfile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error creating/updating profile:', error);
    }
  };

  const toggleFollow = async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    try {
      if (isFollowing) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
      } else {
        await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });
      }

      setIsFollowing(!isFollowing);
      await fetchProfile(); // Refresh to get updated follower count
      await fetchFollowData();
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return {
    profile,
    isFollowing,
    followers,
    following,
    loading,
    createOrUpdateProfile,
    toggleFollow
  };
};
