
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Map, 
  Layers, 
  Settings, 
  Save, 
  Share2, 
  Download,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Palette
} from "lucide-react";

interface Layer {
  id: string;
  name: string;
  type: 'geojson' | 'csv' | 'wms' | 'wmts';
  url?: string;
  data?: any;
  visible: boolean;
  opacity: number;
  color: string;
  style: any;
}

interface MapProject {
  id: string;
  name: string;
  description: string;
  layers: Layer[];
  center: [number, number];
  zoom: number;
  basemap: string;
  widgets: string[];
  isPublic: boolean;
}

const MapBuilder = () => {
  const [currentProject, setCurrentProject] = useState<MapProject>({
    id: '',
    name: 'Untitled Map',
    description: '',
    layers: [],
    center: [0, 0],
    zoom: 2,
    basemap: 'osm',
    widgets: [],
    isPublic: false
  });

  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const basemaps = [
    { id: 'osm', name: 'OpenStreetMap' },
    { id: 'satellite', name: 'Satellite' },
    { id: 'terrain', name: 'Terrain' },
    { id: 'dark', name: 'Dark Theme' }
  ];

  const layerTypes = [
    { id: 'geojson', name: 'GeoJSON', description: 'Vector data' },
    { id: 'csv', name: 'CSV', description: 'Point data with coordinates' },
    { id: 'wms', name: 'WMS', description: 'Web Map Service' },
    { id: 'wmts', name: 'WMTS', description: 'Web Map Tile Service' }
  ];

  const widgets = [
    { id: 'legend', name: 'Legend' },
    { id: 'scale', name: 'Scale Bar' },
    { id: 'coordinates', name: 'Coordinates' },
    { id: 'search', name: 'Search' },
    { id: 'measure', name: 'Measurement Tool' }
  ];

  const addLayer = (type: string, name: string) => {
    const newLayer: Layer = {
      id: `layer_${Date.now()}`,
      name: name || `New ${type.toUpperCase()} Layer`,
      type: type as Layer['type'],
      visible: true,
      opacity: 100,
      color: '#3b82f6',
      style: {}
    };

    setCurrentProject(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer]
    }));
  };

  const updateLayer = (layerId: string, updates: Partial<Layer>) => {
    setCurrentProject(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      )
    }));
  };

  const removeLayer = (layerId: string) => {
    setCurrentProject(prev => ({
      ...prev,
      layers: prev.layers.filter(layer => layer.id !== layerId)
    }));
    if (selectedLayer === layerId) {
      setSelectedLayer(null);
    }
  };

  const toggleWidget = (widgetId: string) => {
    setCurrentProject(prev => ({
      ...prev,
      widgets: prev.widgets.includes(widgetId)
        ? prev.widgets.filter(w => w !== widgetId)
        : [...prev.widgets, widgetId]
    }));
  };

  const saveProject = async () => {
    setIsSaving(true);
    try {
      // Save to backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Project saved:', currentProject);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedLayerData = selectedLayer 
    ? currentProject.layers.find(l => l.id === selectedLayer)
    : null;

  return (
    <div className="h-full flex">
      {/* Left Panel - Controls */}
      <div className="w-80 border-r bg-background overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Project Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Project Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={currentProject.name}
                  onChange={(e) => setCurrentProject(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="project-desc">Description</Label>
                <Input
                  id="project-desc"
                  value={currentProject.description}
                  onChange={(e) => setCurrentProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="public-toggle">Public Project</Label>
                <Switch
                  id="public-toggle"
                  checked={currentProject.isPublic}
                  onCheckedChange={(checked) => setCurrentProject(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Basemap Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Basemap</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={currentProject.basemap} onValueChange={(value) => setCurrentProject(prev => ({ ...prev, basemap: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {basemaps.map(basemap => (
                    <SelectItem key={basemap.id} value={basemap.id}>
                      {basemap.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Layers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Layers ({currentProject.layers.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add Layer Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {layerTypes.map(type => (
                  <Button
                    key={type.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addLayer(type.id, `${type.name} Layer`)}
                    className="h-auto p-2"
                  >
                    <div className="text-center">
                      <Plus className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-xs">{type.name}</div>
                    </div>
                  </Button>
                ))}
              </div>

              <Separator />

              {/* Layer List */}
              <div className="space-y-2">
                {currentProject.layers.map(layer => (
                  <div
                    key={layer.id}
                    className={`p-2 border rounded cursor-pointer transition-colors ${
                      selectedLayer === layer.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => setSelectedLayer(layer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { visible: !layer.visible });
                          }}
                        >
                          {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <div>
                          <div className="font-medium text-sm">{layer.name}</div>
                          <div className="text-xs text-muted-foreground">{layer.type.toUpperCase()}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLayer(layer.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {currentProject.layers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No layers added yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Widgets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Map Widgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {widgets.map(widget => (
                  <div key={widget.id} className="flex items-center justify-between">
                    <Label htmlFor={`widget-${widget.id}`}>{widget.name}</Label>
                    <Switch
                      id={`widget-${widget.id}`}
                      checked={currentProject.widgets.includes(widget.id)}
                      onCheckedChange={() => toggleWidget(widget.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{currentProject.name}</h2>
              {currentProject.isPublic && (
                <Badge variant="secondary">Public</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={saveProject} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 flex">
          {/* Map Area */}
          <div className="flex-1 bg-slate-100 relative">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Interactive map will render here</p>
                <p className="text-sm">Basemap: {basemaps.find(b => b.id === currentProject.basemap)?.name}</p>
                <p className="text-sm">Layers: {currentProject.layers.length}</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Layer Properties */}
          {selectedLayerData && (
            <div className="w-64 border-l bg-background p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Layer Properties</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="layer-name">Name</Label>
                      <Input
                        id="layer-name"
                        value={selectedLayerData.name}
                        onChange={(e) => updateLayer(selectedLayerData.id, { name: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label>Opacity: {selectedLayerData.opacity}%</Label>
                      <Slider
                        value={[selectedLayerData.opacity]}
                        onValueChange={([value]) => updateLayer(selectedLayerData.id, { opacity: value })}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="layer-color">Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedLayerData.color}
                          onChange={(e) => updateLayer(selectedLayerData.id, { color: e.target.value })}
                          className="w-8 h-8 rounded border"
                        />
                        <Input
                          value={selectedLayerData.color}
                          onChange={(e) => updateLayer(selectedLayerData.id, { color: e.target.value })}
                        />
                      </div>
                    </div>

                    {selectedLayerData.type === 'wms' && (
                      <div>
                        <Label htmlFor="wms-url">WMS URL</Label>
                        <Input
                          id="wms-url"
                          value={selectedLayerData.url || ''}
                          onChange={(e) => updateLayer(selectedLayerData.id, { url: e.target.value })}
                          placeholder="https://example.com/geoserver/wms"
                        />
                      </div>
                    )}

                    {selectedLayerData.type === 'geojson' && (
                      <div>
                        <Label htmlFor="geojson-url">GeoJSON URL</Label>
                        <Input
                          id="geojson-url"
                          value={selectedLayerData.url || ''}
                          onChange={(e) => updateLayer(selectedLayerData.id, { url: e.target.value })}
                          placeholder="https://example.com/data.geojson"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapBuilder;
