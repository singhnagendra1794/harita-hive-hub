import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import FileUploadManager from "../geospatial/FileUploadManager";
import { 
  Layers, 
  Calculator, 
  Satellite, 
  TrendingUp,
  Thermometer,
  Brain,
  Crown,
  Play,
  Zap,
  BarChart3,
  Image
} from "lucide-react";

interface EnhancedRasterToolsProps {
  onJobCreated: () => void;
  onResultGenerated: (result: any) => void;
  subscription: any;
}

const EnhancedRasterTools = ({ onJobCreated, onResultGenerated, subscription }: EnhancedRasterToolsProps) => {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [parameters, setParameters] = useState<any>({});
  const [processing, setProcessing] = useState(false);

  const rasterTools = [
    {
      id: "ndvi_calculation",
      name: "NDVI Analysis",
      description: "Calculate Normalized Difference Vegetation Index from satellite imagery",
      icon: TrendingUp,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".tif", ".tiff"],
      category: "indices",
      isPremium: false
    },
    {
      id: "lst_calculation",
      name: "Land Surface Temperature",
      description: "Extract temperature data from thermal satellite bands",
      icon: Thermometer,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".tif", ".tiff"],
      category: "indices",
      isPremium: false
    },
    {
      id: "raster_calculator",
      name: "Raster Calculator",
      description: "Perform complex mathematical operations on raster layers",
      icon: Calculator,
      minFiles: 1,
      maxFiles: 5,
      supportedFormats: [".tif", ".tiff"],
      category: "math",
      isPremium: true
    },
    {
      id: "ai_classification",
      name: "AI Land Cover Classification",
      description: "Machine learning-powered land cover classification",
      icon: Brain,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".tif", ".tiff"],
      category: "ai",
      isPremium: true
    },
    {
      id: "raster_reproject",
      name: "Raster Reprojection",
      description: "Transform raster coordinate reference systems",
      icon: Satellite,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".tif", ".tiff"],
      category: "transform",
      isPremium: false
    },
    {
      id: "raster_mosaic",
      name: "Raster Mosaic",
      description: "Combine multiple raster tiles into single dataset",
      icon: Image,
      minFiles: 2,
      maxFiles: 10,
      supportedFormats: [".tif", ".tiff"],
      category: "processing",
      isPremium: false
    },
    {
      id: "histogram_analysis",
      name: "Histogram Analysis",
      description: "Statistical analysis of raster value distributions",
      icon: BarChart3,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".tif", ".tiff"],
      category: "analysis",
      isPremium: false
    },
    {
      id: "change_detection",
      name: "Change Detection",
      description: "Detect changes between multi-temporal imagery",
      icon: Zap,
      minFiles: 2,
      maxFiles: 2,
      supportedFormats: [".tif", ".tiff"],
      category: "analysis",
      isPremium: true
    }
  ];

  const categories = [
    { id: "indices", name: "Spectral Indices", icon: TrendingUp },
    { id: "math", name: "Math Operations", icon: Calculator },
    { id: "ai", name: "AI Analysis", icon: Brain },
    { id: "transform", name: "Transformation", icon: Satellite },
    { id: "processing", name: "Processing", icon: Layers },
    { id: "analysis", name: "Analysis", icon: BarChart3 }
  ];

  const handleToolSelect = (toolId: string) => {
    const tool = rasterTools.find(t => t.id === toolId);
    if (tool?.isPremium && subscription?.subscription_tier === 'free') {
      toast({
        title: "Premium Feature",
        description: "This tool requires a Pro or Enterprise subscription.",
        variant: "destructive",
      });
      return;
    }
    setSelectedTool(toolId);
    setUploadedFiles([]);
    setParameters({});
  };

  const handleFileUploaded = (file: any) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleFileRemoved = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const renderToolParameters = () => {
    const tool = rasterTools.find(t => t.id === selectedTool);
    if (!tool) return null;

    switch (selectedTool) {
      case "ndvi_calculation":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="red_band">Red Band Index</Label>
              <Input
                id="red_band"
                type="number"
                placeholder="3"
                value={parameters.red_band || ""}
                onChange={(e) => setParameters({...parameters, red_band: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="nir_band">Near-Infrared Band Index</Label>
              <Input
                id="nir_band"
                type="number"
                placeholder="4"
                value={parameters.nir_band || ""}
                onChange={(e) => setParameters({...parameters, nir_band: parseInt(e.target.value)})}
              />
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                <strong>Common band configurations:</strong><br />
                • Landsat 8/9: Red=4, NIR=5<br />
                • Sentinel-2: Red=4, NIR=8<br />
                • MODIS: Red=1, NIR=2
              </p>
            </div>
          </div>
        );

      case "raster_calculator":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="expression">Mathematical Expression</Label>
              <Textarea
                id="expression"
                placeholder="(B4 - B3) / (B4 + B3)"
                value={parameters.expression || ""}
                onChange={(e) => setParameters({...parameters, expression: e.target.value})}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use B1, B2, B3... to reference bands. Supports +, -, *, /, sqrt(), log(), etc.
              </p>
            </div>
            <div>
              <Label htmlFor="output_type">Output Data Type</Label>
              <Select onValueChange={(value) => setParameters({...parameters, output_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="float32">Float32 (decimal values)</SelectItem>
                  <SelectItem value="int16">Int16 (integer values)</SelectItem>
                  <SelectItem value="uint8">UInt8 (0-255 range)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                <strong>Example expressions:</strong><br />
                • NDVI: (B4 - B3) / (B4 + B3)<br />
                • EVI: 2.5 * (B4 - B3) / (B4 + 6*B3 - 7.5*B1 + 1)<br />
                • Custom: sqrt(B1 * B2) + log(B3)
              </p>
            </div>
          </div>
        );

      case "ai_classification":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="model_type">Classification Model</Label>
              <Select onValueChange={(value) => setParameters({...parameters, model_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landcover">Land Cover (Urban, Forest, Water, Agriculture)</SelectItem>
                  <SelectItem value="vegetation">Vegetation Types (Detailed plant classification)</SelectItem>
                  <SelectItem value="water">Water Bodies (Rivers, lakes, wetlands)</SelectItem>
                  <SelectItem value="urban">Urban Features (Buildings, roads, parks)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="confidence_threshold">Confidence Threshold</Label>
              <Input
                id="confidence_threshold"
                type="number"
                step="0.1"
                min="0"
                max="1"
                placeholder="0.8"
                value={parameters.confidence_threshold || ""}
                onChange={(e) => setParameters({...parameters, confidence_threshold: parseFloat(e.target.value)})}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>🤖 AI Powered:</strong> Uses pre-trained deep learning models for accurate classification. 
                Results include confidence scores and detailed class probabilities.
              </p>
            </div>
          </div>
        );

      case "change_detection":
        return (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                Upload two raster files:<br />
                1. <strong>Before image</strong> (older date)<br />
                2. <strong>After image</strong> (newer date)
              </p>
            </div>
            <div>
              <Label htmlFor="method">Change Detection Method</Label>
              <Select onValueChange={(value) => setParameters({...parameters, method: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="difference">Simple Difference</SelectItem>
                  <SelectItem value="ratio">Band Ratio</SelectItem>
                  <SelectItem value="ndvi_diff">NDVI Difference</SelectItem>
                  <SelectItem value="pca">Principal Component Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="threshold">Change Threshold</Label>
              <Input
                id="threshold"
                type="number"
                step="0.1"
                placeholder="0.2"
                value={parameters.threshold || ""}
                onChange={(e) => setParameters({...parameters, threshold: parseFloat(e.target.value)})}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              Configure parameters for {tool.name}
            </p>
          </div>
        );
    }
  };

  const handleProcessJob = async () => {
    if (!selectedTool || uploadedFiles.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a tool and upload files",
        variant: "destructive",
      });
      return;
    }

    const tool = rasterTools.find(t => t.id === selectedTool);
    if (!tool) return;

    setProcessing(true);

    try {
      // Create processing job
      const { data: jobData, error: jobError } = await supabase
        .from('geo_processing_jobs')
        .insert({
          user_id: user?.id,
          job_type: selectedTool,
          input_files: uploadedFiles.map(f => f.path || f.url),
          parameters: parameters,
          status: 'pending'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Generate AI summary
      const summary = generateAISummary(tool, uploadedFiles, parameters);
      
      toast({
        title: "Raster Analysis Started",
        description: summary,
      });

      // Simulate result for demo
      setTimeout(() => {
        onResultGenerated({
          tool_name: tool.name,
          data: new Blob(['mock-raster-data'], { type: 'image/tiff' }),
          summary: summary
        });
      }, 3000);

      // Reset form
      setSelectedTool("");
      setUploadedFiles([]);
      setParameters({});
      onJobCreated();

    } catch (error: any) {
      console.error('Error starting job:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to start processing job",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const generateAISummary = (tool: any, files: any[], params: any) => {
    const fileCount = files.length;
    const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(1);
    
    switch (tool.id) {
      case "ndvi_calculation":
        return `Calculating NDVI using bands ${params.red_band || 3} and ${params.nir_band || 4}. Processing ${sizeMB}MB of satellite imagery to assess vegetation health and density.`;
      case "ai_classification":
        return `Running AI classification using ${params.model_type || 'land cover'} model with ${(params.confidence_threshold || 0.8) * 100}% confidence threshold. Processing ${sizeMB}MB imagery with deep learning algorithms.`;
      case "raster_calculator":
        return `Executing mathematical expression "${params.expression || 'custom formula'}" on ${fileCount} raster layer(s). Total input: ${sizeMB}MB. Complex calculations will provide advanced analytical insights.`;
      case "change_detection":
        return `Analyzing temporal changes using ${params.method || 'difference'} method with ${params.threshold || 0.2} threshold. Comparing ${fileCount} time-series images (${sizeMB}MB) to detect environmental changes.`;
      default:
        return `Processing ${fileCount} raster file(s) with ${tool.name}. Input size: ${sizeMB}MB. Advanced geospatial analysis will provide detailed results and visualizations.`;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Category-based Tool Selection */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryTools = rasterTools.filter(tool => tool.category === category.id);
          const IconComponent = category.icon;
          
          return (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryTools.map((tool) => {
                    const ToolIcon = tool.icon;
                    const isLocked = tool.isPremium && subscription?.subscription_tier === 'free';
                    
                    return (
                      <Tooltip key={tool.id}>
                        <TooltipTrigger asChild>
                          <Card 
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedTool === tool.id ? 'ring-2 ring-primary' : ''
                            } ${isLocked ? 'opacity-60' : ''}`}
                            onClick={() => handleToolSelect(tool.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <div className="relative">
                                  <ToolIcon className="h-4 w-4 text-primary mt-1" />
                                  {tool.isPremium && (
                                    <Crown className="h-3 w-3 text-amber-500 absolute -top-1 -right-1" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-xs truncate">{tool.name}</h3>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {tool.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      {tool.supportedFormats[0]}
                                    </Badge>
                                    <Badge variant={tool.isPremium ? "default" : "secondary"} className="text-xs px-1 py-0">
                                      {tool.isPremium ? "PRO" : "FREE"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <p>{tool.description}</p>
                            <p className="mt-1">
                              <strong>Files:</strong> {tool.minFiles}-{tool.maxFiles} | 
                              <strong> Formats:</strong> {tool.supportedFormats.join(', ')}
                            </p>
                            {tool.isPremium && (
                              <p className="text-amber-500 mt-1">⭐ Premium Feature</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* File Upload and Parameters */}
      {selectedTool && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
          {/* File Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Upload Raster Data</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadManager
                onFileUploaded={handleFileUploaded}
                onFileRemoved={handleFileRemoved}
                uploadedFiles={uploadedFiles}
                allowedFormats={rasterTools.find(t => t.id === selectedTool)?.supportedFormats}
                maxFileSize={1000}
              />
            </CardContent>
          </Card>

          {/* Tool Parameters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Analysis Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              {renderToolParameters()}
              
              <div className="mt-4 pt-3 border-t">
                <Button 
                  onClick={handleProcessJob}
                  disabled={processing || uploadedFiles.length === 0}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {processing ? "Starting Analysis..." : "Start Analysis"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedRasterTools;