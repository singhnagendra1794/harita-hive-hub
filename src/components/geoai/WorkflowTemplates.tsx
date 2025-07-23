import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Building, 
  Satellite, 
  Leaf, 
  Route, 
  Zap, 
  Flame,
  TreePine,
  Play,
  ExternalLink,
  Search,
  Filter,
  Clock,
  Star,
  Download,
  Eye,
  Settings
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  rating: number;
  usageCount: number;
  icon: React.ReactNode;
  tags: string[];
  colabLink: string;
  sampleData?: string;
  outputs: string[];
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'building-detection',
    title: 'Building Detection (YOLOv8)',
    description: 'Detect and classify buildings from drone imagery using state-of-the-art object detection',
    category: 'Computer Vision',
    difficulty: 'Advanced',
    estimatedTime: '15-20 min',
    rating: 4.8,
    usageCount: 1247,
    icon: <Building className="h-5 w-5" />,
    tags: ['Object Detection', 'YOLOv8', 'Urban Planning'],
    colabLink: 'https://colab.research.google.com/github/haritahive/building-detection',
    sampleData: 'Urban drone imagery dataset',
    outputs: ['Bounding boxes', 'Classification maps', 'Building count']
  },
  {
    id: 'land-use-classification',
    title: 'Land Use Classification (U-Net)',
    description: 'Multi-spectral land cover classification with deep learning on Sentinel-2 data',
    category: 'Remote Sensing',
    difficulty: 'Intermediate',
    estimatedTime: '10-15 min',
    rating: 4.9,
    usageCount: 2156,
    icon: <Satellite className="h-5 w-5" />,
    tags: ['Semantic Segmentation', 'U-Net', 'Sentinel-2'],
    colabLink: 'https://colab.research.google.com/github/haritahive/land-use-classification',
    sampleData: 'Sentinel-2 multispectral imagery',
    outputs: ['Land use maps', 'Class statistics', 'Accuracy metrics']
  },
  {
    id: 'ndvi-analyzer',
    title: 'NDVI Crop Health Analyzer',
    description: 'Automated crop health monitoring using normalized difference vegetation index',
    category: 'Agriculture',
    difficulty: 'Beginner',
    estimatedTime: '5-10 min',
    rating: 4.7,
    usageCount: 3421,
    icon: <Leaf className="h-5 w-5" />,
    tags: ['NDVI', 'Agriculture', 'Time Series'],
    colabLink: 'https://colab.research.google.com/github/haritahive/ndvi-analyzer',
    sampleData: 'Agricultural field imagery',
    outputs: ['NDVI maps', 'Health statistics', 'Trend analysis']
  },
  {
    id: 'road-extraction',
    title: 'Road Network Extraction',
    description: 'Extract road networks from satellite imagery using semantic segmentation',
    category: 'Infrastructure',
    difficulty: 'Advanced',
    estimatedTime: '20-25 min',
    rating: 4.6,
    usageCount: 987,
    icon: <Route className="h-5 w-5" />,
    tags: ['Road Detection', 'CNN', 'Infrastructure'],
    colabLink: 'https://colab.research.google.com/github/haritahive/road-extraction',
    sampleData: 'High-resolution satellite imagery',
    outputs: ['Road networks', 'Connectivity analysis', 'Vector data']
  },
  {
    id: 'change-detection',
    title: 'Time-Series Change Detection',
    description: 'Multi-temporal analysis for detecting land cover changes using GEE and TensorFlow',
    category: 'Environmental',
    difficulty: 'Advanced',
    estimatedTime: '25-30 min',
    rating: 4.8,
    usageCount: 1543,
    icon: <Zap className="h-5 w-5" />,
    tags: ['Change Detection', 'Time Series', 'Google Earth Engine'],
    colabLink: 'https://colab.research.google.com/github/haritahive/change-detection',
    sampleData: 'Multi-temporal satellite data',
    outputs: ['Change maps', 'Statistics', 'Trend analysis']
  },
  {
    id: 'forest-degradation',
    title: 'Forest Degradation Detector',
    description: 'Detect forest degradation patterns using machine learning and satellite data',
    category: 'Environmental',
    difficulty: 'Intermediate',
    estimatedTime: '15-20 min',
    rating: 4.7,
    usageCount: 876,
    icon: <TreePine className="h-5 w-5" />,
    tags: ['Forest Monitoring', 'Random Forest', 'Conservation'],
    colabLink: 'https://colab.research.google.com/github/haritahive/forest-degradation',
    sampleData: 'Forest cover time series',
    outputs: ['Degradation maps', 'Risk zones', 'Alerts']
  },
  {
    id: 'fire-risk-mapping',
    title: 'AI-Powered Fire Risk Mapping',
    description: 'Predict fire risk zones using NDMI, temperature, and weather data',
    category: 'Disaster Management',
    difficulty: 'Advanced',
    estimatedTime: '20-25 min',
    rating: 4.9,
    usageCount: 654,
    icon: <Flame className="h-5 w-5" />,
    tags: ['Fire Risk', 'NDMI', 'Weather Data'],
    colabLink: 'https://colab.research.google.com/github/haritahive/fire-risk-mapping',
    sampleData: 'Multi-source environmental data',
    outputs: ['Risk maps', 'Probability scores', 'Warning zones']
  }
];

