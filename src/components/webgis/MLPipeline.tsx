import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Code, 
  Play, 
  Save, 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Database, 
  Zap,
  Settings,
  Eye,
  Cpu,
  BarChart3,
  Target,
  Layers,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MLPipelineProps {
  projectId: string;
}

const MLPipeline: React.FC<MLPipelineProps> = ({ projectId }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const { toast } = useToast();

  const models = [
    {
      id: 'spatial-analysis',
      name: 'Spatial Pattern Recognition',
      type: 'Computer Vision',
      description: 'Detect patterns in satellite imagery and spatial data',
      status: 'trained',
      accuracy: 94.2,
      lastTrained: '2 days ago'
    },
    {
      id: 'change-detection',
      name: 'Change Detection',
      type: 'Time Series',
      description: 'Identify changes over time in geographic areas',
      status: 'training',
      accuracy: 87.5,
      lastTrained: 'Training...'
    },
    {
      id: 'land-classification',
      name: 'Land Use Classification',
      type: 'Classification',
      description: 'Classify land use types from aerial imagery',
      status: 'ready',
      accuracy: null,
      lastTrained: 'Not trained'
    },
    {
      id: 'flood-prediction',
      name: 'Flood Risk Prediction',
      type: 'Regression',
      description: 'Predict flood risks based on topographic data',
      status: 'deployed',
      accuracy: 91.8,
      lastTrained: '1 week ago'
    }
  ];

  const datasets = [
    {
      id: '1',
      name: 'Satellite Imagery 2023',
      type: 'Images',
      size: '2.3 GB',
      samples: 15420,
      status: 'processed'
    },
    {
      id: '2',
      name: 'Land Use Annotations',
      type: 'Labels',
      size: '45 MB',
      samples: 8934,
      status: 'ready'
    },
    {
      id: '3',
      name: 'Historical Weather Data',
      type: 'Time Series',
      size: '890 MB',
      samples: 125000,
      status: 'processing'
    }
  ];

  const deployedModels = [
    {
      id: '1',
      name: 'Forest Fire Detection',
      endpoint: '/api/ml/fire-detection',
      status: 'active',
      requests: 1247,
      latency: '150ms',
      accuracy: 96.3
    },
    {
      id: '2',
      name: 'Urban Growth Predictor',
      endpoint: '/api/ml/urban-growth',
      status: 'active',
      requests: 892,
      latency: '220ms',
      accuracy: 89.7
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trained':
      case 'deployed':
      case 'active':
      case 'processed':
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'training':
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleTrainModel = async (modelId: string) => {
    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate training process
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          toast({
            title: "Model Training Complete",
            description: "Your ML model has been trained successfully!",
          });
          return 100;
        }
        return prev + 2;
      });
    }, 200);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for image generation",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-map-visualization', {
        body: { prompt: imagePrompt }
      });

      if (error) throw error;

      setGeneratedImage(data.imageUrl);
      toast({
        title: "Image Generated",
        description: "Your map visualization has been created successfully!",
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>ML Pipeline</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Train and deploy machine learning models for geospatial analysis
                </p>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Brain className="h-4 w-4" />
                  Create Model
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New ML Model</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-name">Model Name</Label>
                    <Input id="model-name" placeholder="Land Cover Classification" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model-type">Model Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classification">Classification</SelectItem>
                        <SelectItem value="regression">Regression</SelectItem>
                        <SelectItem value="detection">Object Detection</SelectItem>
                        <SelectItem value="segmentation">Image Segmentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="What does this model do?" />
                  </div>
                  <Button className="w-full">Create Model</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="generation">AI Generation</TabsTrigger>
        </TabsList>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <Card key={model.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{model.name}</h4>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {model.type}
                      </Badge>
                    </div>
                    <Badge className={getStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {model.accuracy && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span className="font-medium">{model.accuracy}%</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last trained:</span>
                      <span className="font-medium">{model.lastTrained}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTrainModel(model.id)}
                      disabled={model.status === 'training'}
                    >
                      {model.status === 'training' ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Training
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          {model.status === 'ready' ? 'Train' : 'Retrain'}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Training Datasets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {datasets.map((dataset) => (
                    <div key={dataset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{dataset.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{dataset.type}</span>
                            <span>•</span>
                            <span>{dataset.size}</span>
                            <span>•</span>
                            <span>{dataset.samples.toLocaleString()} samples</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(dataset.status)}>
                        {dataset.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <Button className="w-full gap-2">
                  <Upload className="h-4 w-4" />
                  Upload New Dataset
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Training Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {isTraining ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Training Model</span>
                        <span className="text-sm text-muted-foreground">{Math.round(trainingProgress)}%</span>
                      </div>
                      <Progress value={trainingProgress} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Epoch:</span>
                        <span>15/50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Loss:</span>
                        <span>0.0342</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span>92.4%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ETA:</span>
                        <span>12 minutes</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Cpu className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No active training sessions</p>
                    <p className="text-sm">Select a model to start training</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deployment Tab */}
        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployed Models</CardTitle>
              <p className="text-sm text-muted-foreground">
                Models currently running in production
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deployedModels.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Target className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-semibold">{model.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {model.endpoint}
                          </code>
                          <span>•</span>
                          <span>{model.requests} requests</span>
                          <span>•</span>
                          <span>{model.latency} avg latency</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{model.accuracy}%</div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Generation Tab */}
        <TabsContent value="generation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Map Visualization Generator</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate custom map visualizations using AI
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-prompt">Visualization Prompt</Label>
                  <Textarea
                    id="image-prompt"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="A satellite view of a city with heat map overlay showing population density, vibrant colors, high resolution"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="w-full gap-2"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4" />
                      Generate Visualization
                    </>
                  )}
                </Button>
              </div>
              
              {generatedImage && (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-2">
                    <Label>Generated Visualization</Label>
                    <div className="border rounded-lg p-4">
                      <img 
                        src={generatedImage} 
                        alt="Generated map visualization"
                        className="w-full h-64 object-cover rounded"
                      />
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Layers className="h-4 w-4" />
                          Add to Map
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLPipeline;