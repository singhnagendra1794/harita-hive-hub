import { useState, useEffect } from 'react';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  description: string;
  requirements: string[];
  skills: string[];
  apply_url: string;
  source_platform: string;
  is_remote: boolean;
  is_india_focused: boolean;
  is_verified: boolean;
  posted_date: string;
  ai_relevance_score: number;
  created_at: string;
}

export const useJobListings = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Mock data for now - will be replaced with real Supabase data once types are updated
      const mockJobs: JobListing[] = [
        {
          id: '1',
          title: 'GIS Analyst - Smart Cities Project',
          company: 'Ministry of Housing and Urban Affairs',
          location: 'New Delhi, India',
          job_type: 'full-time',
          experience_level: 'mid',
          salary_min: 800000,
          salary_max: 1200000,
          currency: 'INR',
          description: 'Work on Smart Cities Mission projects using GIS technology for urban planning and development.',
          requirements: ['Bachelor degree in Geography/GIS', '3+ years GIS experience'],
          skills: ['ArcGIS', 'QGIS', 'Urban Planning', 'Spatial Analysis'],
          apply_url: 'https://www.sarkariresult.com/gis-analyst-smart-cities',
          source_platform: 'government',
          is_remote: false,
          is_india_focused: true,
          is_verified: true,
          posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          ai_relevance_score: 95,
          created_at: new Date().toISOString()
        }
      ];
      
      setJobs(mockJobs);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const refreshJobs = async () => {
    await fetchJobs();
    return { success: true, message: 'Jobs refreshed' };
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    lastUpdated,
    fetchJobs,
    refreshJobs
  };
};