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
        .select('id,title,description,duration,difficulty,requirements,price,is_blockchain_verified,rating,students_enrolled,estimated_launch,features,is_active,created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching certification courses:', error);
        // Graceful fallback: show empty list instead of erroring the page
        setCourses([]);
        setError(null);
        return;
      }

      const normalized = (data || []).map((c: any) => ({
        ...c,
        features: Array.isArray(c?.features) ? c.features : [],
        requirements: Array.isArray(c?.requirements) ? c.requirements : [],
        rating: typeof c?.rating === 'string' ? parseFloat(c.rating) : (c?.rating ?? 0),
        price: typeof c?.price === 'string' ? parseFloat(c.price) : (c?.price ?? 0),
        students_enrolled: typeof c?.students_enrolled === 'string' ? parseInt(c.students_enrolled, 10) : (c?.students_enrolled ?? 0),
        difficulty: c?.difficulty ?? 'beginner',
        duration: c?.duration ?? '',
      }));

      setCourses(normalized);
      setError(null);
    } catch (err) {
      console.error('Error fetching certification courses:', err);
      // Graceful fallback to avoid blocking the page
      setCourses([]);
      setError(null);
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