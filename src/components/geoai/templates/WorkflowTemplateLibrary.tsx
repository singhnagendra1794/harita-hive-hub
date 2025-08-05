import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useGeoAIUsage } from '../enhanced/GeoAIUsageTracker';
import {
  Search,
  Play,
  Star,
  Download,
  Clock,
  Target,
  Layers,
  Zap,
  Leaf,
  AlertTriangle,
  Building,
  TrendingUp,
  Filter,
  Eye,
  BookOpen
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_runtime: number;
  accuracy_rating: number;
  tags: string[];
  workflow_config: any;
  models_used: string[];
  data_requirements: string[];
  output_formats: string[];
  use_cases: string[];
  created_by: string;
  is_featured: boolean;
  usage_count: number;
}

const templateCategories = [
  { id: 'agriculture', name: 'Agriculture', icon: Leaf, color: '#43AA8B' },
  { id: 'disaster', name: 'Disaster Management', icon: AlertTriangle, color: '#EE964B' },
  { id: 'urban', name: 'Urban Planning', icon: Building, color: '#F4D35E' },
  { id: 'climate', name: 'ESG & Climate', icon: TrendingUp, color: '#43AA8B' },
  { id: 'environmental', name: 'Environmental', icon: Leaf, color: '#43AA8B' },
  { id: 'water', name: 'Water Resources', icon: Target, color: '#43AA8B' }
];

