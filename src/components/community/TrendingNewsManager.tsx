import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Info, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSuperAdminAccess } from '@/hooks/useSuperAdminAccess';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const TrendingNewsManager: React.FC = () => {
  const { toast } = useToast();
  const { isSuperAdmin } = useSuperAdminAccess();
  const [fetching, setFetching] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const handleManualFetch = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-trending-news', {
        body: { manual: true }
      });

      if (error) throw error;

      setLastFetch(new Date());
      
      toast({
        title: "News Updated Successfully",
        description: `Fetched ${data?.count || 0} new articles from around the world`,
      });
    } catch (error) {
      console.error('Error fetching trending news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trending news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  if (!isSuperAdmin) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-blue-500" />
          News Update Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            News is configured to auto-update every hour. You can also manually trigger an update below.
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium">Last manual update:</p>
            <p className="text-muted-foreground">
              {lastFetch ? lastFetch.toLocaleString() : 'Never'}
            </p>
          </div>
          
          <Button
            onClick={handleManualFetch}
            disabled={fetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
            {fetching ? 'Fetching...' : 'Fetch Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};