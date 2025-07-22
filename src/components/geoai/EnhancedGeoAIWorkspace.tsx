import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  Zap,
  Hammer,
  ExternalLink,
  Play,
  FileImage
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
  // Set default active tab to templates
  const [activeTab, setActiveTab] = useState("templates");
  const [isTrainDialogOpen, setIsTrainDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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

  // AI Workflow Templates data
  const workflowTemplates = [
    {
      id: 'building-detection',
      title: 'Detect Buildings from Drone Imagery',
      description: 'AI-powered building detection using computer vision on high-resolution drone imagery',
      colabLink: 'https://colab.research.google.com/drive/1234567890abcdef',
      icon: <FileImage className="h-6 w-6" />
    },
    {
      id: 'land-use-classification',
      title: 'Land Use Classification using Sentinel-2',
      description: 'Multi-spectral land cover classification with deep learning on satellite data',
      colabLink: 'https://colab.research.google.com/drive/abcdef1234567890',
      icon: <Map className="h-6 w-6" />
    },
    {
      id: 'ndvi-analyzer',
      title: 'NDVI Crop Health Analyzer',
      description: 'Automated crop health monitoring using normalized difference vegetation index',
      colabLink: 'https://colab.research.google.com/drive/fedcba0987654321',
      icon: <BarChart3 className="h-6 w-6" />
    }
  ];

  const handleRunColab = (link: string, title: string) => {
    window.open(link, '_blank');
    toast({
      title: "Opening Google Colab",
      description: `Launching ${title} notebook in a new tab`,
    });
  };

  const handleTryOnHaritaHive = (templateId: string) => {
    toast({
      title: "Coming Soon",
      description: "Direct execution on HaritaHive is coming in the next update!",
    });
  };

  const handleTrainModel = () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a GeoTIFF or shapefile first",
        variant: "destructive"
      });
      return;
    }

    // Launch Hugging Face Spaces for model training
    window.open('https://huggingface.co/spaces/your-space/geospatial-trainer', '_blank');
    toast({
      title: "Launching Model Training",
      description: "Opening Hugging Face Spaces for custom model training",
    });
    setIsTrainDialogOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['image/tiff', 'application/x-shapefile', '.tif', '.tiff', '.shp'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      
      if (validTypes.some(type => type.includes(fileExtension || '')) || file.type.includes('tiff')) {
        setUploadedFile(file);
        toast({
          title: "File uploaded",
          description: `${file.name} is ready for training`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a GeoTIFF (.tif) or Shapefile (.shp)",
          variant: "destructive"
        });
      }
    }
  };

  // Check premium access - now require PRO or ENTERPRISE
  if (!hasAccess('pro')) {
    return (
      <div className="container py-8">
        <PremiumContentGate 
          contentType="feature"
          contentId="geoai-forge"
          title="The Geospatial AI Forge"
          description="Access advanced AI workflow templates, custom model training capabilities, and cutting-edge geospatial analysis tools powered by machine learning."
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
                <Hammer className="h-6 w-6 text-primary" />
                The Geospatial AI Forge
              </h1>
              <p className="text-muted-foreground text-sm">Advanced AI workflow templates & custom model training</p>
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
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="templates" className="text-xs">
                  <Sparkles className="h-3 w-3" />
                </TabsTrigger>
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

              <TabsContent value="templates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Workflow Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workflowTemplates.map((template) => (
                      <Card key={template.id} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            {template.icon}
                            {template.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleRunColab(template.colabLink, template.title)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Run in Colab
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleTryOnHaritaHive(template.id)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Try on HaritaHive
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>

                {/* Train Your Own Model Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Hammer className="h-4 w-4" />
                      Custom Model Training
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Dialog open={isTrainDialogOpen} onOpenChange={setIsTrainDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Hammer className="h-4 w-4 mr-2" />
                          Train Your Own Model
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Train Custom Geospatial Model</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="training-file">Upload Sample Data</Label>
                            <Input
                              id="training-file"
                              type="file"
                              accept=".tif,.tiff,.shp"
                              onChange={handleFileUpload}
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Supported: GeoTIFF (.tif) or Shapefile (.shp)
                            </p>
                          </div>
                          
                          {uploadedFile && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium">File Ready:</p>
                              <p className="text-xs text-muted-foreground">{uploadedFile.name}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              onClick={handleTrainModel} 
                              className="flex-1"
                              disabled={!uploadedFile}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Launch Training
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsTrainDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </TabsContent>
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