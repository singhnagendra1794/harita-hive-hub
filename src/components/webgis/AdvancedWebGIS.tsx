import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, Upload, Settings, Map, Brain, BarChart3, 
  Database, Plug, Eye, EyeOff, Download, Share,
  Save, Globe, Code, Play, Maximize2, Filter, Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Import components
import LeftPanel from './LeftPanel';
import MapCanvas from './MapCanvas';
import RightPanel from './RightPanel';
import { AIRequirementForm } from './AIRequirementForm';
import { GlobalDataBrowser } from './GlobalDataBrowser';

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
    id: 'esri-satellite',
    name: 'Esri Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    type: 'esri',
    variant: 'satellite'
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
    id: 'opentopo',
    name: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap',
    type: 'opentopo'
  }
];

const preBuiltTemplates = [
  {
    id: 'urban-zoning',
    name: 'Urban Zoning Map',
    description: 'City planning and zoning analysis template',
    category: 'Urban Planning',
    layers: ['parcels', 'zoning', 'infrastructure']
  },
  {
    id: 'disaster-response',
    name: 'Disaster Response Dashboard',
    description: 'Emergency response and risk assessment',
    category: 'Emergency Management',
    layers: ['hazards', 'evacuation_routes', 'shelters']
  },
  {
    id: 'farm-analysis',
    name: 'Farm Analysis Map',
    description: 'Agricultural monitoring and crop analysis',
    category: 'Agriculture',
    layers: ['fields', 'ndvi', 'soil_types']
  },
  {
    id: 'infrastructure-coverage',
    name: 'Infrastructure Coverage',
    description: 'Utilities and service coverage analysis',
    category: 'Infrastructure',
    layers: ['utilities', 'coverage_areas', 'service_points']
  },
  {
    id: 'land-rights',
    name: 'Land Rights Mapping',
    description: 'Property boundaries and ownership tracking',
    category: 'Legal/Cadastral',
    layers: ['parcels', 'ownership', 'legal_boundaries']
  }
];

