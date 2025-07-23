import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  Brain, 
  Download, 
  Upload, 
  Play, 
  Pause,
  Database,
  Target,
  Zap,
  Settings,
  Star,
  Clock,
  Users,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Share,
  Trash,
  Copy
} from 'lucide-react';

interface ModelManagerProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  completedJobs: any[];
}

const ModelManager = ({ selectedModel, onModelSelect, completedJobs }: ModelManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isTrainingDialogOpen, setIsTrainingDialogOpen] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);

  const pretrainedModels = [
    {
      id: 'yolov8-building',
      name: 'YOLOv8 Building Detector',
      description: 'Pre-trained on global building datasets with 95% accuracy',
      category: 'Object Detection',
      accuracy: 95.2,
      size: '89 MB',
      usage: 2156,
      rating: 4.8,
      lastUpdated: '2 days ago',
      author: 'HaritaHive Team',
      tags: ['Buildings', 'Urban', 'Object Detection']
    },
    {
      id: 'unet-landcover',
      name: 'U-Net Land Cover Classifier',
      description: 'Semantic segmentation for land cover classification',
      category: 'Semantic Segmentation',
      accuracy: 91.7,
      size: '156 MB',
      usage: 1832,
      rating: 4.6,
      lastUpdated: '1 week ago',
      author: 'Community',
      tags: ['Land Cover', 'Segmentation', 'Sentinel-2']
    },
    {
      id: 'resnet-crop',
      name: 'ResNet Crop Classification',
      description: 'Classification of crop types from agricultural imagery',
      category: 'Classification',
      accuracy: 88.9,
      size: '124 MB',
      usage: 987,
      rating: 4.4,
      lastUpdated: '3 days ago',
      author: 'AgriAI Lab',
      tags: ['Agriculture', 'Crops', 'Classification']
    },
    {
      id: 'transformer-change',
      name: 'Vision Transformer Change Detection',
      description: 'Advanced change detection using transformer architecture',
      category: 'Change Detection',
      accuracy: 93.1,
      size: '298 MB',
      usage: 654,
      rating: 4.9,
      lastUpdated: '5 days ago',
      author: 'HaritaHive Research',
      tags: ['Change Detection', 'Transformer', 'Time Series']
    }
  ];

  const userModels = [
    {
      id: 'user-model-1',
      name: 'My Building Detector v2',
      description: 'Custom trained on local building dataset',
      accuracy: 92.3,
      size: '76 MB',
      createdAt: '2024-01-15',
      status: 'trained',
      trainedOn: 'Urban imagery (local)'
    },
    {
      id: 'user-model-2',
      name: 'Forest Health Monitor',
      description: 'NDVI-based forest health classification',
      accuracy: 87.6,
      size: '45 MB',
      createdAt: '2024-01-10',
      status: 'training',
      progress: 75
    }
  ];

  const categories = ['all', 'Object Detection', 'Semantic Segmentation', 'Classification', 'Change Detection'];

  const filteredModels = pretrainedModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleModelDownload = (model: any) => {
    toast({
      title: "Downloading Model",
      description: `${model.name} is being downloaded to your workspace`,
    });
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setIsTrainingDialogOpen(false);
          toast({
            title: "Training Complete",
            description: "Your custom model has been trained successfully!",
          });
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 1000);
  };

  const ModelCard = ({ model, isUserModel = false }: { model: any, isUserModel?: boolean }) => (
    <Card className="bg-[#1B263B] border-[#43AA8B]/20 hover:border-[#43AA8B]/40 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-[#F4D35E]/10 rounded-lg text-[#F4D35E]">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-white text-sm font-semibold line-clamp-1">
                {model.name}
              </CardTitle>
              <p className="text-xs text-[#F9F9F9]/70 line-clamp-1">
                {model.description}
              </p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="p-1 text-[#F9F9F9]">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Model Metadata */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-[#43AA8B]" />
              <span className="text-[#F9F9F9]/70">{model.accuracy}%</span>
            </div>
            <div className="text-[#F9F9F9]/50">{model.size}</div>
          </div>
          {!isUserModel && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-[#F4D35E] fill-current" />
              <span className="text-[#F9F9F9]/70">{model.rating}</span>
            </div>
          )}
        </div>

        {/* Category and Tags */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs border-[#43AA8B]/50 text-[#43AA8B]">
            {isUserModel ? 'Custom' : model.category}
          </Badge>
          {(isUserModel ? [] : model.tags.slice(0, 2)).map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs border-[#F9F9F9]/30 text-[#F9F9F9]/70">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Progress for training models */}
        {isUserModel && model.status === 'training' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#F9F9F9]/70">Training Progress</span>
              <span className="text-[#F4D35E]">{model.progress}%</span>
            </div>
            <Progress value={model.progress} className="h-2" />
          </div>
        )}

        {/* Model Info */}
        <div className="text-xs text-[#F9F9F9]/50">
          {isUserModel ? (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Created {new Date(model.createdAt).toLocaleDateString()}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {model.usage} uses
              </div>
              <div>{model.lastUpdated}</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isUserModel ? (
            <>
              <Button 
                size="sm" 
                className="flex-1 bg-[#F4D35E] hover:bg-[#F4D35E]/90 text-[#0D1B2A]"
                disabled={model.status === 'training'}
              >
                <Play className="h-3 w-3 mr-1" />
                {model.status === 'training' ? 'Training...' : 'Deploy'}
              </Button>
              <Button size="sm" variant="outline" className="border-[#43AA8B]/50 text-[#43AA8B]">
                <Download className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                className="flex-1 bg-[#F4D35E] hover:bg-[#F4D35E]/90 text-[#0D1B2A]"
                onClick={() => handleModelDownload(model)}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button size="sm" variant="outline" className="border-[#43AA8B]/50 text-[#43AA8B]">
                <Eye className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col bg-[#0D1B2A] text-[#F9F9F9]">
      {/* Header */}
      <div className="p-6 bg-[#1B263B] border-b border-[#43AA8B]/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Model Manager</h2>
            <p className="text-sm text-[#F9F9F9]/70">Pre-trained models and custom training</p>
          </div>
          
          <Dialog open={isTrainingDialogOpen} onOpenChange={setIsTrainingDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#F4D35E] hover:bg-[#F4D35E]/90 text-[#0D1B2A]">
                <Plus className="h-4 w-4 mr-2" />
                Train Custom Model
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1B263B] border-[#43AA8B]/30 text-[#F9F9F9]">
              <DialogHeader>
                <DialogTitle className="text-white">Train Custom Model</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-[#F9F9F9]/70">Model Name</Label>
                  <Input 
                    placeholder="My Custom Model" 
                    className="bg-[#0D1B2A] border-[#43AA8B]/30"
                  />
                </div>
                
                <div>
                  <Label className="text-[#F9F9F9]/70">Model Type</Label>
                  <Select>
                    <SelectTrigger className="bg-[#0D1B2A] border-[#43AA8B]/30">
                      <SelectValue placeholder="Select model type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1B263B]">
                      <SelectItem value="classification">Classification</SelectItem>
                      <SelectItem value="detection">Object Detection</SelectItem>
                      <SelectItem value="segmentation">Semantic Segmentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[#F9F9F9]/70">Training Data</Label>
                  <div className="border-2 border-dashed border-[#43AA8B]/30 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 text-[#43AA8B] mx-auto mb-2" />
                    <p className="text-sm text-[#F9F9F9]/70">
                      Upload your training dataset
                    </p>
                  </div>
                </div>

                {isTraining && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#F9F9F9]/70">Training Progress</span>
                      <span className="text-[#F4D35E]">{trainingProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={trainingProgress} className="h-2" />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleStartTraining}
                    disabled={isTraining}
                    className="flex-1 bg-[#43AA8B] hover:bg-[#43AA8B]/90"
                  >
                    {isTraining ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Training...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Training
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsTrainingDialogOpen(false)}
                    className="border-[#43AA8B]/50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F9F9F9]/50" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#0D1B2A] border-[#43AA8B]/30 text-[#F9F9F9]"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 bg-[#0D1B2A] border-[#43AA8B]/30 text-[#F9F9F9]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#1B263B] border-[#43AA8B]/30">
              {categories.map(category => (
                <SelectItem key={category} value={category} className="text-[#F9F9F9]">
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Model Tabs */}
      <Tabs defaultValue="pretrained" className="flex-1 flex flex-col">
        <div className="bg-[#1B263B] border-b border-[#43AA8B]/20">
          <TabsList className="bg-transparent border-none h-12 justify-start gap-0 rounded-none">
            <TabsTrigger 
              value="pretrained" 
              className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
            >
              <Brain className="h-4 w-4 mr-2" />
              Pre-trained Models ({filteredModels.length})
            </TabsTrigger>
            <TabsTrigger 
              value="custom" 
              className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
            >
              <Settings className="h-4 w-4 mr-2" />
              My Models ({userModels.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <TabsContent value="pretrained" className="m-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredModels.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="m-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {userModels.map((model) => (
                <ModelCard key={model.id} model={model} isUserModel />
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ModelManager;