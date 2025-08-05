import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Brain, 
  Database, 
  Play, 
  Save, 
  Share, 
  Download,
  Plus,
  Settings,
  Zap,
  MapPin,
  BarChart3,
  FileText,
  Globe,
  Layers,
  Target,
  Clock,
  Activity
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  source_type: string;
  api_endpoint: string;
  bands_available: any;
  resolution_meters: number;
  metadata: any;
}

interface GeoAIModel {
  id: string;
  name: string;
  model_type: string;
  category: string;
  description: string;
  accuracy_metrics: any;
  is_gpu_required: boolean;
  processing_time_estimate: number;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  workflow_config: any;
  models_used: any;
  estimated_runtime: number;
  tags: any;
}

const GeoAIWorkflowBuilder: React.FC = () => {
  const { user } = useAuth();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [models, setModels] = useState<GeoAIModel[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Dialog states
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false);
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    loadDataSources();
    loadModels();
    loadTemplates();
  }, []);

  const loadDataSources = async () => {
    try {
      const { data, error } = await supabase
        .from('geoai_data_sources')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setDataSources((data || []).map(item => ({
        ...item,
        bands_available: Array.isArray(item.bands_available) ? item.bands_available : []
      })));
    } catch (error) {
      console.error('Error loading data sources:', error);
    }
  };

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from('geoai_models')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('geoai_workflows')
        .select('*')
        .eq('is_template', true)
        .eq('is_public', true);
      
      if (error) throw error;
      setTemplates((data || []).map(item => ({
        ...item,
        models_used: Array.isArray(item.models_used) ? item.models_used : [],
        tags: Array.isArray(item.tags) ? item.tags : []
      })));
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  };

  const addDataSourceNode = (dataSource: DataSource) => {
    const newNode: Node = {
      id: `datasource-${dataSource.id}`,
      type: 'input',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: dataSource.name,
        type: 'data_source',
        config: dataSource
      },
      style: {
        background: '#43AA8B',
        color: 'white',
        border: '1px solid #43AA8B'
      }
    };
    setNodes((nds) => nds.concat(newNode));
    setShowDataSourceDialog(false);
  };

  const addModelNode = (model: GeoAIModel) => {
    const newNode: Node = {
      id: `model-${model.id}`,
      type: 'default',
      position: { x: Math.random() * 400 + 200, y: Math.random() * 400 + 100 },
      data: { 
        label: model.name,
        type: 'model',
        config: model
      },
      style: {
        background: '#F4D35E',
        color: '#0D1B2A',
        border: '1px solid #F4D35E'
      }
    };
    setNodes((nds) => nds.concat(newNode));
    setShowModelDialog(false);
  };

  const addOutputNode = () => {
    const newNode: Node = {
      id: `output-${Date.now()}`,
      type: 'output',
      position: { x: Math.random() * 400 + 400, y: Math.random() * 400 + 200 },
      data: { 
        label: 'Analysis Results',
        type: 'output'
      },
      style: {
        background: '#EE964B',
        color: 'white',
        border: '1px solid #EE964B'
      }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const runWorkflow = async () => {
    if (!user || nodes.length === 0) return;
    
    setIsBuilding(true);
    setBuildProgress(0);
    
    try {
      // Create workflow configuration from nodes and edges
      const workflowConfig = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.data.type,
          config: node.data.config
        })),
        edges: edges.map(edge => ({
          source: edge.source,
          target: edge.target
        }))
      };

      // Create job in database
      const { data: job, error } = await supabase
        .from('geoai_jobs')
        .insert({
          user_id: user.id,
          job_name: `Workflow Run - ${new Date().toLocaleString()}`,
          status: 'queued',
          input_data: workflowConfig
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate workflow execution with progress updates
      const progressInterval = setInterval(() => {
        setBuildProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            completeWorkflow(job.id);
            return 100;
          }
          return newProgress;
        });
      }, 500);

    } catch (error) {
      console.error('Error running workflow:', error);
      toast({
        title: "Error",
        description: "Failed to run workflow",
        variant: "destructive"
      });
      setIsBuilding(false);
    }
  };

  const completeWorkflow = async (jobId: string) => {
    try {
      // Update job status
      await supabase
        .from('geoai_jobs')
        .update({
          status: 'completed',
          progress: 100,
          completed_at: new Date().toISOString(),
          output_data: {
            results: 'Analysis completed successfully',
            accuracy: 94.5,
            processing_time: 45
          }
        })
        .eq('id', jobId);

      // Create results record
      await supabase
        .from('geoai_results')
        .insert({
          job_id: jobId,
          user_id: user!.id,
          result_type: 'workflow_output',
          result_data: {
            analysis_type: 'custom_workflow',
            metrics: { accuracy: 94.5, confidence: 89.2 }
          },
          output_files: ['workflow_results.geotiff', 'analysis_summary.pdf']
        });

      setIsBuilding(false);
      toast({
        title: "Workflow Complete",
        description: "Your analysis has been completed successfully",
      });
    } catch (error) {
      console.error('Error completing workflow:', error);
      setIsBuilding(false);
    }
  };

  const saveWorkflow = async (name: string, description: string) => {
    if (!user) return;

    try {
      const workflowConfig = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.data.type,
          config: node.data.config,
          position: node.position
        })),
        edges: edges.map(edge => ({
          source: edge.source,
          target: edge.target
        }))
      };

      const { error } = await supabase
        .from('geoai_workflows')
        .insert({
          user_id: user.id,
          name,
          description,
          workflow_type: 'custom',
          workflow_config: workflowConfig,
          models_used: nodes
            .filter(n => n.data.type === 'model')
            .map(n => n.data.config.name)
        });

      if (error) throw error;
      
      setShowSaveDialog(false);
      toast({
        title: "Workflow Saved",
        description: "Your workflow has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive"
      });
    }
  };

  const loadTemplate = (template: WorkflowTemplate) => {
    const config = template.workflow_config;
    if (config.nodes && config.edges) {
      setNodes(config.nodes.map((node: any) => ({
        ...node,
        style: getNodeStyle(node.type)
      })));
      setEdges(config.edges);
      toast({
        title: "Template Loaded",
        description: `${template.name} template has been loaded`,
      });
    }
  };

  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'data_source':
        return { background: '#43AA8B', color: 'white', border: '1px solid #43AA8B' };
      case 'model':
        return { background: '#F4D35E', color: '#0D1B2A', border: '1px solid #F4D35E' };
      case 'output':
        return { background: '#EE964B', color: 'white', border: '1px solid #EE964B' };
      default:
        return { background: '#1B263B', color: 'white', border: '1px solid #1B263B' };
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0D1B2A] text-[#F9F9F9]">
      {/* Header */}
      <div className="bg-[#1B263B] border-b border-[#43AA8B]/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F4D35E] rounded-lg">
                <Brain className="h-6 w-6 text-[#0D1B2A]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">GeoAI Workflow Builder</h1>
                <p className="text-sm text-[#F9F9F9]/70">Create custom no-code geospatial AI workflows</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isBuilding && (
              <div className="flex items-center gap-3">
                <Progress value={buildProgress} className="w-32" />
                <span className="text-sm">{buildProgress}%</span>
              </div>
            )}
            
            <Button 
              onClick={runWorkflow} 
              disabled={isBuilding || nodes.length === 0}
              className="bg-[#43AA8B] hover:bg-[#43AA8B]/90"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Workflow
            </Button>

            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  disabled={nodes.length === 0}
                  className="border-[#43AA8B] text-[#43AA8B] hover:bg-[#43AA8B]/10"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1B263B] border-[#43AA8B]/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Save Workflow</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input 
                    placeholder="Workflow name"
                    className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white"
                    id="workflow-name"
                  />
                  <Textarea 
                    placeholder="Workflow description"
                    className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white"
                    id="workflow-description"
                  />
                  <Button 
                    onClick={() => {
                      const name = (document.getElementById('workflow-name') as HTMLInputElement)?.value;
                      const description = (document.getElementById('workflow-description') as HTMLTextAreaElement)?.value;
                      if (name) saveWorkflow(name, description);
                    }}
                    className="w-full bg-[#43AA8B] hover:bg-[#43AA8B]/90"
                  >
                    Save Workflow
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Palette */}
        <div className="w-80 bg-[#1B263B] border-r border-[#43AA8B]/20 flex flex-col">
          <div className="p-4 border-b border-[#43AA8B]/20">
            <h3 className="text-lg font-semibold text-white mb-4">Workflow Components</h3>
            
            <div className="space-y-3">
              <Dialog open={showDataSourceDialog} onOpenChange={setShowDataSourceDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start bg-[#43AA8B] hover:bg-[#43AA8B]/90">
                    <Database className="h-4 w-4 mr-2" />
                    Add Data Source
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1B263B] border-[#43AA8B]/20 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Select Data Source</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-96">
                    <div className="grid gap-3">
                      {dataSources.map((source) => (
                        <Card 
                          key={source.id} 
                          className="bg-[#0D1B2A] border-[#43AA8B]/20 cursor-pointer hover:border-[#43AA8B]/40"
                          onClick={() => addDataSourceNode(source)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-white font-medium">{source.name}</h4>
                                <p className="text-sm text-[#F9F9F9]/70">
                                  {source.resolution_meters}m resolution
                                </p>
                              </div>
                              <Badge variant="outline" className="border-[#43AA8B] text-[#43AA8B]">
                                {source.source_type}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Dialog open={showModelDialog} onOpenChange={setShowModelDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start bg-[#F4D35E] text-[#0D1B2A] hover:bg-[#F4D35E]/90">
                    <Brain className="h-4 w-4 mr-2" />
                    Add AI Model
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1B263B] border-[#43AA8B]/20 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Select AI Model</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-96">
                    <div className="grid gap-3">
                      {models.map((model) => (
                        <Card 
                          key={model.id} 
                          className="bg-[#0D1B2A] border-[#43AA8B]/20 cursor-pointer hover:border-[#43AA8B]/40"
                          onClick={() => addModelNode(model)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-white font-medium">{model.name}</h4>
                                <p className="text-sm text-[#F9F9F9]/70">{model.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="border-[#F4D35E] text-[#F4D35E]">
                                    {model.category}
                                  </Badge>
                                  {model.is_gpu_required && (
                                    <Badge variant="outline" className="border-[#EE964B] text-[#EE964B]">
                                      GPU Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-[#43AA8B]">
                                  ~{Math.floor(model.processing_time_estimate / 60)}min
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Button 
                onClick={addOutputNode}
                className="w-full justify-start bg-[#EE964B] hover:bg-[#EE964B]/90"
              >
                <Target className="h-4 w-4 mr-2" />
                Add Output
              </Button>
            </div>
          </div>

          {/* Templates Section */}
          <div className="flex-1 p-4">
            <h4 className="text-white font-medium mb-3">Workflow Templates</h4>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className="bg-[#0D1B2A] border-[#43AA8B]/20 cursor-pointer hover:border-[#43AA8B]/40"
                    onClick={() => loadTemplate(template)}
                  >
                    <CardContent className="p-3">
                      <h5 className="text-white text-sm font-medium">{template.name}</h5>
                      <p className="text-xs text-[#F9F9F9]/70 mt-1">{template.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 2).map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="border-[#43AA8B]/50 text-[#43AA8B] text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-[#F9F9F9]/50">
                          {Math.floor((template.estimated_runtime || 0) / 60)}min
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 bg-[#0D1B2A]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            style={{ backgroundColor: '#0D1B2A' }}
          >
            <Controls className="[&>button]:bg-[#1B263B] [&>button]:border-[#43AA8B]/20 [&>button]:text-white" />
            <MiniMap 
              className="bg-[#1B263B] border-[#43AA8B]/20"
              nodeColor="#43AA8B"
            />
            <Background color="#43AA8B" gap={16} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default GeoAIWorkflowBuilder;