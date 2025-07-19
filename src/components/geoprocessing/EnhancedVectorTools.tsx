import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import FileUploadManager from "../geospatial/FileUploadManager";
import { 
  MapPin, 
  Circle, 
  Scissors, 
  Crosshair, 
  RefreshCcw,
  Play,
  Merge,
  Minus,
  Plus,
  Target,
  Layers,
  Globe,
  Crown
} from "lucide-react";

interface EnhancedVectorToolsProps {
  onJobCreated: () => void;
  onResultGenerated: (result: any) => void;
  subscription: any;
}

const EnhancedVectorTools = ({ onJobCreated, onResultGenerated, subscription }: EnhancedVectorToolsProps) => {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [parameters, setParameters] = useState<any>({});
  const [processing, setProcessing] = useState(false);

  const vectorTools = [
    {
      id: "vector_buffer",
      name: "Buffer Analysis",
      description: "Create buffer zones around vector features with advanced options",
      icon: Circle,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".shp", ".geojson", ".kml", ".gpx"],
      category: "spatial",
      isPremium: false
    },
    {
      id: "vector_dissolve",
      name: "Dissolve Features",
      description: "Merge features based on attribute values with aggregation",
      icon: Merge,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".shp", ".geojson", ".kml"],
      category: "spatial",
      isPremium: false
    },
    {
      id: "vector_intersect",
      name: "Intersect Layers",
      description: "Find geometric intersections with attribute handling",
      icon: Crosshair,
      minFiles: 2,
      maxFiles: 2,
      supportedFormats: [".shp", ".geojson", ".kml"],
      category: "overlay",
      isPremium: false
    },
    {
      id: "vector_union",
      name: "Union Layers",
      description: "Combine all features from multiple layers",
      icon: Plus,
      minFiles: 2,
      maxFiles: 5,
      supportedFormats: [".shp", ".geojson", ".kml"],
      category: "overlay",
      isPremium: false
    },
    {
      id: "vector_difference",
      name: "Difference Analysis",
      description: "Extract features from first layer not in second",
      icon: Minus,
      minFiles: 2,
      maxFiles: 2,
      supportedFormats: [".shp", ".geojson", ".kml"],
      category: "overlay",
      isPremium: true
    },
    {
      id: "vector_clip",
      name: "Clip Features",
      description: "Extract features within a boundary with precision",
      icon: Scissors,
      minFiles: 2,
      maxFiles: 2,
      supportedFormats: [".shp", ".geojson", ".kml"],
      category: "spatial",
      isPremium: false
    },
    {
      id: "crs_reproject",
      name: "CRS Reprojection",
      description: "Transform coordinate reference systems (EPSG)",
      icon: Globe,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".shp", ".geojson", ".kml"],
      category: "transform",
      isPremium: true
    },
    {
      id: "zonal_statistics",
      name: "Zonal Statistics",
      description: "Calculate statistics for raster within vector zones",
      icon: Target,
      minFiles: 2,
      maxFiles: 2,
      supportedFormats: [".shp", ".geojson", ".tif"],
      category: "analysis",
      isPremium: true
    },
    {
      id: "vector_convert",
      name: "Format Conversion",
      description: "Convert between vector formats with CRS options",
      icon: RefreshCcw,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".shp", ".geojson", ".kml", ".gpx", ".csv"],
      category: "transform",
      isPremium: false
    }
  ];

  const categories = [
    { id: "spatial", name: "Spatial Analysis", icon: MapPin },
    { id: "overlay", name: "Overlay Operations", icon: Layers },
    { id: "transform", name: "Transformation", icon: Globe },
    { id: "analysis", name: "Advanced Analysis", icon: Target }
  ];

  const handleToolSelect = (toolId: string) => {
    const tool = vectorTools.find(t => t.id === toolId);
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
    const tool = vectorTools.find(t => t.id === selectedTool);
    if (!tool) return null;

    switch (selectedTool) {
      case "vector_buffer":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="distance">Buffer Distance</Label>
              <Input
                id="distance"
                type="number"
                step="any"
                placeholder="100"
                value={parameters.distance || ""}
                onChange={(e) => setParameters({...parameters, distance: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="units">Distance Units</Label>
              <Select onValueChange={(value) => setParameters({...parameters, units: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="kilometers">Kilometers</SelectItem>
                  <SelectItem value="feet">Feet</SelectItem>
                  <SelectItem value="miles">Miles</SelectItem>
                  <SelectItem value="degrees">Degrees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="segments">Buffer Segments</Label>
              <Input
                id="segments"
                type="number"
                placeholder="16"
                value={parameters.segments || ""}
                onChange={(e) => setParameters({...parameters, segments: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="cap_style">Cap Style</Label>
              <Select onValueChange={(value) => setParameters({...parameters, cap_style: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cap style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "crs_reproject":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="source_crs">Source CRS (auto-detect if empty)</Label>
              <Input
                id="source_crs"
                placeholder="EPSG:4326"
                value={parameters.source_crs || ""}
                onChange={(e) => setParameters({...parameters, source_crs: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="target_crs">Target CRS *</Label>
              <Input
                id="target_crs"
                placeholder="EPSG:3857"
                value={parameters.target_crs || ""}
                onChange={(e) => setParameters({...parameters, target_crs: e.target.value})}
              />
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                <strong>Common CRS:</strong><br />
                • EPSG:4326 - WGS84 Geographic<br />
                • EPSG:3857 - Web Mercator<br />
                • EPSG:32633 - UTM Zone 33N<br />
                • EPSG:2154 - RGF93 Lambert-93
              </p>
            </div>
          </div>
        );

      case "zonal_statistics":
        return (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                Upload two files: <br />
                1. <strong>Vector zones</strong> - polygons to calculate stats for<br />
                2. <strong>Raster data</strong> - values to analyze (NDVI, LST, etc.)
              </p>
            </div>
            <div>
              <Label htmlFor="statistics">Statistics to Calculate</Label>
              <Select onValueChange={(value) => setParameters({...parameters, statistics: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select statistics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All (mean, min, max, sum, count, std)</SelectItem>
                  <SelectItem value="mean">Mean only</SelectItem>
                  <SelectItem value="minmax">Min and Max</SelectItem>
                  <SelectItem value="custom">Custom selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nodata_value">NoData Value</Label>
              <Input
                id="nodata_value"
                type="number"
                placeholder="-9999"
                value={parameters.nodata_value || ""}
                onChange={(e) => setParameters({...parameters, nodata_value: parseFloat(e.target.value)})}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              Select files and configure parameters for {tool.name}
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

    const tool = vectorTools.find(t => t.id === selectedTool);
    if (!tool) return;

    if (uploadedFiles.length < tool.minFiles || uploadedFiles.length > tool.maxFiles) {
      toast({
        title: "Invalid File Count",
        description: `This tool requires ${tool.minFiles}-${tool.maxFiles} files`,
        variant: "destructive",
      });
      return;
    }

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

      // Start processing via edge function
      const { error: processError } = await supabase.functions.invoke('geo-processing', {
        body: {
          job_id: jobData.id,
          job_type: selectedTool,
          input_files: uploadedFiles,
          parameters: parameters
        }
      });

      if (processError) throw processError;

      // Generate AI summary
      const summary = generateAISummary(tool, uploadedFiles, parameters);
      
      toast({
        title: "Job Submitted Successfully",
        description: summary,
      });

      // Simulate result for demo
      setTimeout(() => {
        onResultGenerated({
          tool_name: tool.name,
          data: { type: 'FeatureCollection', features: [] },
          summary: summary
        });
      }, 2000);

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
      case "vector_buffer":
        return `Creating ${params.distance || 100}${params.units || 'meter'} buffers around ${fileCount} dataset(s). Output size: ~${sizeMB}MB. This analysis will help identify proximity zones and spatial relationships.`;
      case "vector_intersect":
        return `Finding intersections between ${fileCount} layers totaling ${sizeMB}MB. This operation will identify overlapping areas and combine attribute data for spatial analysis.`;
      case "crs_reproject":
        return `Reprojecting coordinates from ${params.source_crs || 'auto-detected'} to ${params.target_crs}. This ensures accurate spatial measurements and proper map display.`;
      default:
        return `Processing ${fileCount} file(s) with ${tool.name}. Total input: ${sizeMB}MB. You'll receive detailed results with enhanced spatial insights.`;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Category-based Tool Selection */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryTools = vectorTools.filter(tool => tool.category === category.id);
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
                                    {tool.supportedFormats.slice(0, 2).map((format) => (
                                      <Badge key={format} variant="outline" className="text-xs px-1 py-0">
                                        {format}
                                      </Badge>
                                    ))}
                                    {tool.supportedFormats.length > 2 && (
                                      <Badge variant="outline" className="text-xs px-1 py-0">
                                        +{tool.supportedFormats.length - 2}
                                      </Badge>
                                    )}
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
              <CardTitle className="text-sm">Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadManager
                onFileUploaded={handleFileUploaded}
                onFileRemoved={handleFileRemoved}
                uploadedFiles={uploadedFiles}
                allowedFormats={vectorTools.find(t => t.id === selectedTool)?.supportedFormats}
                maxFileSize={500}
              />
            </CardContent>
          </Card>

          {/* Tool Parameters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Processing Parameters</CardTitle>
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
                  {processing ? "Starting Job..." : "Start Processing"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedVectorTools;