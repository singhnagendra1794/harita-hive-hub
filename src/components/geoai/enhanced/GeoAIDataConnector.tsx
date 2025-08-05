import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useGeoAIUsage } from './GeoAIUsageTracker';
import {
  Satellite,
  Globe,
  Database,
  Download,
  Calendar,
  MapPin,
  Layers,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface SatelliteData {
  id: string;
  name: string;
  source_type: string;
  api_endpoint: string;
  bands_available: any;
  resolution_meters: number;
  temporal_range: any;
  coverage_area: any;
  metadata: any;
}

interface DataRequest {
  dataSourceId: string;
  bbox: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
  bands: string[];
  maxCloudCover: number;
}

const GeoAIDataConnector: React.FC = () => {
  const { user } = useAuth();
  const { trackApiCall, trackDataProcessing } = useGeoAIUsage();
  const [dataSources, setDataSources] = useState<SatelliteData[]>([]);
  const [selectedSource, setSelectedSource] = useState<SatelliteData | null>(null);
  const [dataRequest, setDataRequest] = useState<DataRequest>({
    dataSourceId: '',
    bbox: { west: -74.1, south: 40.7, east: -73.9, north: 40.8 }, // Default NYC
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    bands: [],
    maxCloudCover: 20
  });
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showDataRequest, setShowDataRequest] = useState(false);
  const [availableData, setAvailableData] = useState<any[]>([]);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      const { data, error } = await supabase
        .from('geoai_data_sources')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setDataSources(data || []);
    } catch (error) {
      console.error('Error loading data sources:', error);
      toast({
        title: "Error",
        description: "Failed to load data sources",
        variant: "destructive"
      });
    }
  };

  const searchAvailableData = async () => {
    if (!selectedSource) return;

    setIsLoading(true);
    try {
      await trackApiCall();

      // Simulate API call to satellite data provider
      const response = await supabase.functions.invoke('geoai-workflow-engine', {
        body: {
          action: 'get_satellite_data',
          payload: {
            data_source_id: selectedSource.id,
            bbox: dataRequest.bbox,
            date_range: dataRequest.dateRange,
            bands: dataRequest.bands
          }
        }
      });

      if (response.error) throw response.error;

      // Simulate available data results
      const mockData = Array.from({ length: Math.floor(Math.random() * 10) + 3 }, (_, i) => ({
        id: `scene_${i + 1}`,
        acquisition_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cloud_cover: Math.floor(Math.random() * 50),
        file_size_mb: Math.floor(Math.random() * 500) + 100,
        bands: selectedSource.bands_available || [],
        preview_url: `https://example.com/preview_${i + 1}.jpg`,
        download_url: `https://example.com/download_${i + 1}.tif`
      }));

      setAvailableData(mockData.filter(scene => scene.cloud_cover <= dataRequest.maxCloudCover));
      
      toast({
        title: "Search Complete",
        description: `Found ${availableData.length} scenes matching your criteria`,
      });
    } catch (error: any) {
      console.error('Error searching data:', error);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search satellite data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadData = async (scene: any) => {
    setDownloadProgress(0);
    
    try {
      const sizeGb = scene.file_size_mb / 1024;
      await trackDataProcessing(sizeGb);

      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            completeDownload(scene);
            return 100;
          }
          return newProgress;
        });
      }, 200);

    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const completeDownload = async (scene: any) => {
    try {
      // Save downloaded data to user's layers
      const { error } = await supabase
        .from('geoai_data_layers')
        .insert({
          user_id: user!.id,
          layer_name: `${selectedSource?.name} - ${scene.acquisition_date}`,
          layer_type: 'raster',
          data_source_id: selectedSource?.id,
          file_path: scene.download_url,
          file_size_bytes: scene.file_size_mb * 1024 * 1024,
          file_format: 'geotiff',
          spatial_reference: 'EPSG:4326',
          bounding_box: dataRequest.bbox,
          temporal_info: { acquisition_date: scene.acquisition_date },
          bands_info: scene.bands,
          metadata: {
            cloud_cover: scene.cloud_cover,
            source: selectedSource?.name
          }
        });

      if (error) throw error;

      setDownloadProgress(0);
      toast({
        title: "Download Complete",
        description: `${scene.id} has been added to your data layers`,
      });
    } catch (error) {
      console.error('Error saving downloaded data:', error);
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'sentinel_hub':
        return <Satellite className="h-4 w-4" />;
      case 'nasa_earthdata':
        return <Globe className="h-4 w-4" />;
      case 'copernicus':
        return <Database className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full bg-[#0D1B2A] text-[#F9F9F9] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Satellite Data Connector</h1>
            <p className="text-[#F9F9F9]/70">Connect to real-time satellite data sources</p>
          </div>
          <Badge variant="outline" className="border-[#43AA8B] text-[#43AA8B]">
            {dataSources.length} Sources Available
          </Badge>
        </div>

        {/* Data Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataSources.map((source) => (
            <Card 
              key={source.id}
              className={`bg-[#1B263B] border-[#43AA8B]/20 cursor-pointer transition-colors ${
                selectedSource?.id === source.id ? 'border-[#F4D35E] bg-[#F4D35E]/5' : 'hover:border-[#43AA8B]/40'
              }`}
              onClick={() => setSelectedSource(source)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  {getSourceIcon(source.source_type)}
                  {source.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#F9F9F9]/70">Resolution</span>
                  <span className="text-sm text-white">{source.resolution_meters}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#F9F9F9]/70">Bands</span>
                  <span className="text-sm text-white">
                    {Array.isArray(source.bands_available) ? source.bands_available.length : 'Multiple'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#F9F9F9]/70">Update Freq.</span>
                  <span className="text-sm text-white capitalize">{source.metadata?.update_frequency || 'Daily'}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className="w-full justify-center border-[#43AA8B]/50 text-[#43AA8B]"
                >
                  {source.source_type.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Request Configuration */}
        {selectedSource && (
          <Card className="bg-[#1B263B] border-[#43AA8B]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configure Data Request - {selectedSource.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bounding Box */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Area of Interest (Bounding Box)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="West"
                    type="number"
                    step="0.001"
                    value={dataRequest.bbox.west}
                    onChange={(e) => setDataRequest(prev => ({
                      ...prev,
                      bbox: { ...prev.bbox, west: parseFloat(e.target.value) }
                    }))}
                    className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white"
                  />
                  <Input
                    placeholder="South"
                    type="number"
                    step="0.001"
                    value={dataRequest.bbox.south}
                    onChange={(e) => setDataRequest(prev => ({
                      ...prev,
                      bbox: { ...prev.bbox, south: parseFloat(e.target.value) }
                    }))}
                    className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white"
                  />
                  <Input
                    placeholder="East"
                    type="number"
                    step="0.001"
                    value={dataRequest.bbox.east}
                    onChange={(e) => setDataRequest(prev => ({
                      ...prev,
                      bbox: { ...prev.bbox, east: parseFloat(e.target.value) }
                    }))}
                    className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white"
                  />
                  <Input
                    placeholder="North"
                    type="number"
                    step="0.001"
                    value={dataRequest.bbox.north}
                    onChange={(e) => setDataRequest(prev => ({
                      ...prev,
                      bbox: { ...prev.bbox, north: parseFloat(e.target.value) }
                    }))}
                    className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={dataRequest.dateRange.start}
                    onChange={(e) => setDataRequest(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={dataRequest.dateRange.end}
                    onChange={(e) => setDataRequest(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white"
                  />
                </div>
              </div>

              {/* Cloud Cover */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Maximum Cloud Cover: {dataRequest.maxCloudCover}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={dataRequest.maxCloudCover}
                  onChange={(e) => setDataRequest(prev => ({
                    ...prev,
                    maxCloudCover: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

              {/* Search Button */}
              <div className="flex justify-end">
                <Button
                  onClick={searchAvailableData}
                  disabled={isLoading}
                  className="bg-[#43AA8B] hover:bg-[#43AA8B]/90"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Search Available Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Data Results */}
        {availableData.length > 0 && (
          <Card className="bg-[#1B263B] border-[#43AA8B]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#43AA8B]" />
                Available Scenes ({availableData.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {availableData.map((scene) => (
                    <Card key={scene.id} className="bg-[#0D1B2A] border-[#43AA8B]/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-medium">{scene.id}</span>
                              <Badge 
                                variant="outline" 
                                className={`${
                                  scene.cloud_cover < 10 ? 'border-[#43AA8B] text-[#43AA8B]' :
                                  scene.cloud_cover < 20 ? 'border-[#F4D35E] text-[#F4D35E]' :
                                  'border-[#EE964B] text-[#EE964B]'
                                }`}
                              >
                                {scene.cloud_cover}% clouds
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[#F9F9F9]/70">
                              <span>{scene.acquisition_date}</span>
                              <span>{scene.file_size_mb} MB</span>
                              <span>{scene.bands.length} bands</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {downloadProgress > 0 && (
                              <div className="flex items-center gap-2">
                                <Progress value={downloadProgress} className="w-24" />
                                <span className="text-xs text-[#F9F9F9]/70">{downloadProgress}%</span>
                              </div>
                            )}
                            <Button
                              size="sm"
                              onClick={() => downloadData(scene)}
                              disabled={downloadProgress > 0}
                              className="bg-[#F4D35E] text-[#0D1B2A] hover:bg-[#F4D35E]/90"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GeoAIDataConnector;