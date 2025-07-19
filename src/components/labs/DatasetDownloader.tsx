import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  FileText, 
  Map, 
  Layers, 
  Database,
  CheckCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DatasetDownloader = () => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { toast } = useToast();

  const datasets = [
    {
      id: 'sample-shapefiles',
      name: 'Sample Shapefiles Pack',
      description: 'Administrative boundaries, urban areas, and transportation networks',
      size: '25.3 MB',
      format: 'SHP',
      icon: Map,
      files: ['countries.shp', 'cities.shp', 'roads.shp', 'water_bodies.shp'],
      category: 'Vector'
    },
    {
      id: 'landsat-imagery',
      name: 'Landsat 8 Sample Scenes',
      description: 'Multi-spectral satellite imagery for NDVI and land cover analysis',
      size: '185.7 MB',
      format: 'GeoTIFF',
      icon: Layers,
      files: ['LC08_B1.tif', 'LC08_B2.tif', 'LC08_B3.tif', 'LC08_B4.tif', 'LC08_B5.tif'],
      category: 'Raster'
    },
    {
      id: 'elevation-data',
      name: 'Digital Elevation Model',
      description: 'SRTM 30m resolution elevation data for terrain analysis',
      size: '67.2 MB',
      format: 'GeoTIFF',
      icon: Layers,
      files: ['srtm_dem.tif', 'hillshade.tif', 'slope.tif'],
      category: 'Raster'
    },
    {
      id: 'climate-data',
      name: 'Climate Station Data',
      description: 'Temperature and precipitation data with coordinates',
      size: '8.9 MB',
      format: 'CSV/GeoJSON',
      icon: Database,
      files: ['weather_stations.geojson', 'temperature_data.csv', 'precipitation_data.csv'],
      category: 'Tabular'
    },
    {
      id: 'demographics',
      name: 'Population Demographics',
      description: 'Census data with administrative boundaries',
      size: '15.4 MB',
      format: 'SHP/CSV',
      icon: Map,
      files: ['census_blocks.shp', 'population_data.csv', 'age_distribution.csv'],
      category: 'Vector'
    },
    {
      id: 'poi-data',
      name: 'Points of Interest',
      description: 'Schools, hospitals, parks, and commercial areas',
      size: '12.1 MB',
      format: 'GeoJSON',
      icon: Map,
      files: ['schools.geojson', 'hospitals.geojson', 'parks.geojson', 'commercial.geojson'],
      category: 'Vector'
    }
  ];

  const handleDownload = async (datasetId: string, datasetName: string) => {
    setDownloading(datasetId);
    setDownloadProgress(0);

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(null);
          toast({
            title: "Download Complete!",
            description: `${datasetName} has been downloaded successfully.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case 'Vector': return 'text-blue-500';
      case 'Raster': return 'text-green-500';
      case 'Tabular': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Sample Datasets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Download ready-to-use geospatial datasets for testing and learning.
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {datasets.map((dataset) => {
            const IconComponent = dataset.icon;
            const isDownloading = downloading === dataset.id;
            
            return (
              <div key={dataset.id} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <IconComponent className={`h-5 w-5 mt-0.5 ${getIconColor(dataset.category)}`} />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm">{dataset.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {dataset.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {dataset.format}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {dataset.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {dataset.size}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File List */}
                <div className="text-xs">
                  <span className="font-medium">Files: </span>
                  <span className="text-muted-foreground">
                    {dataset.files.slice(0, 2).join(', ')}
                    {dataset.files.length > 2 && ` +${dataset.files.length - 2} more`}
                  </span>
                </div>

                {/* Download Progress */}
                {isDownloading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Downloading...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <Progress value={downloadProgress} className="h-1" />
                  </div>
                )}

                {/* Download Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(dataset.id, dataset.name)}
                  disabled={isDownloading}
                  className="w-full gap-2 h-8"
                >
                  {isDownloading ? (
                    <>
                      <Clock className="h-3 w-3 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Usage Instructions */}
        <div className="pt-3 border-t text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Usage:</p>
              <p>Extract datasets to your project folder and update file paths in the code samples.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatasetDownloader;