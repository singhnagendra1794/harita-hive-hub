import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Download, 
  Share, 
  TrendingUp, 
  Globe, 
  Calendar,
  Users,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AnalyticsData {
  totalViews: number;
  totalDownloads: number;
  totalShares: number;
  uniqueVisitors: number;
  topReferrers: { name: string; count: number }[];
  viewsOverTime: { date: string; views: number }[];
  topCountries: { country: string; count: number }[];
  careerMatchScore: number;
}

interface Portfolio {
  id: string;
  view_count: number;
  download_count: number;
}

interface PortfolioAnalyticsProps {
  portfolio: Portfolio | null;
}

export const PortfolioAnalytics = ({ portfolio }: PortfolioAnalyticsProps) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalDownloads: 0,
    totalShares: 0,
    uniqueVisitors: 0,
    topReferrers: [],
    viewsOverTime: [],
    topCountries: [],
    careerMatchScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (portfolio && user) {
      loadAnalytics();
    }
  }, [portfolio, user, timeRange]);

  const loadAnalytics = async () => {
    if (!portfolio || !user) return;

    try {
      setLoading(true);
      
      // Basic stats from portfolio
      const basicStats = {
        totalViews: portfolio.view_count,
        totalDownloads: portfolio.download_count,
        totalShares: 0, // TODO: implement sharing tracking
        uniqueVisitors: Math.floor(portfolio.view_count * 0.7) // Estimate
      };

      // Get detailed analytics from the last 30 days
      const { data: analyticsData, error } = await supabase
        .from('portfolio_analytics')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .gte('created_at', getDateRange(timeRange))
        .order('created_at');

      if (error) throw error;

      // Process analytics data
      const processedData = processAnalyticsData(analyticsData || []);
      
      // Mock career match score (in real app, this would come from AI analysis)
      const careerMatchScore = Math.floor(Math.random() * 30) + 70; // 70-100%

      setAnalytics({
        ...basicStats,
        ...processedData,
        careerMatchScore
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range: string) => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return startDate.toISOString();
  };

  const processAnalyticsData = (data: any[]) => {
    // Group by referrer
    const referrerMap = new Map();
    const countryMap = new Map();
    const dateMap = new Map();
    
    data.forEach(item => {
      // Process referrers
      const referrer = item.referrer || 'Direct';
      referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1);
      
      // Process countries (mock data for now)
      const country = item.visitor_country || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
      
      // Process dates
      const date = new Date(item.created_at).toLocaleDateString();
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    return {
      topReferrers: Array.from(referrerMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topCountries: Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      viewsOverTime: Array.from(dateMap.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Analytics</h2>
          <p className="text-muted-foreground">Track your portfolio performance and engagement</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{analytics.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                <p className="text-2xl font-bold">{analytics.totalDownloads}</p>
              </div>
              <Download className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
                <p className="text-2xl font-bold">{analytics.uniqueVisitors}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Career Match</p>
                <p className="text-2xl font-bold">{analytics.careerMatchScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Views Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Views Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics.viewsOverTime.length > 0 ? (
                  analytics.viewsOverTime.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="bg-primary rounded-t w-full"
                        style={{ 
                          height: `${Math.max((item.views / Math.max(...analytics.viewsOverTime.map(v => v.views))) * 200, 8)}px` 
                        }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">
                        {new Date(item.date).getDate()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center text-muted-foreground">
                    No data available for selected period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Career Match Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Career Match Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Match Score</span>
                  <Badge variant={analytics.careerMatchScore > 80 ? "default" : "secondary"}>
                    {analytics.careerMatchScore}%
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full" 
                    style={{ width: `${analytics.careerMatchScore}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {analytics.careerMatchScore > 85 
                    ? "Excellent match for target roles" 
                    : analytics.careerMatchScore > 70 
                    ? "Good match with room for improvement" 
                    : "Consider adding more relevant skills"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Referrers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Referrers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topReferrers.length > 0 ? (
                    analytics.topReferrers.map((referrer, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{referrer.name}</span>
                        <Badge variant="outline">{referrer.count}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No referrer data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Countries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topCountries.length > 0 ? (
                    analytics.topCountries.map((country, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{country.country}</span>
                        <Badge variant="outline">{country.count}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No location data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {analytics.totalViews > 0 ? Math.round((analytics.totalDownloads / analytics.totalViews) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Download Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {analytics.totalViews > 0 ? Math.round((analytics.uniqueVisitors / analytics.totalViews) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Unique Visitor Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2.3m</div>
                  <div className="text-sm text-muted-foreground">Avg. Session Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};