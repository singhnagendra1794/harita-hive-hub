import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PremiumContentGate from "@/components/premium/PremiumContentGate";
import WorkflowWizard from "./WorkflowWizard";
import AIModelLibrary from "./AIModelLibrary";
import InteractiveMapViewer from "./InteractiveMapViewer";
import ExportManager from "./ExportManager";
import AISummaryGenerator from "./AISummaryGenerator";
import DataUploadPanel from "./DataUploadPanel";
import { toast } from "@/hooks/use-toast";
import { 
  Brain, 
  Upload, 
  Map, 
  Download, 
  History,
  BarChart3,
  Sparkles,
  Settings,
  Database,
  Zap
} from "lucide-react";

interface JobStatus {
  id: string;
  modelName: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  results?: any;
}

const EnhancedGeoAIWorkspace = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [jobQueue, setJobQueue] = useState<JobStatus[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("workflow");

  // Fetch user subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    fetchSubscription();
  }, [user]);

  // Check premium access
  if (!hasAccess('premium')) {
    return (
      <div className="container py-8">
        <PremiumContentGate 
          contentType="feature"
          contentId="geoai-lab"
          title="GeoAI Laboratory"
          description="Access cutting-edge AI-powered geospatial analysis tools including object detection, change detection, and automated feature extraction from satellite imagery."
        >
          <div />
        </PremiumContentGate>
      </div>
    );
  }

  const handleDataUpload = (data: any) => {
    const newData = {
      ...data,
      id: `data_${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    
    setUploadedData(prev => [...prev, newData]);
    
    if (!selectedData) {
      setSelectedData(newData);
    }

    // Auto-advance to next step
    if (currentStep === 0) {
      setCurrentStep(1);
    }

    toast({
      title: "Data Uploaded",
      description: `${data.name} has been uploaded successfully.`,
    });
  };

  const handleDataSelect = (data: any) => {
    setSelectedData(data);
  };

  const handleAnalysisStart = (modelId: string, result: any) => {
    setSelectedModel(modelId);
    setAnalysisResults(prev => [...prev, result]);
    
    // Add to job queue
    const job: JobStatus = {
      id: result.id,
      modelName: result.modelName,
      status: 'completed',
      progress: 100,
      startedAt: result.timestamp,
      completedAt: result.timestamp,
      results: result.results
    };
    
    setJobQueue(prev => [...prev, job]);

    // Auto-advance to preview step
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    
    // Set appropriate tab based on step
    switch (step) {
      case 0:
        setActiveTab("upload");
        break;
      case 1:
        setActiveTab("models");
        break;
      case 2:
        setActiveTab("preview");
        break;
      case 3:
        setActiveTab("export");
        break;
      default:
        setActiveTab("workflow");
    }
  };

  const handleStepComplete = (step: number) => {
    // Handle step completion logic
    switch (step) {
      case 0:
        if (uploadedData.length > 0) {
          setCurrentStep(1);
        }
        break;
      case 1:
        if (selectedModel) {
          setCurrentStep(2);
        }
        break;
      case 2:
        if (analysisResults.length > 0) {
          setCurrentStep(3);
        }
        break;
    }
  };

  const handleExportComplete = (exportInfo: any) => {
    toast({
      title: "Export Complete",
      description: `${exportInfo.name} has been exported successfully.`,
    });
  };

  const handleSummaryGenerated = (summary: any) => {
    // Handle summary generation
    console.log('Summary generated:', summary);
  };

  const handleLayerToggle = (layerId: string, visible: boolean) => {
    console.log('Layer toggle:', layerId, visible);
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    console.log('Opacity change:', layerId, opacity);
  };

  const getStepProgress = () => {
    let progress = 0;
    if (uploadedData.length > 0) progress += 25;
    if (selectedModel) progress += 25;
    if (analysisResults.length > 0) progress += 25;
    if (currentStep === 3) progress += 25;
    return progress;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                GeoAI Laboratory
              </h1>
              <p className="text-muted-foreground text-sm">AI-powered spatial analysis workspace</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                {uploadedData.length} datasets
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                {analysisResults.length} analyses
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {jobQueue.filter(j => j.status === 'completed').length} completed
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              Progress: {getStepProgress()}%
            </div>
            <Progress value={getStepProgress()} className="w-32" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Workflow & Tools */}
        <div className="w-80 border-r bg-background overflow-y-auto">
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="workflow" className="text-xs">
                  <Settings className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-xs">
                  <Upload className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="models" className="text-xs">
                  <Brain className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs">
                  <History className="h-3 w-3" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="workflow" className="space-y-4">
                <WorkflowWizard
                  currentStep={currentStep}
                  uploadedData={uploadedData}
                  selectedModel={selectedModel}
                  analysisResults={analysisResults}
                  onStepChange={handleStepChange}
                  onStepComplete={handleStepComplete}
                />
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <DataUploadPanel
                  onDataUpload={handleDataUpload}
                  uploadedData={uploadedData}
                  onDataSelect={handleDataSelect}
                />
              </TabsContent>

              <TabsContent value="models" className="space-y-4">
                <AIModelLibrary
                  selectedData={selectedData}
                  onAnalysisStart={handleAnalysisStart}
                  subscription={subscription}
                />
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Job Queue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {jobQueue.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No analysis jobs yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {jobQueue.map((job) => (
                          <div key={job.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{job.modelName}</span>
                              <Badge 
                                variant={job.status === 'completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {job.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              Started: {new Date(job.startedAt).toLocaleString()}
                            </div>
                            {job.status === 'running' && (
                              <Progress value={job.progress} className="w-full" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Main Content - Map & Analysis */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Tabs value={currentStep === 2 ? "preview" : "map"} className="h-full">
              <TabsList className="m-4 grid w-40 grid-cols-2">
                <TabsTrigger value="map">
                  <Map className="h-3 w-3 mr-1" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="m-4 h-[calc(100%-80px)]">
                <InteractiveMapViewer
                  uploadedData={uploadedData}
                  analysisResults={analysisResults}
                  selectedData={selectedData}
                  onDataSelect={handleDataSelect}
                  onLayerToggle={handleLayerToggle}
                  onOpacityChange={handleOpacityChange}
                />
              </TabsContent>

              <TabsContent value="preview" className="m-4 h-[calc(100%-80px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                  <div className="space-y-4">
                    <AISummaryGenerator
                      analysisResults={analysisResults}
                      selectedData={selectedData}
                      onSummaryGenerated={handleSummaryGenerated}
                    />
                  </div>
                  <div className="space-y-4">
                    <InteractiveMapViewer
                      uploadedData={uploadedData}
                      analysisResults={analysisResults}
                      selectedData={selectedData}
                      onDataSelect={handleDataSelect}
                      onLayerToggle={handleLayerToggle}
                      onOpacityChange={handleOpacityChange}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - Export & Summary */}
        <div className="w-80 border-l bg-background overflow-y-auto">
          <div className="p-4 space-y-4">
            <Tabs defaultValue="export" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="export">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </TabsTrigger>
                <TabsTrigger value="insights">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="export" className="mt-4">
                <ExportManager
                  analysisResults={analysisResults}
                  selectedLayers={uploadedData.map(d => d.id)}
                  subscription={subscription}
                  onExportComplete={handleExportComplete}
                />
              </TabsContent>

              <TabsContent value="insights" className="mt-4">
                <AISummaryGenerator
                  analysisResults={analysisResults}
                  selectedData={selectedData}
                  onSummaryGenerated={handleSummaryGenerated}
                />
              </TabsContent>
            </Tabs>

            {/* Selected Data Info */}
            {selectedData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Selected Dataset</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Name</Label>
                    <p className="text-sm">{selectedData.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Type</Label>
                    <Badge variant="outline" className="text-xs">
                      {selectedData.type}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Size</Label>
                    <p className="text-sm">{(selectedData.size / 1024).toFixed(1)} KB</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedGeoAIWorkspace;