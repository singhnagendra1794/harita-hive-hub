import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, EyeOff, Layers, ZoomIn, ZoomOut, RotateCcw, 
  Download, Settings, Palette, Grid
} from 'lucide-react';

interface MapLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  visible: boolean;
  opacity: number;
}

interface MapViewerProps {
  layers: MapLayer[];
  onLayerToggle: (layerId: string, visible: boolean) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
}

const MapViewer: React.FC<MapViewerProps> = ({
  layers,
  onLayerToggle,
  onLayerOpacityChange
}) => {
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'terrain'>('street');
  const [showGrid, setShowGrid] = useState(false);
  const [showScale, setShowScale] = useState(true);

  const handleExportMap = () => {
    // Simulate map export
    console.log('Exporting map with current view and layers');
  };

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Interactive Map</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Map Canvas Placeholder */}
          <div className="w-full h-96 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
            <div className="text-center space-y-2">
              <Layers className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Interactive Map View</p>
              <p className="text-xs text-muted-foreground">
                Upload data to see it visualized here
              </p>
            </div>
          </div>

          {/* Map Style Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Base Map:</span>
              <div className="flex gap-1">
                {(['street', 'satellite', 'terrain'] as const).map((style) => (
                  <Button
                    key={style}
                    variant={mapStyle === style ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMapStyle(style)}
                    className="text-xs"
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                <span className="text-sm">Grid</span>
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
              </div>
              <Button variant="outline" size="sm" onClick={handleExportMap}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layer Control Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Layer Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          {layers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No layers loaded</p>
              <p className="text-xs">Upload data to see layers here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {layers.map((layer, index) => (
                <div key={layer.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLayerToggle(layer.id, !layer.visible)}
                        className="p-1"
                      >
                        {layer.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4 opacity-50" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{layer.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={layer.type === 'vector' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {layer.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(layer.opacity * 100)}% opacity
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {layer.visible && (
                    <div className="ml-8 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs w-16">Opacity:</span>
                        <Slider
                          value={[layer.opacity]}
                          onValueChange={([value]) => onLayerOpacityChange(layer.id, value)}
                          max={1}
                          min={0}
                          step={0.1}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Palette className="h-3 w-3" />
                        <span className="text-muted-foreground">Symbology options</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          Configure
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {index < layers.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MapViewer;