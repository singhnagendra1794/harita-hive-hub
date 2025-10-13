import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Globe, Download, Eye, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GlobalDataBrowserProps {
  onDatasetSelect: (dataset: any) => void;
  selectedRegion?: string;
}

export const GlobalDataBrowser: React.FC<GlobalDataBrowserProps> = ({
  onDatasetSelect,
  selectedRegion
}) => {
  const { toast } = useToast();
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      // Mock data until types are regenerated
      const mockDatasets = [
        {
          id: '1',
          name: 'Sentinel-2 L2A',
          provider: 'ESA Copernicus',
          dataset_type: 'raster',
          description: 'Multispectral satellite imagery with 13 bands',
          coverage: 'Global',
          resolution: '10m-60m',
          api_endpoint: 'https://scihub.copernicus.eu',
          access_method: 'api'
        },
        {
          id: '2',
          name: 'Landsat 8',
          provider: 'USGS',
          dataset_type: 'raster',
          description: 'Multispectral satellite imagery',
          coverage: 'Global',
          resolution: '30m',
          api_endpoint: 'https://earthexplorer.usgs.gov',
          access_method: 'api'
        },
        {
          id: '3',
          name: 'OpenStreetMap',
          provider: 'OSM',
          dataset_type: 'vector',
          description: 'Community-driven map data',
          coverage: 'Global',
          resolution: 'Vector',
          api_endpoint: 'https://overpass-api.de/api',
          access_method: 'api'
        }
      ];

      setDatasets(mockDatasets);
    } catch (error: any) {
      console.error('Error fetching datasets:', error);
      toast({
        title: "Failed to load datasets",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || dataset.dataset_type === filterType;
    return matchesSearch && matchesType;
  });

  const datasetTypes = ['all', 'raster', 'vector', 'dem', 'climate', 'administrative'];

  const handleLoadDataset = (dataset: any) => {
    toast({
      title: "Loading dataset",
      description: `Preparing ${dataset.name} for analysis...`,
    });
    onDatasetSelect(dataset);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center">
            <Database className="h-8 w-8 animate-pulse text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading global datasets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Global Open Datasets
            </CardTitle>
            <CardDescription>
              Access satellite imagery, vector data, and more from around the world
            </CardDescription>
          </div>
          <Badge variant="secondary">{filteredDatasets.length} available</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={filterType} onValueChange={setFilterType}>
          <TabsList className="grid grid-cols-6 w-full">
            {datasetTypes.map((type) => (
              <TabsTrigger key={type} value={type} className="capitalize">
                {type === 'dem' ? 'DEM' : type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {filteredDatasets.map((dataset) => (
              <Card key={dataset.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{dataset.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {dataset.dataset_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {dataset.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {dataset.provider}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {dataset.coverage}
                        </Badge>
                        {dataset.resolution && (
                          <Badge variant="secondary" className="text-xs">
                            {dataset.resolution}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleLoadDataset(dataset)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Load
                      </Button>
                      {dataset.api_endpoint && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(dataset.api_endpoint, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredDatasets.length === 0 && (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No datasets match your criteria</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};