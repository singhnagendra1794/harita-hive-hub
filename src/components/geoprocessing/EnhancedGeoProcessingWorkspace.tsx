import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import RasterTools from "./RasterTools";
import VectorTools from "./VectorTools";
import JobQueue from "./JobQueue";
import UsageDashboard from "./UsageDashboard";
import MergeTools from "./MergeTools";
import UserDataManager from "./UserDataManager";
import RealMapIntegration from "./RealMapIntegration";
import ExportTools from "./ExportTools";
import UpgradePrompt from "@/components/premium/UpgradePrompt";
import { 
  Cpu, 
  Database, 
  Clock, 
  CheckCircle,
  Activity,
  Layers,
  MapPin,
  BarChart3,
  Merge,
  Upload,
  Map,
  Download
} from "lucide-react";

interface JobStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface MapLayer {
  id: string;
  name: string;
  type: 'basemap' | 'user' | 'result';
  visible: boolean;
  opacity: number;
  data?: any;
}

const EnhancedGeoProcessingWorkspace = () => {
  const { user } = useAuth();
  const { hasAccess, subscription } = usePremiumAccess();
  const [jobStats, setJobStats] = useState<JobStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });
  const [usageStats, setUsageStats] = useState({
    monthlyJobs: 0,
    monthlyLimit: 0,
    totalProcessingTime: 0
  });
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    {
      id: 'basemap',
      name: 'OpenStreetMap',
      type: 'basemap',
      visible: true,
      opacity: 1.0
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && hasAccess('premium')) {
      fetchJobStats();
      fetchUsageStats();
    }
  }, [user, hasAccess]);

  const fetchJobStats = async () => {
    try {
      const { data, error } = await supabase
        .from('geo_processing_jobs')
        .select('status')
        .eq('user_id', user?.id);

      if (error) throw error;

      const stats = data?.reduce((acc, job) => {
        acc[job.status as keyof JobStats] = (acc[job.status as keyof JobStats] || 0) + 1;
        return acc;
      }, { pending: 0, processing: 0, completed: 0, failed: 0 } as JobStats) || {
        pending: 0, processing: 0, completed: 0, failed: 0
      };

      setJobStats(stats);
    } catch (error) {
      console.error('Error fetching job stats:', error);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('check_geo_processing_limits', {
          p_user_id: user?.id,
          p_job_type: 'all'
        });

      if (error) throw error;

      if (data && typeof data === 'object') {
        setUsageStats({
          monthlyJobs: (data as any).current_usage || 0,
          monthlyLimit: (data as any).monthly_limit || 0,
          totalProcessingTime: 0
        });
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLayerVisibilityChange = (layerId: string, visible: boolean) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible } : layer
    ));
  };

  const handleLayerOpacityChange = (layerId: string, opacity: number) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  };

  const handleExportMap = () => {
    toast({
      title: "Map Export",
      description: "Map export functionality initiated",
    });
  };

  const addResultLayer = (data: any, name: string, type: 'vector' | 'raster') => {
    const newLayer: MapLayer = {
      id: `result_${Date.now()}`,
      name: name,
      type: 'result',
      visible: true,
      opacity: 0.8,
      data: data
    };
    
    setMapLayers(prev => [...prev, newLayer]);
  };

  if (!hasAccess('premium')) {
    return (
      <div className="container py-8">
        <UpgradePrompt 
          feature="Geo Processing Lab"
          description="Access professional-grade spatial analysis tools for raster and vector data processing. Handle large datasets with cloud-powered processing capabilities."
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              Enhanced Geo Processing Lab
            </h1>
            <p className="text-muted-foreground">
              Professional-grade spatial analysis with real-time map integration
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {jobStats.pending + jobStats.processing} active
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {jobStats.completed} completed
            </Badge>
            <Badge 
              variant={subscription?.subscription_tier === 'enterprise' ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              <Database className="h-3 w-3" />
              {subscription?.subscription_tier?.toUpperCase()} Plan
            </Badge>
          </div>
        </div>

        {/* Usage Overview */}
        {!loading && usageStats.monthlyLimit > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Monthly Usage</span>
              <span>
                {usageStats.monthlyJobs} / {usageStats.monthlyLimit === -1 ? '∞' : usageStats.monthlyLimit}
              </span>
            </div>
            <Progress 
              value={usageStats.monthlyLimit === -1 ? 0 : (usageStats.monthlyJobs / usageStats.monthlyLimit) * 100} 
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tools */}
        <div className="w-80 border-r bg-background overflow-y-auto">
          <Tabs defaultValue="raster" className="w-full h-full">
            <TabsList className="grid w-full grid-cols-2 m-4">
              <TabsTrigger value="raster" className="text-xs">
                <Layers className="h-3 w-3 mr-1" />
                Raster
              </TabsTrigger>
              <TabsTrigger value="vector" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Vector
              </TabsTrigger>
            </TabsList>

            <div className="px-4">
              <TabsContent value="raster" className="mt-0">
                <RasterTools 
                  onJobCreated={fetchJobStats}
                  subscription={subscription}
                />
              </TabsContent>

              <TabsContent value="vector" className="mt-0">
                <VectorTools 
                  onJobCreated={fetchJobStats}
                  subscription={subscription}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Center Panel - Map */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <RealMapIntegration
              layers={mapLayers}
              onLayerVisibilityChange={handleLayerVisibilityChange}
              onLayerOpacityChange={handleLayerOpacityChange}
              onExportMap={handleExportMap}
            />
          </div>
        </div>

        {/* Right Panel - Advanced Tools */}
        <div className="w-80 border-l bg-background overflow-y-auto">
          <Tabs defaultValue="merge" className="w-full h-full">
            <TabsList className="grid w-full grid-cols-2 m-4">
              <TabsTrigger value="merge" className="text-xs">
                <Merge className="h-3 w-3 mr-1" />
                Merge
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs">
                <Upload className="h-3 w-3 mr-1" />
                Data
              </TabsTrigger>
            </TabsList>

            <div className="px-4">
              <TabsContent value="merge" className="mt-0">
                <MergeTools />
              </TabsContent>

              <TabsContent value="data" className="mt-0">
                <UserDataManager />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Bottom Panel - Status and Export */}
      <div className="border-t p-4 bg-background">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Job Queue
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-48 overflow-y-auto">
            <TabsContent value="jobs" className="mt-0">
              <JobQueue 
                jobStats={jobStats}
                onJobUpdate={fetchJobStats}
              />
            </TabsContent>

            <TabsContent value="usage" className="mt-0">
              <UsageDashboard 
                usageStats={usageStats}
                subscription={subscription}
              />
            </TabsContent>

            <TabsContent value="export" className="mt-0">
              <ExportTools
                data={null}
                dataType="vector"
                fileName="processing_results"
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedGeoProcessingWorkspace;