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

      // Fetch trending news from database
      const { data: newsData, error: newsError } = await supabase
        .from('trending_news')
        .select('*')
        .order('fetched_at', { ascending: false })
        .order('relevance_score', { ascending: false })
        .limit(20);

      if (newsError) throw newsError;

      // Get trending skills (from old function)
      const { data: scrapingResult, error: functionError } = await supabase.functions.invoke('scrape-trending');

      const skills = scrapingResult?.data?.skills || [
        { name: "Python for GIS", count: 156, trend: "up" },
        { name: "QGIS Advanced", count: 142, trend: "up" },
        { name: "ArcGIS Pro", count: 138, trend: "stable" },
        { name: "Remote Sensing", count: 125, trend: "up" }
      ];

      const jobs = scrapingResult?.data?.jobs || [
        {
          title: "Senior GIS Analyst",
          company: "Tech Corp",
          location: "Remote",
          posted: new Date().toISOString()
        }
      ];

      // Format news from database
      const formattedNews = (newsData || []).map(article => ({
        title: article.title,
        url: article.url,
        source: article.source,
        published: article.published_date,
        summary: article.summary
      }));

      setData({
        skills,
        jobs,
        news: formattedNews.length > 0 ? formattedNews : [
          {
            title: "Loading latest geospatial news...",
            url: "#",
            source: "HaritaHive",
            published: new Date().toISOString(),
            summary: "News is being updated automatically every hour."
          }
        ]
      });
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