
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Satellite, Image, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RasterAnalysisToolsProps {
  availableData: any[];
  selectedData: any;
  onAnalysisComplete: (result: any) => void;
}

const RasterAnalysisTools = ({ availableData, selectedData, onAnalysisComplete }: RasterAnalysisToolsProps) => {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const rasterTools = [
    {
      id: "spectral_indices",
      name: "Spectral Indices",
      description: "Calculate NDVI, NDWI, SAVI and other indices",
      icon: BarChart3,
    },
    {
      id: "classification",
      name: "Image Classification",
      description: "Supervised land cover classification",
      icon: Image,
    },
    {
      id: "change_analysis",
      name: "Change Analysis",
      description: "Multi-temporal change detection",
      icon: Satellite,
    }
  ];

  const runRasterAnalysis = async () => {
    if (!selectedTool || !selectedData) {
      toast({
        title: "Missing requirements",
        description: "Please select both a tool and raster data.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // Simulate raster processing
      await new Promise(resolve => setTimeout(resolve, 4000));

      const result = {
        id: Math.random().toString(36).substr(2, 9),
        tool: selectedTool,
        input: selectedData.name,
        parameters: {},
        output: {
          id: Math.random().toString(36).substr(2, 9),
          name: `${selectedTool}_output_${Date.now()}`,
          type: 'raster' as const,
          format: 'GEOTIFF',
          url: selectedData.url,
          visible: true,
        },
        timestamp: new Date(),
        status: 'completed' as const,
      };

      onAnalysisComplete(result);

      toast({
        title: "Raster analysis completed",
        description: `${selectedTool} processing has been completed.`,
      });

      setSelectedTool("");
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error processing the raster data.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Raster Analysis</CardTitle>
        <CardDescription className="text-xs">
          Advanced raster and satellite image processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Select Raster Tool</Label>
          <Select value={selectedTool} onValueChange={setSelectedTool}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose raster analysis..." />
            </SelectTrigger>
            <SelectContent>
              {rasterTools.map((tool) => (
                <SelectItem key={tool.id} value={tool.id}>
                  <div className="flex items-center space-x-2">
                    <tool.icon className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedData && (
          <div className="p-3 bg-accent/50 rounded-lg">
            <Label className="text-xs">Selected Raster</Label>
            <p className="text-sm font-medium">{selectedData.name}</p>
            <p className="text-xs text-muted-foreground">{selectedData.format} • {selectedData.type}</p>
          </div>
        )}

        <Button 
          onClick={runRasterAnalysis} 
          disabled={!selectedTool || !selectedData || processing}
          className="w-full"
        >
          {processing ? "Processing Raster..." : "Run Raster Analysis"}
        </Button>

        {availableData.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Upload raster or satellite data to begin analysis
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RasterAnalysisTools;
