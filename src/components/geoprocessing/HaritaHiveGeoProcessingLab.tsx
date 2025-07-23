import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Cpu, 
  Database, 
  Clock, 
  CheckCircle,
  Activity,
  Layers,
  MapPin,
  BarChart3,
  Merge,
  Upload,
  Map,
  Download,
  Calculator,
  Navigation,
  Scissors,
  RotateCcw,
  Combine,
  Zap,
  CloudRain,
  TreePine,
  Grid3X3,
  Workflow,
  Bot,
  Play,
  Pause,
  Square,
  FileText,
  Settings,
  User,
  HelpCircle,
  Star
} from "lucide-react";

interface JobStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface MapLayer {
  id: string;
  name: string;
  type: 'basemap' | 'user' | 'result';
  visible: boolean;
  opacity: number;
  data?: any;
}

const HaritaHiveGeoProcessingLab = () => {
  const { user } = useAuth();
  const { hasAccess, subscription } = usePremiumAccess();
  const [activeTab, setActiveTab] = useState("raster");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [jobStats, setJobStats] = useState<JobStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    {
      id: 'osm',
      name: 'OpenStreetMap',
      type: 'basemap',
      visible: true,
      opacity: 1.0
    }
  ]);
  const [usageStats, setUsageStats] = useState({
    monthlyJobs: 12,
    monthlyLimit: 50,
    totalProcessingTime: 345
  });

  // Raster Tools
  const rasterTools = [
    {
      id: 'raster-calculator',
      name: 'Raster Calculator',
      icon: Calculator,
      description: 'Perform band math operations (NDVI, NDMI, SAVI)',
      category: 'calculation',
      isPremium: false
    },
    {
      id: 'reproject-raster',
      name: 'Reproject Raster',
      icon: Navigation,
      description: 'Change coordinate reference system',
      category: 'projection',
      isPremium: false
    },
    {
      id: 'clip-raster',
      name: 'Clip Raster',
      icon: Scissors,
      description: 'Extract raster by extent or shape',
      category: 'extraction',
      isPremium: false
    },
    {
      id: 'merge-rasters',
      name: 'Merge Rasters',
      icon: Combine,
      description: 'Mosaic multiple raster files',
      category: 'merge',
      isPremium: true
    },
    {
      id: 'resample-raster',
      name: 'Resample Raster',
      icon: Grid3X3,
      description: 'Change resolution (nearest, bilinear, cubic)',
      category: 'processing',
      isPremium: true
    },
    {
      id: 'zonal-statistics',
      name: 'Zonal Statistics',
      icon: BarChart3,
      description: 'Calculate raster statistics by polygons',
      category: 'analysis',
      isPremium: true
    },
    {
      id: 'ndvi-calculator',
      name: 'NDVI Calculator',
      icon: TreePine,
      description: 'Vegetation index calculator',
      category: 'index',
      isPremium: false
    },
    {
      id: 'cloud-masking',
      name: 'Cloud Masking',
      icon: CloudRain,
      description: 'Remove clouds from Sentinel-2 imagery',
      category: 'preprocessing',
      isPremium: true
    },
    {
      id: 'timeseries-analyzer',
      name: 'Time Series Analyzer',
      icon: Activity,
      description: 'Multi-temporal stack analysis',
      category: 'temporal',
      isPremium: true
    }
  ];

  // Vector Tools
  const vectorTools = [
    {
      id: 'merge-vectors',
      name: 'Merge Vectors',
      icon: Combine,
      description: 'Combine shapefiles/GeoJSON',
      category: 'merge',
      isPremium: false
    },
    {
      id: 'clip-vectors',
      name: 'Clip Vectors',
      icon: Scissors,
      description: 'Extract vectors by boundary',
      category: 'extraction',
      isPremium: false
    },
    {
      id: 'spatial-operations',
      name: 'Union/Intersect/Dissolve',
      icon: Zap,
      description: 'Geometric overlay operations',
      category: 'overlay',
      isPremium: true
    },
    {
      id: 'spatial-join',
      name: 'Spatial Join',
      icon: MapPin,
      description: 'Attribute and geometric joins',
      category: 'join',
      isPremium: true
    },
    {
      id: 'reproject-vector',
      name: 'Reproject Vector',
      icon: Navigation,
      description: 'Change coordinate reference system',
      category: 'projection',
      isPremium: false
    },
    {
      id: 'buffer-tools',
      name: 'Buffer/Centroid/Hull',
      icon: RotateCcw,
      description: 'Generate buffers and geometric operations',
      category: 'geometry',
      isPremium: false
    },
    {
      id: 'simplify-geometry',
      name: 'Simplify Geometry',
      icon: Grid3X3,
      description: 'Reduce vertex complexity',
      category: 'optimization',
      isPremium: true
    },
    {
      id: 'calculate-geometry',
      name: 'Area & Length Calculator',
      icon: Calculator,
      description: 'Calculate geometric properties',
      category: 'calculation',
      isPremium: false
    },
    {
      id: 'generate-grid',
      name: 'Generate Grid',
      icon: Grid3X3,
      description: 'Create hex or square grids',
      category: 'generation',
      isPremium: true
    }
  ];

  const automationTools = [
    {
      id: 'batch-processing',
      name: 'Batch Processing',
      icon: Database,
      description: 'Apply operations to multiple files',
      category: 'batch',
      isPremium: true
    },
    {
      id: 'workflow-builder',
      name: 'Workflow Builder',
      icon: Workflow,
      description: 'Create custom processing chains',
      category: 'automation',
      isPremium: true
    }
  ];

  const fetchJobStats = async () => {
    // Simulate fetching job stats
    setJobStats({
      pending: 2,
      processing: 1,
      completed: 47,
      failed: 1
    });
  };

  useEffect(() => {
    fetchJobStats();
  }, []);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleRunTool = async () => {
    if (!selectedTool) return;
    
    toast({
      title: "Processing Started",
      description: "Your geo-processing job has been queued",
    });
    
    // Simulate processing
    setTimeout(() => {
      toast({
        title: "Processing Complete",
        description: "Your results are ready for download",
      });
      fetchJobStats();
    }, 3000);
  };

  const renderToolCard = (tool: any) => (
    <Card 
      key={tool.id}
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedTool === tool.id ? 'ring-2 ring-primary' : ''
      } ${tool.isPremium && !hasAccess('premium') ? 'opacity-50' : ''}`}
      onClick={() => handleToolSelect(tool.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <tool.icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{tool.name}</h4>
              {tool.isPremium && (
                <Badge variant="secondary" className="text-xs">Pro</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {tool.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderParameterPanel = () => {
    if (!selectedTool) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select a tool to configure parameters</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Input File</Label>
          <Button variant="outline" className="w-full justify-start">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>

        {selectedTool === 'raster-calculator' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Formula</Label>
              <Textarea 
                placeholder="(B4 - B3) / (B4 + B3)"
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select defaultValue="geotiff">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geotiff">GeoTIFF</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {selectedTool === 'buffer-tools' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Buffer Distance (meters)</Label>
              <Input type="number" defaultValue="100" />
            </div>
            <div className="space-y-2">
              <Label>Buffer Style</Label>
              <Select defaultValue="round">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button 
            onClick={handleRunTool}
            className="w-full"
            disabled={!selectedTool}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Processing
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-[#0D1B2A] text-white">
      {/* Top Navigation */}
      <div className="border-b border-[#1B263B] bg-[#0D1B2A] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-[#F4D35E]" />
              <h1 className="text-xl font-bold">HaritaHive GeoProcessing Lab</h1>
            </div>
            <Badge variant="outline" className="border-[#43AA8B] text-[#43AA8B]">
              Enterprise Grade
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{jobStats.pending + jobStats.processing} active</span>
              </div>
              <div className="flex items-center gap-1 text-[#43AA8B]">
                <CheckCircle className="h-3 w-3" />
                <span>{jobStats.completed} completed</span>
              </div>
            </div>
            
            <Badge className="bg-[#F4D35E] text-[#0D1B2A]">
              {subscription?.subscription_tier?.toUpperCase() || 'FREE'}
            </Badge>
            
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#F9F9F9]">Monthly Usage</span>
            <span className="text-[#F4D35E]">
              {usageStats.monthlyJobs} / {usageStats.monthlyLimit}
            </span>
          </div>
          <Progress 
            value={(usageStats.monthlyJobs / usageStats.monthlyLimit) * 100}
            className="h-1"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tool Categories */}
        <div className="w-80 border-r border-[#1B263B] bg-[#0D1B2A] overflow-y-auto">
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#1B263B]">
                <TabsTrigger value="raster" className="text-xs data-[state=active]:bg-[#43AA8B]">
                  <Layers className="h-3 w-3 mr-1" />
                  Raster
                </TabsTrigger>
                <TabsTrigger value="vector" className="text-xs data-[state=active]:bg-[#43AA8B]">
                  <MapPin className="h-3 w-3 mr-1" />
                  Vector
                </TabsTrigger>
                <TabsTrigger value="automation" className="text-xs data-[state=active]:bg-[#43AA8B]">
                  <Workflow className="h-3 w-3 mr-1" />
                  Auto
                </TabsTrigger>
              </TabsList>

              <TabsContent value="raster" className="mt-4 space-y-2">
                <div className="mb-3">
                  <h3 className="font-medium text-[#F4D35E] mb-2">Raster Processing Tools</h3>
                  <p className="text-xs text-[#F9F9F9]/70">
                    Process satellite imagery, DEMs, and raster datasets
                  </p>
                </div>
                {rasterTools.map(renderToolCard)}
              </TabsContent>

              <TabsContent value="vector" className="mt-4 space-y-2">
                <div className="mb-3">
                  <h3 className="font-medium text-[#F4D35E] mb-2">Vector Analysis Tools</h3>
                  <p className="text-xs text-[#F9F9F9]/70">
                    Analyze shapefiles, GeoJSON, and vector datasets
                  </p>
                </div>
                {vectorTools.map(renderToolCard)}
              </TabsContent>

              <TabsContent value="automation" className="mt-4 space-y-2">
                <div className="mb-3">
                  <h3 className="font-medium text-[#F4D35E] mb-2">Automation & Workflows</h3>
                  <p className="text-xs text-[#F9F9F9]/70">
                    Batch processing and custom workflows
                  </p>
                </div>
                {automationTools.map(renderToolCard)}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Center Panel - Map */}
        <div className="flex-1 bg-[#1B263B] relative">
          <div className="absolute inset-4 bg-[#0D1B2A] rounded-lg border border-[#1B263B] flex items-center justify-center">
            <div className="text-center">
              <Map className="h-12 w-12 text-[#43AA8B] mx-auto mb-3" />
              <h3 className="font-medium text-[#F4D35E] mb-2">Interactive Map Canvas</h3>
              <p className="text-sm text-[#F9F9F9]/70 mb-4">
                Real-time preview of your data and processing results
              </p>
              <div className="flex gap-2 justify-center">
                <Badge variant="outline" className="border-[#43AA8B] text-[#43AA8B]">
                  Basemap: OpenStreetMap
                </Badge>
                <Badge variant="outline" className="border-[#F4D35E] text-[#F4D35E]">
                  {mapLayers.length} Layer(s)
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button size="sm" variant="secondary" className="bg-[#0D1B2A] border-[#1B263B]">
              <Layers className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="bg-[#0D1B2A] border-[#1B263B]">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Sidebar - Parameters & AI */}
        <div className="w-80 border-l border-[#1B263B] bg-[#0D1B2A] overflow-y-auto">
          <div className="p-4">
            <Tabs defaultValue="params" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#1B263B]">
                <TabsTrigger value="params" className="text-xs data-[state=active]:bg-[#43AA8B]">
                  <Settings className="h-3 w-3 mr-1" />
                  Parameters
                </TabsTrigger>
                <TabsTrigger value="ava" className="text-xs data-[state=active]:bg-[#43AA8B]">
                  <Bot className="h-3 w-3 mr-1" />
                  AVA AI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="params" className="mt-4">
                {renderParameterPanel()}
              </TabsContent>

              <TabsContent value="ava" className="mt-4">
                <div className="space-y-4">
                  <div className="p-3 bg-[#1B263B] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-[#43AA8B]" />
                      <span className="font-medium text-[#F4D35E]">AVA Copilot</span>
                    </div>
                    <p className="text-xs text-[#F9F9F9]/70">
                      Ask me about spatial analysis, tool recommendations, or best practices.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      "Which projection is best for India?"
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      "How to merge shapefiles?"
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      "Run NDVI on my data"
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Ask AVA anything about geo-processing..."
                      className="resize-none bg-[#1B263B] border-[#1B263B]"
                    />
                    <Button size="sm" className="w-full bg-[#43AA8B] hover:bg-[#43AA8B]/90">
                      Ask AVA
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Job Queue & Export */}
      <div className="border-t border-[#1B263B] bg-[#0D1B2A] p-4">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#1B263B]">
            <TabsTrigger value="jobs" className="text-xs data-[state=active]:bg-[#43AA8B]">
              <Activity className="h-3 w-3 mr-1" />
              Job Queue
            </TabsTrigger>
            <TabsTrigger value="files" className="text-xs data-[state=active]:bg-[#43AA8B]">
              <Database className="h-3 w-3 mr-1" />
              My Files
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs data-[state=active]:bg-[#43AA8B]">
              <Download className="h-3 w-3 mr-1" />
              Export
            </TabsTrigger>
            <TabsTrigger value="tutorial" className="text-xs data-[state=active]:bg-[#43AA8B]">
              <FileText className="h-3 w-3 mr-1" />
              Tutorials
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-32 overflow-y-auto">
            <TabsContent value="jobs" className="mt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-[#1B263B] rounded text-xs">
                  <span>NDVI Calculation</span>
                  <Badge className="bg-[#F4D35E] text-[#0D1B2A]">Processing</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#1B263B] rounded text-xs">
                  <span>Vector Buffer</span>
                  <Badge variant="outline" className="border-[#43AA8B] text-[#43AA8B]">Completed</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-0">
              <div className="text-center text-xs text-[#F9F9F9]/70 py-4">
                <Upload className="h-6 w-6 mx-auto mb-2 opacity-50" />
                Upload your first file to get started
              </div>
            </TabsContent>

            <TabsContent value="export" className="mt-0">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  GeoTIFF
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Shapefile
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  PDF Report
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tutorial" className="mt-0">
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                  <Star className="h-3 w-3 mr-2" />
                  Getting Started Guide
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                  <FileText className="h-3 w-3 mr-2" />
                  NDVI Tutorial
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default HaritaHiveGeoProcessingLab;