import React, { useState, useEffect, useRef } from "react";
import { DataImportDialog } from "./DataImportDialog";
import { SpatialAnalysisPanel } from "./SpatialAnalysisPanel";
import { PublishDashboardDialog } from "./PublishDashboardDialog";
import { MapContainer, TileLayer, LayersControl, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Map, 
  Layers, 
  Settings, 
  Share2, 
  Save, 
  Eye, 
  Upload,
  Download,
  Palette,
  Grid,
  MousePointer,
  Plus,
  Minus,
  MapPin,
  BarChart3,
  Filter,
  RefreshCw,
  ExternalLink,
  Trash2,
  ChevronUp,
  ChevronDown,
  Play,
  Pause
} from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWebGISBuilder } from "@/hooks/useWebGISBuilder";
import { useWebGISProjects } from "@/hooks/useWebGISProjects";
import 'leaflet/dist/leaflet.css';

interface EnhancedMapBuilderProps {
  projectId: string;
  onBack: () => void;
}

interface MapConfig {
  title: string;
  basemap: string;
  center: [number, number];
  zoom: number;
  theme: string;
}

const SortableLayerItem: React.FC<{
  id: string;
  layer: any;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}> = ({ id, layer, onToggleVisibility, onDelete, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="p-3 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div {...listeners} className="cursor-grab hover:cursor-grabbing p-1">
              <Grid className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="checkbox"
              checked={layer.is_visible}
              onChange={() => onToggleVisibility(layer.id)}
              className="mr-2"
            />
            <div>
              <span className="text-sm font-medium">{layer.name}</span>
              <Badge variant="outline" className="text-xs ml-2">
                {layer.layer_type.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(layer.id)}>
              <Settings className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(layer.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
};

const EnhancedMapBuilder: React.FC<EnhancedMapBuilderProps> = ({ projectId, onBack }) => {
  const [mapConfig, setMapConfig] = useState<MapConfig>({
    title: "My WebGIS Dashboard",
    basemap: "osm",
    center: [0, 0],
    zoom: 2,
    theme: "light"
  });

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [fileUploadType, setFileUploadType] = useState<'geojson' | 'csv' | 'api'>('geojson');
  const [analysisMode, setAnalysisMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { 
    layers, 
    widgets, 
    loading,
    addLayer,
    updateLayer,
    deleteLayer,
    addWidget,
    updateWidget,
    deleteWidget
  } = useWebGISBuilder(projectId);

  const { updateProject } = useWebGISProjects();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Load project config when component mounts
    // This would typically come from the project data
  }, [projectId]);

  const handleSave = async () => {
    try {
      await updateProject(projectId, {
        config: mapConfig,
        title: mapConfig.title
      });
      toast({
        title: "Dashboard Saved",
        description: "Your WebGIS dashboard has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save dashboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/dashboard/${projectId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share Link Copied",
      description: "Dashboard share link has been copied to clipboard.",
    });
  };

  const handleExport = () => {
    // Generate export data
    const exportData = {
      config: mapConfig,
      layers: layers,
      widgets: widgets,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapConfig.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Dashboard configuration has been downloaded.",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileUploadType);

      // In a real implementation, this would upload to a backend service
      // For now, we'll simulate the process
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          let data;
          let layerType = fileUploadType;

          if (fileUploadType === 'geojson') {
            data = JSON.parse(e.target?.result as string);
          } else if (fileUploadType === 'csv') {
            // CSV parsing would be implemented here
            data = { type: 'FeatureCollection', features: [] };
            layerType = 'geojson'; // Convert shapefile to geojson format
          }

          await addLayer({
            name: file.name.replace(/\.[^/.]+$/, ""),
            layer_type: layerType as any,
            data_source: JSON.stringify(data),
            style_config: {
              color: '#3b82f6',
              weight: 2,
              fillOpacity: 0.3
            },
            is_visible: true,
            layer_order: layers.length,
            project_id: projectId,
            opacity: 1
          });

          setUploadDialogOpen(false);
          toast({
            title: "File Uploaded",
            description: `${file.name} has been added as a layer.`,
          });
        } catch (error) {
          toast({
            title: "Upload Error",
            description: "Failed to process the uploaded file.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload file.",
        variant: "destructive"
      });
    }
  };

  const handleLayerReorder = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = layers.findIndex(layer => layer.id === active.id);
      const newIndex = layers.findIndex(layer => layer.id === over.id);
      
      const reorderedLayers = arrayMove(layers, oldIndex, newIndex);
      
      // Update layer orders in database
      reorderedLayers.forEach((layer, index) => {
        updateLayer(layer.id, { layer_order: index });
      });
    }
  };

  const toggleLayerVisibility = async (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      await updateLayer(layerId, { is_visible: !layer.is_visible });
    }
  };

  const addNewWidget = async (type: 'legend' | 'scale' | 'coordinates' | 'filter' | 'chart') => {
    await addWidget({
      widget_type: type as any,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
      position: { x: 20, y: 20 },
      size: { width: 200, height: 100 },
      config: {},
      is_visible: true,
      project_id: projectId
    });
  };

  const handleImportedLayerAdded = async (layerData: any) => {
    await addLayer(layerData);
  };

  const handleAnalysisComplete = async (result: any) => {
    const analysisLayer = {
      name: result.name,
      layer_type: 'geojson' as const,
      data_source: JSON.stringify(result),
      style_config: result.style,
      is_visible: true,
      layer_order: layers.length,
      project_id: projectId,
      opacity: 1
    };
    await addLayer(analysisLayer);
  };

  const handleProjectUpdate = (updates: any) => {
    setCurrentProject(prev => ({ ...prev, ...updates }));
  };

  const getBasemapUrl = (basemap: string) => {
    const basemaps = {
      osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    };
    return basemaps[basemap as keyof typeof basemaps] || basemaps.osm;
  };

  return (
    <div className="h-screen flex">
      {/* Left Panel - Configuration */}
      <div className="w-80 bg-background border-r overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Map Builder
            </h2>
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Drag & Drop Interface</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 m-4 text-xs">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Dashboard Title</Label>
              <Input
                id="title"
                value={mapConfig.title}
                onChange={(e) => setMapConfig({...mapConfig, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basemap">Basemap</Label>
              <Select value={mapConfig.basemap} onValueChange={(value) => setMapConfig({...mapConfig, basemap: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="osm">OpenStreetMap</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                  <SelectItem value="dark">Dark Theme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="zoom">Zoom Level</Label>
                <Input
                  id="zoom"
                  type="number"
                  min="1"
                  max="18"
                  value={mapConfig.zoom}
                  onChange={(e) => setMapConfig({...mapConfig, zoom: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={mapConfig.theme} onValueChange={(value) => setMapConfig({...mapConfig, theme: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={mapConfig.center[0]}
                  onChange={(e) => setMapConfig({...mapConfig, center: [parseFloat(e.target.value), mapConfig.center[1]]})}
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={mapConfig.center[1]}
                  onChange={(e) => setMapConfig({...mapConfig, center: [mapConfig.center[0], parseFloat(e.target.value)]})}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layers" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Data Layers ({layers.length})</h3>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Layer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Data Layer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Data Source Type</Label>
                      <Select value={fileUploadType} onValueChange={(value: any) => setFileUploadType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="geojson">GeoJSON File</SelectItem>
                          <SelectItem value="csv">CSV File</SelectItem>
                          <SelectItem value="shapefile">Shapefile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Upload File</Label>
                      <Input type="file" onChange={handleFileUpload} accept=".geojson,.json,.csv,.zip" />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleLayerReorder}
            >
              <SortableContext items={layers.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {layers.map((layer) => (
                    <SortableLayerItem
                      key={layer.id}
                      id={layer.id}
                      layer={layer}
                      onToggleVisibility={toggleLayerVisibility}
                      onDelete={deleteLayer}
                      onEdit={(id) => {
                        // Open layer editing dialog
                        toast({
                          title: "Layer Settings",
                          description: "Layer editing interface coming soon!",
                        });
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {layers.length === 0 && (
              <Card className="text-center py-8">
                <CardContent>
                  <Map className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No layers added yet</p>
                  <p className="text-xs text-muted-foreground">Upload data files to get started</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="widgets" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Map Widgets ({widgets.length})</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => addNewWidget('legend')}>
                <Grid className="h-4 w-4 mr-1" />
                Legend
              </Button>
              <Button variant="outline" size="sm" onClick={() => addNewWidget('scale')}>
                <MousePointer className="h-4 w-4 mr-1" />
                Scale Bar
              </Button>
              <Button variant="outline" size="sm" onClick={() => addNewWidget('coordinates')}>
                <MapPin className="h-4 w-4 mr-1" />
                Coordinates
              </Button>
              <Button variant="outline" size="sm" onClick={() => addNewWidget('chart')}>
                <BarChart3 className="h-4 w-4 mr-1" />
                Chart
              </Button>
              <Button variant="outline" size="sm" onClick={() => addNewWidget('filter')}>
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Active Widgets</h4>
              {widgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={widget.is_visible}
                      onChange={(e) => updateWidget(widget.id, { is_visible: e.target.checked })}
                    />
                    <span className="text-sm capitalize">{widget.widget_type}</span>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {widget.position.x},{widget.position.y}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => deleteWidget(widget.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Spatial Analysis Tools</h3>
              <Button
                variant={analysisMode ? "default" : "outline"}
                size="sm"
                onClick={() => setAnalysisMode(!analysisMode)}
              >
                {analysisMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" size="sm" disabled={!analysisMode}>
                <MapPin className="h-4 w-4 mr-2" />
                Buffer Analysis
              </Button>
              <Button variant="outline" size="sm" disabled={!analysisMode}>
                <Grid className="h-4 w-4 mr-2" />
                Intersection
              </Button>
              <Button variant="outline" size="sm" disabled={!analysisMode}>
                <Palette className="h-4 w-4 mr-2" />
                Thematic Styling
              </Button>
              <Button variant="outline" size="sm" disabled={!analysisMode}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Temporal Analysis
              </Button>
            </div>

            <Card className="p-3">
              <h4 className="text-sm font-medium mb-2">Temporal Analysis</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={isPlaying ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {isPlaying ? "Playing..." : "Paused"}
                </span>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {analysisMode ? "Analysis Mode" : "Design Mode"}
            </Badge>
            <span className="text-sm text-muted-foreground">{mapConfig.title}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button size="sm" onClick={() => window.open(`/dashboard/${projectId}`, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>

        {/* Map Canvas with Real Leaflet Integration */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapConfig.center}
            zoom={mapConfig.zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <MapUpdater center={mapConfig.center} zoom={mapConfig.zoom} />
            
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Base Map">
                <TileLayer
                  url={getBasemapUrl(mapConfig.basemap)}
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {/* Map Widgets positioned absolutely */}
            {widgets.filter(w => w.is_visible).map(widget => (
              <div
                key={widget.id}
                className="absolute z-[1000] p-2 bg-background/90 backdrop-blur-sm rounded border shadow-sm top-4 left-4"
                style={{
                  left: `${widget.position.x}px`,
                  top: `${widget.position.y}px`,
                  width: `${widget.size.width}px`,
                  minHeight: `${widget.size.height}px`
                }}
              >
                <div className="text-xs font-medium mb-1 capitalize">
                  {widget.widget_type}
                </div>
                <div className="text-xs text-muted-foreground">
                  {widget.widget_type === 'coordinates' && 'Lat: 0.000, Lng: 0.000'}
                  {widget.widget_type === 'scale' && '1:100,000'}
                  {widget.widget_type === 'legend' && 'Map Legend'}
                  {widget.widget_type === 'chart' && 'Data Chart'}
                  {widget.widget_type === 'filter' && 'Layer Filter'}
                </div>
              </div>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Data Import Dialog */}
      <DataImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        projectId={projectId}
        onLayerAdded={handleImportedLayerAdded}
      />

      {/* Publish Dashboard Dialog */}
      <PublishDashboardDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        project={currentProject}
        onProjectUpdate={handleProjectUpdate}
      />
    </div>
  );
};

export default EnhancedMapBuilder;