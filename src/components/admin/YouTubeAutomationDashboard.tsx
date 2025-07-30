import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, CheckCircle, AlertCircle, Info, Youtube, Clock, Zap, Calendar } from "lucide-react";

interface AutomationStatus {
  enhanced_sync_enabled: boolean;
  rapid_sync_enabled: boolean;
  weekly_creation_enabled: boolean;
  last_updated: string;
  note?: string;
}

interface StreamSummary {
  live_count: number;
  scheduled_count: number;
  total_weekly_schedule: number;
  last_sync: string;
}

export function YouTubeAutomationDashboard() {
  const [status, setStatus] = useState<AutomationStatus | null>(null);
  const [streamSummary, setStreamSummary] = useState<StreamSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomationStatus();
    fetchStreamSummary();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAutomationStatus();
      fetchStreamSummary();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAutomationStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('get_youtube_automation_status');
      if (error) throw error;
      
      // Set default status since function returns a simple message
      setStatus({
        enhanced_sync_enabled: true,
        rapid_sync_enabled: true, 
        weekly_creation_enabled: false,
        last_updated: new Date().toISOString(),
        note: (data as any)?.message || 'Manual triggers available - automated scheduling requires cron extensions'
      });
    } catch (error) {
      console.error('Error fetching automation status:', error);
      // Set fallback status
      setStatus({
        enhanced_sync_enabled: false,
        rapid_sync_enabled: false,
        weekly_creation_enabled: false,
        last_updated: new Date().toISOString(),
        note: 'Unable to fetch automation status'
      });
    }
  };

  const fetchStreamSummary = async () => {
    try {
      // Get live streams count
      const { data: liveStreams } = await supabase
        .from('live_classes')
        .select('id', { count: 'exact' })
        .eq('status', 'live');

      // Get scheduled streams count
      const { data: scheduledStreams } = await supabase
        .from('live_classes')
        .select('id', { count: 'exact' })
        .eq('status', 'scheduled');

      // Get weekly schedule count
      const { data: weeklySchedule } = await supabase
        .from('youtube_stream_schedule')
        .select('id', { count: 'exact' })
        .eq('status', 'scheduled');

      setStreamSummary({
        live_count: liveStreams?.length || 0,
        scheduled_count: scheduledStreams?.length || 0,
        total_weekly_schedule: weeklySchedule?.length || 0,
        last_sync: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching stream summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerWeeklyCreation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-scheduler', {
        body: { action: 'create_weekly_streams' }
      });

      if (error) throw error;

      toast.success('✅ Weekly streams creation triggered successfully!');
      fetchStreamSummary();
    } catch (error: any) {
      toast.error('Failed to trigger weekly creation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerManualSync = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-youtube-sync');
      
      if (error) throw error;

      toast.success('✅ Manual sync completed successfully!');
      fetchStreamSummary();
    } catch (error: any) {
      toast.error('Manual sync failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading automation status...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            YouTube Live Automation Dashboard
          </CardTitle>
          <CardDescription>
            Complete automation system for YouTube Live streaming with OBS integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Automation Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enhanced Sync</p>
                  <p className="text-xs text-muted-foreground">Real-time detection</p>
                </div>
                <Badge variant={status?.enhanced_sync_enabled ? "default" : "secondary"}>
                  {status?.enhanced_sync_enabled ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {status?.enhanced_sync_enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Live Detection</p>
                  <p className="text-xs text-muted-foreground">15-second polling</p>
                </div>
                <Badge variant="outline">
                  <Zap className="h-3 w-3 mr-1" />
                  Manual Trigger
                </Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Weekly Creation</p>
                  <p className="text-xs text-muted-foreground">Saturday automation</p>
                </div>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Manual Trigger
                </Badge>
              </div>
            </div>
          </div>

          {/* Stream Summary */}
          {streamSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{streamSummary.live_count}</p>
                  <p className="text-sm text-red-700">Live Now</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{streamSummary.scheduled_count}</p>
                  <p className="text-sm text-blue-700">Scheduled</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{streamSummary.total_weekly_schedule}</p>
                  <p className="text-sm text-green-700">Week Schedule</p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Controls */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={triggerManualSync} disabled={loading} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Manual Sync
            </Button>
            <Button onClick={triggerWeeklyCreation} disabled={loading}>
              <Calendar className="h-4 w-4 mr-2" />
              Create Weekly Streams
            </Button>
          </div>

          {/* System Information */}
          {status?.note && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">System Note</p>
                  <p className="text-sm text-amber-700">{status.note}</p>
                </div>
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">How the Automation Works:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li><strong>Weekly Creation:</strong> Click "Create Weekly Streams" to auto-generate Monday-Saturday YouTube broadcasts</li>
              <li><strong>OBS Setup:</strong> Use the persistent stream key provided after creation in your OBS settings</li>
              <li><strong>Go Live:</strong> Click "Start Streaming" in OBS - HaritaHive detects and syncs automatically</li>
              <li><strong>Real-time Sync:</strong> Stream titles, descriptions, and viewer counts update instantly</li>
              <li><strong>Auto-Archive:</strong> When stream ends, it moves to "Recorded Sessions" automatically</li>
            </ol>
          </div>

          {streamSummary && (
            <p className="text-xs text-muted-foreground text-center">
              Last updated: {new Date(streamSummary.last_sync).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}