import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TrendingSkill {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TrendingJob {
  title: string;
  company: string;
  location: string;
  posted: string;
}

export interface TrendingNews {
  title: string;
  url: string;
  source: string;
  published: string;
  summary: string;
}

export interface TrendingData {
  skills: TrendingSkill[];
  jobs: TrendingJob[];
  news: TrendingNews[];
}

export const useTrendingData = () => {
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: functionError } = await supabase.functions.invoke('scrape-trending');

      if (functionError) {
        throw functionError;
      }

      if (result?.data) {
        setData(result.data);
      } else {
        throw new Error('No data received from trending function');
      }
    } catch (err) {
      console.error('Error fetching trending data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending data');
      
      // Fallback data in case of error
      setData({
        skills: [
          { name: "Python for GIS", count: 156, trend: "up" },
          { name: "QGIS Advanced", count: 142, trend: "up" },
          { name: "ArcGIS Pro", count: 138, trend: "stable" },
          { name: "Remote Sensing", count: 125, trend: "up" }
        ],
        jobs: [
          {
            title: "Senior GIS Analyst",
            company: "Tech Corp",
            location: "Remote",
            posted: new Date().toISOString()
          }
        ],
        news: [
          {
            title: "GIS Technology Trends 2025",
            url: "#",
            source: "GeoTech Today",
            published: new Date().toISOString(),
            summary: "Exploring the latest trends in GIS technology."
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchTrendingData
  };
};