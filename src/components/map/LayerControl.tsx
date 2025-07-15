
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Layers, Eye, EyeOff, Settings, Info } from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'basemap';
  visible: boolean;
  opacity: number;
  features?: number;
  style?: string;
  metadata?: {
    provider?: string;
    source?: string;
    geometry?: string;
    qgisLayerId?: string;
  };
}

interface LayerControlProps {
  layers: Layer[];
  onLayerToggle: (layerId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
}

const LayerControl: React.FC<LayerControlProps> = ({ 
  layers, 
  onLayerToggle, 
  onOpacityChange 
}) => {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());

  const toggleLayerExpanded = (layerId: string) => {
    const newExpanded = new Set(expandedLayers);
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId);
    } else {
      newExpanded.add(layerId);
    }
    setExpandedLayers(newExpanded);
  };

  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'vector': return '📍';
      case 'raster': return '🗺️';
      case 'basemap': return '🌍';
      default: return '📄';
    }
  };

  return (
    <Card className="absolute top-4 left-4 z-10 w-80 max-h-96 overflow-y-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Layers ({layers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {layers.map((layer) => (
            <div key={layer.id} className="border rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm">{getLayerIcon(layer.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{layer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {layer.type} {layer.features && `• ${layer.features} features`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={layer.visible}
                    onCheckedChange={() => onLayerToggle(layer.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayerExpanded(layer.id)}
                    className="p-1 h-6 w-6"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {expandedLayers.has(layer.id) && (
                <div className="mt-2 pt-2 border-t space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Opacity: {Math.round(layer.opacity * 100)}%
                    </div>
                    <Slider
                      value={[layer.opacity * 100]}
                      onValueChange={(value) => onOpacityChange(layer.id, value[0] / 100)}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {layer.type}
                    </Badge>
                    {layer.metadata?.geometry && (
                      <Badge variant="outline" className="text-xs">
                        {layer.metadata.geometry}
                      </Badge>
                    )}
                    {layer.metadata?.provider && (
                      <Badge variant="outline" className="text-xs">
                        {layer.metadata.provider}
                      </Badge>
                    )}
                    {layer.style && (
                      <Badge variant="outline" className="text-xs">
                        Styled
                      </Badge>
                    )}
                  </div>
                  {layer.metadata?.source && (
                    <div className="text-xs text-muted-foreground mt-1 p-1 bg-muted rounded">
                      <div className="font-medium">Source:</div>
                      <div className="break-all">{layer.metadata.source.length > 50 ? 
                        layer.metadata.source.substring(0, 50) + '...' : 
                        layer.metadata.source}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LayerControl;
export type { Layer };
