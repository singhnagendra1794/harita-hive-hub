import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type ActivityType = 
  | 'tool_upload' 
  | 'code_share' 
  | 'note_share' 
  | 'challenge_join' 
  | 'post_create' 
  | 'comment_create' 
  | 'like_give' 
  | 'course_complete';

export const useActivityTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const trackActivity = async (
    activityType: ActivityType, 
    metadata: Record<string, any> = {}
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('track_user_activity', {
        p_user_id: user.id,
        p_activity_type: activityType,
        p_metadata: metadata
      });

      if (error) throw error;

      // Show toast for significant activities
      const significantActivities = ['tool_upload', 'challenge_join', 'course_complete'];
      if (significantActivities.includes(activityType)) {
        const activityNames = {
          tool_upload: 'Tool uploaded',
          challenge_join: 'Challenge joined',
          course_complete: 'Course completed'
        };
        
        const points = {
          tool_upload: 10,
          challenge_join: 8,
          course_complete: 15
        };

        toast({
          title: "Activity Recorded! 🎉",
          description: `${activityNames[activityType as keyof typeof activityNames]} (+${points[activityType as keyof typeof points]} points)`,
        });
      }
    } catch (error: any) {
      console.error('Error tracking activity:', error);
    }
  };

  return { trackActivity };
};

// Helper functions for common activities
export const ActivityTrackers = {
  toolUpload: (metadata: { tool_name?: string; category?: string } = {}) => 
    ({ activityType: 'tool_upload' as ActivityType, metadata }),
  
  codeShare: (metadata: { title?: string; language?: string } = {}) => 
    ({ activityType: 'code_share' as ActivityType, metadata }),
  
  noteShare: (metadata: { title?: string; category?: string } = {}) => 
    ({ activityType: 'note_share' as ActivityType, metadata }),
  
  challengeJoin: (metadata: { challenge_id?: string; challenge_name?: string } = {}) => 
    ({ activityType: 'challenge_join' as ActivityType, metadata }),
  
  postCreate: (metadata: { post_id?: string; title?: string } = {}) => 
    ({ activityType: 'post_create' as ActivityType, metadata }),
  
  commentCreate: (metadata: { post_id?: string; content_type?: string } = {}) => 
    ({ activityType: 'comment_create' as ActivityType, metadata }),
  
  likeGive: (metadata: { target_id?: string; target_type?: string } = {}) => 
    ({ activityType: 'like_give' as ActivityType, metadata }),
  
  courseComplete: (metadata: { course_id?: string; course_name?: string } = {}) => 
    ({ activityType: 'course_complete' as ActivityType, metadata })
};