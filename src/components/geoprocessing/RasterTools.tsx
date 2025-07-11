import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import FileUploader from "./FileUploader";
import { 
  Layers, 
  Merge, 
  RotateCcw, 
  Scissors, 
  Calculator,
  Upload,
  Play
} from "lucide-react";

interface RasterToolsProps {
  onJobCreated: () => void;
  subscription: any;
}

const RasterTools = ({ onJobCreated, subscription }: RasterToolsProps) => {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [parameters, setParameters] = useState<any>({});
  const [processing, setProcessing] = useState(false);

  const rasterTools = [
    {
      id: "raster_merge",
      name: "Merge Rasters",
      description: "Combine multiple raster datasets into a single file",
      icon: Merge,
      minFiles: 2,
      maxFiles: 10,
      supportedFormats: [".tif", ".tiff", ".geotiff"]
    },
    {
      id: "raster_reproject",
      name: "Reproject Raster",
      description: "Transform raster coordinate system",
      icon: RotateCcw,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".tif", ".tiff", ".geotiff"]
    },
    {
      id: "raster_clip",
      name: "Clip Raster",
      description: "Extract raster data by boundary or extent",
      icon: Scissors,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".tif", ".tiff", ".geotiff"]
    },
    {
      id: "raster_calculate",
      name: "Raster Calculator",
      description: "Perform band math calculations (NDVI, etc.)",
      icon: Calculator,
      minFiles: 1,
      maxFiles: 5,
      supportedFormats: [".tif", ".tiff", ".geotiff"]
    }
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    setUploadedFiles([]);
    setParameters({});
  };

  const handleFileUpload = (files: any[]) => {
    setUploadedFiles(files);
  };

  const renderToolParameters = () => {
    const tool = rasterTools.find(t => t.id === selectedTool);
    if (!tool) return null;

    switch (selectedTool) {
      case "raster_merge":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="method">Merge Method</Label>
              <Select onValueChange={(value) => setParameters({...parameters, method: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select merge method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mosaic">Mosaic (overlay)</SelectItem>
                  <SelectItem value="blend">Blend edges</SelectItem>
                  <SelectItem value="first">First pixel wins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="resampling">Resampling Method</Label>
              <Select onValueChange={(value) => setParameters({...parameters, resampling: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resampling method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Nearest Neighbor</SelectItem>
                  <SelectItem value="bilinear">Bilinear</SelectItem>
                  <SelectItem value="cubic">Cubic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "raster_reproject":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="target_crs">Target CRS</Label>
              <Input
                id="target_crs"
                placeholder="EPSG:4326 or WKT string"
                value={parameters.target_crs || ""}
                onChange={(e) => setParameters({...parameters, target_crs: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="resampling">Resampling Method</Label>
              <Select onValueChange={(value) => setParameters({...parameters, resampling: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resampling method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Nearest Neighbor</SelectItem>
                  <SelectItem value="bilinear">Bilinear</SelectItem>
                  <SelectItem value="cubic">Cubic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "raster_clip":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="clip_method">Clip Method</Label>
              <Select onValueChange={(value) => setParameters({...parameters, clip_method: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clip method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extent">By Extent</SelectItem>
                  <SelectItem value="shapefile">By Shapefile</SelectItem>
                  <SelectItem value="geojson">By GeoJSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {parameters.clip_method === "extent" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_x">Min X</Label>
                  <Input
                    id="min_x"
                    type="number"
                    step="any"
                    value={parameters.min_x || ""}
                    onChange={(e) => setParameters({...parameters, min_x: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="max_x">Max X</Label>
                  <Input
                    id="max_x"
                    type="number"
                    step="any"
                    value={parameters.max_x || ""}
                    onChange={(e) => setParameters({...parameters, max_x: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="min_y">Min Y</Label>
                  <Input
                    id="min_y"
                    type="number"
                    step="any"
                    value={parameters.min_y || ""}
                    onChange={(e) => setParameters({...parameters, min_y: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="max_y">Max Y</Label>
                  <Input
                    id="max_y"
                    type="number"
                    step="any"
                    value={parameters.max_y || ""}
                    onChange={(e) => setParameters({...parameters, max_y: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "raster_calculate":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="calculation">Calculation Type</Label>
              <Select onValueChange={(value) => setParameters({...parameters, calculation: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select calculation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ndvi">NDVI (Normalized Difference Vegetation Index)</SelectItem>
                  <SelectItem value="ndwi">NDWI (Normalized Difference Water Index)</SelectItem>
                  <SelectItem value="custom">Custom Expression</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {parameters.calculation === "custom" && (
              <div>
                <Label htmlFor="expression">Band Math Expression</Label>
                <Textarea
                  id="expression"
                  placeholder="e.g., (band4 - band3) / (band4 + band3)"
                  value={parameters.expression || ""}
                  onChange={(e) => setParameters({...parameters, expression: e.target.value})}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use band1, band2, etc. to reference raster bands
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
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
      // Check usage limits
      const { data: limitsData, error: limitsError } = await supabase
        .rpc('check_geo_processing_limits', {
          p_user_id: user?.id,
          p_job_type: selectedTool
        });

      if (limitsError) throw limitsError;

      if (!(limitsData as any)?.can_process) {
        toast({
          title: "Usage Limit Reached",
          description: `You've reached your monthly limit for ${tool.name}. Upgrade for higher limits.`,
          variant: "destructive",
        });
        return;
      }

      // Create processing job
      const { data: jobData, error: jobError } = await supabase
        .from('geo_processing_jobs')
        .insert({
          user_id: user?.id,
          job_type: selectedTool,
          input_files: uploadedFiles.map(f => f.path),
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

      toast({
        title: "Job Submitted",
        description: "Your processing job has been queued. You'll be notified when complete.",
      });

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

  return (
    <div className="space-y-6">
      {/* Tool Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Raster Processing Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rasterTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Card 
                  key={tool.id}
                  className={`cursor-pointer transition-all ${
                    selectedTool === tool.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => handleToolSelect(tool.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {tool.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {tool.supportedFormats.map((format) => (
                            <Badge key={format} variant="outline" className="text-xs">
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* File Upload and Parameters */}
      {selectedTool && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader
                onFilesUploaded={handleFileUpload}
                acceptedTypes={rasterTools.find(t => t.id === selectedTool)?.supportedFormats}
                maxFiles={rasterTools.find(t => t.id === selectedTool)?.maxFiles}
                bucket="geo-processing"
              />
            </CardContent>
          </Card>

          {/* Tool Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              {renderToolParameters()}
              
              <div className="mt-6 pt-4 border-t">
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

export default RasterTools;