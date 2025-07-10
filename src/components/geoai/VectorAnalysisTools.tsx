
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MapPin, Layers, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VectorAnalysisToolsProps {
  availableData: any[];
  selectedData: any;
  onAnalysisComplete: (result: any) => void;
}

const VectorAnalysisTools = ({ availableData, selectedData, onAnalysisComplete }: VectorAnalysisToolsProps) => {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [bufferDistance, setBufferDistance] = useState([100]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const vectorTools = [
    {
      id: "buffer",
      name: "Buffer Analysis",
      description: "Create buffer zones around features",
      icon: MapPin,
    },
    {
      id: "overlay",
      name: "Spatial Overlay",
      description: "Intersect, union, or clip geometries",
      icon: Layers,
    },
    {
      id: "distance_analysis",
      name: "Distance Analysis", 
      description: "Calculate distances and nearest neighbors",
      icon: Ruler,
    }
  ];

  const runVectorAnalysis = async () => {
    if (!selectedTool || !selectedData) {
      toast({
        title: "Missing requirements",
        description: "Please select both a tool and vector data.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // Simulate vector processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result = {
        id: Math.random().toString(36).substr(2, 9),
        tool: selectedTool,
        input: selectedData.name,
        parameters: selectedTool === 'buffer' ? { distance: bufferDistance[0] } : {},
        output: {
          id: Math.random().toString(36).substr(2, 9),
          name: `${selectedTool}_output_${Date.now()}`,
          type: 'vector' as const,
          format: 'GeoJSON',
          url: selectedData.url,
          visible: true,
        },
        timestamp: new Date(),
        status: 'completed' as const,
      };

      onAnalysisComplete(result);

      toast({
        title: "Vector analysis completed",
        description: `${selectedTool} analysis has been completed.`,
      });

      setSelectedTool("");
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error processing the vector data.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Vector Analysis</CardTitle>
        <CardDescription className="text-xs">
          Advanced spatial analysis for vector data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Select Vector Tool</Label>
          <Select value={selectedTool} onValueChange={setSelectedTool}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose analysis..." />
            </SelectTrigger>
            <SelectContent>
              {vectorTools.map((tool) => (
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

        {selectedTool === 'buffer' && (
          <div className="space-y-2">
            <Label className="text-xs">Buffer Distance (meters)</Label>
            <div className="px-2">
              <Slider
                value={bufferDistance}
                onValueChange={setBufferDistance}
                max={1000}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1m</span>
                <span>{bufferDistance[0]}m</span>
                <span>1000m</span>
              </div>
            </div>
          </div>
        )}

        {selectedData && (
          <div className="p-3 bg-accent/50 rounded-lg">
            <Label className="text-xs">Selected Vector Data</Label>
            <p className="text-sm font-medium">{selectedData.name}</p>
            <p className="text-xs text-muted-foreground">{selectedData.format} • {selectedData.type}</p>
          </div>
        )}

        <Button 
          onClick={runVectorAnalysis} 
          disabled={!selectedTool || !selectedData || processing}
          className="w-full"
        >
          {processing ? "Processing Vector Data..." : "Run Vector Analysis"}
        </Button>

        {availableData.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Upload vector data to begin analysis
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default VectorAnalysisTools;