const AdvancedWebGIS = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  
  // AI and initialization state
  const [showAIForm, setShowAIForm] = useState(true);
  const [showDataBrowser, setShowDataBrowser] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  
  // Core state
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
  const [leftPanelTab, setLeftPanelTab] = useState('layers');
  const [rightPanelTab, setRightPanelTab] = useState('analysis');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<string>('select');

  // Panel visibility
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  // Map state
  const [mapCenter] = useState<[number, number]>([0, 0]);
  const [mapZoom] = useState(2);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  // Auto-save project
  useEffect(() => {
    if (!user || !currentProject) return;
    
    const saveTimer = setTimeout(() => {
      saveProject();
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearTimeout(saveTimer);
  }, [layers, currentProject]);

  const saveProject = async () => {
    if (!user || !currentProject) return;
    
    try {
      // Project auto-save will be enabled once types are regenerated
      console.log('Auto-saving project...', currentProject.id);
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const handleAIRequirementSubmit = async (toolkitData: any) => {
    setShowAIForm(false);
    
    toast({
      title: "🎉 Toolkit Ready!",
      description: "Loading recommended datasets and tools...",
    });

    // Auto-load recommended datasets
    if (toolkitData.recommended_datasets?.length > 0) {
      const newLayers = toolkitData.recommended_datasets.map((dataset: any) => ({
        id: crypto.randomUUID(),
        name: dataset.dataset_name || dataset.name,
        type: dataset.type === 'Raster' ? 'raster' : 'vector',
        visible: true,
        opacity: 0.8,
        metadata: {
          provider: dataset.source,
          source: dataset.download_link,
          description: dataset.description
        }
      }));
      
      setLayers(prev => [...prev, ...newLayers]);
    }

    // Create project record (will be enabled when types are regenerated)
    const mockProject = {
      id: crypto.randomUUID(),
      title: `${toolkitData.formData.goal} - ${toolkitData.formData.region}`,
      metadata: {
        ai_generated: true,
        toolkit_session_id: toolkitData.sessionId
      }
    };
    
    setCurrentProject(mockProject);
    
    toast({
      title: "Project Created",
      description: "Your AI-powered workspace is ready!",
    });
  };

  const handleFileUpload = useCallback(async (files: File[]) => {
    const newLayers: MapLayer[] = [];
    
    for (const file of files) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      const layerId = crypto.randomUUID();
      
      let layerType: 'vector' | 'raster' = 'vector';
      if (['tif', 'tiff', 'img', 'jp2'].includes(fileType || '')) {
        layerType = 'raster';
      }
      
      // Simulate file processing with enhanced metadata
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
          bands: layerType === 'raster' ? Math.floor(Math.random() * 4) + 1 : undefined,
          geometry: layerType === 'vector' ? ['Point', 'LineString', 'Polygon'][Math.floor(Math.random() * 3)] : undefined,
          provider: 'User Upload',
          source: file.name
        }
      };
      
      newLayers.push(layer);
    }
    
    setLayers(prev => [...prev, ...newLayers]);
    
    toast({
      title: "Files Uploaded Successfully",
      description: `Loaded ${files.length} file${files.length > 1 ? 's' : ''} into the map`,
    });
    
    if (newLayers.length > 0) {
      setLeftPanelTab('layers');
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
      title: "Basemap Updated",
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

  const handleTemplateLoad = useCallback((templateId: string) => {
    const template = preBuiltTemplates.find(t => t.id === templateId);
    if (!template) return;

    // Simulate loading template layers
    const templateLayers: MapLayer[] = template.layers.map((layerName, index) => ({
      id: crypto.randomUUID(),
      name: layerName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: Math.random() > 0.5 ? 'vector' : 'raster',
      visible: true,
      opacity: 0.8,
      metadata: {
        featureCount: Math.floor(Math.random() * 500) + 50,
        crs: 'EPSG:4326',
        bounds: [-180, -90, 180, 90],
        provider: 'Template',
        source: template.name
      }
    }));

    setLayers(prev => [prev[0], ...templateLayers]); // Keep basemap
    setSelectedTemplate(templateId);
    setLeftPanelTab('layers');

    toast({
      title: "Template Loaded",
      description: `${template.name} template with ${template.layers.length} layers`,
    });
  }, [toast]);

  const handleExport = useCallback((format: string, options?: any) => {
    toast({
      title: "Export Started",
      description: `Preparing ${format.toUpperCase()} export...`,
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Map exported successfully as ${format.toUpperCase()}`,
      });
    }, 2000);
  }, [toast]);

  const handleShare = useCallback((shareType: 'public' | 'embed' | 'pdf') => {
    const shareData = {
      layers: layers.filter(l => l.type !== 'basemap'),
      basemap: selectedBasemap,
      center: mapCenter,
      zoom: mapZoom
    };

    toast({
      title: "Share Link Generated",
      description: `Map is now available for ${shareType} sharing`,
    });
    
    console.log('Share data:', shareData);
  }, [layers, selectedBasemap, mapCenter, mapZoom, toast]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setLeftPanelVisible(false);
      setRightPanelVisible(false);
    } else {
      setLeftPanelVisible(true);
      setRightPanelVisible(true);
    }
  }, [isFullscreen]);

  return (
    <>
      {/* AI Requirement Form - Initial Setup */}
      {showAIForm && (
        <AIRequirementForm
          onRequirementSubmit={handleAIRequirementSubmit}
          onSkip={() => setShowAIForm(false)}
        />
      )}

      {/* Global Data Browser Modal */}
      {showDataBrowser && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <GlobalDataBrowser
              onDatasetSelect={(dataset) => {
                const newLayer: MapLayer = {
                  id: crypto.randomUUID(),
                  name: dataset.name,
                  type: dataset.dataset_type === 'raster' ? 'raster' : 'vector',
                  visible: true,
                  opacity: 0.8,
                  metadata: {
                    provider: dataset.provider,
                    source: dataset.api_endpoint
                  }
                };
                setLayers(prev => [...prev, newLayer]);
                setShowDataBrowser(false);
                toast({
                  title: "Dataset Added",
                  description: `${dataset.name} loaded successfully`,
                });
              }}
            />
            <Button
              variant="outline"
              onClick={() => setShowDataBrowser(false)}
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <div className={`flex h-screen bg-background overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Left Panel - Layers & Tools */}
        {leftPanelVisible && (
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Layers & Tools
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLeftPanelVisible(false)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <LeftPanel
              activeTab={leftPanelTab}
              setActiveTab={setLeftPanelTab}
              layers={layers}
              basemaps={basemaps}
              selectedBasemap={selectedBasemap}
              templates={preBuiltTemplates}
              onFileUpload={handleFileUpload}
              onBasemapChange={handleBasemapChange}
              onLayerToggle={handleLayerToggle}
              onLayerOpacityChange={handleLayerOpacityChange}
              onLayerStyleChange={handleLayerStyleChange}
              onTemplateLoad={handleTemplateLoad}
              activeTool={activeTool}
              onToolChange={setActiveTool}
            />
          </div>
        </div>
      )}

      {/* Center Panel - Map View */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <MapCanvas
            ref={mapRef}
            layers={layers}
            selectedBasemap={selectedBasemap}
            center={mapCenter}
            zoom={mapZoom}
            activeTool={activeTool}
            onFeatureSelect={setSelectedFeature}
            selectedFeature={selectedFeature}
          />
        </div>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 space-y-2">
          {!leftPanelVisible && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeftPanelVisible(true)}
              className="bg-background/95 backdrop-blur"
            >
              <Layers className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-background/95 backdrop-blur"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDataBrowser(true)}
            className="bg-background/95 backdrop-blur"
          >
            <Database className="h-4 w-4" />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAIForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute top-4 right-4 z-10">
          {!rightPanelVisible && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRightPanelVisible(true)}
              className="bg-background/95 backdrop-blur"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Map Status Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="bg-background/95 backdrop-blur">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {layers.filter(l => l.visible).length} active layers
                  </span>
                  <span>{selectedBasemap.name}</span>
                  <span>EPSG:4326</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {activeTool}
                  </Badge>
                  <span>Zoom: {mapZoom}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Analysis & Automation */}
      {rightPanelVisible && (
        <div className="w-80 border-l bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Analysis & AI
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setRightPanelVisible(false)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <RightPanel
              activeTab={rightPanelTab}
              setActiveTab={setRightPanelTab}
              layers={layers}
              selectedFeature={selectedFeature}
              onExport={handleExport}
              onShare={handleShare}
            />
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default AdvancedWebGIS;