import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Palette, Circle, Square, Triangle, Layers } from 'lucide-react';

interface MapLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  visible: boolean;
  opacity: number;
  style?: any;
  metadata?: {
    featureCount?: number;
    bands?: number;
  };
}

interface LayerStylePanelProps {
  layers: MapLayer[];
  onStyleChange: (layerId: string, style: any) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
}

const LayerStylePanel: React.FC<LayerStylePanelProps> = ({
  layers,
  onStyleChange,
  onOpacityChange
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    layers.length > 0 ? layers[0].id : null
  );

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const colorPresets = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Gray', value: '#6b7280' }
  ];

  const symbolTypes = [
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'square', name: 'Square', icon: Square },
    { id: 'triangle', name: 'Triangle', icon: Triangle }
  ];

  const classificationMethods = [
    { id: 'single', name: 'Single Symbol' },
    { id: 'categorized', name: 'Categorized' },
    { id: 'graduated', name: 'Graduated' },
    { id: 'rule-based', name: 'Rule-based' }
  ];

  if (layers.length === 0) {
    return (
      <div className="text-center py-8">
        <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="font-medium text-lg mb-2">No Layers to Style</h3>
        <p className="text-sm text-muted-foreground">
          Upload data files to start styling your layers
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Layer Selection */}
      <div className="space-y-2">
        <Label>Select Layer</Label>
        <Select value={selectedLayerId || ''} onValueChange={setSelectedLayerId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a layer to style" />
          </SelectTrigger>
          <SelectContent>
            {layers.map((layer) => (
              <SelectItem key={layer.id} value={layer.id}>
                <div className="flex items-center gap-2">
                  <Badge variant={layer.type === 'vector' ? 'default' : 'secondary'} className="text-xs">
                    {layer.type}
                  </Badge>
                  {layer.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedLayer && (
        <>
          <Separator />

          {/* Layer Info */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm mb-2">{selectedLayer.name}</h4>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Type: {selectedLayer.type}</span>
              {selectedLayer.metadata?.featureCount && (
                <span>Features: {selectedLayer.metadata.featureCount}</span>
              )}
              {selectedLayer.metadata?.bands && (
                <span>Bands: {selectedLayer.metadata.bands}</span>
              )}
            </div>
          </div>

          {/* Opacity Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Opacity</Label>
              <span className="text-xs text-muted-foreground">
                {Math.round(selectedLayer.opacity * 100)}%
              </span>
            </div>
            <Slider
              value={[selectedLayer.opacity]}
              onValueChange={([value]) => onOpacityChange(selectedLayer.id, value)}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Vector Styling */}
          {selectedLayer.type === 'vector' && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Vector Styling
                </h4>

                {/* Classification Method */}
                <div className="space-y-2">
                  <Label>Classification</Label>
                  <Select defaultValue="single">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {classificationMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Symbol Type */}
                <div className="space-y-2">
                  <Label>Symbol</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {symbolTypes.map((symbol) => {
                      const Icon = symbol.icon;
                      return (
                        <Button
                          key={symbol.id}
                          variant="outline"
                          className="h-12 flex flex-col gap-1"
                          onClick={() => onStyleChange(selectedLayer.id, { symbolType: symbol.id })}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-xs">{symbol.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorPresets.map((color) => (
                      <Button
                        key={color.value}
                        variant="outline"
                        className="h-10 p-0"
                        style={{ backgroundColor: color.value }}
                        onClick={() => onStyleChange(selectedLayer.id, { color: color.value })}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      defaultValue="#3b82f6"
                      className="w-16 h-8 p-1"
                      onChange={(e) => onStyleChange(selectedLayer.id, { color: e.target.value })}
                    />
                    <Input
                      placeholder="Hex color"
                      className="flex-1"
                      onChange={(e) => onStyleChange(selectedLayer.id, { color: e.target.value })}
                    />
                  </div>
                </div>

                {/* Size Control */}
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Slider
                    defaultValue={[5]}
                    onValueChange={([value]) => onStyleChange(selectedLayer.id, { size: value })}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Stroke Width */}
                <div className="space-y-2">
                  <Label>Stroke Width</Label>
                  <Slider
                    defaultValue={[1]}
                    onValueChange={([value]) => onStyleChange(selectedLayer.id, { strokeWidth: value })}
                    max={10}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Raster Styling */}
          {selectedLayer.type === 'raster' && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Raster Styling
                </h4>

                {/* Band Selection */}
                {selectedLayer.metadata?.bands && selectedLayer.metadata.bands > 1 && (
                  <div className="space-y-2">
                    <Label>Display Band</Label>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: selectedLayer.metadata.bands }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            Band {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Color Ramp */}
                <div className="space-y-2">
                  <Label>Color Ramp</Label>
                  <Select defaultValue="viridis">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viridis">Viridis</SelectItem>
                      <SelectItem value="plasma">Plasma</SelectItem>
                      <SelectItem value="inferno">Inferno</SelectItem>
                      <SelectItem value="magma">Magma</SelectItem>
                      <SelectItem value="grayscale">Grayscale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contrast & Brightness */}
                <div className="space-y-2">
                  <Label>Contrast</Label>
                  <Slider
                    defaultValue={[1]}
                    onValueChange={([value]) => onStyleChange(selectedLayer.id, { contrast: value })}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Brightness</Label>
                  <Slider
                    defaultValue={[0]}
                    onValueChange={([value]) => onStyleChange(selectedLayer.id, { brightness: value })}
                    max={100}
                    min={-100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Legend Preview</h4>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span className="text-xs">{selectedLayer.name}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LayerStylePanel;