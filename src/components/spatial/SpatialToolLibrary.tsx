import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, Layers, Thermometer, Route, Calculator, 
  Scissors, RotateCw, Grid, Target, Palette, 
  Database, Play, Zap, Clock, Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  size: number;
  format: string;
}

interface AnalysisJob {
  toolName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  inputFiles: string[];
  outputFiles: string[];
  parameters: Record<string, any>;
}

interface SpatialToolLibraryProps {
  uploadedFiles: UploadedFile[];
  onToolSelect: (toolId: string) => void;
  onJobCreate: (job: Omit<AnalysisJob, 'id' | 'createdAt'>) => void;
  hasAccess: boolean;
  dailyUsage: number;
  dailyLimit: number;
}

const SpatialToolLibrary: React.FC<SpatialToolLibraryProps> = ({
  uploadedFiles,
  onToolSelect,
  onJobCreate,
  hasAccess,
  dailyUsage,
  dailyLimit
}) => {
  const [selectedCategory, setSelectedCategory] = useState('basic');
  const [toolParameters, setToolParameters] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const tools = {
    basic: [
      {
        id: 'buffer',
        title: 'Buffer Analysis',
        description: 'Create buffer zones around features',
        icon: MapPin,
        complexity: 'Basic',
        premium: false,
        parameters: ['distance', 'unit', 'dissolve']
      },
      {
        id: 'spatial-join',
        title: 'Spatial Join',
        description: 'Join attributes based on spatial relationships',
        icon: Layers,
        complexity: 'Basic',
        premium: false,
        parameters: ['target_layer', 'join_layer', 'predicate']
      },
      {
        id: 'heatmap',
        title: 'Heatmap Generation',
        description: 'Create density surfaces from point data',
        icon: Thermometer,
        complexity: 'Basic',
        premium: false,
        parameters: ['radius', 'pixel_size', 'kernel']
      },
      {
        id: 'clip',
        title: 'Clip',
        description: 'Extract data within boundary',
        icon: Scissors,
        complexity: 'Basic',
        premium: false,
        parameters: ['input_layer', 'clip_layer']
      }
    ],
    advanced: [
      {
        id: 'zonal-stats',
        title: 'Zonal Statistics',
        description: 'Calculate statistics for raster data within zones',
        icon: Database,
        complexity: 'Advanced',
        premium: true,
        parameters: ['raster_layer', 'vector_layer', 'statistics']
      },
      {
        id: 'ndvi',
        title: 'NDVI Calculator',
        description: 'Calculate vegetation indices from band math',
        icon: Palette,
        complexity: 'Advanced',
        premium: true,
        parameters: ['red_band', 'nir_band', 'output_name']
      },
      {
        id: 'dissolve',
        title: 'Dissolve',
        description: 'Merge features based on attributes',
        icon: Layers,
        complexity: 'Intermediate',
        premium: false,
        parameters: ['dissolve_field', 'statistics']
      },
      {
        id: 'union',
        title: 'Union',
        description: 'Combine overlapping features',
        icon: Layers,
        complexity: 'Intermediate',
        premium: false,
        parameters: ['input_layers', 'overlay_type']
      },
      {
        id: 'reproject',
        title: 'Reprojection',
        description: 'Transform coordinate reference system',
        icon: RotateCw,
        complexity: 'Basic',
        premium: false,
        parameters: ['source_crs', 'target_crs']
      },
      {
        id: 'raster-vector',
        title: 'Raster to Vector',
        description: 'Convert raster data to vector polygons',
        icon: Grid,
        complexity: 'Advanced',
        premium: true,
        parameters: ['raster_layer', 'band', 'simplify']
      }
    ],
    specialized: [
      {
        id: 'grid-generator',
        title: 'Grid Generator',
        description: 'Create hexagonal or square grids',
        icon: Grid,
        complexity: 'Basic',
        premium: false,
        parameters: ['grid_type', 'cell_size', 'extent']
      },
      {
        id: 'point-in-polygon',
        title: 'Point in Polygon',
        description: 'Count points within polygon features',
        icon: Target,
        complexity: 'Basic',
        premium: false,
        parameters: ['point_layer', 'polygon_layer', 'count_field']
      },
      {
        id: 'fill-nodata',
        title: 'Fill NoData',
        description: 'Interpolate missing raster values',
        icon: Palette,
        complexity: 'Advanced',
        premium: true,
        parameters: ['raster_layer', 'method', 'max_distance']
      },
      {
        id: 'network-analysis',
        title: 'Network Analysis',
        description: 'Route calculation and service areas',
        icon: Route,
        complexity: 'Advanced',
        premium: true,
        parameters: ['network_layer', 'analysis_type', 'impedance']
      },
      {
        id: 'attribute-calculator',
        title: 'Attribute Calculator',
        description: 'Calculate new field values using expressions',
        icon: Calculator,
        complexity: 'Intermediate',
        premium: false,
        parameters: ['expression', 'output_field', 'field_type']
      },
      {
        id: 'batch-runner',
        title: 'Batch Tool Runner',
        description: 'Run multiple tools in sequence',
        icon: Zap,
        complexity: 'Advanced',
        premium: true,
        parameters: ['tool_sequence', 'input_mapping']
      }
    ]
  };

  const canRunTool = (tool: any) => {
    if (tool.premium && !hasAccess) return false;
    if (!hasAccess && dailyUsage >= dailyLimit) return false;
    return uploadedFiles.length > 0;
  };

  const handleRunTool = (tool: any) => {
    if (!canRunTool(tool)) {
      if (tool.premium && !hasAccess) {
        toast({
          title: "Premium Feature",
          description: "This tool requires a premium subscription.",
          variant: "destructive"
        });
      } else if (!hasAccess && dailyUsage >= dailyLimit) {
        toast({
          title: "Daily Limit Reached",
          description: "Upgrade to premium for unlimited access.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "No Data",
          description: "Please upload data files first.",
          variant: "destructive"
        });
      }
      return;
    }

    // Create a new analysis job
    const job = {
      toolName: tool.title,
      status: 'pending' as const,
      progress: 0,
      inputFiles: uploadedFiles.map(f => f.id),
      outputFiles: [],
      parameters: toolParameters[tool.id] || {}
    };

    onJobCreate(job);
    onToolSelect(tool.id);

    toast({
      title: "Analysis Started",
      description: `${tool.title} is now processing your data.`,
    });
  };

  const renderToolCard = (tool: any) => {
    const Icon = tool.icon;
    const isDisabled = !canRunTool(tool);
    
    return (
      <Card key={tool.id} className={`relative ${isDisabled ? 'opacity-60' : ''}`}>
        {tool.premium && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {hasAccess ? 'Pro' : <Lock className="h-3 w-3" />}
            </Badge>
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{tool.title}</CardTitle>
          </div>
          <CardDescription className="text-sm">{tool.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <Badge 
              variant={tool.complexity === 'Basic' ? 'default' : 
                     tool.complexity === 'Intermediate' ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {tool.complexity}
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={isDisabled}>
                Try Example
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleRunTool(tool)}
                disabled={isDisabled}
              >
                <Play className="h-3 w-3 mr-1" />
                Run
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Analysis Tools</h2>
        {!hasAccess && (
          <Badge variant="outline" className="text-xs">
            {dailyUsage}/{dailyLimit} tools used today
          </Badge>
        )}
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Tools</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="specialized">Specialized</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.basic.map(renderToolCard)}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.advanced.map(renderToolCard)}
          </div>
        </TabsContent>

        <TabsContent value="specialized" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.specialized.map(renderToolCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpatialToolLibrary;