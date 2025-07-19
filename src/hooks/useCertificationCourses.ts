import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CertificationCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  requirements: string[];
  price: number;
  is_blockchain_verified: boolean;
  rating: number;
  students_enrolled: number;
  estimated_launch: string;
  features: string[];
  is_active: boolean;
}

export const useCertificationCourses = () => {
  const [courses, setCourses] = useState<CertificationCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificationCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certification_courses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching certification courses:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificationCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    refetch: fetchCertificationCourses
  };
};