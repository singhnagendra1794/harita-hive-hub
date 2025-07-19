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
      // Fetch from sources where we have permissions
      const activityFeed: ActivityDisplay[] = [];

      // Try to fetch course enrollments (may fail due to RLS)
      try {
        const enrollmentData = await supabase
          .from('course_enrollments')
          .select('course_id, enrolled_at')
          .eq('user_id', user.id)
          .order('enrolled_at', { ascending: false })
          .limit(5);
        
        if (enrollmentData.data) {
          enrollmentData.data.forEach(enrollment => {
            activityFeed.push({
              title: `Enrolled in ${enrollment.course_id ? enrollment.course_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'a'} course`,
              date: formatRelativeTime(enrollment.enrolled_at)
            });
          });
        }
      } catch (error) {
        console.warn('Failed to fetch course enrollments:', error);
      }

      // Try to fetch feedback submissions (should work)
      try {
        const feedbackData = await supabase
          .from('content_feedback')
          .select('content_type, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (feedbackData.data) {
          feedbackData.data.forEach(feedback => {
            activityFeed.push({
              title: `Submitted feedback for ${feedback.content_type}`,
              date: formatRelativeTime(feedback.created_at)
            });
          });
        }
      } catch (error) {
        console.warn('Failed to fetch feedback data:', error);
      }

      // Try to fetch community posts (should work)
      try {
        const communityData = await supabase
          .from('community_posts')
          .select('title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (communityData.data) {
          communityData.data.forEach(post => {
            activityFeed.push({
              title: `Posted "${post.title}" in community`,
              date: formatRelativeTime(post.created_at)
            });
          });
        }
      } catch (error) {
        console.warn('Failed to fetch community posts:', error);
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