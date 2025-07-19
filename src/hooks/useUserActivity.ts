import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserActivity {
  id: string;
  activity_type: string;
  created_at: string;
  metadata: any;
}

interface ActivityDisplay {
  title: string;
  date: string;
  icon?: string;
}

export const useUserActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserActivity();
    }
  }, [user]);

  const fetchUserActivity = async () => {
    if (!user) return;

    try {
      // Fetch from multiple sources to build comprehensive activity feed
      const [
        enrollmentData,
        waitlistData,
        feedbackData,
        challengeData,
        communityData
      ] = await Promise.all([
        // Course enrollments
        supabase
          .from('enrollments')
          .select('course_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Waitlist entries
        supabase
          .from('course_waitlist')
          .select('course_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Feedback submissions
        supabase
          .from('content_feedback')
          .select('content_type, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Challenge participations
        supabase
          .from('challenge_participants')
          .select('challenge_name, created_at, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Community posts
        supabase
          .from('community_posts')
          .select('title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const activityFeed: ActivityDisplay[] = [];

      // Process enrollments
      if (enrollmentData.data) {
        enrollmentData.data.forEach(enrollment => {
          activityFeed.push({
            title: `Enrolled in ${enrollment.course_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} course`,
            date: formatRelativeTime(enrollment.created_at)
          });
        });
      }

      // Process waitlist entries
      if (waitlistData.data) {
        waitlistData.data.forEach(waitlist => {
          activityFeed.push({
            title: `Joined waitlist for ${waitlist.course_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            date: formatRelativeTime(waitlist.created_at)
          });
        });
      }

      // Process feedback
      if (feedbackData.data) {
        feedbackData.data.forEach(feedback => {
          activityFeed.push({
            title: `Submitted feedback for ${feedback.content_type}`,
            date: formatRelativeTime(feedback.created_at)
          });
        });
      }

      // Process challenges
      if (challengeData.data) {
        challengeData.data.forEach(challenge => {
          const action = challenge.status === 'submitted' ? 'Submitted' : 'Registered for';
          activityFeed.push({
            title: `${action} ${challenge.challenge_name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} challenge`,
            date: formatRelativeTime(challenge.created_at)
          });
        });
      }

      // Process community posts
      if (communityData.data) {
        communityData.data.forEach(post => {
          activityFeed.push({
            title: `Posted "${post.title}" in community`,
            date: formatRelativeTime(post.created_at)
          });
        });
      }

      // Sort by date and limit to 10 most recent
      activityFeed.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });

      setActivities(activityFeed.slice(0, 10));
    } catch (error) {
      console.error('Error fetching user activity:', error);
      // Fallback to static activities if API fails
      setActivities([
        { title: "Welcome to Harita Hive! Start exploring GIS courses", date: "Just now" },
        { title: "Check out our Professional Plan features", date: "Today" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return { activities, loading, refetch: fetchUserActivity };
};