const predefinedTemplates: Omit<WorkflowTemplate, 'id' | 'created_by' | 'usage_count'>[] = [
  {
    name: 'Crop Health Monitoring',
    description: 'Automated detection of crop health using NDVI analysis and machine learning',
    category: 'agriculture',
    difficulty: 'beginner',
    estimated_runtime: 15,
    accuracy_rating: 94.5,
    tags: ['ndvi', 'crop-health', 'agriculture', 'sentinel-2'],
    workflow_config: {
      nodes: [
        { id: 'data-1', type: 'data_source', config: { name: 'Sentinel-2', bands: ['B4', 'B8'] } },
        { id: 'process-1', type: 'processing', config: { operation: 'ndvi_calculation' } },
        { id: 'model-1', type: 'model', config: { name: 'Crop Health Classifier' } },
        { id: 'output-1', type: 'output', config: { format: 'geotiff' } }
      ],
      edges: [
        { source: 'data-1', target: 'process-1' },
        { source: 'process-1', target: 'model-1' },
        { source: 'model-1', target: 'output-1' }
      ]
    },
    models_used: ['Crop Health Classifier'],
    data_requirements: ['Multispectral satellite imagery', 'Field boundary polygons'],
    output_formats: ['GeoTIFF', 'Shapefile', 'PDF Report'],
    use_cases: ['Precision agriculture', 'Yield prediction', 'Disease detection'],
    is_featured: true
  },
  {
    name: 'Flood Risk Assessment',
    description: 'Comprehensive flood risk analysis using elevation models and precipitation data',
    category: 'disaster',
    difficulty: 'intermediate',
    estimated_runtime: 30,
    accuracy_rating: 91.2,
    tags: ['flood', 'risk-assessment', 'dem', 'precipitation'],
    workflow_config: {
      nodes: [
        { id: 'data-1', type: 'data_source', config: { name: 'DEM Data' } },
        { id: 'data-2', type: 'data_source', config: { name: 'Precipitation Data' } },
        { id: 'model-1', type: 'model', config: { name: 'Flood Risk Assessment' } },
        { id: 'output-1', type: 'output', config: { format: 'risk_zones' } }
      ],
      edges: [
        { source: 'data-1', target: 'model-1' },
        { source: 'data-2', target: 'model-1' },
        { source: 'model-1', target: 'output-1' }
      ]
    },
    models_used: ['Flood Risk Assessment'],
    data_requirements: ['Digital Elevation Model', 'Historical precipitation data', 'River network'],
    output_formats: ['Risk zones shapefile', 'Flood probability maps', 'Emergency response plan'],
    use_cases: ['Emergency planning', 'Insurance assessment', 'Urban development'],
    is_featured: true
  },
  {
    name: 'Urban Heat Island Detection',
    description: 'Identify and analyze urban heat islands using thermal satellite data',
    category: 'urban',
    difficulty: 'intermediate',
    estimated_runtime: 25,
    accuracy_rating: 88.7,
    tags: ['heat-island', 'urban', 'thermal', 'temperature'],
    workflow_config: {
      nodes: [
        { id: 'data-1', type: 'data_source', config: { name: 'Landsat Thermal' } },
        { id: 'model-1', type: 'model', config: { name: 'Heat Island Detection' } },
        { id: 'output-1', type: 'output', config: { format: 'thermal_map' } }
      ],
      edges: [
        { source: 'data-1', target: 'model-1' },
        { source: 'model-1', target: 'output-1' }
      ]
    },
    models_used: ['Heat Island Detection'],
    data_requirements: ['Thermal satellite imagery', 'Land cover data', 'Building footprints'],
    output_formats: ['Temperature maps', 'Heat island boundaries', 'Mitigation recommendations'],
    use_cases: ['Urban planning', 'Climate adaptation', 'Energy efficiency'],
    is_featured: false
  },
  {
    name: 'Deforestation Alert System',
    description: 'Real-time deforestation detection and alerting using change detection algorithms',
    category: 'environmental',
    difficulty: 'advanced',
    estimated_runtime: 45,
    accuracy_rating: 96.3,
    tags: ['deforestation', 'change-detection', 'forest', 'alerts'],
    workflow_config: {
      nodes: [
        { id: 'data-1', type: 'data_source', config: { name: 'Sentinel-2 Time Series' } },
        { id: 'model-1', type: 'model', config: { name: 'Deforestation Alert System' } },
        { id: 'output-1', type: 'output', config: { format: 'alerts' } }
      ],
      edges: [
        { source: 'data-1', target: 'model-1' },
        { source: 'model-1', target: 'output-1' }
      ]
    },
    models_used: ['Deforestation Alert System'],
    data_requirements: ['Multi-temporal satellite imagery', 'Forest cover baseline', 'Protected area boundaries'],
    output_formats: ['Alert polygons', 'Change statistics', 'Monitoring dashboard'],
    use_cases: ['Forest conservation', 'REDD+ monitoring', 'Illegal logging detection'],
    is_featured: true
  },
  {
    name: 'Irrigation Stress Analysis',
    description: 'Monitor crop water stress and optimize irrigation scheduling',
    category: 'agriculture',
    difficulty: 'beginner',
    estimated_runtime: 20,
    accuracy_rating: 92.1,
    tags: ['irrigation', 'water-stress', 'evapotranspiration', 'agriculture'],
    workflow_config: {
      nodes: [
        { id: 'data-1', type: 'data_source', config: { name: 'Sentinel-2' } },
        { id: 'data-2', type: 'data_source', config: { name: 'Weather Data' } },
        { id: 'process-1', type: 'processing', config: { operation: 'evapotranspiration' } },
        { id: 'model-1', type: 'model', config: { name: 'Irrigation Optimizer' } },
        { id: 'output-1', type: 'output', config: { format: 'irrigation_plan' } }
      ],
      edges: [
        { source: 'data-1', target: 'process-1' },
        { source: 'data-2', target: 'process-1' },
        { source: 'process-1', target: 'model-1' },
        { source: 'model-1', target: 'output-1' }
      ]
    },
    models_used: ['Irrigation Optimizer'],
    data_requirements: ['Multispectral imagery', 'Weather station data', 'Soil moisture sensors'],
    output_formats: ['Irrigation schedule', 'Water stress maps', 'Efficiency metrics'],
    use_cases: ['Precision irrigation', 'Water conservation', 'Yield optimization'],
    is_featured: false
  },
  {
    name: 'Wildfire Risk Prediction',
    description: 'Predict wildfire risk using weather, vegetation, and topographic data',
    category: 'disaster',
    difficulty: 'advanced',
    estimated_runtime: 40,
    accuracy_rating: 89.4,
    tags: ['wildfire', 'risk-prediction', 'weather', 'vegetation'],
    workflow_config: {
      nodes: [
        { id: 'data-1', type: 'data_source', config: { name: 'Weather Forecast' } },
        { id: 'data-2', type: 'data_source', config: { name: 'Vegetation Index' } },
        { id: 'data-3', type: 'data_source', config: { name: 'Topographic Data' } },
        { id: 'model-1', type: 'model', config: { name: 'Wildfire Risk Predictor' } },
        { id: 'output-1', type: 'output', config: { format: 'risk_forecast' } }
      ],
      edges: [
        { source: 'data-1', target: 'model-1' },
        { source: 'data-2', target: 'model-1' },
        { source: 'data-3', target: 'model-1' },
        { source: 'model-1', target: 'output-1' }
      ]
    },
    models_used: ['Wildfire Risk Predictor'],
    data_requirements: ['Weather forecast data', 'Vegetation moisture content', 'Digital elevation model'],
    output_formats: ['Risk probability maps', 'Alert zones', 'Evacuation plans'],
    use_cases: ['Fire prevention', 'Emergency planning', 'Resource allocation'],
    is_featured: true
  }
];

interface WorkflowTemplateLibraryProps {
  onTemplateSelect: (template: WorkflowTemplate) => void;
  onTemplateRun: (template: WorkflowTemplate) => void;
}

