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
  Globe,
  Brain,
  Shield,
  Database,
  Paintbrush,
  Building,
  Code
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
import AnalyticsDashboard from "./AnalyticsDashboard";
import AIInsights from "./AIInsights";
import ExportManager from "./ExportManager";
import UserManagement from "./UserManagement";
import WorkflowDesigner from "./WorkflowDesigner";
import APIBuilder from "./APIBuilder";
import AutomationEngine from "./AutomationEngine";
import EnterpriseIntegration from "./EnterpriseIntegration";
import 'leaflet/dist/leaflet.css';

interface EnhancedMapBuilderProps {
  projectId: string;
  onBack: () => void;
}

export const EnhancedMapBuilder = ({ projectId, onBack }: EnhancedMapBuilderProps) => {
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('design');
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

  const tabs = [
    { id: 'design', name: 'Design', icon: Paintbrush },
    { id: 'data', name: 'Data', icon: Database },
    { id: 'analysis', name: 'Analysis', icon: BarChart3 },
    { id: 'collaboration', name: 'Collaborate', icon: Users },
    { id: 'templates', name: 'Templates', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'ai-insights', name: 'AI Insights', icon: Brain },
    { id: 'export', name: 'Export', icon: Download },
    { id: 'users', name: 'Users', icon: Shield },
    { id: 'workflows', name: 'Workflows', icon: Zap },
    { id: 'api', name: 'API Builder', icon: Code },
    { id: 'automation', name: 'Automation', icon: Settings },
    { id: 'enterprise', name: 'Enterprise', icon: Building },
    { id: 'publish', name: 'Publish', icon: Globe }
  ];

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
            <Button variant="outline" size="sm" onClick={() => setUseMapbox(!useMapbox)}>
              <Globe className="h-4 w-4 mr-2" />
              {useMapbox ? 'Mapbox' : 'Leaflet'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleSaveProject}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tabs */}
        <div className={`bg-muted/20 border-r transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'} flex flex-col`}>
          <div className="p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              {!sidebarCollapsed && "Tools & Features"}
            </Button>
          </div>

          {!sidebarCollapsed && (
            <div className="flex-1 overflow-auto">
              {/* Tab Navigation */}
              <div className="p-4 border-b">
                <div className="grid grid-cols-2 gap-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-2 justify-start h-10"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-xs">{tab.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                <div className="space-y-4">
                  {/* Design Tab */}
                  {activeTab === 'design' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Map Layers</h3>
                        <Button size="sm" onClick={handleAddLayer}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Layer
                        </Button>
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
                                <span className="font-medium text-sm">{layer.name}</span>
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

                      <Separator />

                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Widgets</h3>
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
                            className="h-12 flex flex-col gap-1"
                            onClick={() => handleAddWidget()}
                          >
                            {type === 'legend' && <Map className="h-4 w-4" />}
                            {type === 'scale' && <BarChart3 className="h-4 w-4" />}
                            {type === 'coordinates' && <MapPin className="h-4 w-4" />}
                            {type === 'filter' && <Settings className="h-4 w-4" />}
                            {type === 'chart' && <TrendingUp className="h-4 w-4" />}
                            <span className="text-xs capitalize">{type}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data Tab */}
                  {activeTab === 'data' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Data Sources</h3>
                        <Button size="sm" onClick={() => setImportDialogOpen(true)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Import Data
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">
                            Import GeoJSON, Shapefile, KML, or CSV data to create map layers.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Analysis Tab */}
                  {activeTab === 'analysis' && (
                    <SpatialAnalysisPanel 
                      layers={layers}
                      onAnalysisComplete={handleAnalysisComplete}
                    />
                  )}

                  {/* Collaboration Tab */}
                  {activeTab === 'collaboration' && (
                    <CollaborationPanel 
                      projectId={projectId}
                      currentUser={null}
                    />
                  )}

                  {/* Templates Tab */}
                  {activeTab === 'templates' && (
                    <DashboardTemplates 
                      open={true}
                      onClose={() => {}}
                      onSelectTemplate={handleTemplateSelect} 
                    />
                  )}
                  
                  {/* Analytics Tab */}
                  {activeTab === 'analytics' && (
                    <AnalyticsDashboard projectId={projectId} />
                  )}
                  
                  {/* AI Insights Tab */}
                  {activeTab === 'ai-insights' && (
                    <AIInsights projectId={projectId} />
                  )}
                  
                  {/* Export Tab */}
                  {activeTab === 'export' && (
                    <ExportManager projectId={projectId} />
                  )}
                  
                  {/* Users Tab */}
                  {activeTab === 'users' && (
                    <UserManagement projectId={projectId} />
                  )}

                  {/* Phase 5 Tabs */}
                  {activeTab === 'workflows' && (
                    <WorkflowDesigner projectId={projectId} />
                  )}
                  
                  {activeTab === 'api' && (
                    <APIBuilder projectId={projectId} />
                  )}
                  
                  {activeTab === 'automation' && (
                    <AutomationEngine projectId={projectId} />
                  )}
                  
                  {activeTab === 'enterprise' && (
                    <EnterpriseIntegration projectId={projectId} />
                  )}

                  {/* Publish Tab */}
                  {activeTab === 'publish' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Publish Dashboard</h3>
                      <Card>
                        <CardContent className="p-4 space-y-4">
                          <div className="space-y-2">
                            <Label>Dashboard URL</Label>
                            <Input 
                              value={`https://app.webgis.com/dashboard/${projectId}`}
                              readOnly 
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Public Access</Label>
                            <Switch />
                          </div>
                          <Button 
                            onClick={() => setPublishDialogOpen(true)}
                            className="w-full"
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Publish Dashboard
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
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

      {/* Dialogs */}
      <DataImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        projectId={projectId}
        onLayerAdded={handleImportedLayerAdded}
      />

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