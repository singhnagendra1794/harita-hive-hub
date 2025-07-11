import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import FileUploader from "./FileUploader";
import { 
  MapPin, 
  Circle, 
  Scissors, 
  Crosshair, 
  RefreshCcw,
  Upload,
  Play,
  Merge
} from "lucide-react";

interface VectorToolsProps {
  onJobCreated: () => void;
  subscription: any;
}

const VectorTools = ({ onJobCreated, subscription }: VectorToolsProps) => {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [parameters, setParameters] = useState<any>({});
  const [processing, setProcessing] = useState(false);

  const vectorTools = [
    {
      id: "vector_buffer",
      name: "Buffer Analysis",
      description: "Create buffer zones around vector features",
      icon: Circle,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".shp", ".geojson", ".kml", ".gpx"]
    },
    {
      id: "vector_dissolve",
      name: "Dissolve Features",
      description: "Merge features based on attribute values",
      icon: Merge,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".shp", ".geojson", ".kml"]
    },
    {
      id: "vector_intersect",
      name: "Intersect Layers",
      description: "Find geometric intersections between layers",
      icon: Crosshair,
      minFiles: 2,
      maxFiles: 2,
      supportedFormats: [".shp", ".geojson", ".kml"]
    },
    {
      id: "vector_clip",
      name: "Clip Features",
      description: "Extract features within a boundary",
      icon: Scissors,
      minFiles: 2,
      maxFiles: 2,
      supportedFormats: [".shp", ".geojson", ".kml"]
    },
    {
      id: "vector_convert",
      name: "Format Conversion",
      description: "Convert between vector formats",
      icon: RefreshCcw,
      minFiles: 1,
      maxFiles: 1,
      supportedFormats: [".shp", ".geojson", ".kml", ".gpx", ".csv"]
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
              <Label htmlFor="segments">Segments (smoothness)</Label>
              <Input
                id="segments"
                type="number"
                placeholder="16"
                value={parameters.segments || ""}
                onChange={(e) => setParameters({...parameters, segments: parseInt(e.target.value)})}
              />
            </div>
          </div>
        );

      case "vector_dissolve":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dissolve_field">Dissolve Field (optional)</Label>
              <Input
                id="dissolve_field"
                placeholder="Field name to group by"
                value={parameters.dissolve_field || ""}
                onChange={(e) => setParameters({...parameters, dissolve_field: e.target.value})}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to dissolve all features into one
              </p>
            </div>
            <div>
              <Label htmlFor="aggregate_fields">Aggregate Fields (optional)</Label>
              <Input
                id="aggregate_fields"
                placeholder="field1:sum,field2:mean"
                value={parameters.aggregate_fields || ""}
                onChange={(e) => setParameters({...parameters, aggregate_fields: e.target.value})}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: field_name:operation (sum, mean, min, max, count)
              </p>
            </div>
          </div>
        );

      case "vector_intersect":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="intersect_type">Intersection Type</Label>
              <Select onValueChange={(value) => setParameters({...parameters, intersect_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intersection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intersect">Intersect (overlapping areas)</SelectItem>
                  <SelectItem value="difference">Difference (first minus second)</SelectItem>
                  <SelectItem value="symmetric_difference">Symmetric Difference</SelectItem>
                  <SelectItem value="union">Union (combine all)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="keep_attributes">Attribute Handling</Label>
              <Select onValueChange={(value) => setParameters({...parameters, keep_attributes: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select attribute handling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Keep attributes from both layers</SelectItem>
                  <SelectItem value="first">Keep attributes from first layer only</SelectItem>
                  <SelectItem value="second">Keep attributes from second layer only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "vector_clip":
        return (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                Upload two files: <br />
                1. <strong>Input layer</strong> - features to be clipped<br />
                2. <strong>Clipping boundary</strong> - boundary to clip by
              </p>
            </div>
            <div>
              <Label htmlFor="clip_method">Clipping Method</Label>
              <Select onValueChange={(value) => setParameters({...parameters, clip_method: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clipping method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intersect">Intersect (clip exactly)</SelectItem>
                  <SelectItem value="within">Within (features completely inside)</SelectItem>
                  <SelectItem value="contains">Contains (features that contain boundary)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "vector_convert":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="output_format">Output Format</Label>
              <Select onValueChange={(value) => setParameters({...parameters, output_format: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select output format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geojson">GeoJSON</SelectItem>
                  <SelectItem value="shapefile">Shapefile</SelectItem>
                  <SelectItem value="kml">KML</SelectItem>
                  <SelectItem value="gpx">GPX</SelectItem>
                  <SelectItem value="csv">CSV (with coordinates)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="coordinate_system">Target Coordinate System (optional)</Label>
              <Input
                id="coordinate_system"
                placeholder="EPSG:4326"
                value={parameters.coordinate_system || ""}
                onChange={(e) => setParameters({...parameters, coordinate_system: e.target.value})}
              />
            </div>
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
            <MapPin className="h-5 w-5" />
            Vector Processing Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vectorTools.map((tool) => {
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
                acceptedTypes={vectorTools.find(t => t.id === selectedTool)?.supportedFormats}
                maxFiles={vectorTools.find(t => t.id === selectedTool)?.maxFiles}
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

export default VectorTools;