const WorkflowTemplateLibrary: React.FC<WorkflowTemplateLibraryProps> = ({
  onTemplateSelect,
  onTemplateRun
}) => {
  const { user } = useAuth();
  const { canExecuteJob, trackJobExecution } = useGeoAIUsage();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showTemplateDetails, setShowTemplateDetails] = useState<WorkflowTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // Load templates from database
      const { data: dbTemplates, error } = await supabase
        .from('geoai_workflows')
        .select('*')
        .eq('is_template', true)
        .eq('is_public', true);

      if (error) throw error;

      // Combine predefined templates with database templates
      const combinedTemplates = [
        ...predefinedTemplates.map((template, index) => ({
          ...template,
          id: `predefined-${index}`,
          created_by: 'system',
          usage_count: Math.floor(Math.random() * 1000) + 100
        })),
        ...(dbTemplates || []).map(template => ({
          ...template,
          tags: Array.isArray(template.tags) ? template.tags : [],
          models_used: Array.isArray(template.models_used) ? template.models_used : [],
          data_requirements: Array.isArray(template.data_requirements) ? template.data_requirements : [],
          output_formats: Array.isArray(template.output_formats) ? template.output_formats : [],
          use_cases: Array.isArray(template.use_cases) ? template.use_cases : []
        }))
      ];

      setTemplates(combinedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fall back to predefined templates only
      setTemplates(predefinedTemplates.map((template, index) => ({
        ...template,
        id: `predefined-${index}`,
        created_by: 'system',
        usage_count: Math.floor(Math.random() * 1000) + 100
      })));
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const featuredTemplates = filteredTemplates.filter(template => template.is_featured);
  const regularTemplates = filteredTemplates.filter(template => !template.is_featured);

  const handleTemplateRun = async (template: WorkflowTemplate) => {
    try {
      if (!canExecuteJob()) {
        toast({
          title: "Usage Limit Reached",
          description: "Upgrade your plan to run more workflows",
          variant: "destructive"
        });
        return;
      }

      await trackJobExecution();
      onTemplateRun(template);
      
      // Track usage
      await supabase
        .from('geoai_workflows')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', template.id);

      toast({
        title: "Workflow Started",
        description: `${template.name} is now running`,
      });
    } catch (error) {
      console.error('Error running template:', error);
      toast({
        title: "Error",
        description: "Failed to start workflow",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-[#43AA8B] text-white';
      case 'intermediate': return 'bg-[#F4D35E] text-[#0D1B2A]';
      case 'advanced': return 'bg-[#EE964B] text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = templateCategories.find(cat => cat.id === category);
    const IconComponent = categoryData?.icon || Layers;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4D35E]"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0D1B2A]">
      {/* Header */}
      <div className="bg-[#1B263B] border-b border-[#43AA8B]/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Workflow Templates</h2>
            <p className="text-[#F9F9F9]/70">One-click deployable AI workflows for common use cases</p>
          </div>
          <Badge variant="outline" className="border-[#F4D35E] text-[#F4D35E]">
            {filteredTemplates.length} templates
          </Badge>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F9F9F9]/50" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0D1B2A] border-[#43AA8B]/20 text-white"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#0D1B2A] border border-[#43AA8B]/20 text-white rounded-md px-3 py-2"
            >
              <option value="all">All Categories</option>
              {templateCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-[#0D1B2A] border border-[#43AA8B]/20 text-white rounded-md px-3 py-2"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8">
          {/* Featured Templates */}
          {featuredTemplates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-[#F4D35E]" />
                <h3 className="text-xl font-semibold text-white">Featured Templates</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {featuredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onRun={() => handleTemplateRun(template)}
                    onViewDetails={() => setShowTemplateDetails(template)}
                    onSelect={() => onTemplateSelect(template)}
                    getCategoryIcon={getCategoryIcon}
                    getDifficultyColor={getDifficultyColor}
                    isFeatured
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Templates */}
          {regularTemplates.length > 0 && (
            <div>
              {featuredTemplates.length > 0 && <Separator className="my-8 bg-[#43AA8B]/20" />}
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-[#43AA8B]" />
                <h3 className="text-xl font-semibold text-white">All Templates</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {regularTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onRun={() => handleTemplateRun(template)}
                    onViewDetails={() => setShowTemplateDetails(template)}
                    onSelect={() => onTemplateSelect(template)}
                    getCategoryIcon={getCategoryIcon}
                    getDifficultyColor={getDifficultyColor}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-[#F9F9F9]/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
              <p className="text-[#F9F9F9]/70">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Template Details Dialog */}
      <Dialog open={!!showTemplateDetails} onOpenChange={() => setShowTemplateDetails(null)}>
        <DialogContent className="bg-[#1B263B] border-[#43AA8B]/20 max-w-4xl max-h-[80vh]">
          {showTemplateDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-[#F4D35E] rounded-lg">
                    {getCategoryIcon(showTemplateDetails.category)}
                  </div>
                  {showTemplateDetails.name}
                  {showTemplateDetails.is_featured && (
                    <Star className="h-5 w-5 text-[#F4D35E] fill-current" />
                  )}
                </DialogTitle>
              </DialogHeader>
              <TemplateDetails template={showTemplateDetails} onRun={() => handleTemplateRun(showTemplateDetails)} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: WorkflowTemplate;
  onRun: () => void;
  onViewDetails: () => void;
  onSelect: () => void;
  getCategoryIcon: (category: string) => React.ReactNode;
  getDifficultyColor: (difficulty: string) => string;
  isFeatured?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onRun,
  onViewDetails,
  onSelect,
  getCategoryIcon,
  getDifficultyColor,
  isFeatured
}) => (
  <Card className={`bg-[#1B263B] border-[#43AA8B]/20 hover:border-[#43AA8B]/40 transition-all ${isFeatured ? 'ring-1 ring-[#F4D35E]/20' : ''}`}>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getCategoryIcon(template.category)}
          <Badge variant="outline" className="text-xs border-[#43AA8B]/30 text-[#43AA8B]">
            {template.category}
          </Badge>
          <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
            {template.difficulty}
          </Badge>
        </div>
        {isFeatured && <Star className="h-4 w-4 text-[#F4D35E] fill-current" />}
      </div>
      <CardTitle className="text-white text-lg">{template.name}</CardTitle>
      <p className="text-[#F9F9F9]/70 text-sm line-clamp-2">{template.description}</p>
    </CardHeader>
    
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#F9F9F9]/50" />
          <span className="text-[#F9F9F9]/70">{template.estimated_runtime}min</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#F9F9F9]/50" />
          <span className="text-[#F9F9F9]/70">{template.accuracy_rating}% accuracy</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {template.tags.slice(0, 3).map(tag => (
          <Badge key={tag} variant="outline" className="text-xs border-[#43AA8B]/20 text-[#F9F9F9]/50">
            {tag}
          </Badge>
        ))}
        {template.tags.length > 3 && (
          <Badge variant="outline" className="text-xs border-[#43AA8B]/20 text-[#F9F9F9]/50">
            +{template.tags.length - 3}
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={onRun}
          className="flex-1 bg-[#43AA8B] hover:bg-[#43AA8B]/90 text-white"
          size="sm"
        >
          <Play className="h-4 w-4 mr-2" />
          Run
        </Button>
        <Button 
          onClick={onViewDetails}
          variant="outline"
          className="border-[#43AA8B]/20 text-[#43AA8B] hover:bg-[#43AA8B]/10"
          size="sm"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button 
          onClick={onSelect}
          variant="outline"
          className="border-[#F4D35E]/20 text-[#F4D35E] hover:bg-[#F4D35E]/10"
          size="sm"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Template Details Component
interface TemplateDetailsProps {
  template: WorkflowTemplate;
  onRun: () => void;
}

const TemplateDetails: React.FC<TemplateDetailsProps> = ({ template, onRun }) => (
  <ScrollArea className="max-h-[60vh]">
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-white font-medium mb-2">Models Used</h4>
          <div className="space-y-1">
            {template.models_used.map(model => (
              <div key={model} className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-[#F4D35E]" />
                <span className="text-[#F9F9F9]/70 text-sm">{model}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-medium mb-2">Data Requirements</h4>
          <div className="space-y-1">
            {template.data_requirements.map(req => (
              <div key={req} className="flex items-center gap-2">
                <Layers className="h-3 w-3 text-[#43AA8B]" />
                <span className="text-[#F9F9F9]/70 text-sm">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-2">Output Formats</h4>
        <div className="flex flex-wrap gap-2">
          {template.output_formats.map(format => (
            <Badge key={format} variant="outline" className="border-[#EE964B]/20 text-[#EE964B]">
              {format}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-2">Use Cases</h4>
        <div className="grid grid-cols-1 gap-2">
          {template.use_cases.map(useCase => (
            <div key={useCase} className="flex items-center gap-2">
              <Target className="h-3 w-3 text-[#F4D35E]" />
              <span className="text-[#F9F9F9]/70 text-sm">{useCase}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#43AA8B]/20">
        <div className="text-sm text-[#F9F9F9]/50">
          Used {template.usage_count} times
        </div>
        <Button onClick={onRun} className="bg-[#43AA8B] hover:bg-[#43AA8B]/90">
          <Play className="h-4 w-4 mr-2" />
          Run Template
        </Button>
      </div>
    </div>
  </ScrollArea>
);

export default WorkflowTemplateLibrary;