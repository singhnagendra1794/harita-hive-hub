import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Upload, Trash2, Eye, EyeOff } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface LayerManagerProps {
  layers: any[];
  selectedLayers: string[];
  onLayersChange: (layers: any[]) => void;
  onSelectionChange: (selected: string[]) => void;
  onUpload: (files: File[]) => void;
}

const LayerManager = ({ 
  layers, 
  selectedLayers, 
  onLayersChange, 
  onSelectionChange,
  onUpload 
}: LayerManagerProps) => {
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/geo+json': ['.geojson'],
      'application/vnd.google-earth.kml+xml': ['.kml'],
      'application/x-shape': ['.shp'],
      'image/tiff': ['.tif', '.tiff'],
      'application/x-netcdf': ['.nc'],
    }
  });

  const toggleVisibility = (layerId: string) => {
    const updatedLayers = layers.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    );
    onLayersChange(updatedLayers);
  };

  const updateOpacity = (layerId: string, opacity: number) => {
    const updatedLayers = layers.map(layer => 
      layer.id === layerId ? { ...layer, opacity: opacity / 100 } : layer
    );
    onLayersChange(updatedLayers);
  };

  const removeLayer = (layerId: string) => {
    const updatedLayers = layers.filter(layer => layer.id !== layerId);
    onLayersChange(updatedLayers);
    onSelectionChange(selectedLayers.filter(id => id !== layerId));
  };

  const toggleSelection = (layerId: string) => {
    if (selectedLayers.includes(layerId)) {
      onSelectionChange(selectedLayers.filter(id => id !== layerId));
    } else {
      onSelectionChange([...selectedLayers, layerId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? 'Drop files here...' : 'Drag & drop layers or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports: GeoJSON, KML, Shapefile, GeoTIFF, NetCDF
        </p>
      </div>

      {/* Layers list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Layers ({layers.length})</h3>
        
        {layers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No layers added yet. Upload or add from global data.
          </p>
        ) : (
          layers.map((layer) => (
            <Card key={layer.id} className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedLayers.includes(layer.id)}
                      onCheckedChange={() => toggleSelection(layer.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{layer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {layer.type} {layer.provider && `• ${layer.provider}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleVisibility(layer.id)}
                      className="h-7 w-7 p-0"
                    >
                      {layer.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeLayer(layer.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {layer.visible && (
                  <div className="pl-6">
                    <p className="text-xs text-muted-foreground mb-1">
                      Opacity: {Math.round((layer.opacity || 1) * 100)}%
                    </p>
                    <Slider
                      value={[(layer.opacity || 1) * 100]}
                      onValueChange={([value]) => updateOpacity(layer.id, value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LayerManager;