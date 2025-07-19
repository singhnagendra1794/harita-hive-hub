import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowLeft, 
  Layers, 
  Plus, 
  Eye, 
  EyeOff, 
  Settings, 
  Trash2,
  Save,
  Share2,
  Download,
  Map,
  BarChart3,
  Gauge,
  PieChart,
  TrendingUp,
  MapPin,
  Upload,
  Zap,
  Users,
  FileText,
  Globe
} from "lucide-react";
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useWebGISBuilder } from "@/hooks/useWebGISBuilder";
import { useToast } from "@/hooks/use-toast";
import { DataImportDialog } from "./DataImportDialog";
import { SpatialAnalysisPanel } from "./SpatialAnalysisPanel";
import { PublishDashboardDialog } from "./PublishDashboardDialog";
import { MapboxRenderer } from "./MapboxRenderer";
import { CollaborationPanel } from "./CollaborationPanel";
import { DashboardTemplates } from "./DashboardTemplates";
import 'leaflet/dist/leaflet.css';

interface EnhancedMapBuilderProps {
  projectId: string;
  onBack: () => void;
}

export const EnhancedMapBuilder = ({ projectId, onBack }: EnhancedMapBuilderProps) => {
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'layers' | 'widgets' | 'analysis' | 'collaborate' | 'settings'>('layers');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);
  const [useMapbox, setUseMapbox] = useState(true);
  const mapRef = useRef<any>(null);
  
  const { 
    layers, 
    widgets, 
    loading, 
    addLayer, 
    updateLayer, 
    deleteLayer, 
    addWidget, 
    updateWidget, 
    deleteWidget,
    refetch 
  } = useWebGISBuilder(projectId);
  
  const { toast } = useToast();

  const handleAddLayer = async () => {
    const newLayer = {
      name: 'New Layer',
      type: 'geojson' as const,
      source_data: { type: 'FeatureCollection', features: [] },
      style_config: {
        color: '#3b82f6',
        weight: 2,
        fillOpacity: 0.3
      },
      is_visible: true,
      layer_order: layers.length,
      project_id: projectId
    };

    await addLayer(newLayer);
  };

  const handleAddWidget = async () => {
    const newWidget = {
      type: 'chart' as const,
      title: 'New Chart',
      position: 'top-left' as const,
      config: {
        chartType: 'bar',
        dataSource: 'layer1',
        title: 'Sample Chart'
      },
      is_visible: true,
      project_id: projectId
    };

    await addWidget(newWidget);
  };

  const handleImportedLayerAdded = async (layerData: any) => {
    await addLayer(layerData);
  };

  const handleAnalysisComplete = async (result: any) => {
    const analysisLayer = {
      name: result.name,
      type: 'geojson' as const,
      source_data: result,
      style_config: result.style,
      is_visible: true,
      layer_order: layers.length,
      project_id: projectId
    };
    await addLayer(analysisLayer);
  };

  const handleSaveProject = async () => {
    toast({
      title: "Project saved",
      description: "All changes have been saved successfully."
    });
  };

  const handleExportProject = async () => {
    toast({
      title: "Export started",
      description: "Your dashboard export will be ready shortly."
    });
  };

  const handleProjectUpdate = (updates: any) => {
    setCurrentProject(prev => ({ ...prev, ...updates }));
  };

  const handleTemplateSelect = async (template: any) => {
    // Apply template layers and widgets
    for (const layerTemplate of template.layers) {
      await addLayer({
        name: layerTemplate.name,
        type: layerTemplate.type,
        source_data: layerTemplate.sampleData || {},
        style_config: layerTemplate.style,
        is_visible: true,
        layer_order: layers.length,
        project_id: projectId
      });
    }

    for (const widgetTemplate of template.widgets) {
      await addWidget({
        type: widgetTemplate.type,
        title: widgetTemplate.config?.title || widgetTemplate.type,
        position: widgetTemplate.position,
        config: widgetTemplate.config || {},
        is_visible: true,
        project_id: projectId
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <h1 className="text-2xl font-bold">WebGIS Dashboard Builder</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setTemplatesDialogOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button variant="outline" size="sm" onClick={() => setUseMapbox(!useMapbox)}>
              <Globe className="h-4 w-4 mr-2" />
              {useMapbox ? 'Mapbox' : 'Leaflet'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`bg-muted/20 border-r transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'} flex flex-col`}>
          <div className="p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              {!sidebarCollapsed && "Tools & Layers"}
            </Button>
          </div>

          {!sidebarCollapsed && (
            <div className="flex-1 overflow-auto p-4">
              <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="layers" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Layers
                  </TabsTrigger>
                  <TabsTrigger value="widgets" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Widgets
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Analysis
                  </TabsTrigger>
                  <TabsTrigger value="collaborate" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Collaborate
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="layers" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Map Layers</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setImportDialogOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </Button>
                      <Button size="sm" onClick={handleAddLayer}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Layer
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <Card key={layer.id} className={`p-3 cursor-pointer transition-colors ${
                        selectedLayer === layer.id ? 'ring-2 ring-primary' : ''
                      }`} onClick={() => setSelectedLayer(layer.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLayer(layer.id, { is_visible: !layer.is_visible });
                              }}
                            >
                              {layer.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <span className="font-medium">{layer.name}</span>
                            <Badge variant="outline" className="text-xs ml-2">
                              {layer.type.toUpperCase()}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLayer(layer.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="widgets" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Map Widgets</h3>
                    <Button size="sm" onClick={handleAddWidget}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Widget
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {['legend', 'scale', 'coordinates', 'filter', 'chart'].map((type) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        className="h-16 flex flex-col gap-1"
                        onClick={() => handleAddWidget()}
                      >
                        {type === 'legend' && <Map className="h-5 w-5" />}
                        {type === 'scale' && <BarChart3 className="h-5 w-5" />}
                        {type === 'coordinates' && <MapPin className="h-5 w-5" />}
                        {type === 'filter' && <Settings className="h-5 w-5" />}
                        {type === 'chart' && <TrendingUp className="h-5 w-5" />}
                        <span className="text-xs capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {widgets.map((widget) => (
                      <Card key={widget.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={widget.is_visible}
                              onCheckedChange={(checked) =>
                                updateWidget(widget.id, { is_visible: checked })
                              }
                            />
                            <span className="font-medium">{widget.title}</span>
                            <span className="text-sm capitalize">{widget.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {widget.position}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteWidget(widget.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <SpatialAnalysisPanel 
                    layers={layers}
                    onAnalysisComplete={handleAnalysisComplete}
                  />
                </TabsContent>

                <TabsContent value="collaborate" className="space-y-4">
                  <CollaborationPanel 
                    projectId={projectId}
                    currentUser={null} // Would get from auth context
                  />
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input placeholder="Enter project name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input placeholder="Project description" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Public Access</Label>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSaveProject}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPublishDialogOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Publish
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportProject}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {useMapbox ? (
            <MapboxRenderer
              layers={layers}
              widgets={widgets}
              onMapReady={(map) => { mapRef.current = map; }}
            />
          ) : (
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              ref={mapRef}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </MapContainer>
          )}
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

      {/* Dashboard Templates Dialog */}
      <DashboardTemplates
        open={templatesDialogOpen}
        onClose={() => setTemplatesDialogOpen(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
};

export default EnhancedMapBuilder;