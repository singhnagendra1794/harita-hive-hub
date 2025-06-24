
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ClassEnrollment {
  class_id: string;
  class_title: string;
  class_date: string;
  instructor?: string;
}

export const useClassEnrollment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const enrollInClass = async (classInfo: ClassEnrollment) => {
    if (!user) {
      toast.error('Please log in to enroll in classes');
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('class_enrollments')
        .insert({
          user_id: user.id,
          class_id: classInfo.class_id,
          class_title: classInfo.class_title,
          class_date: classInfo.class_date,
          instructor: classInfo.instructor,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.info('You are already enrolled in this class');
          return false;
        }
        throw error;
      }

      toast.success(`Successfully enrolled in ${classInfo.class_title}`);
      return true;
    } catch (error) {
      console.error('Error enrolling in class:', error);
      toast.error('Failed to enroll in class');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unenrollFromClass = async (classId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('class_enrollments')
        .delete()
        .eq('user_id', user.id)
        .eq('class_id', classId);

      if (error) throw error;

      // Cancel pending email reminders for this class
      await supabase
        .from('email_queue')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .like('email_data', `%"class_id":"${classId}"%`);

      toast.success('Successfully unenrolled from class');
      return true;
    } catch (error) {
      console.error('Error unenrolling from class:', error);
      toast.error('Failed to unenroll from class');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserEnrollments = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('class_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .order('class_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }
  };

  return {
    enrollInClass,
    unenrollFromClass,
    getUserEnrollments,
    loading,
  };
};
