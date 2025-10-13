import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { Download, Save, Share2, Layers as LayersIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VectorTools from "./VectorTools";
import RasterTools from "./RasterTools";
import AIAnalysisTools from "./AIAnalysisTools";
import LayerManager from "./LayerManager";
import { GlobalDataBrowser } from "../webgis/GlobalDataBrowser";
import AnalysisResults from "./AnalysisResults";
import "leaflet/dist/leaflet.css";

const SpatialAnalysisStudio = () => {
  const [activeProject, setActiveProject] = useState<any>(null);
  const [layers, setLayers] = useState<any[]>([]);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [processingJobs, setProcessingJobs] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadOrCreateProject();
    loadAvailableTools();
  }, []);

  const loadOrCreateProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check for existing project or create new one
    const { data: projects } = await supabase
      .from('spatial_analysis_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (projects && projects.length > 0) {
      setActiveProject(projects[0]);
      const layersData = Array.isArray(projects[0].layers) ? projects[0].layers : [];
      const historyData = Array.isArray(projects[0].analysis_history) ? projects[0].analysis_history : [];
      setLayers(layersData);
      setAnalysisResults(historyData);
    } else {
      // Create new project
      const { data: newProject } = await supabase
        .from('spatial_analysis_projects')
        .insert({
          user_id: user.id,
          project_name: 'Untitled Analysis',
          project_type: 'mixed'
        })
        .select()
        .single();

      if (newProject) {
        setActiveProject(newProject);
      }
    }
  };

  const loadAvailableTools = async () => {
    const { data: tools } = await supabase
      .from('spatial_analysis_tools')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });

    console.log('Available tools:', tools);
  };

  const handleLayerUpload = async (files: File[]) => {
    const newLayers = await Promise.all(
      files.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        type: getFileType(file.name),
        size: file.size,
        visible: true,
        opacity: 1,
        uploaded_at: new Date().toISOString()
      }))
    );

    const updatedLayers = [...layers, ...newLayers];
    setLayers(updatedLayers);

    // Update project
    if (activeProject) {
      await supabase
        .from('spatial_analysis_projects')
        .update({ layers: updatedLayers, updated_at: new Date().toISOString() })
        .eq('id', activeProject.id);
    }

    toast({
      title: "Layers uploaded",
      description: `${files.length} layer(s) added to the workspace.`,
    });
  };

  const handleGlobalDataSelect = async (dataset: any) => {
    const newLayer = {
      id: crypto.randomUUID(),
      name: dataset.dataset_name,
      type: dataset.data_type,
      provider: dataset.provider,
      category: dataset.category,
      visible: true,
      opacity: 1,
      source: 'global_catalog',
      api_endpoint: dataset.api_endpoint,
      added_at: new Date().toISOString()
    };

    const updatedLayers = [...layers, newLayer];
    setLayers(updatedLayers);

    if (activeProject) {
      await supabase
        .from('spatial_analysis_projects')
        .update({ layers: updatedLayers, updated_at: new Date().toISOString() })
        .eq('id', activeProject.id);
    }

    toast({
      title: "Global dataset added",
      description: `${dataset.dataset_name} loaded from ${dataset.provider}`,
    });
  };

  const executeAnalysis = async (toolName: string, parameters: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const inputLayers = layers.filter(l => selectedLayers.includes(l.id));

    if (inputLayers.length === 0) {
      toast({
        title: "No layers selected",
        description: "Please select at least one layer for analysis.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await supabase.functions.invoke('spatial-processing', {
        body: {
          action: 'execute',
          toolName,
          inputLayers,
          parameters
        }
      });

      if (response.error) throw response.error;

      const { jobId, result } = response.data;

      // Add result as new layer
      if (result.type === 'vector' || result.type === 'raster') {
        const updatedLayers = [...layers, result];
        setLayers(updatedLayers);

        if (activeProject) {
          await supabase
            .from('spatial_analysis_projects')
            .update({ 
              layers: updatedLayers,
              analysis_history: [...analysisResults, { tool: toolName, timestamp: new Date(), output: result.id }],
              updated_at: new Date().toISOString() 
            })
            .eq('id', activeProject.id);
        }
      }

      setAnalysisResults(prev => [...prev, { tool: toolName, result, timestamp: new Date() }]);

      toast({
        title: "Analysis complete",
        description: `${toolName} executed successfully.`,
      });

    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveProject = async () => {
    if (!activeProject) return;

    await supabase
      .from('spatial_analysis_projects')
      .update({
        layers,
        analysis_history: analysisResults,
        updated_at: new Date().toISOString()
      })
      .eq('id', activeProject.id);

    toast({
      title: "Project saved",
      description: "Your analysis workspace has been saved.",
    });
  };

  const handleExport = () => {
    // Export functionality
    toast({
      title: "Export",
      description: "Export functionality will be available soon.",
    });
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['shp', 'geojson', 'kml', 'gpx'].includes(ext || '')) return 'vector';
    if (['tif', 'tiff', 'nc', 'hdf'].includes(ext || '')) return 'raster';
    return 'unknown';
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top toolbar */}
      <div className="border-b bg-card p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Spatial Analysis Studio</h1>
          <p className="text-sm text-muted-foreground">
            {activeProject?.project_name || 'Untitled Project'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveProject} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Main workspace - 3 panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tools & Layers */}
        <div className="w-80 border-r bg-card overflow-y-auto">
          <Tabs defaultValue="tools" className="h-full">
            <TabsList className="w-full">
              <TabsTrigger value="tools" className="flex-1">Tools</TabsTrigger>
              <TabsTrigger value="layers" className="flex-1">
                <LayersIcon className="h-4 w-4 mr-1" />
                Layers
              </TabsTrigger>
              <TabsTrigger value="data" className="flex-1">Data</TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="p-4 space-y-4">
              <VectorTools 
                onExecute={executeAnalysis}
                selectedLayers={selectedLayers}
              />
              <RasterTools 
                onExecute={executeAnalysis}
                selectedLayers={selectedLayers}
              />
              <AIAnalysisTools 
                onExecute={executeAnalysis}
                selectedLayers={selectedLayers}
              />
            </TabsContent>

            <TabsContent value="layers" className="p-4">
              <LayerManager
                layers={layers}
                selectedLayers={selectedLayers}
                onLayersChange={setLayers}
                onSelectionChange={setSelectedLayers}
                onUpload={handleLayerUpload}
              />
            </TabsContent>

            <TabsContent value="data" className="p-4">
              <GlobalDataBrowser onDatasetSelect={handleGlobalDataSelect} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Center Panel - Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <LayersControl position="topright">
              {/* Render layers here */}
            </LayersControl>
          </MapContainer>
        </div>

        {/* Right Panel - Results */}
        <div className="w-80 border-l bg-card overflow-y-auto p-4">
          <AnalysisResults results={analysisResults} />
        </div>
      </div>
    </div>
  );
};

export default SpatialAnalysisStudio;