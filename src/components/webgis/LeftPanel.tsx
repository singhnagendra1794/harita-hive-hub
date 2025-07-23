import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Layers, Upload, Settings, Map, Database, Filter,
  Eye, EyeOff, Move, Edit3, Ruler, Square, Circle,
  Search, Plus, Trash2, Download, Globe
} from 'lucide-react';

interface MapLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'basemap';
  visible: boolean;
  opacity: number;
  style?: any;
  data?: any;
  metadata?: {
    featureCount?: number;
    crs?: string;
    bounds?: [number, number, number, number];
    bands?: number;
    geometry?: string;
    provider?: string;
    source?: string;
  };
}

interface Basemap {
  id: string;
  name: string;
  url: string;
  attribution: string;
  type: 'osm' | 'carto' | 'stamen' | 'esri' | 'nasa' | 'opentopo';
  variant?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  layers: string[];
}

interface LeftPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  layers: MapLayer[];
  basemaps: Basemap[];
  selectedBasemap: Basemap;
  templates: Template[];
  onFileUpload: (files: File[]) => void;
  onBasemapChange: (basemap: Basemap) => void;
  onLayerToggle: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerStyleChange: (layerId: string, style: any) => void;
  onTemplateLoad: (templateId: string) => void;
  activeTool: string;
  onToolChange: (tool: string) => void;
}

const tools = [
  { id: 'select', name: 'Select', icon: Move },
  { id: 'draw-point', name: 'Add Point', icon: Circle },
  { id: 'draw-line', name: 'Draw Line', icon: Edit3 },
  { id: 'draw-polygon', name: 'Draw Polygon', icon: Square },
  { id: 'measure', name: 'Measure', icon: Ruler },
  { id: 'filter', name: 'Filter', icon: Filter }
];

const LeftPanel = ({
  activeTab,
  setActiveTab,
  layers,
  basemaps,
  selectedBasemap,
  templates,
  onFileUpload,
  onBasemapChange,
  onLayerToggle,
  onLayerOpacityChange,
  onLayerStyleChange,
  onTemplateLoad,
  activeTool,
  onToolChange
}: LeftPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const filteredLayers = layers.filter(layer => 
    layer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-6 m-4 mb-0">
          <TabsTrigger value="layers">
            <Layers className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="basemap">
            <Globe className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Edit3 className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Map className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="layers" className="h-full m-0 p-4">
            <div className="space-y-4 h-full flex flex-col">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search layers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {filteredLayers.map((layer) => (
                    <Card key={layer.id} className={selectedLayer === layer.id ? 'ring-2 ring-primary' : ''}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onLayerToggle(layer.id)}
                              className="p-1"
                            >
                              {layer.visible ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4 opacity-50" />
                              )}
                            </Button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{layer.name}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant={layer.type === 'vector' ? 'default' : 'secondary'} className="text-xs">
                                  {layer.type}
                                </Badge>
                                {layer.metadata?.featureCount && (
                                  <span className="text-xs text-muted-foreground">
                                    {layer.metadata.featureCount} features
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {layer.type !== 'basemap' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {selectedLayer === layer.id && layer.type !== 'basemap' && (
                          <div className="space-y-3 mt-3 pt-3 border-t">
                            <div>
                              <label className="text-xs font-medium">Opacity: {Math.round(layer.opacity * 100)}%</label>
                              <Slider
                                value={[layer.opacity * 100]}
                                onValueChange={([value]) => onLayerOpacityChange(layer.id, value / 100)}
                                max={100}
                                step={5}
                                className="mt-1"
                              />
                            </div>
                            
                            {layer.metadata && (
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div>CRS: {layer.metadata.crs}</div>
                                {layer.metadata.geometry && <div>Geometry: {layer.metadata.geometry}</div>}
                                {layer.metadata.provider && <div>Source: {layer.metadata.provider}</div>}
                              </div>
                            )}
                            
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" className="text-xs">
                                <Download className="h-3 w-3 mr-1" />
                                Export
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="h-full m-0 p-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Upload Data Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Drop files here or click to browse
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".shp,.geojson,.kml,.csv,.tif,.tiff"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Select Files
                      </label>
                    </Button>
                    <div className="text-xs text-muted-foreground mt-2">
                      Supports: SHP, GeoJSON, KML, CSV, TIFF
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Uploads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No recent uploads
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="basemap" className="h-full m-0 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {basemaps.map((basemap) => (
                  <Card 
                    key={basemap.id} 
                    className={`cursor-pointer transition-all ${selectedBasemap.id === basemap.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => onBasemapChange(basemap)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded border bg-gradient-to-br ${
                          basemap.type === 'osm' ? 'from-blue-100 to-green-100' :
                          basemap.type === 'esri' ? 'from-green-100 to-brown-100' :
                          basemap.type === 'carto' ? 'from-gray-100 to-blue-100' :
                          'from-orange-100 to-yellow-100'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{basemap.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {basemap.attribution}
                          </p>
                        </div>
                        {selectedBasemap.id === basemap.id && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tools" className="h-full m-0 p-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Drawing & Editing Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {tools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Button
                          key={tool.id}
                          variant={activeTool === tool.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onToolChange(tool.id)}
                          className="justify-start"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {tool.name}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Geoprocessing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Buffer Analysis
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Spatial Join
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Clip
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Intersect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="h-full m-0 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-medium">{template.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            {template.layers.length} layers
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTemplateLoad(template.id)}
                          >
                            Load Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="data" className="h-full m-0 p-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      OpenStreetMap
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Sentinel Hub
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Google Earth Engine
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      PostGIS Database
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">WFS/WMS Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Input placeholder="Service URL" className="text-sm" />
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default LeftPanel;