interface WorkflowTemplatesProps {
  onWorkflowRun: (workflow: WorkflowTemplate) => void;
  uploadedLayers: any[];
}

const WorkflowTemplates = ({ onWorkflowRun, uploadedLayers }: WorkflowTemplatesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = ['all', 'Computer Vision', 'Remote Sensing', 'Agriculture', 'Infrastructure', 'Environmental', 'Disaster Management'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredTemplates = workflowTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleRunColab = (template: WorkflowTemplate) => {
    window.open(template.colabLink, '_blank');
    toast({
      title: "Opening Google Colab",
      description: `Launching ${template.title} notebook in a new tab`,
    });
  };

  const handleTryOnHaritaHive = (template: WorkflowTemplate) => {
    onWorkflowRun(template);
    toast({
      title: "Workflow Started",
      description: `Running ${template.title} on HaritaHive platform`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-[#43AA8B] border-[#43AA8B]';
      case 'Intermediate': return 'text-[#F4D35E] border-[#F4D35E]';
      case 'Advanced': return 'text-red-400 border-red-400';
      default: return 'text-[#F9F9F9] border-[#F9F9F9]';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0D1B2A] text-[#F9F9F9]">
      {/* Header with Search and Filters */}
      <div className="p-6 bg-[#1B263B] border-b border-[#43AA8B]/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">AI Workflow Templates</h2>
            <p className="text-sm text-[#F9F9F9]/70">Ready-to-use AI models for geospatial analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-[#43AA8B] text-[#43AA8B]">
              {filteredTemplates.length} Available
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F9F9F9]/50" />
            <Input
              placeholder="Search workflows..."
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
          
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-40 bg-[#0D1B2A] border-[#43AA8B]/30 text-[#F9F9F9]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-[#1B263B] border-[#43AA8B]/30">
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty} className="text-[#F9F9F9]">
                  {difficulty === 'all' ? 'All Levels' : difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="bg-[#1B263B] border-[#43AA8B]/20 hover:border-[#43AA8B]/40 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F4D35E]/10 rounded-lg text-[#F4D35E]">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-sm font-semibold line-clamp-1">
                        {template.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-[#F4D35E] fill-current" />
                          <span className="text-xs text-[#F9F9F9]/70">{template.rating}</span>
                        </div>
                        <span className="text-xs text-[#F9F9F9]/50">•</span>
                        <span className="text-xs text-[#F9F9F9]/70">{template.usageCount} uses</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#F9F9F9]/70 mt-2 line-clamp-2">
                  {template.description}
                </p>

                {/* Tags and Metadata */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 border-[#F9F9F9]/30 text-[#F9F9F9]/70">
                      {template.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#F9F9F9]/50">
                    <Clock className="h-3 w-3" />
                    {template.estimatedTime}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs bg-[#43AA8B]/10 text-[#43AA8B] px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-xs text-[#F9F9F9]/50">+{template.tags.length - 3}</span>
                  )}
                </div>

                {/* Sample Data */}
                {template.sampleData && (
                  <div className="text-xs text-[#F9F9F9]/60">
                    📁 Sample: {template.sampleData}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-[#F4D35E] hover:bg-[#F4D35E]/90 text-[#0D1B2A] font-medium"
                    onClick={() => handleTryOnHaritaHive(template)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Run Here
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-[#43AA8B]/50 text-[#43AA8B] hover:bg-[#43AA8B]/10"
                    onClick={() => handleRunColab(template)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-[#F9F9F9]/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#F9F9F9]/70 mb-2">No workflows found</h3>
            <p className="text-sm text-[#F9F9F9]/50">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowTemplates;