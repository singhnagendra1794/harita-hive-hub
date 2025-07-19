import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Map, Upload, Layers, Download, Settings, 
  Share, Save, Globe, Mountain, Satellite, 
  Ruler, Edit3, Filter, Eye, EyeOff
} from 'lucide-react';

import BasemapSelector from './BasemapSelector';
import FileUploadZone from './FileUploadZone';
import LayerStylePanel from './LayerStylePanel';
import RasterViewer from './RasterViewer';
import ExportTools from './ExportTools';
import DrawingTools from './DrawingTools';
import MeasurementTools from './MeasurementTools';
import FilterPanel from './FilterPanel';
import ProjectManager from './ProjectManager';

import { useToast } from '@/hooks/use-toast';

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

const basemaps: Basemap[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    type: 'osm'
  },
  {
    id: 'carto-light',
    name: 'Carto Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© CARTO',
    type: 'carto',
    variant: 'light'
  },
  {
    id: 'carto-dark',
    name: 'Carto Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© CARTO',
    type: 'carto',
    variant: 'dark'
  },
  {
    id: 'stamen-terrain',
    name: 'Stamen Terrain',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution: '© Stamen Design',
    type: 'stamen',
    variant: 'terrain'
  },
  {
    id: 'esri-satellite',
    name: 'Esri Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    type: 'esri',
    variant: 'satellite'
  },
  {
    id: 'nasa-gibs',
    name: 'NASA VIIRS',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_ENCC/default/{time}/{tilematrixset}{max_zoom}/{z}/{y}/{x}.jpg',
    attribution: '© NASA GIBS',
    type: 'nasa'
  },
  {
    id: 'opentopo',
    name: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap',
    type: 'opentopo'
  }
];

const EnhancedWebGISViewer = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<MapLayer[]>([
    {
      id: 'basemap',
      name: 'OpenStreetMap',
      type: 'basemap',
      visible: true,
      opacity: 1.0
    }
  ]);
  
  const [selectedBasemap, setSelectedBasemap] = useState<Basemap>(basemaps[0]);
  const [activeTab, setActiveTab] = useState('upload');
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'measure' | 'filter'>('select');
  const [mapCenter] = useState([0, 0]);
  const [mapZoom] = useState(2);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (files: File[]) => {
    const newLayers: MapLayer[] = [];
    
    for (const file of files) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      const layerId = crypto.randomUUID();
      
      let layerType: 'vector' | 'raster' = 'vector';
      if (['tif', 'tiff', 'img', 'jp2'].includes(fileType || '')) {
        layerType = 'raster';
      }
      
      // Simulate file processing
      const layer: MapLayer = {
        id: layerId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: layerType,
        visible: true,
        opacity: 0.8,
        metadata: {
          featureCount: layerType === 'vector' ? Math.floor(Math.random() * 1000) + 10 : undefined,
          crs: 'EPSG:4326',
          bounds: [-180, -90, 180, 90],
          bands: layerType === 'raster' ? Math.floor(Math.random() * 4) + 1 : undefined
        }
      };
      
      newLayers.push(layer);
    }
    
    setLayers(prev => [...prev, ...newLayers]);
    
    toast({
      title: "Files Uploaded",
      description: `Successfully loaded ${files.length} file${files.length > 1 ? 's' : ''}`,
    });
    
    if (newLayers.length > 0) {
      setActiveTab('layers');
    }
  }, [toast]);

  const handleBasemapChange = useCallback((basemap: Basemap) => {
    setSelectedBasemap(basemap);
    setLayers(prev => prev.map(layer => 
      layer.type === 'basemap' 
        ? { ...layer, name: basemap.name }
        : layer
    ));
    
    toast({
      title: "Basemap Changed",
      description: `Switched to ${basemap.name}`,
    });
  }, [toast]);

  const handleLayerToggle = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  }, []);

  const handleLayerOpacityChange = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ));
  }, []);

  const handleLayerStyleChange = useCallback((layerId: string, style: any) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId 
        ? { ...layer, style }
        : layer
    ));
  }, []);

  const handleExportMap = useCallback((format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting map as ${format.toUpperCase()}`,
    });
  }, [toast]);

  const handleSaveProject = useCallback((projectName: string, isPublic: boolean) => {
    const projectData = {
      layers: layers.filter(l => l.type !== 'basemap'),
      basemap: selectedBasemap,
      center: mapCenter,
      zoom: mapZoom
    };
    
    toast({
      title: "Project Saved",
      description: `${projectName} saved successfully`,
    });
    
    console.log('Saving project:', { projectName, isPublic, projectData });
  }, [layers, selectedBasemap, mapCenter, mapZoom, toast]);

  const renderMapCanvas = () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-50 relative overflow-hidden">
      {/* Map Simulation */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
          
          {/* Simulate geographic features based on basemap */}
          {selectedBasemap.type === 'esri' && (
            <>
              <rect x="20%" y="30%" width="60%" height="40%" fill="#8b5cf6" opacity="0.3" rx="10" />
              <circle cx="30%" cy="50%" r="5%" fill="#059669" opacity="0.5" />
              <circle cx="70%" cy="40%" r="3%" fill="#dc2626" opacity="0.5" />
            </>
          )}
          
          {selectedBasemap.type === 'osm' && (
            <>
              <path d="M 10% 60% Q 50% 40% 90% 70%" stroke="#374151" strokeWidth="4" fill="none" opacity="0.6" />
              <path d="M 40% 10% L 45% 90%" stroke="#6b7280" strokeWidth="2" fill="none" opacity="0.5" />
              <circle cx="25%" cy="35%" r="15" fill="#3b82f6" opacity="0.4" />
              <circle cx="75%" cy="65%" r="20" fill="#ef4444" opacity="0.4" />
            </>
          )}
          
          {selectedBasemap.variant === 'terrain' && (
            <>
              <polygon points="20,20 80,30 70,80 30,70" fill="#22c55e" opacity="0.3" />
              <polygon points="60,40 90,50 85,90 55,85" fill="#a3a3a3" opacity="0.3" />
            </>
          )}
        </svg>
      </div>
      
      {/* Layer Features */}
      {layers.filter(layer => layer.visible && layer.type !== 'basemap').map((layer, index) => (
        <div
          key={layer.id}
          className="absolute w-4 h-4 rounded border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"
          style={{
            left: `${25 + (index * 15) % 60}%`,
            top: `${30 + (index * 10) % 40}%`,
            opacity: layer.opacity,
            backgroundColor: layer.type === 'vector' ? '#3b82f6' : '#f59e0b'
          }}
          title={`${layer.name} - ${layer.metadata?.featureCount || 'Raster'} ${layer.type === 'vector' ? 'features' : 'bands: ' + layer.metadata?.bands}`}
        />
      ))}
      
      {/* Map Info Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Globe className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Web GIS Viewer</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {layers.filter(l => l.visible).length} active layers • {selectedBasemap.name}
          </p>
          <div className="flex gap-2 justify-center pointer-events-auto">
            <Button variant="outline" size="sm">
              <Ruler className="h-3 w-3 mr-1" />
              Measure
            </Button>
            <Button variant="outline" size="sm">
              <Edit3 className="h-3 w-3 mr-1" />
              Draw
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-3 w-3 mr-1" />
              Filter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen bg-background">
      {/* Main Map Container */}
      <div ref={mapContainer} className="w-full h-full">
        {renderMapCanvas()}
      </div>

      {/* Basemap Selector */}
      <div className="absolute top-4 left-4 z-10">
        <BasemapSelector 
          basemaps={basemaps}
          selectedBasemap={selectedBasemap}
          onBasemapChange={handleBasemapChange}
        />
      </div>

      {/* Layer Control Panel */}
      <div className="absolute top-4 right-4 w-80 z-10">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Layers
              <Badge variant="secondary" className="ml-auto">
                {layers.filter(l => l.visible).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {layers.map((layer) => (
              <div key={layer.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLayerToggle(layer.id)}
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
                      <Badge variant={layer.type === 'vector' ? 'default' : layer.type === 'raster' ? 'secondary' : 'outline'} className="text-xs">
                        {layer.type}
                      </Badge>
                      {layer.metadata?.featureCount && (
                        <span className="text-xs text-muted-foreground">
                          {layer.metadata.featureCount} features
                        </span>
                      )}
                      {layer.metadata?.bands && (
                        <span className="text-xs text-muted-foreground">
                          {layer.metadata.bands} bands
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {layer.type !== 'basemap' && (
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Tool Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="upload" className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="layers" className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              Style
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-1">
              <Edit3 className="h-4 w-4" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-1">
              <Share className="h-4 w-4" />
              Share
            </TabsTrigger>
            <TabsTrigger value="save" className="flex items-center gap-1">
              <Save className="h-4 w-4" />
              Save
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <FileUploadZone onFileUpload={handleFileUpload} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layers" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <LayerStylePanel
                  layers={layers.filter(l => l.type !== 'basemap') as any}
                  onStyleChange={handleLayerStyleChange}
                  onOpacityChange={handleLayerOpacityChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <DrawingTools onToolActivate={(tool) => setActiveTool(tool as any)} activeTool={activeTool} />
                  <MeasurementTools onMeasure={(type, value) => console.log('Measure:', type, value)} />
                  <FilterPanel 
                    layers={layers.filter(l => l.type === 'vector') as any}
                    onFilter={(layerId, filter) => console.log('Filter:', layerId, filter)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <ExportTools 
                  layers={layers}
                  onExport={handleExportMap}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h3 className="font-medium">Share Map</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      <Share className="h-4 w-4 mr-2" />
                      Public Link
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Embed Code
                    </Button>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    Share your interactive map with others via public link or embed on websites
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="save" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <ProjectManager onSave={handleSaveProject} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedWebGISViewer;