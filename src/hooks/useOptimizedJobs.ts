import { useState, useCallback } from 'react';
import { useQueryCache } from '@/hooks/useCache';
import { useOptimizedSearch, useDebounce } from '@/hooks/useOptimization';
import { supabase } from '@/integrations/supabase/client';

export interface OptimizedJobsData {
  jobs: any[];
  stats: any;
  loading: boolean;
  error: string | null;
}

// Optimized version of job fetching with caching and pagination
export const useOptimizedJobs = (searchTerm: string = '', filters: any = {}) => {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Generate cache key based on search and filters
  const cacheKey = `jobs-${debouncedSearch}-${JSON.stringify(filters)}-${page}`;

  // Optimized query function with pagination
  const fetchJobs = useCallback(async () => {
    const { data: jobs, error } = await supabase
      .from('job_postings_ai')
      .select('*')
      .ilike('title', `%${debouncedSearch}%`)
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order('posted_date', { ascending: false });

    if (error) throw error;

    // Fetch stats separately with lighter query
    const { data: statsData } = await supabase
      .from('job_postings_ai')
      .select('remote_allowed, is_verified, salary_max')
      .limit(1000); // Limit for stats calculation

    const stats = {
      total_jobs: jobs?.length || 0,
      remote_opportunities: statsData?.filter(j => j.remote_allowed).length || 0,
      verified_companies: statsData?.filter(j => j.is_verified).length || 0,
      avg_salary: Math.round(
        (statsData?.reduce((sum, job) => sum + (job.salary_max || 0), 0) || 0) / (statsData?.length || 1)
      )
    };

    return { jobs: jobs || [], stats };
  }, [debouncedSearch, page, pageSize]);

  // Use cache for better performance
  const { data, isLoading, error, refetch } = useQueryCache(
    cacheKey,
    fetchJobs,
    { staleTime: 300000, cacheTime: 600000 } // 5 min stale, 10 min cache
  );

  return {
    jobs: data?.jobs || [],
    stats: data?.stats || {},
    loading: isLoading,
    error: error?.message || null,
    refetch,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    currentPage: page
  };
};