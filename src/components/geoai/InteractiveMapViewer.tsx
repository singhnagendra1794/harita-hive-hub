import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Map, 
  Layers, 
  Eye, 
  EyeOff, 
  Settings, 
  ZoomIn, 
  ZoomOut,
  RotateCcw,
  Target,
  Palette,
  BarChart3
} from "lucide-react";

interface MapLayer {
  id: string;
  name: string;
  type: 'base' | 'data' | 'result';
  dataType: 'vector' | 'raster' | 'point';
  visible: boolean;
  opacity: number;
  color?: string;
  style?: any;
  data?: any;
  bounds?: [number, number, number, number];
}

interface InteractiveMapViewerProps {
  uploadedData: any[];
  analysisResults: any[];
  selectedData: any;
  onDataSelect: (data: any) => void;
  onLayerToggle: (layerId: string, visible: boolean) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
}

const InteractiveMapViewer = ({
  uploadedData,
  analysisResults,
  selectedData,
  onDataSelect,
  onLayerToggle,
  onOpacityChange
}: InteractiveMapViewerProps) => {
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([-95.7129, 37.0902]);
  const [mapZoom, setMapZoom] = useState(4);
  const [showLayerPanel, setShowLayerPanel] = useState(true);

  // Initialize layers from uploaded data and results
  useEffect(() => {
    const baseLayers: MapLayer[] = [
      {
        id: "osm",
        name: "OpenStreetMap",
        type: "base",
        dataType: "raster",
        visible: true,
        opacity: 1.0
      }
    ];

    const dataLayers: MapLayer[] = uploadedData.map((data, index) => ({
      id: `data_${data.id || index}`,
      name: data.name,
      type: "data",
      dataType: data.type,
      visible: true,
      opacity: 0.8,
      data: data,
      bounds: generateMockBounds(data.name)
    }));

    const resultLayers: MapLayer[] = analysisResults.map((result, index) => ({
      id: `result_${result.id || index}`,
      name: `${result.modelName} Result`,
      type: "result",
      dataType: "raster",
      visible: true,
      opacity: 0.7,
      data: result,
      bounds: generateMockBounds(result.inputData)
    }));

    setMapLayers([...baseLayers, ...dataLayers, ...resultLayers]);
  }, [uploadedData, analysisResults]);

  // Auto-zoom to uploaded data
  useEffect(() => {
    if (uploadedData.length > 0 && uploadedData[uploadedData.length - 1]) {
      const latestData = uploadedData[uploadedData.length - 1];
      const bounds = generateMockBounds(latestData.name);
      const center: [number, number] = [
        (bounds[0] + bounds[2]) / 2,
        (bounds[1] + bounds[3]) / 2
      ];
      setMapCenter(center);
      setMapZoom(10);
    }
  }, [uploadedData]);

  const generateMockBounds = (name: string): [number, number, number, number] => {
    // Generate bounds based on name hash for consistency
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const baseLat = 40 + ((hash % 1000) / 1000) * 20;
    const baseLng = -120 + ((hash % 2000) / 2000) * 60;
    
    return [
      baseLng - 0.1,
      baseLat - 0.1,
      baseLng + 0.1,
      baseLat + 0.1
    ];
  };

  const handleLayerVisibilityChange = (layerId: string, visible: boolean) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible } : layer
    ));
    onLayerToggle(layerId, visible);
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity: opacity / 100 } : layer
    ));
    onOpacityChange(layerId, opacity / 100);
  };

  const zoomToLayer = (layer: MapLayer) => {
    if (layer.bounds) {
      const center: [number, number] = [
        (layer.bounds[0] + layer.bounds[2]) / 2,
        (layer.bounds[1] + layer.bounds[3]) / 2
      ];
      setMapCenter(center);
      setMapZoom(12);
    }
    if (layer.data) {
      onDataSelect(layer.data);
    }
    setSelectedLayer(layer.id);
  };

  const getLayerIcon = (layer: MapLayer) => {
    switch (layer.dataType) {
      case 'vector':
        return <Target className="h-4 w-4" />;
      case 'raster':
        return <BarChart3 className="h-4 w-4" />;
      case 'point':
        return <Map className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  const getLayerTypeColor = (type: string) => {
    switch (type) {
      case 'base':
        return 'bg-blue-100 text-blue-800';
      case 'data':
        return 'bg-green-100 text-green-800';
      case 'result':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex">
      {/* Map Container */}
      <div className="flex-1 relative bg-muted/20 rounded-lg">
        {/* Mock Map Display */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
          <div className="text-center">
            <Map className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Interactive Map View</p>
            <p className="text-xs text-muted-foreground">
              Center: {mapCenter[1].toFixed(4)}, {mapCenter[0].toFixed(4)} | Zoom: {mapZoom}
            </p>
            {mapLayers.filter(l => l.visible).length > 0 && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {mapLayers.filter(l => l.visible).length} layers visible
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLayerPanel(!showLayerPanel)}
          >
            <Layers className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMapZoom(prev => prev + 1)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMapZoom(prev => Math.max(1, prev - 1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMapZoom(4)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Layer Panel */}
      {showLayerPanel && (
        <div className="w-80 border-l bg-background">
          <Card className="h-full rounded-none border-0">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Map Layers
                <Badge variant="outline" className="text-xs">
                  {mapLayers.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="p-4 space-y-4">
                  {['base', 'data', 'result'].map(layerType => {
                    const layersOfType = mapLayers.filter(layer => layer.type === layerType);
                    if (layersOfType.length === 0) return null;

                    return (
                      <div key={layerType}>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-medium capitalize">{layerType} Layers</h4>
                          <Badge variant="secondary" className="text-xs">
                            {layersOfType.length}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {layersOfType.map((layer) => (
                            <div
                              key={layer.id}
                              className={cn(
                                "p-3 border rounded-lg space-y-3 transition-colors",
                                selectedLayer === layer.id && "border-primary bg-primary/5"
                              )}
                            >
                              {/* Layer Header */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleLayerVisibilityChange(layer.id, !layer.visible)}
                                >
                                  {layer.visible ? (
                                    <Eye className="h-3 w-3" />
                                  ) : (
                                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </Button>
                                
                                <div className="flex-1 cursor-pointer" onClick={() => zoomToLayer(layer)}>
                                  <div className="flex items-center gap-2">
                                    {getLayerIcon(layer)}
                                    <span className="text-sm font-medium">{layer.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className={cn("text-xs", getLayerTypeColor(layer.type))}>
                                      {layer.type}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {layer.dataType}
                                    </Badge>
                                  </div>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => zoomToLayer(layer)}
                                >
                                  <Target className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Layer Controls */}
                              {layer.visible && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Opacity</Label>
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round(layer.opacity * 100)}%
                                    </span>
                                  </div>
                                  <Slider
                                    value={[layer.opacity * 100]}
                                    onValueChange={(value) => handleOpacityChange(layer.id, value[0])}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {layerType !== 'result' && <Separator className="my-4" />}
                      </div>
                    );
                  })}

                  {mapLayers.length === 1 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Upload data to add layers</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InteractiveMapViewer;