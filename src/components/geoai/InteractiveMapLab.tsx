import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Map, 
  Layers, 
  Eye, 
  EyeOff, 
  Download, 
  Palette, 
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  MapPin,
  Square,
  Circle,
  Pencil,
  Ruler,
  Navigation
} from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'ai_output';
  visible: boolean;
  opacity: number;
  style?: any;
  data?: any;
}

interface InteractiveMapLabProps {
  layers: Layer[];
  onLayerToggle: (layerId: string, visible: boolean) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
}

const InteractiveMapLab = ({ layers, onLayerToggle, onLayerOpacityChange }: InteractiveMapLabProps) => {
  const [selectedBasemap, setSelectedBasemap] = useState('satellite');
  const [drawingTool, setDrawingTool] = useState('none');
  const [measurementMode, setMeasurementMode] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [mapCoords, setMapCoords] = useState({ lat: 37.0902, lng: -95.7129, zoom: 4 });

  const basemaps = [
    { id: 'osm', name: 'OpenStreetMap', preview: '🗺️' },
    { id: 'satellite', name: 'Satellite', preview: '🛰️' },
    { id: 'dark', name: 'Dark Theme', preview: '🌙' },
    { id: 'terrain', name: 'Terrain', preview: '🏔️' }
  ];

  const drawingTools = [
    { id: 'none', name: 'Select', icon: <Navigation className="h-4 w-4" /> },
    { id: 'point', name: 'Point', icon: <MapPin className="h-4 w-4" /> },
    { id: 'polygon', name: 'Polygon', icon: <Square className="h-4 w-4" /> },
    { id: 'circle', name: 'Circle', icon: <Circle className="h-4 w-4" /> },
    { id: 'freehand', name: 'Draw', icon: <Pencil className="h-4 w-4" /> },
    { id: 'measure', name: 'Measure', icon: <Ruler className="h-4 w-4" /> }
  ];

  const handleExport = (format: string) => {
    console.log(`Exporting map as ${format}`);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setMapCoords(prev => ({
      ...prev,
      zoom: direction === 'in' ? prev.zoom + 1 : prev.zoom - 1
    }));
  };

  const LayerStylePanel = ({ layer }: { layer: Layer }) => (
    <div className="space-y-4 p-4 bg-[#0D1B2A] rounded-lg border border-[#43AA8B]/20">
      <h4 className="text-sm font-medium text-white">Style: {layer.name}</h4>
      
      {layer.type === 'vector' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#F9F9F9]/70">Fill Color</label>
            <div className="flex gap-2 mt-1">
              {['#F4D35E', '#43AA8B', '#ff6b6b', '#4ecdc4', '#45b7d1'].map(color => (
                <div 
                  key={color}
                  className="w-8 h-8 rounded cursor-pointer border-2 border-transparent hover:border-white"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs text-[#F9F9F9]/70">Stroke Width</label>
            <Slider
              value={[2]}
              onValueChange={(value) => console.log('Stroke width:', value[0])}
              max={10}
              step={1}
              className="mt-1"
            />
          </div>
        </div>
      )}
      
      {layer.type === 'raster' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#F9F9F9]/70">Color Ramp</label>
            <Select>
              <SelectTrigger className="bg-[#1B263B] border-[#43AA8B]/30">
                <SelectValue placeholder="Select color ramp" />
              </SelectTrigger>
              <SelectContent className="bg-[#1B263B]">
                <SelectItem value="viridis">Viridis</SelectItem>
                <SelectItem value="plasma">Plasma</SelectItem>
                <SelectItem value="jet">Jet</SelectItem>
                <SelectItem value="gray">Grayscale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-xs text-[#F9F9F9]/70">Contrast</label>
            <Slider
              value={[100]}
              onValueChange={(value) => console.log('Contrast:', value[0])}
              max={200}
              step={10}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex bg-[#0D1B2A]">
      {/* Map Canvas */}
      <div className="flex-1 relative bg-[#1B263B] border border-[#43AA8B]/20 m-4 rounded-lg overflow-hidden">
        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="bg-[#1B263B]/90 backdrop-blur-sm border border-[#43AA8B]/30 rounded-lg p-2 flex flex-col gap-1">
            <Button size="sm" variant="ghost" onClick={() => handleZoom('in')} className="p-2 text-[#F9F9F9]">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleZoom('out')} className="p-2 text-[#F9F9F9]">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="p-2 text-[#F9F9F9]">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="p-2 text-[#F9F9F9]">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Drawing Tools */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-[#1B263B]/90 backdrop-blur-sm border border-[#43AA8B]/30 rounded-lg p-2 flex gap-1">
            {drawingTools.map(tool => (
              <Button
                key={tool.id}
                size="sm"
                variant={drawingTool === tool.id ? "default" : "ghost"}
                onClick={() => setDrawingTool(tool.id)}
                className={`p-2 ${drawingTool === tool.id ? 'bg-[#F4D35E] text-[#0D1B2A]' : 'text-[#F9F9F9]'}`}
                title={tool.name}
              >
                {tool.icon}
              </Button>
            ))}
          </div>
        </div>

        {/* Coordinates Display */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-[#1B263B]/90 backdrop-blur-sm border border-[#43AA8B]/30 rounded-lg px-3 py-2 text-xs text-[#F9F9F9]">
            Lat: {mapCoords.lat.toFixed(4)}, Lng: {mapCoords.lng.toFixed(4)} | Zoom: {mapCoords.zoom}
          </div>
        </div>

        {/* Map Canvas Placeholder */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0D1B2A] to-[#1B263B]">
          <div className="text-center">
            <Map className="h-24 w-24 text-[#43AA8B]/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#F9F9F9]/70 mb-2">Interactive Map</h3>
            <p className="text-sm text-[#F9F9F9]/50">
              Center: USA ({mapCoords.lat}, {mapCoords.lng})
            </p>
            <p className="text-xs text-[#F9F9F9]/40 mt-1">
              Basemap: {basemaps.find(b => b.id === selectedBasemap)?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Map Controls */}
      <div className="w-80 bg-[#1B263B] border-l border-[#43AA8B]/20 flex flex-col">
        <div className="p-4 border-b border-[#43AA8B]/20">
          <h3 className="text-lg font-semibold text-white mb-1">Map Controls</h3>
          <p className="text-xs text-[#F9F9F9]/70">Manage layers, basemap, and styling</p>
        </div>

        <Tabs defaultValue="layers" className="flex-1 flex flex-col">
          <TabsList className="bg-[#0D1B2A] border-b border-[#43AA8B]/20 rounded-none justify-start">
            <TabsTrigger value="layers" className="data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A]">
              <Layers className="h-4 w-4 mr-2" />
              Layers
            </TabsTrigger>
            <TabsTrigger value="basemap" className="data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A]">
              <Map className="h-4 w-4 mr-2" />
              Basemap
            </TabsTrigger>
            <TabsTrigger value="style" className="data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A]">
              <Palette className="h-4 w-4 mr-2" />
              Style
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="layers" className="space-y-4 p-4 m-0">
              <div className="space-y-3">
                {layers.length === 0 ? (
                  <div className="text-center py-8">
                    <Layers className="h-12 w-12 text-[#F9F9F9]/30 mx-auto mb-4" />
                    <p className="text-sm text-[#F9F9F9]/50">No layers loaded</p>
                  </div>
                ) : (
                  layers.map((layer) => (
                    <Card key={layer.id} className="bg-[#0D1B2A] border-[#43AA8B]/20">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={layer.visible}
                              onCheckedChange={(checked) => onLayerToggle(layer.id, checked)}
                            />
                            <span className="text-sm font-medium text-white">{layer.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedLayer(selectedLayer === layer.id ? '' : layer.id)}
                            className="p-1 text-[#F9F9F9]"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-[#F9F9F9]/70">Opacity: {layer.opacity}%</label>
                            <Slider
                              value={[layer.opacity]}
                              onValueChange={(value) => onLayerOpacityChange(layer.id, value[0])}
                              max={100}
                              step={1}
                              className="mt-1"
                            />
                          </div>
                          
                          <Badge variant="outline" className="text-xs border-[#43AA8B]/50 text-[#43AA8B]">
                            {layer.type}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="basemap" className="space-y-4 p-4 m-0">
              <div className="grid grid-cols-2 gap-3">
                {basemaps.map((basemap) => (
                  <Card 
                    key={basemap.id} 
                    className={`cursor-pointer transition-all ${
                      selectedBasemap === basemap.id 
                        ? 'bg-[#F4D35E]/10 border-[#F4D35E]' 
                        : 'bg-[#0D1B2A] border-[#43AA8B]/20 hover:border-[#43AA8B]/40'
                    }`}
                    onClick={() => setSelectedBasemap(basemap.id)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl mb-2">{basemap.preview}</div>
                      <div className="text-xs text-[#F9F9F9]/70">{basemap.name}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 p-4 m-0">
              {selectedLayer && layers.find(l => l.id === selectedLayer) ? (
                <LayerStylePanel layer={layers.find(l => l.id === selectedLayer)!} />
              ) : (
                <div className="text-center py-8">
                  <Palette className="h-12 w-12 text-[#F9F9F9]/30 mx-auto mb-4" />
                  <p className="text-sm text-[#F9F9F9]/50">Select a layer to edit styles</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Export Options */}
        <div className="p-4 border-t border-[#43AA8B]/20 space-y-3">
          <h4 className="text-sm font-semibold text-white">Export Map</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => handleExport('png')} className="border-[#43AA8B]/50 text-[#43AA8B]">
              PNG
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExport('pdf')} className="border-[#43AA8B]/50 text-[#43AA8B]">
              PDF
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExport('geotiff')} className="border-[#43AA8B]/50 text-[#43AA8B]">
              GeoTIFF
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExport('html')} className="border-[#43AA8B]/50 text-[#43AA8B]">
              HTML
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMapLab;