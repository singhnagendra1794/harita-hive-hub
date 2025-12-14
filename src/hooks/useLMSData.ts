import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LMSCourse {
  id: string;
  title: string;
  description: string | null;
  course_fee: number;
  is_free: boolean;
  thumbnail_url: string | null;
  category: string | null;
  status: string;
  created_at: string;
}

interface LMSBatch {
  id: string;
  course_id: string;
  batch_name: string;
  batch_number: number;
  teacher_id: string | null;
  start_date: string | null;
  end_date: string | null;
  max_students: number;
  current_enrollments: number;
  is_active: boolean;
}

interface BatchEnrollment {
  batch_id: string;
  batch_name: string;
  course_title: string;
  course_id: string;
  payment_status: string;
  start_date: string | null;
  end_date: string | null;
}

interface TeacherBatch {
  batch_id: string;
  batch_name: string;
  course_title: string;
  course_id: string;
  student_count: number;
  start_date: string | null;
  end_date: string | null;
}

interface BatchLiveSession {
  id: string;
  batch_id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string | null;
  meeting_platform: string;
  status: string;
}

interface BatchRecording {
  id: string;
  batch_id: string;
  title: string;
  description: string | null;
  video_url: string;
  video_platform: string;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  order_index: number;
}

interface BatchStudyMaterial {
  id: string;
  batch_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  category: string;
  order_index: number;
}

export const useLMSData = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<LMSCourse[]>([]);
  const [batches, setBatches] = useState<LMSBatch[]>([]);
  const [enrolledBatches, setEnrolledBatches] = useState<BatchEnrollment[]>([]);
  const [teacherBatches, setTeacherBatches] = useState<TeacherBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch published courses
  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('lms_courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message);
    }
  };

  // Fetch batches for a course
  const fetchBatchesForCourse = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('lms_batches')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .order('batch_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching batches:', err);
      return [];
    }
  };

  // Fetch user's enrolled batches
  const fetchEnrolledBatches = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_batches', { p_user_id: user.id });

      if (error) throw error;
      setEnrolledBatches(data || []);
    } catch (err: any) {
      console.error('Error fetching enrolled batches:', err);
    }
  };

  // Fetch teacher's assigned batches
  const fetchTeacherBatches = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_teacher_batches', { p_user_id: user.id });

      if (error) throw error;
      setTeacherBatches(data || []);
    } catch (err: any) {
      console.error('Error fetching teacher batches:', err);
    }
  };

  // Fetch live sessions for a batch
  const fetchBatchLiveSessions = async (batchId: string): Promise<BatchLiveSession[]> => {
    try {
      const { data, error } = await supabase
        .from('batch_live_sessions')
        .select('*')
        .eq('batch_id', batchId)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching live sessions:', err);
      return [];
    }
  };

  // Fetch recordings for a batch
  const fetchBatchRecordings = async (batchId: string): Promise<BatchRecording[]> => {
    try {
      const { data, error } = await supabase
        .from('batch_recordings')
        .select('*')
        .eq('batch_id', batchId)
        .eq('is_available', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching recordings:', err);
      return [];
    }
  };

  // Fetch study materials for a batch
  const fetchBatchMaterials = async (batchId: string): Promise<BatchStudyMaterial[]> => {
    try {
      const { data, error } = await supabase
        .from('batch_study_materials')
        .select('*')
        .eq('batch_id', batchId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching materials:', err);
      return [];
    }
  };

  // Check if user has access to a batch
  const hasBatchAccess = async (batchId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('has_batch_access', { 
          p_user_id: user.id, 
          p_batch_id: batchId 
        });

      if (error) throw error;
      return data || false;
    } catch (err: any) {
      console.error('Error checking batch access:', err);
      return false;
    }
  };

  // Enroll user in a batch (creates pending enrollment)
  const enrollInBatch = async (batchId: string, courseId: string, amount: number) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('batch_enrollments')
      .insert({
        user_id: user.id,
        batch_id: batchId,
        course_id: courseId,
        payment_status: 'pending',
        payment_amount: amount
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Check if user is a teacher
  const isTeacher = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('is_lms_teacher', { p_user_id: user.id });

      if (error) throw error;
      return data || false;
    } catch (err: any) {
      console.error('Error checking teacher status:', err);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCourses(),
        fetchEnrolledBatches(),
        fetchTeacherBatches()
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    } else {
      // Still fetch courses for non-authenticated users
      fetchCourses().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    courses,
    batches,
    enrolledBatches,
    teacherBatches,
    loading,
    error,
    fetchCourses,
    fetchBatchesForCourse,
    fetchEnrolledBatches,
    fetchTeacherBatches,
    fetchBatchLiveSessions,
    fetchBatchRecordings,
    fetchBatchMaterials,
    hasBatchAccess,
    enrollInBatch,
    isTeacher,
    refetch: () => {
      fetchCourses();
      fetchEnrolledBatches();
      fetchTeacherBatches();
    }
  };
};

export type { 
  LMSCourse, 
  LMSBatch, 
  BatchEnrollment,
  TeacherBatch,
  BatchLiveSession, 
  BatchRecording, 
  BatchStudyMaterial 
};
