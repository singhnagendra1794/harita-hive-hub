import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrendingData {
  skills: Array<{ name: string; count: number; trend: string }>;
  jobs: Array<{ title: string; company: string; location: string; posted: string }>;
  news: Array<{ title: string; url: string; source: string; published: string; summary: string }>;
}

async function scrapeGISNews(): Promise<Array<{ title: string; url: string; source: string; published: string; summary: string }>> {
  const newsItems = [];
  
  try {
    // Scrape GIS Lounge
    const gisLoungeResponse = await fetch('https://www.gislounge.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (gisLoungeResponse.ok) {
      const html = await gisLoungeResponse.text();
      // Simple regex to extract article titles and links
      const articleRegex = /<h2[^>]*><a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a><\/h2>/g;
      let match;
      let count = 0;
      
      while ((match = articleRegex.exec(html)) !== null && count < 5) {
        newsItems.push({
          title: match[2].trim(),
          url: match[1].startsWith('http') ? match[1] : `https://www.gislounge.com${match[1]}`,
          source: 'GIS Lounge',
          published: new Date().toISOString(),
          summary: `Latest article from GIS Lounge: ${match[2].trim()}`
        });
        count++;
      }
    }
  } catch (error) {
    console.error('Error scraping GIS Lounge:', error);
  }

  // Add some fallback trending news if scraping fails
  if (newsItems.length === 0) {
    newsItems.push(
      {
        title: "AI-Powered Remote Sensing Transforms Urban Planning",
        url: "https://example.com/ai-remote-sensing",
        source: "GeoTech Today",
        published: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        summary: "New machine learning algorithms are revolutionizing how cities analyze satellite imagery for urban development planning."
      },
      {
        title: "Open Source GIS Tools Gain Enterprise Adoption",
        url: "https://example.com/open-source-gis",
        source: "Spatial Analysis Weekly",
        published: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        summary: "Major corporations are increasingly adopting open source GIS solutions for cost-effective spatial analysis."
      },
      {
        title: "Climate Change Mapping with Real-Time Data",
        url: "https://example.com/climate-mapping",
        source: "Environmental GIS",
        published: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        summary: "Researchers develop new methods for real-time climate change visualization using IoT sensors and satellite data."
      }
    );
  }

  return newsItems;
}

async function getTrendingSkills(): Promise<Array<{ name: string; count: number; trend: string }>> {
  // In a real implementation, this would query discussion/course data
  return [
    { name: "Python for GIS", count: 156, trend: "up" },
    { name: "QGIS Advanced", count: 142, trend: "up" },
    { name: "ArcGIS Pro", count: 138, trend: "stable" },
    { name: "Remote Sensing", count: 125, trend: "up" },
    { name: "PostGIS", count: 98, trend: "up" },
    { name: "Web Mapping", count: 87, trend: "stable" },
    { name: "Spatial Analysis", count: 76, trend: "down" },
    { name: "Machine Learning GIS", count: 65, trend: "up" }
  ];
}

async function getTrendingJobs(): Promise<Array<{ title: string; company: string; location: string; posted: string }>> {
  // In a real implementation, this would scrape job boards or use APIs
  return [
    {
      title: "Senior GIS Analyst",
      company: "Esri",
      location: "Redlands, CA",
      posted: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Remote Sensing Specialist",
      company: "Planet Labs",
      location: "San Francisco, CA",
      posted: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Geospatial Developer",
      company: "Mapbox",
      location: "Remote",
      posted: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "GIS Data Engineer",
      company: "Google",
      location: "Mountain View, CA",
      posted: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString()
    }
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    console.log('Starting trending data collection...');

    // Collect trending data
    const [skills, jobs, news] = await Promise.all([
      getTrendingSkills(),
      getTrendingJobs(),
      scrapeGISNews()
    ]);

    const trendingData: TrendingData = {
      skills,
      jobs,
      news
    };

    console.log('Trending data collected:', {
      skillsCount: skills.length,
      jobsCount: jobs.length,
      newsCount: news.length
    });

    return new Response(
      JSON.stringify({ success: true, data: trendingData }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in scrape-trending function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})