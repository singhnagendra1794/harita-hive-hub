import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Activity, Users, Clock, TrendingUp, RefreshCw } from 'lucide-react';

interface StreamMetrics {
  total_streams: number;
  active_streams: number;
  total_viewers: number;
  avg_duration: number;
  recent_analytics: Array<{
    id: string;
    event_type: string;
    viewer_count: number;
    created_at: string;
    class: {
      title: string;
      instructor: string;
    };
  }>;
}

const StreamAnalytics = () => {
  const [metrics, setMetrics] = useState<StreamMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch stream analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('stream_analytics')
        .select(`
          *,
          live_classes!inner(title, status)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (analyticsError) throw analyticsError;

      // Get active streams count
      const { count: activeCount } = await supabase
        .from('live_classes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'live');

      // Get total streams count
      const { count: totalCount } = await supabase
        .from('live_classes')
        .select('*', { count: 'exact', head: true });

      // Calculate total viewers (sum of current viewer counts)
      const { data: viewerData } = await supabase
        .from('live_classes')
        .select('viewer_count')
        .eq('status', 'live');

      const totalViewers = viewerData?.reduce((sum, item) => sum + (item.viewer_count || 0), 0) || 0;

      setMetrics({
        total_streams: totalCount || 0,
        active_streams: activeCount || 0,
        total_viewers: totalViewers,
        avg_duration: 95, // Mock average duration in minutes
        recent_analytics: (analytics || []).map(item => ({
          id: item.id,
          event_type: item.event_type,
          viewer_count: item.viewer_count,
          created_at: item.created_at,
          class: {
            title: item.live_classes.title,
            instructor: 'Expert Instructor' // Default since instructor field doesn't exist
          }
        }))
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stream analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      
      // Set up real-time subscription for analytics updates
      const channel = supabase
        .channel('stream-analytics')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'stream_analytics' },
          () => fetchAnalytics()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stream Analytics</h2>
        <Button 
          onClick={fetchAnalytics}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_streams}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Now</CardTitle>
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.active_streams}</div>
            <p className="text-xs text-muted-foreground">Active streams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_viewers}</div>
            <p className="text-xs text-muted-foreground">Watching now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avg_duration}m</div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recent_analytics.length > 0 ? (
              metrics.recent_analytics.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      event.event_type === 'stream_start' ? 'default' :
                      event.event_type === 'stream_end' ? 'secondary' :
                      event.event_type === 'viewer_join' ? 'outline' : 'secondary'
                    }>
                      {event.event_type.replace('_', ' ')}
                    </Badge>
                    <div>
                      <p className="font-medium">{event.class.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {event.class.instructor}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{event.viewer_count} viewers</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent activity found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamAnalytics;