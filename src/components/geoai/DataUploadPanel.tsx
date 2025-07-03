
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GeoData } from '../../pages/GeoAILab';

interface DataUploadPanelProps {
  onDataUpload: (data: GeoData) => void;
  uploadedData: GeoData[];
  onDataSelect: (data: GeoData) => void;
}

const DataUploadPanel: React.FC<DataUploadPanelProps> = ({
  onDataUpload,
  uploadedData,
  onDataSelect
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.shp', '.geojson', '.kml', '.tiff', '.tif', '.json', '.gpx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a supported geospatial file format.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Upload to Supabase storage
      const fileName = `geoai-data/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('course-content')
        .upload(fileName, file);

      if (error) throw error;

      const fileType = getFileType(fileExtension);
      const geoDataType = getGeoDataType(fileExtension);

      const newData: GeoData = {
        id: Date.now().toString(),
        name: file.name.replace(/\.(shp|geojson|kml|tiff|tif|json|gpx)$/, ''),
        type: geoDataType,
        format: fileExtension.slice(1).toUpperCase(),
        url: data.path,
        visible: true
      };

      onDataUpload(newData);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is now available for analysis.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileType = (extension: string): string => {
    switch (extension) {
      case '.shp': return 'Shapefile';
      case '.geojson': case '.json': return 'GeoJSON';
      case '.kml': return 'KML';
      case '.tiff': case '.tif': return 'GeoTIFF';
      case '.gpx': return 'GPX';
      default: return 'Unknown';
    }
  };

  const getGeoDataType = (extension: string): 'vector' | 'raster' | 'satellite' => {
    if (['.tiff', '.tif'].includes(extension)) return 'raster';
    return 'vector';
  };

  const getFileIcon = (type: GeoData['type']) => {
    switch (type) {
      case 'vector': return '📍';
      case 'raster': return '🗺️';
      case 'satellite': return '🛰️';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Geospatial Data
          </CardTitle>
          <CardDescription className="text-xs">
            Support: Shapefile, GeoJSON, KML, GeoTIFF, GPX
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="file"
            accept=".shp,.geojson,.kml,.tiff,.tif,.json,.gpx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground">
            {uploading ? "Uploading..." : "Drag & drop or click to browse"}
          </p>
        </CardContent>
      </Card>

      {uploadedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uploaded Datasets ({uploadedData.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadedData.map((data) => (
                <div
                  key={data.id}
                  className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-accent"
                  onClick={() => onDataSelect(data)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm">{getFileIcon(data.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{data.name}</div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {data.format}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {data.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle visibility
                      }}
                    >
                      {data.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataUploadPanel;
