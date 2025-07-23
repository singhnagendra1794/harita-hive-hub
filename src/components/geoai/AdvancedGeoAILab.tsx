import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useChatbotIntegration } from '@/hooks/useChatbotIntegration';
import { toast } from '@/hooks/use-toast';
import { 
  Brain, 
  Map, 
  BarChart3, 
  Settings,
  Sparkles,
  Layers,
  Upload,
  Database,
  Play,
  Zap,
  ExternalLink,
  Download,
  Eye,
  Target,
  Activity,
  Clock,
  Users,
  Globe
} from 'lucide-react';

// Import new components
import WorkflowTemplates from './WorkflowTemplates';
import InteractiveMapLab from './InteractiveMapLab';
import InsightsPanel from './InsightsPanel';
import ModelManager from './ModelManager';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const AdvancedGeoAILab = () => {
  const { user } = useAuth();
  const { openChatbot } = useChatbotIntegration();
  const [activeTab, setActiveTab] = useState('workflows');
  const [uploadedLayers, setUploadedLayers] = useState<any[]>([]);
  const [runningJobs, setRunningJobs] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
  const [mapLayers, setMapLayers] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  // Stats for dashboard
  const [stats, setStats] = useState({
    totalModels: 0,
    activeJobs: 0,
    completedAnalyses: 0,
    dataLayers: 0
  });

  useEffect(() => {
    // Update stats when data changes
    setStats({
      totalModels: 8, // Available models
      activeJobs: runningJobs.length,
      completedAnalyses: completedJobs.length,
      dataLayers: uploadedLayers.length
    });
  }, [runningJobs, completedJobs, uploadedLayers]);

  const handleLayerUpload = (layer: any) => {
    const newLayer = {
      id: `layer_${Date.now()}`,
      ...layer,
      uploadedAt: new Date().toISOString(),
      visible: true,
      opacity: 100
    };
    
    setUploadedLayers(prev => [...prev, newLayer]);
    setMapLayers(prev => [...prev, newLayer]);
    
    toast({
      title: "Layer Uploaded",
      description: `${layer.name} has been added to your workspace`,
    });
  };

  const handleWorkflowRun = (workflow: any) => {
    const job = {
      id: `job_${Date.now()}`,
      workflowId: workflow.id,
      workflowName: workflow.title,
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString()
    };
    
    setRunningJobs(prev => [...prev, job]);
    setCurrentWorkflow(workflow);
    
    // Simulate job progress
    const progressInterval = setInterval(() => {
      setRunningJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, progress: Math.min(j.progress + 10, 100) }
          : j
      ));
    }, 500);

    // Complete job after 5 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      setRunningJobs(prev => prev.filter(j => j.id !== job.id));
      
      const completedJob = {
        ...job,
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
        results: {
          accuracy: 94.5,
          f1Score: 0.92,
          classCount: Math.floor(Math.random() * 10) + 3
        }
      };
      
      setCompletedJobs(prev => [...prev, completedJob]);
      
      // Generate insights
      const insight = {
        id: `insight_${Date.now()}`,
        title: `${workflow.title} Results`,
        type: 'model_output',
        data: completedJob.results,
        createdAt: new Date().toISOString()
      };
      
      setInsights(prev => [...prev, insight]);
      
      toast({
        title: "Analysis Complete",
        description: `${workflow.title} finished with 94.5% accuracy`,
      });
    }, 5000);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleExport = (type: string, data: any) => {
    toast({
      title: "Export Started",
      description: `Preparing ${type} export...`,
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[#0D1B2A] text-[#F9F9F9]">
      {/* Corporate Header */}
      <div className="bg-[#1B263B] border-b border-[#43AA8B]/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F4D35E] rounded-lg">
                <Brain className="h-6 w-6 text-[#0D1B2A]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">GeoAI Lab</h1>
                <p className="text-sm text-[#F9F9F9]/70">Advanced Geospatial Intelligence Platform</p>
              </div>
            </div>
            
            {/* Stats Bar */}
            <div className="flex items-center gap-6 ml-8">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#43AA8B]" />
                <span className="text-sm">{stats.totalModels} Models</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#F4D35E]" />
                <span className="text-sm">{stats.activeJobs} Running</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#43AA8B]" />
                <span className="text-sm">{stats.completedAnalyses} Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#F4D35E]" />
                <span className="text-sm">{stats.dataLayers} Layers</span>
              </div>
            </div>
          </div>

          {/* User Info & Status */}
          <div className="flex items-center gap-4">
            {runningJobs.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-[#F4D35E] rounded-full animate-pulse" />
                <span className="text-sm text-[#F9F9F9]/70">
                  {runningJobs.length} jobs running
                </span>
              </div>
            )}
            <Badge variant="outline" className="border-[#43AA8B] text-[#43AA8B]">
              PRO
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools & Layers */}
        <LeftSidebar
          uploadedLayers={uploadedLayers}
          currentWorkflow={currentWorkflow}
          onLayerUpload={handleLayerUpload}
          runningJobs={runningJobs}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#0D1B2A]">
          {/* Tab Navigation */}
          <div className="bg-[#1B263B] border-b border-[#43AA8B]/20">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent border-none h-12 justify-start gap-0 rounded-none">
                <TabsTrigger 
                  value="workflows" 
                  className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Workflows
                </TabsTrigger>
                <TabsTrigger 
                  value="map" 
                  className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Interactive Map
                </TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Insights
                </TabsTrigger>
                <TabsTrigger 
                  value="models" 
                  className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  My Models
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} className="h-full">
              <TabsContent value="workflows" className="h-full m-0">
                <WorkflowTemplates 
                  onWorkflowRun={handleWorkflowRun}
                  uploadedLayers={uploadedLayers}
                />
              </TabsContent>
              
              <TabsContent value="map" className="h-full m-0">
                <InteractiveMapLab 
                  layers={mapLayers}
                  onLayerToggle={(layerId, visible) => {
                    setMapLayers(prev => prev.map(layer => 
                      layer.id === layerId ? { ...layer, visible } : layer
                    ));
                  }}
                  onLayerOpacityChange={(layerId, opacity) => {
                    setMapLayers(prev => prev.map(layer => 
                      layer.id === layerId ? { ...layer, opacity } : layer
                    ));
                  }}
                />
              </TabsContent>
              
              <TabsContent value="insights" className="h-full m-0">
                <InsightsPanel 
                  insights={insights}
                  completedJobs={completedJobs}
                  onExport={handleExport}
                />
              </TabsContent>
              
              <TabsContent value="models" className="h-full m-0">
                <ModelManager 
                  selectedModel={selectedModel}
                  onModelSelect={handleModelSelect}
                  completedJobs={completedJobs}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - AI Assistant & Parameters */}
        <RightSidebar
          selectedModel={selectedModel}
          currentWorkflow={currentWorkflow}
          runningJobs={runningJobs}
          onExport={handleExport}
          onOpenChatbot={openChatbot}
        />
      </div>
    </div>
  );
};

export default AdvancedGeoAILab;